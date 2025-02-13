// Adapted from https://github.com/empiricaly/empirica/blob/297d560424ab9a7ee8d53efabdfc09248e7ec271/lib/%40empirica/core/src/player/react/NoGames.tsx

import React from "react";

export function MyNoGames() {
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="w-92 flex flex-col items-center">
        <h2 className="text-gray-700 font-medium">
          ⏳ No experiments available
        </h2>
        <p className="mt-2 text-gray-400 text-justify">
          There are currently no available experiments. We release studies on a
          regular basis, and we hope that you will have the opportunity to
          participate soon.
        </p>
      </div>
    </div>
  );
}
