import {
  usePlayer,
  usePlayers,
  useGame,
} from "@empirica/core/player/classic/react";
import React, { useState } from "react";
import { Radio } from "../components/Radio";
import { Button } from "../components/Button";
import { MyLoading } from "../components/Loading";

export function ExitSurvey1({ next }) {
  const labelClassName = "block text-base font-medium text-gray-900 my-2";
  const outputClassName =
    "bg-gray-100 text-gray-700 resize-none appearance-none block w-full border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-none focus:border-gray-300 sm:text-sm";

  const game = useGame();
  const player = usePlayer();
  const players = usePlayers();

  // fix to https://github.com/empiricaly/empirica/issues/455
  if (!player || !game || !players) {
    return <MyLoading />;
  }

  for (const p of players) {
    if (!p.game) {
      return <MyLoading />;
    }
  }

  if (
    player.get("consent") === false ||
    game.get("status") === "terminated" ||
    game.get("status") === "failed"
  ) {
    next();
    return;
  }

  const { opponentKind } = game.get("treatment");
  let opponentRole, opponentConclusion;
  let argumentPro,
    argumentCon,
    rebuttalPro,
    rebuttalCon,
    conclusionPro,
    conclusionCon;

  if (opponentKind === "human") {
    const proPlayer = players.find((p) => p.game.get("role") === "pro");
    const conPlayer = players.find((p) => p.game.get("role") === "con");
    argumentPro = proPlayer.game.get("argument");
    argumentCon = conPlayer.game.get("argument");
    rebuttalPro = proPlayer.game.get("rebuttal");
    rebuttalCon = conPlayer.game.get("rebuttal");
    conclusionPro = proPlayer.game.get("conclusion");
    conclusionCon = conPlayer.game.get("conclusion");

    const opponent = players.filter((p) => p.id !== player.id)[0];
    opponentRole = opponent.game.get("role");
    opponentConclusion = opponent.game.get("conclusion");
  } else {
    opponentRole = game.get("roleAI");
    opponentConclusion = game.get("conclusionAI");

    if (opponentRole === "pro") {
      argumentPro = game.get("argumentAI");
      argumentCon = player.game.get("argument");
      rebuttalPro = game.get("rebuttalAI");
      rebuttalCon = player.game.get("rebuttal");
      conclusionPro = game.get("conclusionAI");
      conclusionCon = player.game.get("conclusion");
    } else {
      argumentPro = player.game.get("argument");
      argumentCon = game.get("argumentAI");
      rebuttalPro = player.game.get("rebuttal");
      rebuttalCon = game.get("rebuttalAI");
      conclusionPro = player.game.get("conclusion");
      conclusionCon = game.get("conclusionAI");
    }
  }

  game.set("argumentPro", argumentPro);
  game.set("argumentCon", argumentCon);
  game.set("rebuttalPro", rebuttalPro);
  game.set("rebuttalCon", rebuttalCon);
  game.set("conclusionPro", conclusionPro);
  game.set("conclusionCon", conclusionCon);

  const [agreement, setAgreement] = useState("");

  function handleAgreementChange(e) {
    setAgreement(e.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    player.game.set("agreementPostTreatment", agreement);
    player.set("exitLogs", agreement);
    next();
  }

  return (
    <div className="mt-4 py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="mb-4 text-base text-gray-700 text-center">
          Your opponent, impersonating the{" "}
          <b
            style={{
              color: opponentRole === "pro" ? "green" : "red",
            }}
          >
            {opponentRole.toUpperCase()}
          </b>{" "}
          side, has written the following conclusion:
        </p>

        <textarea
          readOnly
          className={outputClassName}
          rows={5}
          value={opponentConclusion}
        ></textarea>
      </div>

      <div className="mt-8 mb-2">
        <p className="mt-1 mb-2 text-base text-center text-gray-700">
          The following table summarizes the complete debate.
        </p>

        <div className="bg-gray-100 mb-3 border border-gray-300 p-4 rounded-md">
          <h3 className="text-lg leading-6 font-medium text-empirica-500 text-center">
            {game.get("topic")}
          </h3>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridColumnGap: "1rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateRows: "repeat(3, auto)",
              gridRowGap: "1rem",
            }}
          >
            <div className="space-y-2">
              <p className="text-base text-center text-gray-700">
                <b>
                  <span style={{ color: "green" }}>PRO</span> argument
                </b>
              </p>
              <textarea
                readOnly
                className={outputClassName}
                rows={6}
                value={argumentPro}
              ></textarea>
            </div>
            <div className="space-y-2">
              <p className="text-base text-center text-gray-700">
                <b>
                  <span style={{ color: "red" }}>CON</span> counterargument
                </b>
              </p>
              <textarea
                readOnly
                className={outputClassName}
                rows={6}
                value={rebuttalCon}
              ></textarea>
            </div>
            <div className="space-y-2">
              <p className="text-base text-center text-gray-700">
                <b>
                  <span style={{ color: "green" }}>PRO</span> conclusion
                </b>
              </p>
              <textarea
                readOnly
                className={outputClassName}
                rows={6}
                value={conclusionPro}
              ></textarea>
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateRows: "repeat(3, auto)",
              gridRowGap: "1rem",
            }}
          >
            <div className="space-y-2">
              <p className="text-base text-center text-gray-700">
                <b>
                  <span style={{ color: "red" }}>CON</span> argument
                </b>
              </p>
              <textarea
                readOnly
                className={outputClassName}
                rows={6}
                value={argumentCon}
              ></textarea>
            </div>
            <div className="space-y-2">
              <p className="text-base text-center text-gray-700">
                <b>
                  <span style={{ color: "green" }}>PRO</span> counterargument
                </b>
              </p>
              <textarea
                readOnly
                className={outputClassName}
                rows={6}
                value={rebuttalPro}
              ></textarea>
            </div>
            <div className="space-y-2">
              <p className="text-base text-center text-gray-700">
                <b>
                  <span style={{ color: "red" }}>CON</span> conclusion
                </b>
              </p>
              <textarea
                readOnly
                className={outputClassName}
                rows={6}
                value={conclusionCon}
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <form
        className="mt-14 space-y-8 divide-y divide-gray-200"
        onSubmit={handleSubmit}
      >
        <div className="space-y-8 mt-6 mb-6">
          <div>
            <label className={labelClassName}>
              After conducting the debate, how much do you now agree with the
              debate statement?
            </label>
            <div className="grid gap-2">
              <Radio
                selected={agreement}
                name="agreement"
                value="1"
                label="1 (Strongly disagree)"
                onChange={handleAgreementChange}
              />
              <Radio
                selected={agreement}
                name="agreement"
                value="2"
                label="2"
                onChange={handleAgreementChange}
              />
              <Radio
                selected={agreement}
                name="agreement"
                value="3"
                label="3"
                onChange={handleAgreementChange}
              />
              <Radio
                selected={agreement}
                name="agreement"
                value="4"
                label="4"
                onChange={handleAgreementChange}
              />
              <Radio
                selected={agreement}
                name="agreement"
                value="5"
                label="5 (Strongly agree)"
                onChange={handleAgreementChange}
              />
            </div>
          </div>

          <div className="mt-6 mb-12">
            <Button type="submit">Continue</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
