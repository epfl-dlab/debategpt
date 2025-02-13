"""
Generate the figures and tables for the paper, reading from R regressions results.

Usage:
    python analysis.py
"""

import os
import matplotlib as mpl
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
from scipy import stats

DATA_PATH = "data/"

name_map = {
    "(Intercept)": "Intercept",
    "1|2.(Intercept)": "Intercept.1",
    "2|3.(Intercept)": "Intercept.2",
    "3|4.(Intercept)": "Intercept.3",
    "4|5.(Intercept)": "Intercept.4",
    "1|2.sideAgreementPreTreatment1": r"$\agr^{pre}_1$.1",
    "2|3.sideAgreementPreTreatment1": r"$\agr^{pre}_1$.2",
    "3|4.sideAgreementPreTreatment1": r"$\agr^{pre}_1$.3",
    "4|5.sideAgreementPreTreatment1": r"$\agr^{pre}_1$.4",
    "1|2.sideAgreementPreTreatment2": r"$\agr^{pre}_2$.1",
    "2|3.sideAgreementPreTreatment2": r"$\agr^{pre}_2$.2",
    "3|4.sideAgreementPreTreatment2": r"$\agr^{pre}_2$.3",
    "4|5.sideAgreementPreTreatment2": r"$\agr^{pre}_2$.4",
    "1|2.sideAgreementPreTreatment3": r"$\agr^{pre}_3$.1",
    "2|3.sideAgreementPreTreatment3": r"$\agr^{pre}_3$.2",
    "3|4.sideAgreementPreTreatment3": r"$\agr^{pre}_3$.3",
    "4|5.sideAgreementPreTreatment3": r"$\agr^{pre}_3$.4",
    "1|2.sideAgreementPreTreatment4": r"$\agr^{pre}_4$.1",
    "2|3.sideAgreementPreTreatment4": r"$\agr^{pre}_4$.2",
    "3|4.sideAgreementPreTreatment4": r"$\agr^{pre}_4$.3",
    "4|5.sideAgreementPreTreatment4": r"$\agr^{pre}_4$.4",
    "treatmentTypeHuman-AI": "T.Human-AI",
    "treatmentTypeHuman-Human, personalized": "T.Human-Human, personalized",
    "treatmentTypeHuman-AI, personalized": "T.Human-AI, personalized",
    "topicClusterNew2": "Moderate-Strength",
    "topicClusterNew3": "High-Strength",
    "treatmentTypeHuman-AI:topicClusterNew2": "T.Human-AI : Moderate-Strength",
    "treatmentTypeHuman-AI:topicClusterNew3": "T.Human-AI : High-Strength",
    "treatmentTypeHuman-Human, personalized:topicClusterNew2": "T.Human-Human, personalized : Moderate-Strength",
    "treatmentTypeHuman-Human, personalized:topicClusterNew3": "T.Human-Human, personalized : High-Strength",
    "treatmentTypeHuman-AI, personalized:topicClusterNew2": "T.Human-AI, personalized : Moderate-Strength",
    "treatmentTypeHuman-AI, personalized:topicClusterNew3": "T.Human-AI, personalized : High-Strength",
    "treatmentNewHuman-Human_2": "T.Human-Human; Moderate-Strength",
    "treatmentNewHuman-Human_3": "T.Human-Human; High-Strength",
    "treatmentNewHuman-AI_1": "T.Human-AI; Low-Strength",
    "treatmentNewHuman-AI_2": "T.Human-AI; Moderate-Strength",
    "treatmentNewHuman-AI_3": "T.Human-AI; High-Strength",
    "treatmentNewHuman-AI, personalized_1": "T.Human-AI, personalized; Low-Strength",
    "treatmentNewHuman-AI, personalized_2": "T.Human-AI, personalized; Moderate-Strength",
    "treatmentNewHuman-AI, personalized_3": "T.Human-AI, personalized; High-Strength",
    "genderfemale": "Gender.Female",
    "genderother": "Gender.Other",
    "age25-34": "Age.25-34",
    "age35-44": "Age.35-44",
    "age45-54": "Age.45-54",
    "age55-64": "Age.55-64",
    "age65+": "Age.65+",
    "ethnicityblack": "Ethnicity.Black",
    "ethnicityasian": "Ethnicity.Asian",
    "ethnicitylatino": "Ethnicity.Latino",
    "ethnicitymixed": "Ethnicity.Mixed",
    "ethnicityother": "Ethnicity.Other",
    "educationno-degree": "Education.No degree",
    "educationvocational": "Education.Vocational",
    "educationbachelor": "Education.Bachelor",
    "educationmaster": "Education.Master",
    "educationphd": "Education.PhD",
    "employmentStatusself-employed": "Employment.Self-employed",
    "employmentStatusunemployed": "Employment.Unemployed",
    "employmentStatusstudent": "Employment.Student",
    "employmentStatusretired": "Employment.Retired",
    "employmentStatusother": "Employment.Other",
    "politicalAffiliationrepublican": "Politics.Republican",
    "politicalAffiliationindependent": "Politics.Independent",
    "politicalAffiliationother": "Politics.Other",
    "overallOpponent_i": "First-person singular",
    "overallOpponent_we": "First-person plural",
    "overallOpponent_you": "Second-person",
    "overallOpponent_emo_pos": "Positive emotion",
    "overallOpponent_emo_neg": "Negative emotion",
    "overallOpponent_Analytic": "Analytic",
    "overallOpponent_Clout": "Clout",
    "overallOpponent_Authentic": "Authentic",
    "overallOpponent_Tone": "Tone",
    "overallOpponent_WC": "Word count",
    "log(overallOpponent_WC)": "log(Word count)",
    "overallOpponentFlesch": "Flesch Reading Ease",
    "argumentOpponent_knowledge_mean": "Knowledge",
    "argumentOpponent_similarity_mean": "Similarity",
    "argumentOpponent_trust_mean": "Trust",
    "argumentOpponent_power_mean": "Power",
    "argumentOpponent_support_mean": "Support",
    "argumentOpponent_identity_mean": "Identity",
    "argumentOpponent_conflict_mean": "Conflict",
    "argumentOpponent_status_mean": "Status",
    "argumentOpponent_fun_mean": "Fun",
    "topicPrior": "Prior Thought",
    "strengthPreTreatment1": "Strength.Moderate",
    "strengthPreTreatment2": "Strength.Strong",
    "topicCluster2": "Topic Cluster.Moderate",
    "topicCluster3": "Topic Cluster.High",
    "topicKnowledge": "Topic Knowledge",
    "topicDebatableness": "Topic Debatableness",
    "perceivedOpponentBinary": "Perceived Opponent.AI",
    "opponentSideAgreementPreTreatment": r"$\tilde{A}^{pre}_{opponent}$",
}


