import {
  usePlayer,
  useGame,
  useStage,
} from "@empirica/core/player/classic/react";
import React from "react";
import { Avatar } from "./components/Avatar";
import { Timer } from "./components/Timer";

export function Profile() {
  const player = usePlayer();
  const game = useGame();
  const stage = useStage();

  const role = player.game.get("role") || "";

  if (stage.get("name") === "MockWait") {
    return;
  }

  return (
    <div className="min-w-lg md:min-w-2xl mt-2 m-x-auto px-3 py-2 text-gray-500 rounded-md grid grid-cols-[120px_minmax(0,_1fr)_120px] items-center border-.5">
      <Timer />

      <div className="leading-tight ml-1">
        <div className="text-empirica-500 font-medium text-sm text-center">
          {game.get("topic")}
        </div>
      </div>

      <div className="flex space-x-3 items-center justify-end">
        <div className="text-xl">
          <b style={{ color: role === "pro" ? "green" : "red" }}>
            {role.toUpperCase()}
          </b>{" "}
        </div>

        {/* {["mturk", "prolific"].includes(player.get("platform")) ? (
          <div className="text-sm">
            <b style={{ paddingLeft: "20px" }}>
              {player.get("participantIdentifier")}
            </b>
          </div>
        ) : (
          ""
        )} */}
      </div>
    </div>
  );
}
