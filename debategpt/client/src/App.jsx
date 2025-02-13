import { EmpiricaClassic } from "@empirica/core/player/classic";
import { EmpiricaContext } from "@empirica/core/player/classic/react";
import { EmpiricaMenu, EmpiricaParticipant } from "@empirica/core/player/react";
import React from "react";
import { Game } from "./Game";
import { Introduction } from "./intro-exit/Introduction";
import { IntroSurvey } from "./intro-exit/IntroSurvey";
import { ExitSurvey1 } from "./intro-exit/ExitSurvey1";
import { ExitSurvey2 } from "./intro-exit/ExitSurvey2";
import { Exit } from "./intro-exit/Exit";
import { MyLoading } from "./components/Loading";
import { MyNoGames } from "./components/NoGames";
import { myPlayerCreate } from "./components/PlayerCreate";
import { myConsent } from "./intro-exit/Consent";
import { myLobby } from "./components/Lobby";
import { Countdown } from "./intro-exit/Countdown";

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const playerKey = urlParams.get("participantKey") || ""; //disable for production

  const { protocol, host } = window.location;
  const url = `${protocol}//${host}/query`;

  function introSteps({ game, player }) {
    return [myConsent, Introduction, IntroSurvey, Countdown];
  }

  function exitSteps({ game, player }) {
    return [ExitSurvey1, ExitSurvey2, Exit];
  }

  return (
    <EmpiricaParticipant url={url} ns={playerKey} modeFunc={EmpiricaClassic}>
      <div className="h-screen relative">
        <EmpiricaMenu position="bottom-left" />
        <div id="scroller" className="h-full overflow-auto">
          <EmpiricaContext
            disableConsent
            noGames={MyNoGames}
            playerCreate={myPlayerCreate}
            introSteps={introSteps}
            lobby={myLobby}
            exitSteps={exitSteps}
            loading={MyLoading}
            connecting={MyLoading}
          >
            <Game />
          </EmpiricaContext>
        </div>
      </div>
    </EmpiricaParticipant>
  );
}
