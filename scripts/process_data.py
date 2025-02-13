"""
This script contains the code to preprocess the experiment data.

Usage:
    python scripts/analysis.py
"""

import os

import numpy as np
import pandas as pd
import textstat
from extractLIWC import extractLIWC, mergeLIWC
from extractStrategies import extractStrategies
from extractTendimensions import extractTendimensions

DATA_PATH = "data/"


def processData(df, topic_scores):
    """
    Process debates and topics data.
    """
    df_extended = df.copy()

    df_extended["strengthPreTreatment"] = df_extended.apply(
        lambda x: abs(3 - x.agreementPreTreatment), axis=1
    )
    df_extended["strengthPostTreatment"] = df_extended.apply(
        lambda x: abs(3 - x.agreementPostTreatment), axis=1
    )

    df_extended["opponentSideAgreementPreTreatment"] = df_extended.sort_values(
        by=["debateID", "side"], ascending=[True, True]
    ).sideAgreementPreTreatment.values
    df_extended.opponentSideAgreementPreTreatment = df_extended.apply(
        lambda x: (
            x.opponentSideAgreementPreTreatment
            if x.treatmentType in ["Human-Human", "Human-Human, personalized"]
            else -1
        ),
        axis=1,
    ).astype(int)

    df_extended["delta"] = df_extended.apply(
        lambda x: (x.sideAgreementPostTreatment - x.sideAgreementPreTreatment),
        axis=1,
    )
    df_extended["delta_abs"] = df_extended.delta.abs()
    df_extended["changedAgreement"] = df_extended.apply(
        lambda x: x.delta_abs != 0, axis=1
    ).astype(int)

    df_extended["perceivedOpponentBinary"] = df_extended.perceivedOpponent.apply(
        lambda x: x == "ai"
    ).astype(int)
    df_extended["perceivedOpponentCorrect"] = df_extended.apply(
        lambda x: (
            x.perceivedOpponent == "ai"
            and x.treatmentType in ["Human-AI", "Human-AI, personalized"]
        )
        or (x.perceivedOpponent == "human" and x.treatmentType in ["Human-Human"]),
        axis=1,
    )

    df_extended["opponent"] = df_extended.apply(
        lambda x: (
            "human"
            if x.treatmentType in ["Human-Human", "Human-Human, personalized"]
            else "ai"
        ),
        axis=1,
    )

    # Text features
    for feature in [
        "argument",
        "rebuttal",
        "conclusion",
        "argumentOpponent",
        "rebuttalOpponent",
        "conclusionOpponent",
    ]:
        df_extended[feature + "Length"] = df_extended[feature].apply(
            lambda x: len(x.split())
        )
    df_extended["overall"] = df_extended.apply(
        lambda x: x.argument + "\n" + x.rebuttal + "\n" + x.conclusion, axis=1
    )
    df_extended["overallOpponent"] = df_extended.apply(
        lambda x: x.argumentOpponent
        + "\n"
        + x.rebuttalOpponent
        + "\n"
        + x.conclusionOpponent,
        axis=1,
    )
    df_extended["overallLength"] = df_extended.apply(
        lambda x: x.argumentLength + x.rebuttalLength + x.conclusionLength, axis=1
    )
    df_extended["overallOpponentLength"] = df_extended.apply(
        lambda x: x.argumentOpponentLength
        + x.rebuttalOpponentLength
        + x.conclusionOpponentLength,
        axis=1,
    )

    df_extended["overallOpponentFlesch"] = df_extended.overallOpponent.apply(
        lambda x: textstat.flesch_reading_ease(x)
    )

    # Enrich with topic scores
    topics = topic_scores.copy()
    topics = topics[
        ["topic", "cluster", "strength", "knowledge_mean", "debatableness_mean"]
    ]
    topics.columns = [
        "topic",
        "topicCluster",
        "avgSurveyStrength",
        "topicKnowledge",
        "topicDebatableness",
    ]
    temp = (
        df_extended.groupby("topic")
        .apply(
            lambda x: pd.Series([x.strengthPreTreatment.mean(), x.topicPrior.mean()])
        )
        .reset_index()
    )
    temp.columns = ["topic", "avgStrengthPreTreatment", "avgTopicPrior"]
    # Recreate clusters based on the new topic scores
    temp["topicClusterNew"] = pd.qcut(
        temp.rank(method="first").avgStrengthPreTreatment,
        3,
        labels=[1, 2, 3],
    )
    topics = topics.merge(temp, on="topic")
    topics = topics[
        [
            "topic",
            "topicCluster",
            "topicClusterNew",
            "avgSurveyStrength",
            "avgStrengthPreTreatment",
            "topicKnowledge",
            "topicDebatableness",
            "avgTopicPrior",
        ]
    ]

    df_extended = df_extended.merge(topics, on="topic")

    df_extended = df_extended.sort_values(
        by=["debateID", "side"], ascending=[True, False]
    ).reset_index(drop=True)

    return df_extended, topics


if __name__ == "__main__":
    print("Loading data...")
    df_raw = pd.read_csv("hf://datasets/frasalvi/debategpt/debategpt.csv")
    topics_scores = pd.read_csv(
        "hf://datasets/frasalvi/debategpt_topic_scores/topics_scores.csv"
    )

    print("Processing data...")
    df, topics = processData(df_raw, topics_scores)
    topics.to_csv(DATA_PATH + "topics.csv", index=False)

    base_path = DATA_PATH + "debates"
    tendimsPath = base_path + "_tendims.csv"
    if not os.path.isfile(tendimsPath):
        print("Extracting TenDimensions...")
        extractTendimensions(df, tendimsPath)
        print(f"TenDimensions extracted and saved to {tendimsPath}.")
    else:
        print(f"Found TenDimensions in {tendimsPath}.")
    df_dimensions = pd.read_csv(tendimsPath)

    strategiesPath = base_path + "_strategies.csv"
    if not os.path.isfile(strategiesPath):
        print("Extracting strategies...")
        extractStrategies(df, strategiesPath)
        print(f"Strategies extracted and saved to {strategiesPath}.")
    else:
        print(f"Found strategies in {strategiesPath}.")
    df_strategies = pd.read_csv(strategiesPath)

    liwcPath = base_path + "_liwc.csv"
    if not os.path.isfile(liwcPath):
        print("Extracting LIWC features...")
        extractLIWC(df, liwcPath)
        print(f"LIWC features extracted and saved to {liwcPath}.")
    else:
        print(f"Found LIWC features in {liwcPath}.")

    df_augmented = pd.concat([df, df_dimensions, df_strategies], axis=1)
    df_augmented = mergeLIWC(df_augmented, liwcPath)
    df_augmented.to_csv(base_path + "_augmented.csv", index=False)

    print("Done!")
