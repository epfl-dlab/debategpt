import modules.tendimensions.tendims as tendims
import numpy as np
import pandas as pd


def extractTendimensions(df, tendimensionsPath):
    model = tendims.TenDimensionsClassifier(
        is_cuda=True,
        models_dir="scripts/modules/tendimensions/models/lstm_trained_models",
        embeddings_dir="data/embeddings/",
    )
    dimensions = model.dimensions_list

    columns_list = []
    values_list = []
    for stage in ["argument", "rebuttal", "conclusion"]:
        # Gather both Human and AI produced texts
        texts = pd.concat(
            [df[f"{stage}"], df[f"{stage}Opponent"]], ignore_index=True
        ).unique()
        textsLen = list(map(lambda x: len(x.split()), texts))
        meanLength = np.mean(textsLen)
        stdLength = np.std(textsLen)
        for suffix in ["", "Opponent"]:
            normalizedLength = (df[f"{stage + suffix}Length"] - meanLength) / stdLength
            for dim in dimensions:
                print(f"Computing {stage + suffix}_{dim}...")
                columns_list += [
                    f"{stage + suffix}_{dim}_mean",
                    f"{stage + suffix}_{dim}_max",
                    f"{stage + suffix}_{dim}_maxThresholded",
                    f"{stage + suffix}_{dim}_maxDiscounted",
                ]

                res = (
                    df[f"{stage + suffix}"]
                    .apply(lambda x: pd.Series(model.compute_score_split(x, dim)))
                    .iloc[:, :2]
                    .values
                )

                # 1 if the raw score if above 0.8 or if the raw score is above 0.5 and the score is above the 80th percentile
                maxTresholded = np.where(
                    (res[:, 1] >= 0.8)
                    | ((res[:, 1] >= 0.5) & (res[:, 1] >= np.quantile(res[:, 1], 0.8))),
                    1,
                    0,
                )
                maxDiscounted = np.array(
                    list(
                        map(
                            lambda x: (
                                0
                                if x[0] == 0
                                else 1 / (1 + x[1]) if x[1] > 0 else 2 - 1 / (1 - x[1])
                            ),
                            zip(maxTresholded, normalizedLength.values),
                        )
                    )
                )

                values_list.append(
                    np.concatenate(
                        (
                            res,
                            maxTresholded[:, np.newaxis],
                            maxDiscounted[:, np.newaxis],
                        ),
                        axis=1,
                    )
                )

    values_list = np.concatenate(tuple(values_list), axis=1)
    df_tendims = pd.DataFrame(values_list, columns=columns_list)

    texts = pd.concat(
        [df["overall"], df["overallOpponent"]], ignore_index=True
    ).unique()
    textsLen = list(map(lambda x: len(x.split()), texts))
    meanLength = np.mean(textsLen)
    stdLength = np.std(textsLen)
    for suffix in ["", "Opponent"]:
        normalizedLength = (df[f"overall{suffix}Length"] - meanLength) / stdLength
        for dim in dimensions:
            df_tendims[f"overall{suffix}_{dim}_max"] = df_tendims.apply(
                lambda x: max(
                    x[f"{stage + suffix}_{dim}_max"]
                    for stage in ["argument", "rebuttal", "conclusion"]
                ),
                axis=1,
            )
            df_tendims[f"overall{suffix}_{dim}_maxThresholded"] = df_tendims.apply(
                lambda x: max(
                    x[f"{stage + suffix}_{dim}_maxThresholded"]
                    for stage in ["argument", "rebuttal", "conclusion"]
                ),
                axis=1,
            )
            df_tendims[f"overall{suffix}_{dim}_maxDiscounted"] = df_tendims.apply(
                lambda x: (
                    0
                    if x[f"overall{suffix}_{dim}_maxThresholded"] == 0
                    else (
                        1 / (1 + normalizedLength[x.name])
                        if normalizedLength[x.name] > 0
                        else 2 - 1 / (1 - normalizedLength[x.name])
                    )
                ),
                axis=1,
            )

    df_tendims.to_csv(tendimensionsPath, index=False)
