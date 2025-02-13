import { Alert } from "../../components/Alert";
import {
  usePlayer,
  usePlayers,
  useGame,
} from "@empirica/core/player/classic/react";
import React, { useState, useEffect } from "react";
import { getDemographicAliases } from "../../../../commonUtils";

export function Conclusion() {
  const inputClassName =
    "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-empirica-500 focus:border-empirica-500 sm:text-sm";
  const outputClassName =
    "bg-gray-100 text-gray-700 resize-none appearance-none block w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-none focus:border-gray-300 sm:text-sm";
  const game = useGame();
  const { opponentKind } = game.get("treatment");
  const player = usePlayer();

  let opponentRole, opponentRebuttal, opponentDemographics;
  if (opponentKind === "human") {
    const players = usePlayers();
    const opponent = players.filter((p) => p.id !== player.id)[0];
    opponentRole = opponent.game.get("role");
    opponentRebuttal = opponent.game.get("rebuttal");
    opponentDemographics = opponent.get("demographics");
  } else {
    opponentRole = game.get("roleAI");
    opponentRebuttal = game.get("rebuttalAI");
  }
  const demographicAliases = getDemographicAliases();

  const [conclusion, setConclusion] = useState(player.game.get("conclusion"));
  function handleConclusionChange(e) {
    setConclusion(e.target.value);
    player.game.set("conclusion", e.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    player.game.set("conclusion", conclusion);
    player.set("submitReady", true);
  }

  const suggestedWordCount = 25;
  function handleWordCount() {
    const text = document.getElementById("conclusion").value.trim();
    let wordCount;
    if (text === "") {
      wordCount = 0;
    } else {
      wordCount = text.split(/\s+/).length;
    }

    document.getElementById("wordCount").innerHTML = wordCount;
    if (wordCount >= suggestedWordCount) {
      document.getElementById("wordCountAlert").style.display = "none";
    } else {
      document.getElementById("wordCountAlert").style.display = "block";
    }
  }

  useEffect(() => {
    handleWordCount();
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-10">
        <p className="mb-4 text-base text-gray-700 text-center">
          Your opponent, impersonating the{" "}
          <b
            style={{
              color: opponentRole === "pro" ? "green" : "red",
            }}
          >
            {opponentRole.toUpperCase()}
          </b>{" "}
          side, has written the following counterargument:
        </p>

        <textarea
          readOnly
          className={outputClassName}
          rows={6}
          value={opponentRebuttal}
        ></textarea>
      </div>

      <form
        className="space-y-2 divide-y divide-gray-200"
        onSubmit={handleSubmit}
      >
        <div>
          <div className="text-gray-700 mb-4 text-center">
            <p className="text-base">
              You will have <span style={{ color: "blue" }}>3 minutes</span> to
              write your closing argument.
            </p>
            <p className="text-sm">
              You can respond to your opponent's counterargument, add additional
              arguments, or reiterate on your initial points.
            </p>
          </div>
          {player.game.get("personalInfoAccess") ? (
            <div className="text-gray-700 mb-6 text-sm text-center border border-gray-300 rounded-md shadow-sm bg-gray-50">
              <p>
                Additionally, you know that your opponent has self-identified to
                have the following characteristics
              </p>

              <ul>
                <li>
                  Gender:{" "}
                  <b>{demographicAliases[opponentDemographics.gender]}</b>
                </li>
                <li>
                  Age: <b>{demographicAliases[opponentDemographics.age]}</b>
                </li>
                <li>
                  Race:{" "}
                  <b>
                    {opponentDemographics.ethnicity
                      .map((e) => demographicAliases[e])
                      .join(", ")}
                  </b>
                </li>
                <li>
                  Education:{" "}
                  <b>{demographicAliases[opponentDemographics.education]}</b>
                </li>
                <li>
                  Employment Status:{" "}
                  <b>
                    {demographicAliases[opponentDemographics.employmentStatus]}
                  </b>
                </li>
                <li>
                  Political orientation:{" "}
                  <b>
                    {
                      demographicAliases[
                        opponentDemographics.politicalAffiliation
                      ]
                    }
                  </b>
                </li>
              </ul>

              <p className="mt-2 px-1">
                You may use this information to your advantage, crafting an
                argument tailored to your opponent that is more likely to
                persuade them. However, you should not explicitly mention any of
                those characteristics nor that you are aware of them.
              </p>
            </div>
          ) : (
            ""
          )}
        </div>

        <textarea
          className={inputClassName}
          dir="auto"
          id="conclusion"
          name="conclusion"
          rows={12}
          value={conclusion}
          onChange={handleConclusionChange}
          onKeyUp={handleWordCount}
          required
        />
      </form>
      <div id="wordCountAlert" className="border mt-3">
        <Alert title="Warning">
          <p>
            You currently wrote <span id="wordCount">0</span> words. Please try
            to write at least {suggestedWordCount} words for this stage.
          </p>
        </Alert>
      </div>
    </div>
  );
}
