import { usePlayer, useGame } from "@empirica/core/player/classic/react";
import React, { useState } from "react";
import { Radio } from "../components/Radio";
import { Button } from "../components/Button";
import { MyLoading } from "../components/Loading";

export function ExitSurvey2({ next }) {
  const labelClassName = "block text-base font-medium text-gray-900 my-2";

  const player = usePlayer();
  const game = useGame();

  // fix to https://github.com/empiricaly/empirica/issues/455
  if (!player || !game || !player.game) {
    return <MyLoading />;
  }

  if (
    player.get("consent") === false ||
    game.get("status") === "terminated" ||
    game.get("status") === "failed"
  ) {
    next();
    return;
  }

  const [perceivedOpponent, setPerceivedOpponent] = useState("");
  function handlePerceivedOpponentChange(e) {
    setPerceivedOpponent(e.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    player.game.set("perceivedOpponent", perceivedOpponent);
    player.set("exitLogs", player.get("exitLogs") + "-" + perceivedOpponent);
    next();
  }

  return (
    <div className="mt-4 py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <form
        className="mt-14 space-y-6 divide-y divide-gray-200"
        onSubmit={handleSubmit}
      >
        <div className="space-y-6 mt-6 mb-6">
          <div>
            <label className={labelClassName}>
              Finally, do you think that your opponent was a human or an
              Artificial Intelligence (AI)?
            </label>
            <div className="grid gap-2">
              <Radio
                selected={perceivedOpponent}
                name="perceivedOpponent"
                value="human"
                label="Human"
                onChange={handlePerceivedOpponentChange}
              />
              <Radio
                selected={perceivedOpponent}
                name="perceivedOpponent"
                value="ai"
                label="AI"
                onChange={handlePerceivedOpponentChange}
              />
            </div>
          </div>

          <div className="mt-3">
            <Button type="submit">Continue</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
