import React, { useState, useEffect } from "react";
import { Radio } from "../../components/Radio";
import { Button } from "../../components/Button";
import { usePlayer, useGame } from "@empirica/core/player/classic/react";

export function PreTreatment() {
  const player = usePlayer();
  const game = useGame();
  const labelClassName = "block text-base font-medium text-gray-900 my-2";

  const [agreement, setAgreement] = useState(
    player.game.get("agreementPreTreatment")
  );
  const [topicPrior, setTopicPrior] = useState(player.game.get("topicPrior"));

  function handleAgreementChange(e) {
    setAgreement(e.target.value);
    player.game.set("agreementPreTreatment", e.target.value);
  }

  function handleTopicPriorChange(e) {
    setTopicPrior(e.target.value);
    player.game.set("topicPrior", e.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    player.game.set("agreementPreTreatment", agreement);
    player.set("submitReady", true);
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <p className="mt-1 mb-4 text-base text-gray-700">
          You will be debating on the following statement:
        </p>
        <div className="bg-gray-100 border border-gray-300 p-4 rounded-md">
          <h3 className="text-xl leading-6 font-medium text-empirica-500 text-center">
            {game.get("topic")}
          </h3>
        </div>
      </div>

      <form
        className="mt-2 space-y-8 divide-y divide-gray-200"
        onSubmit={handleSubmit}
      >
        <div className="space-y-6 mt-6 mb-6">
          <div>
            <label className={labelClassName}>
              How much do you agree with the debate statement?
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
          <div>
            <label className={labelClassName}>
              How much have you previously thought about this topic?
            </label>
            <div className="grid gap-2">
              <Radio
                selected={topicPrior}
                name="topicPrior"
                value="1"
                label="1 (Never)"
                onChange={handleTopicPriorChange}
              />
              <Radio
                selected={topicPrior}
                name="topicPrior"
                value="2"
                label="2"
                onChange={handleTopicPriorChange}
              />
              <Radio
                selected={topicPrior}
                name="topicPrior"
                value="3"
                label="3"
                onChange={handleTopicPriorChange}
              />
              <Radio
                selected={topicPrior}
                name="topicPrior"
                value="4"
                label="4"
                onChange={handleTopicPriorChange}
              />
              <Radio
                selected={topicPrior}
                name="topicPrior"
                value="5"
                label="5 (Extensively)"
                onChange={handleTopicPriorChange}
              />
            </div>
          </div>
          {/* <div className="mt-6 mb-12">
              <Button type="submit">Continue</Button>
            </div> */}
        </div>
      </form>

      <div className="mt-6 text-gray-500">
        Please input your answers before the countdown expires! If you do not
        input your answer, you will not be able to continue the game. The
        experiment will move forward automatically after the end of the stage.
      </div>
    </div>
  );
}
