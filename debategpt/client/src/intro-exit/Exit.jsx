import React from "react";
import { usePlayer, useGame } from "@empirica/core/player/classic/react";
import { Alert } from "../components/Alert";
import { Button } from "../components/Button";

export function Exit({ next }) {
  // The whole replay logic is a big workaround due to https://github.com/empiricaly/empirica/issues/418
  function handleReplay(event) {
    event.preventDefault();
    player.set("ended", null);
    player.set("exitStep", 0);
    player.set("intro", Math.min(player.get("intro"), 3));
    player.set("introDone", false);
    player.set("matchingContinuous", false);
    player.set("matchedContinuous", false);
    player.set("replay", true);
  }

  const player = usePlayer();
  const game = useGame();

  // fix to https://github.com/empiricaly/empirica/issues/455
  if (!player || !game || !player.game) {
    return <MyLoading />;
  }

  const platform = player.get("platform");
  let exitString;
  let compensated;
  let mturkCode;
  let prolificCode;
  let prolificCodeIndex = 0; // 0 for dlab, 1 for CHuB
  switch (game?.get("status")) {
    case "terminated":
      exitString =
        "😵 Your game was manually terminated by the server admins. Sorry for the inconvenience.";
      compensated = false;
      prolificCode = ["CGMDSSYP", "C95Q875Y"][prolificCodeIndex];
      break;
    case "failed":
      switch (game.get("endedReason")) {
        case "shared lobby timeout":
        case "set clock fired":
          if (
            player.get("introDone") ||
            (game.get("endedReason") === "set clock fired" &&
              player.get("inCountdown"))
          ) {
            exitString =
              "❌ Your game failed because we were unable to match you with an opponent. Sorry for the inconvenience.";
            compensated = true;
            mturkCode = "MISSING-OPPONENT";
            prolificCode = ["CRX4MJA7", "C16OV1JU"][prolificCodeIndex];
          } else {
            exitString =
              "❌ Your game failed because the experiment closed before you successfully completed the preliminary steps. Sorry for the inconvenience.";
            compensated = false;
            prolificCode = ["CZEA5U01", "C1F9M1PY"][prolificCodeIndex];
          }
          break;
        case "participant inactivity":
          if (player.get("inactiveFailed")) {
            exitString =
              "❌ Your game failed because you were inactive for too much time and did not participate in the stage before its ending.";
            if (["mturk", "prolific"].includes(player.get("platform"))) {
              exitString +=
                " If you think this was an error on our side, please submit the code INACTIVITY-COMPLAINT and feel free to contact us.";
            }
            compensated = false;
            prolificCode = ["CFBZIIXV", "CQEF6U4H"][prolificCodeIndex];
          } else {
            exitString =
              "❌ Your game failed because your opponent was inactive for too much time and did not participate in the stage before its ending.";
            compensated = true;
            mturkCode = "INACTIVE-OPPONENT";
            prolificCode = ["C82DX015", "C1LTXAKF"][prolificCodeIndex];
          }
          break;
        default:
          throw new Error("Unknown game failure reason");
      }

    case "ended":
      break;
    default:
      if (!player.get("consent")) {
        exitString =
          "❌ Your game ended because you decided to withdraw from the experiment.";
        compensated = false;
        prolificCode = ["C1KNX3FP", "C1HLIVCG"][prolificCodeIndex];
        break;
      }
      throw new Error("Unknown game status");
  }

  if (game?.get("status") !== "ended") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="py-8 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="mt-1 mb-2 text-base">
            {exitString}
            {platform === "mturk" && compensated
              ? " You will be compensated for your time."
              : ""}
          </p>
          {platform === "mturk" && compensated ? (
            <Alert title="Bonus">
              <p>
                Submit the following string to receive your bonus for completing
                the HIT: <strong>{mturkCode}</strong>.
              </p>
            </Alert>
          ) : compensated ? (
            ""
          ) : (
            <p className="mb-4 text-gray-700">
              {["mturk", "prolific"].includes(player.get("platform"))
                ? "Unfortunately, your HIT will not be compensated. "
                : ""}
              We release studies on a regular basis, and we hope that you will
              have another opportunity to participate again soon.
            </p>
          )}
          {platform === "prolific" ? (
            <Button
              handleClick={() => {
                window.location.href =
                  "https://app.prolific.com/submissions/complete?cc=" +
                  prolificCode;
              }}
            >
              Complete and return to Prolific
            </Button>
          ) : (
            ""
          )}
          {platform === "none" ? (
            <div className="mt-4 mb-2">
              <Button handleClick={handleReplay}>
                <p>Play again</p>
              </Button>
            </div>
          ) : (
            ""
          )}
        </div>
      </div>
    );
  }

  const { opponentKind } = game.get("treatment");
  const opponentString = opponentKind === "human" ? "a human" : "an AI";
  const completionCode = player.game.get("completionCode") || "";
  prolificCode = ["CH4A4QE0", "CF1I2LXU"][prolificCodeIndex];

  return (
    <div className="flex h-full items-center justify-center">
      <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="mt-1 mb-4 text-base text-gray-700">
          🎉 Thanks for completing our study! For this game, your opponent was{" "}
          <span style={{ color: "blue" }}>{opponentString}</span>.
        </p>

        {platform === "mturk" ? (
          <Alert title="Bonus">
            <p>
              Submit the following string to receive your bonus for completing
              the HIT:{" "}
              <strong>{completionCode ? completionCode : "ERROR"}</strong>.
            </p>
          </Alert>
        ) : (
          ""
        )}

        {platform === "prolific" ? (
          <div className="mt-4">
            <Button
              handleClick={() => {
                window.location.href =
                  "https://app.prolific.com/submissions/complete?cc=" +
                  prolificCode;
              }}
            >
              Complete and return to Prolific
            </Button>
          </div>
        ) : (
          ""
        )}
        {platform === "none" ? (
          <div className="mt-8 mb-2">
            <Button handleClick={handleReplay}>
              <p>Play again</p>
            </Button>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