def generateLatexTable(df, filename):
    with open(filename, "w") as f:
        for i, row in df.iterrows():
            pvalue = (
                f"{row['p.value']:.2f}"
                if row["p.value"] > 0.01
                else "$<$ 0.01" if row["p.value"] > 0.001 else "$<$0.001"
            )
            f.write(
                f"{row.term} & {row.estimate:.2f} & [{row['[0.025']:.2f}, {row['0.975]']:.2f}] & {row['statistic']:.2f} & {pvalue} \\\\\n"
            )


def generateRegressionPlots(path):

    for name, xsize, ysize, voffset, xlab in zip(
        [
            "model",
            "model_demographics",
            "model_liwc",
            "model_dimensions",
            "opinion_fluidity",
            "perceived_opponent",
            "model_perceivedOpponent",
            "model_preregistration1",
            "model_preregistration2",
            "model_restricted",
            "model_opponentAgreement",
            "model_linear",
        ],
        [180 / 25.4, 8, 8, 8, 8, 8, 8, 10, 10, 8, 8, 8],
        [4, 12, 8, 8, 6, 8, 4, 8, 8, 4, 5, 4],
        [0.2, 0.5, 0.4, 0.4, 0.4, 0.4, 0.3, 0.4, 0.4, 0.2, 0.3, 0.2],
        [
            "Odds of higher agreement relative change",
            "Coefficient",
            "Coefficient",
            "Coefficient",
            "Odds of agreement change relative change",
            "Coefficient",
            "Odds of agreement change relative change",
            "Odds of agreement change relative change",
            "Odds of agreement change relative change",
            "Odds of higher agreement relative change",
            "Odds of higher agreement relative change",
            "Coefficient",
        ],
    ):
        try:
            df = pd.read_csv(path + name + ".csv")
        except FileNotFoundError:
            print(
                f"Regression results not found. Please run `regressionAnalysisR.ipynb` first."
            )
            exit(1)
        df.term = df.term.map(name_map)
        df["[0.025"] = df.estimate - df["std.error"] * 1.96
        df["0.975]"] = df.estimate + df["std.error"] * 1.96

        n_intercepts = 8 if name == "model_restricted" else 20
        if name.startswith("model") and name != "model_linear":
            # move intercept to the end
            df = pd.concat(
                [df.iloc[n_intercepts:], df.iloc[:n_intercepts]]
            ).reset_index(drop=True)
        generateLatexTable(df, path + name + ".txt")

        if name == "model_linear":
            df_plot = df[::-1].copy()
        elif name.startswith("model"):
            df_plot = df[:-n_intercepts].iloc[::-1].copy()
        else:
            df_plot = df.iloc[1:][::-1].copy()
        df_plot.term = df_plot.term.apply(
            lambda x: x.split("T.")[1] if x.startswith("T.") else x
        )
        if name in [
            "model",
            "model_topic",
            "opinion_fluidity",
            "model_perceivedOpponent",
            "model_preregistration1",
            "model_preregistration2",
            "model_restricted",
            "model_opponentAgreement",
        ]:
            df_plot.estimate = np.exp(df_plot.estimate) - 1
            df_plot["[0.025"] = np.exp(df_plot["[0.025"]) - 1
            df_plot["0.975]"] = np.exp(df_plot["0.975]"]) - 1

        plt.figure(figsize=(xsize, ysize))
        plt.errorbar(
            df_plot.estimate,
            np.array(range(len(df_plot))),
            xerr=np.concatenate(
                [
                    (df_plot.estimate - df_plot["[0.025"]).values[np.newaxis, :],
                    (df_plot["0.975]"] - df_plot.estimate).values[np.newaxis, :],
                ]
            ),
            linewidth=2 if name != "model" else 1,
            linestyle="none",
            marker="o",
            markersize=5 if name != "model" else 3,
            markerfacecolor="black",
            markeredgecolor="black",
            capsize=9 if name != "model" else 5,
        )
        plt.vlines(
            0,
            -voffset,
            len(df_plot) - 1 + voffset,
            linestyle="--",
            linewidth=2 if name != "model" else 1,
            color="grey",
        )
        plt.yticks(
            range(len(df_plot)), df_plot.term, fontsize=14 if name != "model" else 7
        )
        plt.xticks(fontsize=12 if name != "model" else 6)
        plt.xlabel(xlab, fontsize=13 if name != "model" else 7)
        if name == "model_demographics":
            plt.ylim(-0.8, 27.8)
        plt.tight_layout()
        plt.savefig(path + (name if name != "model" else "fig2") + ".pdf", dpi=300)

    df1 = pd.read_csv(path + "model_topic_cluster1.csv")
    df2 = pd.read_csv(path + "model_topic_cluster2.csv")
    df3 = pd.read_csv(path + "model_topic_cluster3.csv")
    dfs_plot = []
    for df, name in zip(
        [df1, df2, df3],
        ["model_topic_cluster1", "model_topic_cluster2", "model_topic_cluster3"],
    ):
        df.term = df.term.map(name_map)
        df["[0.025"] = df.estimate - df["std.error"] * 1.96
        df["0.975]"] = df.estimate + df["std.error"] * 1.96
        df = pd.concat([df.iloc[20:], df.iloc[:20]]).reset_index(drop=True)
        generateLatexTable(df, path + name + ".txt")

        df_plot = df[:-20].iloc[::-1].copy()
        df_plot.term = df_plot.term.apply(
            lambda x: x.split("T.")[1] if x.startswith("T.") else x
        )
        df_plot.estimate = np.exp(df_plot.estimate) - 1
        df_plot["[0.025"] = np.exp(df_plot["[0.025"]) - 1
        df_plot["0.975]"] = np.exp(df_plot["0.975]"]) - 1
        dfs_plot.append(df_plot)

    plt.figure(figsize=(180 / 25.4, 4))
    for i, df_plot in enumerate(dfs_plot):
        plt.errorbar(
            df_plot.estimate,
            np.array(range(len(df_plot))) + [0.175, 0, -0.175][i],
            xerr=np.concatenate(
                [
                    (df_plot.estimate - df_plot["[0.025"]).values[np.newaxis, :],
                    (df_plot["0.975]"] - df_plot.estimate).values[np.newaxis, :],
                ]
            ),
            linewidth=1,
            linestyle="none",
            marker="o",
            markersize=3,
            capsize=5,
            label=["Low", "Moderate", "High"][i],
        )
    handles, labels = plt.gca().get_legend_handles_labels()
    handles = [h[0] for h in handles]
    plt.legend(
        handles,
        labels,
        loc="upper right",
        title="Topic Strength",
        fontsize=6,
        title_fontsize=7,
        borderpad=0.3,
        handletextpad=0.5,
    )
    plt.vlines(
        0, -0.2, len(df_plot) - 1 + 0.4, linestyle="--", linewidth=1, color="grey"
    )
    plt.yticks(range(len(df_plot)), dfs_plot[1].term, fontsize=7)
    plt.xticks(fontsize=6)
    plt.xlabel("Odds of higher agreement relative change", fontsize=7)
    plt.tight_layout()
    plt.savefig(path + "fig3.pdf", dpi=300)


