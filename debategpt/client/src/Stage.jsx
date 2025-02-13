import {
  usePlayer,
  usePlayers,
  useRound,
  useStage,
} from "@empirica/core/player/classic/react";
import React from "react";
import { MockWait } from "./stages/debate/MockWait";
import { PreTreatment } from "./stages/debate/PreTreatment";
import { Opening } from "./stages/debate/Opening";
import { Rebuttal } from "./stages/debate/Rebuttal";
import { Conclusion } from "./stages/debate/Conclusion";

export function Stage() {
  const player = usePlayer();
  const round = useRound();
  const stage = useStage();

  if (
    player.stage.get("submit") ||
    player.get("submitReady")
  ) {
    return (
      <div className="text-center text-gray-400 pointer-events-none">
        Please wait for other player(s) to submit their answers. The next stage
        will start as soon as all players have submitted.
      </div>
    );
  }

  switch (round.get("task")) {
    case "debate":
      switch (stage.get("name")) {
        case "MockWait":
          return <MockWait />;
        case "Pre-treatment":
          return <PreTreatment />;
        case "Opening":
          return <Opening />;
        case "Rebuttal":
          return <Rebuttal />;
        case "Conclusion":
          return <Conclusion />;
        default:
          return <div>Unknown stage</div>;
      }
    default:
      return <div>Unknown task</div>;
  }
}
