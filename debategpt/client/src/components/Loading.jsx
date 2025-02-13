// Adapted from https://github.com/empiricaly/empirica/blob/297d560424ab9a7ee8d53efabdfc09248e7ec271/lib/%40empirica/core/src/player/react/Loading.tsx
import React from "react";
import { usePlayer } from "@empirica/core/player/classic/react";
import { MyNoGames } from "./NoGames";

export function MyLoading() {
  const player = usePlayer();

  // Hack to make sure that when all games are full or players cannot join them due to replay treatment selection, new players see the NoGames page. Otherwise, they will see a Loading screen, because https://github.com/empiricaly/empirica/blob/297d560424ab9a7ee8d53efabdfc09248e7ec271/lib/%40empirica/core/src/player/classic/react/EmpiricaContext.tsx#L98-L104 only toggles when all games have started, i.e. players are not only assigned but also have completed introSteps.
  if (player && player.get("noExperiments")) {
    return <MyNoGames />;
  }

  return (
    <div className="h-full w-full flex items-center justify-center">
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        xmlns="http://www.w3.org/2000/svg"
        className="text-empirica-200 stroke-current"
      >
        <g fill="none" fillRule="evenodd" strokeWidth="2">
          <circle cx="22" cy="22" r="1">
            <animate
              attributeName="r"
              begin="0s"
              dur="1.8s"
              values="1; 20"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.165, 0.84, 0.44, 1"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              begin="0s"
              dur="1.8s"
              values="1; 0"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.3, 0.61, 0.355, 1"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="22" cy="22" r="1">
            <animate
              attributeName="r"
              begin="-0.9s"
              dur="1.8s"
              values="1; 20"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.165, 0.84, 0.44, 1"
              repeatCount="indefinite"
            />
            <animate
              attributeName="stroke-opacity"
              begin="-0.9s"
              dur="1.8s"
              values="1; 0"
              calcMode="spline"
              keyTimes="0; 1"
              keySplines="0.3, 0.61, 0.355, 1"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      </svg>
    </div>
  );
}