def generateDistributionPlots(df, path):
    order = [
        "Human-Human",
        "Human-AI",
        "Human-Human, personalized",
        "Human-AI, personalized",
    ]
    liwc_features = [
        "overallOpponent_i",
        "overallOpponent_we",
        "overallOpponent_you",
        "overallOpponent_emo_pos",
        "overallOpponent_emo_neg",
        "overallOpponent_Analytic",
        "overallOpponent_Clout",
        "overallOpponent_Authentic",
        "overallOpponent_Tone",
        "overallOpponent_WC",
        "overallOpponentFlesch",
    ]
    # divide by 100
    df[
        [
            "overallOpponent_Analytic",
            "overallOpponent_Clout",
            "overallOpponent_Authentic",
            "overallOpponent_Tone",
            "overallOpponentFlesch",
        ]
    ] = (
        df[
            [
                "overallOpponent_Analytic",
                "overallOpponent_Clout",
                "overallOpponent_Authentic",
                "overallOpponent_Tone",
                "overallOpponentFlesch",
            ]
        ]
        / 100
    )
    _, ax = plt.subplots(3, 4, figsize=(180 / 25.4, 5))
    for i, feature in enumerate(liwc_features):
        sns.violinplot(
            y="treatmentType",
            x=feature,
            hue="treatmentType",
            data=df,
            order=order,
            hue_order=order,
            palette=sns.color_palette("deep")[:4],
            legend=False,
            linewidth=0.5,
            cut=0.2,
            ax=ax[i // 4, i % 4],
        )
        ax[i // 4, i % 4].set_title(name_map[feature], fontsize=7)
        ax[i // 4, i % 4].set_xlabel("Score" if i in [7, 8, 9, 10] else "", fontsize=7)
        ax[i // 4, i % 4].set_ylabel("")
        ax[i // 4, i % 4].tick_params(axis="x", labelsize=6)
        ax[i // 4, i % 4].set_yticks(range(4))
        ax[i // 4, i % 4].set_yticklabels(order if i % 4 == 0 else [], fontsize=7)
    ax[2, 3].axis("off")
    plt.tight_layout()
    plt.savefig(path + "fig4.pdf", dpi=300)
    plt.close()

    dimensions = [
        "knowledge",
        "similarity",
        "trust",
        "power",
        "support",
        "identity",
        "conflict",
        "status",
        "fun",
    ]
    _, ax = plt.subplots(3, 3, figsize=(21, 18))
    for i, dim in enumerate(dimensions):
        sns.violinplot(
            y="treatmentType",
            x=f"argumentOpponent_{dim}_mean",
            hue="treatmentType",
            data=df,
            order=order,
            hue_order=order,
            palette=sns.color_palette("deep")[:4],
            legend=False,
            cut=0.2,
            ax=ax[i // 3, i % 3],
        )
        ax[i // 3, i % 3].set_title(dim.capitalize(), fontsize=34)
        ax[i // 3, i % 3].set_xlabel("Score", fontsize=32)
        ax[i // 3, i % 3].set_ylabel("")
        ax[i // 3, i % 3].tick_params(axis="x", labelsize=30)
        ax[i // 3, i % 3].set_yticks(range(4))
        ax[i // 3, i % 3].set_yticklabels(order if i % 3 == 0 else [], fontsize=32)
    plt.tight_layout()
    plt.savefig(path + "dimensions_distribution.pdf", dpi=300)
    plt.close()

    strategies = [
        "logic",
        "evidence",
        "inconsistencies",
        "authority",
        "bias",
        "norms",
        "relationship",
        "stories",
        "emotion",
        "deception",
    ]
    strategies_map = {"Zero": 0, "Low": 1 / 3, "Moderate": 2 / 3, "High": 1}
    df_plot = df.copy()
    for strategy in strategies:
        df_plot[f"argumentOpponent_{strategy}"] = df_plot[
            f"argumentOpponent_{strategy.capitalize()}"
        ].map(strategies_map)
        df_plot[f"rebuttalOpponent_{strategy}"] = df_plot[
            f"rebuttalOpponent_{strategy.capitalize()}"
        ].map(strategies_map)
        df_plot[f"conclusionOpponent_{strategy}"] = df_plot[
            f"conclusionOpponent_{strategy.capitalize()}"
        ].map(strategies_map)
        df_plot[f"opponent_{strategy}"] = (
            df_plot[f"argumentOpponent_{strategy}"]
            + df_plot[f"rebuttalOpponent_{strategy}"]
            + df_plot[f"conclusionOpponent_{strategy}"]
        ) / 3

    _, ax = plt.subplots(3, 4, figsize=(28, 19))
    for i, strategy in enumerate(strategies):
        sns.violinplot(
            y="treatmentType",
            x=f"opponent_{strategy}",
            hue="treatmentType",
            data=df_plot,
            order=order,
            hue_order=order,
            palette=sns.color_palette("deep")[:4],
            legend=False,
            cut=0.2,
            ax=ax[i // 4, i % 4],
        )
        ax[i // 4, i % 4].set_title(strategy.capitalize(), fontsize=36)
        ax[i // 4, i % 4].set_xlabel("Score", fontsize=34)
        ax[i // 4, i % 4].set_ylabel("")
        ax[i // 4, i % 4].tick_params(axis="x", labelsize=32)
        ax[i // 4, i % 4].set_yticks(range(4))
        ax[i // 4, i % 4].set_yticklabels(order if i % 4 == 0 else [], fontsize=34)
    ax[2, 2].axis("off")
    ax[2, 3].axis("off")
    plt.tight_layout()
    plt.savefig(path + "strategies_distribution.pdf", dpi=300)
    plt.close()

    # Agreement heatmap
    _, ax = plt.subplots(2, 3, figsize=(16, 14), width_ratios=[20, 20, 1])
    data1 = (
        df[df.treatmentType == "Human-Human"]
        .groupby("sideAgreementPostTreatment")
        .sideAgreementPreTreatment.value_counts()
        .reset_index()
        .pivot(
            index="sideAgreementPostTreatment",
            columns="sideAgreementPreTreatment",
            values="count",
        )
    )
    data1 = data1.apply(lambda x: x / x.sum(), axis=0).fillna(0)
    data1 = data1.loc[(range(5, 0, -1))]
    sns.heatmap(
        data1,
        cmap="Blues",
        annot=True,
        fmt=".2f",
        ax=ax[0, 0],
        cbar_ax=ax[0, 2],
        annot_kws={"size": 18},
    )
    ax[0, 0].tick_params(axis="both", labelsize=18)
    ax[0, 0].set_xlabel("")
    ax[0, 0].set_ylabel(r"$\tilde{A}^{post}$", fontsize=22)
    ax[0, 0].set_title("Human-Human", fontsize=20)

    data2 = (
        df[df.treatmentType == "Human-AI"]
        .groupby("sideAgreementPostTreatment")
        .sideAgreementPreTreatment.value_counts()
        .reset_index()
        .pivot(
            index="sideAgreementPostTreatment",
            columns="sideAgreementPreTreatment",
            values="count",
        )
    )
    data2 = data2.apply(lambda x: x / x.sum(), axis=0).fillna(0)
    data2 = data2.loc[(range(5, 0, -1))]
    data2 = data2 - data1
    sns.heatmap(
        data2,
        cmap="PiYG_r",
        annot=True,
        fmt=".2f",
        ax=ax[0, 1],
        cbar_ax=ax[1, 2],
        center=0,
        annot_kws={"size": 18},
    )
    ax[0, 1].tick_params(axis="both", labelsize=18)
    ax[0, 1].set_ylabel("")
    ax[0, 1].set_xlabel("")
    ax[0, 1].set_title("Human-AI - Human-Human", fontsize=20)

    data3 = (
        df[df.treatmentType == "Human-Human, personalized"]
        .groupby("sideAgreementPostTreatment")
        .sideAgreementPreTreatment.value_counts()
        .reset_index()
        .pivot(
            index="sideAgreementPostTreatment",
            columns="sideAgreementPreTreatment",
            values="count",
        )
    )
    data3 = data3.apply(lambda x: x / x.sum(), axis=0).fillna(0)
    data3 = data3.loc[(range(5, 0, -1))]
    data3 = data3 - data1
    sns.heatmap(
        data3,
        cmap="PiYG_r",
        annot=True,
        fmt=".2f",
        ax=ax[1, 0],
        cbar_ax=ax[1, 2],
        center=0,
        annot_kws={"size": 18},
    )
    ax[1, 0].tick_params(axis="both", labelsize=18)
    ax[1, 0].set_xlabel(r"$\tilde{A}^{pre}$", fontsize=22)
    ax[1, 0].set_ylabel(r"$\tilde{A}^{post}$", fontsize=22)
    ax[1, 0].set_title("Human-Human, personalized - Human-Human", fontsize=20)

    data4 = (
        df[df.treatmentType == "Human-AI, personalized"]
        .groupby("sideAgreementPostTreatment")
        .sideAgreementPreTreatment.value_counts()
        .reset_index()
        .pivot(
            index="sideAgreementPostTreatment",
            columns="sideAgreementPreTreatment",
            values="count",
        )
    )
    data4 = data4.apply(lambda x: x / x.sum(), axis=0).fillna(0)
    data4 = data4.loc[(range(5, 0, -1))]
    data4 = data4 - data1
    sns.heatmap(
        data4,
        cmap="PiYG_r",
        annot=True,
        fmt=".2f",
        ax=ax[1, 1],
        cbar_ax=ax[1, 2],
        center=0,
        annot_kws={"size": 18},
    )
    ax[1, 1].tick_params(axis="both", labelsize=18)
    ax[1, 1].set_xlabel(r"$\tilde{A}^{pre}$", fontsize=22)
    ax[1, 1].set_ylabel("")
    ax[1, 1].set_title("Human-AI, personalized - Human-Human", fontsize=20)
    plt.tight_layout()
    plt.savefig(path + "agreementHeatmap.pdf", dpi=300)
    plt.close()

    # PerceivedOpponent heatmaps
    _, (ax1, ax2) = plt.subplots(1, 2, figsize=(180 / 25.4, 3), width_ratios=[4, 3])

    # First subplot - Perception heatmap
    data = (
        df.groupby("opponent")
        .perceivedOpponent.value_counts()
        .reset_index()
        .pivot(index="opponent", columns="perceivedOpponent", values="count")
        .loc[["human", "ai"], :]
    )
    dataNormalized = data.apply(lambda x: x / x.sum(), axis=1)
    greens = mpl.colormaps["Greens"]
    reds = mpl.colormaps["Reds"]
    dataColors = np.zeros((2, 2, 4))
    dataColors[0, 0, :] = reds(dataNormalized.iloc[0, 0])
    dataColors[0, 1, :] = greens(dataNormalized.iloc[0, 1])
    dataColors[1, 0, :] = greens(dataNormalized.iloc[1, 0])
    dataColors[1, 1, :] = reds(dataNormalized.iloc[1, 1])

    ax1.imshow(dataColors.transpose(1, 0, 2), interpolation="nearest")
    ax1.set_yticks(np.arange(2))
    ax1.set_yticklabels(["AI", "Human"], rotation=90, fontsize=6)
    ax1.set_xticks(np.arange(2))
    ax1.set_xticklabels(["Human", "AI"], fontsize=6)

    for i in range(2):
        for j in range(2):
            ax1.text(
                i,
                j,
                f"{dataNormalized.iloc[i, j]:.2f}",
                ha="center",
                va="center",
                color="black",
                fontsize=6,
            )

    ax1.set_xlabel("Real Opponent", fontsize=7)
    ax1.set_ylabel("Perceived Opponent", fontsize=7)
    ax1.set_title("(A) Relative frequency", fontsize=7)

    # Second subplot - Agreement change heatmap
    df_plot = df.copy()
    df_plot["realOpponent"] = df_plot.apply(
        lambda x: "Human" if "Human-Human" in x.treatmentType else "AI", axis=1
    )
    df_plot = df_plot.groupby(["realOpponent", "perceivedOpponent"]).delta.mean()
    df_plot = df_plot.reset_index().pivot(
        index="perceivedOpponent", columns="realOpponent", values="delta"
    )
    df_plot.index = ["AI", "Human"]
    df_plot = df_plot.loc[["AI", "Human"], ["Human", "AI"]]

    sns.heatmap(
        df_plot,
        cmap="PuOr",
        annot=True,
        fmt=".2f",
        annot_kws={"size": 6},
        center=0,
        vmin=-0.3,
        vmax=0.3,
        ax=ax2,
    )
    for _, spine in ax2.spines.items():
        spine.set_visible(True)
    cbar = ax2.collections[0].colorbar
    cbar.ax.set_yticks([-0.3, -0.15, 0, 0.15, 0.3])
    cbar.ax.tick_params(labelsize=6)
    ax2.set_xlabel("Real Opponent", fontsize=7)
    ax2.set_xticks([0.5, 1.5])
    ax2.set_xticklabels(["Human", "AI"], fontsize=6)
    ax2.set_ylabel("")
    ax2.set_yticks([0.5, 1.5])
    ax2.set_yticklabels(["AI", "Human"], rotation=90, fontsize=6)
    ax2.set_title("(B) Average difference in agrement", fontsize=7)

    plt.tight_layout()
    plt.savefig(path + "fig5.pdf", dpi=300)
    plt.close()


def generateTopicPlots(topics, path):
    # lmplot of avgStrengthPreTreatment vs avgSurveyStrength
    ax = sns.lmplot(
        x="avgSurveyStrength",
        y="avgStrengthPreTreatment",
        hue="topicCluster",
        data=topics,
        fit_reg=False,
        legend=False,
        height=5,
        aspect=1.4,
    )
    sns.regplot(
        x="avgSurveyStrength",
        y="avgStrengthPreTreatment",
        data=topics,
        scatter=False,
        ax=ax.axes[0, 0],
    )
    plt.legend(
        title="Topic Cluster",
        labels=["Low", "Moderate", "High"],
        loc="lower right",
        fontsize=13,
        title_fontsize=13,
    )
    plt.xlabel("Survey strength (avg)", fontsize=14)
    plt.ylabel("Experimental strength (avg)", fontsize=14)
    r, p = stats.pearsonr(topics.avgSurveyStrength, topics.avgStrengthPreTreatment)
    plt.annotate(
        f"r = {r:.2f}\np = {p:.2f}",
        xy=(0.05, 0.975),
        xycoords="axes fraction",
        fontsize=14,
        ha="left",
        va="top",
    )
    plt.tight_layout()
    plt.savefig(path + "topicClusters.pdf", dpi=300)
    plt.close()


def statistical_tests(df):
    df_humans = df[df.treatmentType.isin(["Human-Human", "Human-Human, personalized"])]
    x = (df_humans.perceivedOpponent == df_humans.opponent).value_counts().values
    k = x[0]
    n = x.sum()
    result = stats.binomtest(k, n, p=0.5)
    print(
        f"H0: When opponent is Human Perceived opponent has a success rate equal to random chance. binom_test, p={result.pvalue:.2f}"
    )


if __name__ == "__main__":
    df_path = os.path.join(DATA_PATH, "debates_augmented.csv")
    topics_path = os.path.join(DATA_PATH, "topics.csv")
    results_path = os.path.join(DATA_PATH, "results/")

    print("Generating regression plots...")
    generateRegressionPlots(results_path)
    print("Generating distribution plots...")
    try:
        df = pd.read_csv(df_path)
    except FileNotFoundError:
        print(f"File not found: {df_path}. Please run `python process_data.py` first.")
        exit(1)
    generateDistributionPlots(df, results_path)

    print("Generating topic plots...")
    topics = pd.read_csv(topics_path)
    generateTopicPlots(topics, results_path)

    print("Running statistical tests...")
    statistical_tests(df)

    print("Done!")
