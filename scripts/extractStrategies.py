import json
import os
import time
from itertools import product
from urllib import response

import pandas as pd
from openai import OpenAI
from tqdm import tqdm

SECRETS_FOLDER = "secrets/"

with open(SECRETS_FOLDER + "OPENAI_API_KEY.txt", "r") as f:
    key = f.read().strip()
client = OpenAI(api_key=key)


def openaiRequest(prompt, systemPrompt="", model="gpt-4-0613"):
    messages = []
    if systemPrompt:
        messages.append({"role": "system", "content": systemPrompt})
    messages.append({"role": "user", "content": prompt})

    max_retry = 5
    retry = 0
    while True:
        try:
            response = client.chat.completions.create(model=model, messages=messages)
            text = response.choices[0].message.content.strip()
            return text

        except Exception as oops:
            retry += 1
            if retry >= max_retry:
                raise RuntimeError("GPT3 error: %s" % oops)
            print("Error communicating with OpenAI:", oops)
            time.sleep(1)


prompt_template = """You are about to be shown the text of a written debate about the proposition: "{{PROPOSITION}}". The person who wrote the argument below is playing the {{SIDE}} side, advocating {{SIDE_INSTRUCTIONS}} the proposition.

Your job is to analyze the text and return a classification of the nature of the debater's arguments. Particularly, you will determine whether the debaters use each of the following persuasion strategies to support their stance. 

** Persuasive Strategy List **

1. Logical reasoning: Using logical, analytical, and formal reasoning.
2. Providing evidence: Providing facts, data, and verifiable evidence. 
3. Pointing inconcistencies: Identify and discuss logical inconsistencies or fallacies in conflicting arguments.
4. Appeal to authority: Acquiring credibility through the endorsement of experts or authorities.
5. Information bias: Influencing through cognitive biases such as anchoring, priming, framing, or confirmation bias.
6. Social norms: Utilizing social proof, and descriptive or injunctive norms.
7. Building relationship: Building rapport, identify common ground, expressing compliments and affirmation, appealing to shared values.
8. Sharing stories: Share stories, anecdotes, or personal examples.
9. Emotional appeal: Appeal to positive and negative emotions to evoke specific feelings.
10. Deception: Deliberate use of false information and misrepresentation.

** Response Scale ** 

Use the following response scale for each strategy:
- Zero: Strategy not used. 
- Low: Strategy used rarely, in a limited fashion. 
- Moderate: Strategy used repeatedly or with clear emphasis. 
- High: Strategy used extensively and/or centrally throughout the response.

** Debater's Text**
{{TEXT}}

Now output your ratings. Please format your ratings as JSON, with one entry per strategy."""


def extractStrategies(df, strategiesPath):

    values_list = []
    for _, row in tqdm(df.iterrows(), total=len(df)):
        prompt_row = prompt_template
        prompt_row = prompt_row.replace("{{PROPOSITION}}", row.topic)
        prompt_row = prompt_row.replace(
            "{{SIDE}}", "PRO" if row.side == "Con" else "CON"
        )
        prompt_row = prompt_row.replace(
            "{{SIDE_INSTRUCTIONS}}", "in favor of" if row.side == "Con" else "against"
        )

        values = []
        for stage in ["argument", "rebuttal", "conclusion"]:
            prompt = prompt_row.replace("{{TEXT}}", row[f"{stage}Opponent"])

            while True:
                try:
                    response = openaiRequest(prompt)
                    response = json.loads(response)
                    assert list(response.keys()) == [
                        "Logical reasoning",
                        "Providing evidence",
                        "Pointing inconcistencies",
                        "Appeal to authority",
                        "Information bias",
                        "Social norms",
                        "Building relationship",
                        "Sharing stories",
                        "Emotional appeal",
                        "Deception",
                    ], "Invalid response format"
                    assert all(
                        map(
                            lambda x: x in ["Zero", "Low", "Moderate", "High"],
                            response.values(),
                        )
                    ), "Invalid response values"
                    values.extend(response.values())

                    # print(row[f"{stage}Opponent"], response, sep="\n")
                    break

                except Exception as e:
                    print("Error:", e)
                    continue
        values_list.append(values)

    column_list = product(
        ["argument", "rebuttal", "conclusion"],
        [
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
        ],
    )
    column_list = list(
        map(lambda x: f"{x[0]}Opponent_{x[1].capitalize()}", column_list)
    )

    df_strategies = pd.DataFrame(values_list, columns=column_list)
    df_strategies.to_csv(strategiesPath, index=False)
