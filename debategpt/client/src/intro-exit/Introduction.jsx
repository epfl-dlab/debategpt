import React from "react";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { usePlayer } from "@empirica/core/player/classic/react";

export function Introduction({ next }) {
  const player = usePlayer();

  return (
    <div className="mt-3 sm:mt-5 p-20 py-8 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl leading-6 font-medium text-gray-900">
        🗣️ DebateGPT
      </h1>
      <div className="mt-5 mb-6 text-base text-gray-500">
        <div className="text-lg mb-3">This is a three-part study:</div>
        <div className="mb-4">
          <div className="text-lg">
            Part 1: Read instructions and take a survey (~2 min)
          </div>
          <ul
            style={{
              listStyleType: "disc",
              listStylePosition: "inside",
            }}
          >
            <li>
              <b>Asynchronous</b> individual activity
            </li>
            <li>
              You will be asked to complete a short survey about yourself.
            </li>
            <li>
              After you submit Part 1, you will be paired with a random
              opponent. Your opponent might be a human or an AI.
            </li>
          </ul>
        </div>
        <div className="mb-4">
          <div className="text-lg">
            Part 2: Debate with your opponent on a given topic (~10 min)
          </div>
          <ul
            style={{
              listStyleType: "disc",
              listStylePosition: "inside",
            }}
          >
            <li>
              <b>Synchronous</b> group activity
            </li>
            <li>You will be asked how much you agree with a given topic.</li>
            <li>
              Then, you will randomly be assigned to either the{" "}
              <b style={{ color: "green" }}>PRO</b> or{" "}
              <b style={{ color: "red" }}>CON</b> side.
            </li>
            <li>
              You will be asked to impersonate the assigned side and engage in a
              debate on the given topic structured in a three stages:{" "}
              <i>Opening</i>, <i>Rebuttal</i>, and <i>Conclusion</i>.
            </li>
          </ul>
        </div>
        <div className="mb-4">
          <div className="text-lg">
            Part 3: Take a survey and debrief (~1 min)
          </div>
          <ul
            style={{
              listStyleType: "disc",
              listStylePosition: "inside",
            }}
          >
            <li>
              <b>Asynchronous</b> individual activity.
            </li>
            <li>You will be asked to complete a short survey.</li>
            <li>
              Finally, you will be informed about whether your opponent was a
              human or an AI.
            </li>
          </ul>
        </div>
      </div>

      <div className="mb-2 border">
        <Alert title="Warning">
          <p>
            Your goal as a participant is <b>NOT</b> to spot whether your
            opponent is a human or an AI, but rather to be as persuasive as
            possible in your arguments during the debate.{" "}
            {["prolific", "mturk"].includes(player.get("platform")) ? (
              <span>
                <b>A bonus might be awarded to the winner of each debate</b>, as
                determined by external evaluators.
              </span>
            ) : (
              ""
            )}
          </p>
        </Alert>
      </div>

      <div className="mb-6 border">
        <Alert title="Warning">
          <p>
            <b>It is strictly forbitten to use ChatGPT</b> or other AI tools for
            this task.
            {["prolific", "mturk"].includes(player.get("platform"))
              ? " We will be closely monitoring the usage of such tools, and evidence of their usage might result in your HIT being rejected."
              : ""}
          </p>
        </Alert>
      </div>

      <Button handleClick={next}>
        <p>Next</p>
      </Button>
    </div>
  );
}
