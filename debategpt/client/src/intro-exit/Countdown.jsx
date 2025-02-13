// adapted from https://github.com/Watts-Lab/deliberation-empirica/blob/2dba27e41cb7c6c181fb97261ef30710f668e461/client/src/intro-exit/Countdown.jsx

import React, { useState, useEffect } from "react";
import { default as ReactCountdown, zeroPad } from "react-countdown";
import { usePlayer, useGame } from "@empirica/core/player/classic/react";
import { Button } from "../components/Button";
import { Alert } from "../components/Alert";
import { MyLoading } from "../components/Loading";

export function Countdown({ next }) {
  const player = usePlayer();
  const game = useGame();
  const chime = new Audio("westminster_quarters.mp3");

  const [k, setK] = useState(0);
  const [nextMatchingTime, setNextMatchingTime] = useState(
    new Date(game.get("nextMatchingTime") + 1250)
  );

  useEffect(() => {
    if (game.get("treatmentName") === "Waiting lobby") {
      if (game.get("synchroType") === "continuous") {
        if (!player.get("matchingContinuous")) {
          player.set("matchingContinuous", true);
        }
      } else {
        if (!player.get("inCountdown")) {
          player.set("inCountdown", true);
        }

        setTimeout(() => {
          chime.play();
          // 1 sec before game.get("nextMatchingTime")
        }, game.get("nextMatchingTime") - Date.now() - 1000);
      }
    }
  }, [player]);

  if (
    game.get("treatmentName") === "Waiting lobby" &&
    game.get("synchroType") === "continuous"
  ) {
    return <MyLoading />;
  }

  if (game.get("treatmentName") !== "Waiting lobby") {
    if (game.get("synchroType") === "continuous") {
      next();
      return;
    }

    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="mt-2 mb-4 text-lg font-medium text-gray-500">
            The experiment is ready to begin!
          </p>
          <Button testId="proceedButton" id="proceed" handleClick={next}>
            Proceed
          </Button>
        </div>
      </div>
    );
  }

  const renderTimer = ({ hours, minutes, seconds, completed }) => {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="mt-2 text-xl font-medium text-gray-900">
            The next experiment opens in{" "}
            <span className="color-blue">
              {zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
            </span>
          </p>
          <div className="mt-2 mb-4 text-base">
            <p className="text-gray-500 max-w-2xl">
              We will sound a chime when the study begins, and you will be
              automatically redirected to the next stage. Feel free to work on
              other things in the meantime.
            </p>
            <p className="text-gray-600">
              <b>Please keep this window open and unmute your speakers (🔊).</b>
            </p>
          </div>

          <div className="mb-8">
            <label className="text-gray-600">I have unmuted my speakers </label>
            <input
              type="checkbox"
              id="speaker-confirm"
              name="speaker-confirm"
              className="mr-2"
              required
            />
          </div>

          {k > 0 ? (
            <Alert title="Matching failed">
              <p>
                We have not been able to match you with an opponent. Please wait
                until the next experiment opens.
              </p>
            </Alert>
          ) : null}
        </div>
      </div>
    );
  };

  // game.get("treatmentName") === "Waiting lobby" && game.get("synchroType") !== "continuous"
  return (
    <ReactCountdown
      key={k}
      date={nextMatchingTime}
      renderer={renderTimer}
      onComplete={() => {
        setNextMatchingTime(
          Math.max(
            new Date(nextMatchingTime + 1000),
            new Date(game.get("nextMatchingTime") + 1250)
          )
        );
        setK(k + 1);
      }}
    />
  );
}
