import React from "react";
import { Profile } from "./Profile";
import { Stage } from "./Stage";
import { MyLoading } from "./components/Loading";
import { usePlayers } from "@empirica/core/player/classic/react";

export function Game() {
  const players = usePlayers();

  return (
    <div className="min-h-full w-full flex">
      <div className="min-h-full w-full flex flex-col">
        <Profile />
        <div className="h-full flex items-center justify-center">
          <Stage />
        </div>
      </div>
    </div>
  );
}
