import os
import shutil
import subprocess
from itertools import product

import pandas as pd


def extractLIWC(df, liwcPath):
    os.makedirs("temp")
    for i, row in df.iterrows():
        for col in [
            "argumentOpponent",
            "rebuttalOpponent",
            "conclusionOpponent",
            "overallOpponent",
        ]:
            text = row[col]
            with open(f"temp/{i}_{col}.txt", "w", encoding="utf-8") as f:
                f.write(text)

    res = subprocess.run(
        [
            "LIWC-22-cli",
            "--mode",
            "wc",
            "--input",
            "temp",
            "--output",
            liwcPath,
        ],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    print(res.stdout.decode("utf-8"))
    shutil.rmtree("temp")


def mergeLIWC(df, liwcPath):
    liwc = pd.read_csv(liwcPath)
    columns = liwc.columns[2:]  # exclude Filename and Segment
    liwc.Filename = liwc.Filename.apply(lambda x: x.split("/")[-1])
    liwc[["id", "type"]] = liwc.Filename.str.extract(r"(\d+)_(\w+).txt")
    liwc.id = liwc.id.astype(int)
    liwc = liwc.pivot(index="id", columns="type", values=columns)
    liwc.columns = [f"{type}_{col}" for col, type in liwc.columns]
    liwc = liwc[
        [
            f"{type}_{col}"
            for col, type in product(
                columns,
                [
                    "argumentOpponent",
                    "rebuttalOpponent",
                    "conclusionOpponent",
                    "overallOpponent",
                ],
            )
        ]
    ]

    new_df = df.merge(liwc, left_index=True, right_index=True)
    return new_df
