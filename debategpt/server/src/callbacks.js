import { TajribaEvent } from "@empirica/core/admin";
import { ClassicListenersCollector } from "@empirica/core/admin/classic";
import { load as loadYaml } from "js-yaml";
import { selectChat } from "./llmQuery";
import { gptPrompts } from "./llmPrompts";
import { assignplayer, matchplayers } from "./assignPlayers";
import { createGames, restoreGames, createReparatoryGame } from "./manageGames";
import { validateConfig } from "./validateConfig";
import {
  readFile,
  waitRandomTime,
  hash,
  setCurrentlyRecruitingBatch,
} from "./utils";
import { getDemographicAliases } from "../../commonUtils";
export const Empirica = new ClassicListenersCollector();

// Workaround for the absence of player connect/disconnect callbacks https://github.com/empiricaly/empirica/issues/257
const online = new Map();
const playersForParticipant = new Map();
const timers = {};

Empirica.onGameStart(({ game }) => {
  const round = game.addRound({
    name: "Debate",
    task: "debate",
  });

  if (!game.get("reparatory")) {
    round.addStage({
      name: "MockWait",
      duration: Math.max(1, Math.floor(game.get("mockWaitTime") / 1000)),
    });
    round.addStage({ name: "Pre-treatment", duration: 10 }); // production 60
  } else {
    const player = game.players[0];
    player.game.set(
      "agreementPreTreatment",
      game.get("reparatoryAgreementPreTreatment")
    );
    player.game.set("role", game.get("reparatorySide"));
    game.set("roleAI", game.get("reparatorySide") === "pro" ? "con" : "pro");
  }
  round.addStage({ name: "Opening", duration: 10 }); // production 180
  round.addStage({ name: "Rebuttal", duration: 10 }); // production 180
  round.addStage({ name: "Conclusion", duration: 10 }); // production 180
});

Empirica.onRoundStart(({ round }) => {});

Empirica.onStageStart(({ stage }) => {
  stage.set("startTime", Date.now());
  let game = stage.currentGame;
  const { opponentKind } = game.get("treatment");
  if (opponentKind === "ai") {
    if (stage.get("name") === "MockWait") {
      return;
    }

    if (stage.get("name") === "Pre-treatment") {
      stage.set("llmWait", waitRandomTime(0.05, 0.1)); // Production values: 0.1, 0.2. OBSOLETE
      return;
    }

    const { llm, personalInfo } = game.get("treatment");
    const messages = game.get("messagesAI") || [];
    const llmChat = selectChat(llm, messages);
    if (stage.get("name") === "Opening") {
      stage.set("llmWait", waitRandomTime(0.05, 0.1)); // Production values: 4, 6. OBSOLETE

      let prompt = gptPrompts["Opening"];
      prompt = prompt.replace("{{TOPIC}}", game.get("topic"));
      prompt = prompt.replace("{{SIDE}}", game.get("roleAI").toUpperCase());
      prompt = prompt.replace(
        "{{SIDE_INSTRUCTION}}",
        game.get("roleAI") === "pro" ? "in favor of" : "against"
      );

      if (personalInfo) {
        const demographics = game.players[0].get("demographics");
        const demographicAliases = getDemographicAliases();

        let info = "\n" + gptPrompts["Personalized"] + "\n";
        info = info.replace(
          "{{OPPONENT_SIDE}}",
          game.get("roleAI") === "pro" ? "CON" : "PRO"
        );
        info = info.replace(
          "{{GENDER}}",
          demographicAliases[demographics.gender]
        );
        info = info.replace("{{AGE}}", demographicAliases[demographics.age]);
        info = info.replace(
          "{{ETHNICITY}}",
          demographics.ethnicity.map((e) => demographicAliases[e]).join(", ")
        );
        info = info.replace(
          "{{EDUCATION}}",
          demographicAliases[demographics.education]
        );
        info = info.replace(
          "{{EMPLOYMENT_STATUS}}",
          demographicAliases[demographics.employmentStatus]
        );
        info = info.replace(
          "{{POLITICAL_AFFILIATION}}",
          demographicAliases[demographics.politicalAffiliation]
        );

        prompt = prompt.replace("{{PERSONAL_INFO}}", info);
      } else {
        prompt = prompt.replace("{{PERSONAL_INFO}}", "");
      }

      llmChat
        .query(prompt)
        .then(([response, messages]) => {
          game.set("argumentAI", response);
          game.set("messagesAI", messages);
          Empirica.flush();
        })
        .then(() => {
          console.log("AI argument set to:", game.get("argumentAI"));
        })
        .catch((error) => {
          console.log("Error:", error);
        });
    }

    if (stage.get("name") === "Rebuttal") {
      stage.set("llmWait", waitRandomTime(0.05, 0.1)); // Production values: 1.5, 3. OBSOLETE

      let prompt = gptPrompts["Rebuttal"];
      prompt = prompt.replace(
        "{{OPPONENT_SIDE}}",
        game.get("roleAI") === "pro" ? "CON" : "PRO"
      );
      prompt = prompt.replace(
        "{{OPPONENT_OPENING}}",
        game.players[0].game.get("argument")
      );
      llmChat
        .query(prompt)
        .then(([response, messages]) => {
          game.set("rebuttalAI", response);
          game.set("messagesAI", messages);
          Empirica.flush();
        })
        .then(() => {
          console.log("AI rebuttal set to:", game.get("rebuttalAI"));
        })
        .catch((error) => {
          console.log("Error:", error);
        });
    }

    if (stage.get("name") === "Conclusion") {
      stage.set("llmWait", waitRandomTime(0.05, 0.1)); // Production values: 1.5, 3. OBSOLETE

      let prompt = gptPrompts["Conclusion"];
      prompt = prompt.replace(
        "{{OPPONENT_SIDE}}",
        game.get("roleAI") === "pro" ? "CON" : "PRO"
      );
      prompt = prompt.replace(
        "{{OPPONENT_REBUTTAL}}",
        game.players[0].game.get("rebuttal")
      );
      llmChat
        .query(prompt)
        .then(([response, messages]) => {
          game.set("conclusionAI", response);
          game.set("messagesAI", messages);
          Empirica.flush();
        })
        .then(() => {
          console.log("AI conclusion set to:", game.get("conclusionAI"));
        })
        .catch((error) => {
          console.log("Error:", error);
        });
    }
  }
});

Empirica.onStageEnded(({ stage }) => {
  const game = stage.currentGame;
  const players = game.players;
  let failed = false;

  switch (stage.get("name")) {
    case "Pre-treatment":
      players.forEach((player) => {
        console.log(
          player.get("participantIdentifier"),
          "agreementPreTreatment set to",
          player.game.get("agreementPreTreatment")
        );
        if (player.game.get("agreementPreTreatment") === undefined) {
          player.set("inactiveFailed", true);
          failed = true;
        } else player.set("inactiveFailed", false);
      });

      // Randomly assign pro and con roles
      var roles = ["pro", "con"];
      roles = roles
        .map((value) => ({ value, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ value }) => value);

      const { opponentKind, personalInfo } = game.get("treatment");

      if (opponentKind === "human") {
        for (const player of game.players) {
          player.game.set("role", roles.pop());
        }
      } else {
        game.players[0].game.set("role", roles.pop());
        game.set("roleAI", roles.pop());
      }

      if (opponentKind === "human" && personalInfo) {
        // Randomly assign to one of the two players the attribute "personalInfoAccess"
        const random = Math.round(Math.random());
        game.players[random].game.set("personalInfoAccess", true);
        game.players[random ^ 1].game.set("personalInfoAccess", false);
      } else {
        for (const player of game.players) {
          player.game.set("personalInfoAccess", false);
        }
      }

      if (!failed) break;

      // Save failed games by converting them into AI games
      // TODO connect reparatory games with the SQLite db
      const activePlayers = players.filter(
        (player) => !player.get("inactiveFailed")
      );
      if (activePlayers.length === 0) break;
      const player = activePlayers[0];

      const batch = game.batch;
      const mode = batch.get("gameCreationMode");
      createReparatoryGame(player, mode).then((newGame) => {
        if (!newGame) {
          game.end("failed", "participant inactivity");
          return;
        }

        game.removePlayer(player).then(() => {
          game.end("failed", "participant inactivity");
          player.set("gameID", null);
          Empirica.flush();
          batch.addGame(newGame);
        });
      });
      return;

    case "Opening":
      players.forEach((player) => {
        console.log(
          player.get("participantIdentifier"),
          "argument set to",
          player.game.get("argument")
        );
        if (player.game.get("argument") === undefined) {
          player.set("inactiveFailed", true);
          failed = true;
        }
      });
      break;
    case "Rebuttal":
      players.forEach((player) => {
        console.log(
          player.get("participantIdentifier"),
          "rebuttal set to",
          player.game.get("rebuttal")
        );
        if (player.game.get("rebuttal") === undefined) {
          player.set("inactiveFailed", true);
          failed = true;
        }
      });
      break;
    case "Conclusion":
      players.forEach((player) => {
        console.log(
          player.get("participantIdentifier"),
          "conclusion set to",
          player.game.get("conclusion")
        );
        if (player.game.get("conclusion") === undefined) {
          player.set("inactiveFailed", true);
          failed = true;
        }
      });
      break;
  }

  if (failed) {
    game.end("failed", "participant inactivity");
  }
});

Empirica.onRoundEnded(({ round }) => {});

Empirica.onGameEnded(({ game }) => {});

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

// ------------------- Server start callback ---------------------
Empirica.on("start", (ctx) => {
  console.log("Starting server");
});

// ------------------- Batch callbacks ---------------------------
Empirica.on("batch", async (ctx, { batch }) => {
  if (batch.get("customInitialised")) return;

  let nPlayers = 0;
  const { config } = batch.get("config");
  console.log("config", config);
  validateConfig(config);
  if (!config.custom) {
    batch.games.forEach((game) => {
      nPlayers += game.get("treatment")["playerCount"];
      game.set("topic", "Should the Death Penalty Be Legal?");
      console.log("Topic set to mock topic");
    });
  } else {
    batch.set("lobbyConfig", config.lobbyConfig); // Manually set lobbyConfig; done to propagate it to games created by the batch. Otherwise, there will be an error after introSteps are done.

    // provided-games mode
    if ("gamesPath" in config) {
      batch.set("gameCreationMode", "provided");
      const gameArray = JSON.parse(readFile(config.gamesPath));
      for await (const game of gameArray) {
        nPlayers += game[0].value.playerCount;
        await batch.addGame(game);
      }
    } else {
      // buffer-games mode
      if ("gamesBufferPath" in config) {
        batch.set("gameCreationMode", "buffer");
      }
      // unprovided-games mode
      else {
        batch.set("gameCreationMode", "unprovided");
        let topics = JSON.parse(readFile(config.topicsPath)).topics;
        console.log("topics", topics);
        batch.set("topics", topics);
      }
      let treatments = loadYaml(readFile(config.treatmentsPath)).treatments;
      console.log("treatments", treatments);
      batch.set("treatments", treatments);
      nPlayers = 99;
    }
  }

  console.log("nPlayers", nPlayers);
  batch.set("nPlayers", nPlayers);
  batch.set("nCurrentPlayers", 0);

  const mockGame = [
    {
      key: "treatment",
      value: { playerCount: nPlayers + 1 },
      immutable: true,
    },
    {
      key: "treatmentName",
      value: "Waiting lobby",
      immutable: true,
    },
    { key: "launchDate", value: config.launchDate },
    { key: "batchId", value: batch.id },
  ];
  await batch.addGame(mockGame);

  console.log(`Initialised batch ${batch.id}`);
  batch.set("customInitialised", true);
});

Empirica.on("batch", "status", async (ctx, { batch, status }) => {
  console.log(`Batch ${batch.id} status changed to`, status);

  if (status === "terminated") {
    const games = batch.games;
    let terminatedGames = [];
    for (const game of games) {
      if (!["ended", "failed"].includes(game.get("status"))) {
        terminatedGames.push(game);
      }
    }
    restoreGames(terminatedGames);
  }

  if (status === "running" || status === "terminated" || status === "failed") {
    setCurrentlyRecruitingBatch({ ctx });

    for (const [_, player] of playersForParticipant) {
      if (player.participantID && online.has(player.get("participantID"))) {
        await assignplayer(ctx, player);
      }
    }
  }
});

// ------------------- Game callbacks ----------------------------
Empirica.on("game", async (ctx, { game }) => {
  if (game.get("customInitialised")) return;

  game.set("assignedPlayers", 0);
  const { opponentKind } = game.get("treatment");
  if (opponentKind === "human") {
    game.set("mockWaitTime", waitRandomTime(0.05, 0.1)); // OBSOLETE
  } else {
    game.set("mockWaitTime", waitRandomTime(0.05, 0.1)); // OBSOLETE
  }

  if (game.get("reparatorySide")) {
    game.set("reparatory", true);
    const players = ctx.scopesByKind("player");
    const id = game.get("startingPlayersIds")[0];
    if (!players.has(id)) throw new Error(`Error: unknown player id ${id}`);
    const player = players.get(id);
    console.log(
      "Assigning player",
      player.get("participantIdentifier"),
      "to reparatory game",
      game.id
    );
    await game.assignPlayer(player);
    game.set("allPlayersAssigned", true);
    game.start();
  } else if (game.get("startingPlayersIds")) {
    game.set("reparatory", false);
    const players = ctx.scopesByKind("player");
    for (const id of game.get("startingPlayersIds")) {
      if (!players.has(id))
        throw new Error(`Error: unknown player id ${id} in game ${game.id}`);
      const player = players.get(id);
      console.log(
        "Assigning player",
        player.get("participantIdentifier"),
        "to game",
        game.id
      );
      await game.assignPlayer(player);
    }
    game.set("allPlayersAssigned", true);
  } else {
    game.set("reparatory", false);
  }

  game.set("customInitialised", true);
  console.log("Game", game.id, "initialised");
});

Empirica.on("game", "configMock", (ctx, { game, configMock }) => {
  if (!configMock || game.get("mockConfigured")) return;

  const launchDate = game.get("launchDate");
  let synchroType;
  if (Number.isInteger(launchDate)) {
    synchroType = "rolling clock";
    game.set("nextMatchingTime", Date.now() + launchDate);
    timers[game.id] ||= setInterval(() => {
      game.set("matchingClock", true);
      game.set("nextMatchingTime", game.get("nextMatchingTime") + launchDate);
      Empirica.flush();
    }, launchDate);
  } else if (launchDate) {
    synchroType = "set clock";
    const parsedLaunchDate = new Date(launchDate);
    game.set("nextMatchingTime", parsedLaunchDate.getTime());
    setTimeout(() => {
      game.set("matchingClock", true);
      Empirica.flush();
    }, parsedLaunchDate - Date.now());
  } else {
    synchroType = "continuous";
  }

  for (const game_ of game.batch.games) {
    game_.set("synchroType", synchroType);
  }

  game.set("mockConfigured", true);
  console.log("Waiting lobby initialized as", game.get("synchroType"));
});

Empirica.on("game", "status", (ctx, { game, status }) => {
  console.log(`Game ${game.id} status changed to ${status}`);

  if (status === "ended" || status === "terminated" || status === "failed")
    if (game.id in timers) clearInterval(timers[game.id]);

  if (status === "failed") {
    restoreGames([game]);
  }

  if (status === "ended") {
    game.players.forEach((player) => {
      const hitId = player.get("hitId");
      if (!hitId) return;
      player.game.set("completionCode", hash(hitId + "debategpt"));
    });
  }
});

// This callback is only ever fired for the Waiting lobby mock game
Empirica.on("game", "matchingClock", async (ctx, { game, matchingClock }) => {
  if (!matchingClock) return;
  console.log("Fired matchingClock callback");

  let playersReady = [];
  for (const player of game.players) {
    if (player.get("inCountdown")) {
      playersReady.push(player);
    }
  }

  const batch = game.batch;
  const mode = batch.get("gameCreationMode");
  if (mode != "provided") {
    await createGames(batch, playersReady, mode);

    // await all playersReady to be assigned, before failing the mock game
    // await Promise.all(
    //   playersReady.map(async (player) => {
    //     await new Promise((resolve) => {
    //       const interval = setInterval(() => {
    //         if (
    //           player &&
    //           game &&
    //           player.currentGame &&
    //           player.currentGame.id !== game.id
    //         ) {
    //           clearInterval(interval);
    //           resolve();
    //         }
    //       }, 100);
    //     });
    //   })
    // );
  } else {
    await matchplayers(batch, playersReady, "clock");

    // If synchroType is set clock, fail all unassigned games
    if (game.get("synchroType") === "set clock") {
      for (const _game of batch.games) {
        if (!_game.get("allPlayersAssigned")) {
          _game.end("failed", "set clock fired, game not filled");
        }
      }
    }
  }

  // If synchroType is set clock, fail mock game and reset recruiting batch
  if (game.get("synchroType") === "set clock") {
    game.end("failed", "set clock fired");
    batch.set("allPlayersAssigned", true);
    setCurrentlyRecruitingBatch({ ctx });
  }

  game.set("matchingClock", false);
});

// ------------------- Player callbacks --------------------------
Empirica.on(TajribaEvent.ParticipantConnect, async (ctx, { participant }) => {
  console.log(`Participant ${participant.id} connected`);
  online.set(participant.id, participant);

  const player = playersForParticipant.get(participant.id);

  if (!player) {
    return;
  }

  await assignplayer(ctx, player);
});

Empirica.on(
  TajribaEvent.ParticipantDisconnect,
  async (ctx, { participant }) => {
    console.log(`Participant ${participant.id} disconnected`);
    online.delete(participant.id);

    //If in Waiting Lobby, remove player from game and from batch.
    const player = playersForParticipant.get(participant.id);
    const game = player.currentGame;
    if (
      game &&
      game.get("treatmentName") === "Waiting lobby" &&
      !["terminated", "failed"].includes(game.get("status"))
    ) {
      player.set("gameID", null);
      player.set("batchId", null);
      await game.removePlayer(player);

      const batch = game.batch;
      batch.set("nCurrentPlayers", batch.get("nCurrentPlayers") - 1);

      if (batch.get("allPlayersAssigned")) {
        batch.set("allPlayersAssigned", false);
        setCurrentlyRecruitingBatch({ ctx });
      }
    }
  }
);

Empirica.on("player", async (ctx, { player }) => {
  console.log(
    `Player ${player.id}-${player.get("participantIdentifier")} created`
  );
  if (!player.get("participantID")) return;

  playersForParticipant.set(player.get("participantID"), player);

  if (online.has(player.get("participantID"))) {
    await assignplayer(ctx, player);
  }
});

Empirica.on("player", "introDone", async (ctx, { player, introDone }) => {
  if (!introDone) return;
  const game = player.currentGame;

  if (!game.get("allPlayersAssigned")) return;

  let gameReady = true;
  for (const player of game.players) {
    if (!player.get("introDone")) {
      gameReady = false;
      break;
    }
  }
  if (gameReady) {
    game.start();
  }
});

Empirica.on(
  "player",
  "matchingContinuous",
  async (ctx, { player, matchingContinuous }) => {
    if (!matchingContinuous || player.get("matchedContinuous")) return;
    console.log("Fired matchingContinuous callback");

    const batch = player.currentGame.batch;
    await matchplayers(batch, [player], "continuous");

    player.set("matchedContinuous", true);
  }
);

Empirica.on("player", "ended", async (ctx, { player, ended }) => {
  console.log(
    "Player",
    player.get("participantIdentifier"),
    "ended changed to",
    ended
  );

  if (ended === "no consent") {
    const batch = player.currentGame.batch;
    batch.set("nCurrentPlayers", batch.get("nCurrentPlayers") - 1);

    if (batch.get("allPlayersAssigned")) {
      batch.set("allPlayersAssigned", false);
      setCurrentlyRecruitingBatch({ ctx });
    }
  }
});

Empirica.on("player", "replay", async (ctx, { player, replay }) => {
  console.log(
    "Player",
    player.get("participantIdentifier"),
    "replay changed to",
    replay
  );
  if (!replay) return;

  await assignplayer(ctx, player);
});

Empirica.on("player", "submitReady", (ctx, { player, submitReady }) => {
  // OBSOLETE: Used to support stage advancements with a "next" button instead of a fixed timer
  console.log(
    "Player",
    player.get("participantIdentifier"),
    "submit ready changed to",
    submitReady
  );
  if (!submitReady) return;

  const { opponentKind } = player.get("treatment");
  if (opponentKind === "human") {
    player.stage.set("submit", true);
    player.set("submitReady", false);
    return;
  }

  const wait = player.currentStage.get("llmWait");
  const startTime = player.currentStage.get("startTime");
  const elapsedTime = Date.now() - startTime;
  const remainingTime = Math.max(1, wait - elapsedTime);

  const timePromise = new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, remainingTime);
  });

  let llmPromise;
  const stageName = player.currentStage.get("name");
  if (stageName == "Pre-treatment") {
    // Mock promise that resolves immediately
    llmPromise = new Promise((resolve) => {
      resolve();
    });
  } else if (stageName === "Opening") {
    llmPromise = new Promise((resolve) => {
      const interval = setInterval(() => {
        if (player.currentGame.get("argumentAI")) {
          resolve();
          clearInterval(interval);
        }
      }, 100);
    });
  } else if (stageName === "Rebuttal") {
    llmPromise = new Promise((resolve) => {
      const interval = setInterval(() => {
        if (player.currentGame.get("rebuttalAI")) {
          resolve();
          clearInterval(interval);
        }
      }, 100);
    });
  } else if (stageName == "Conclusion") {
    llmPromise = new Promise((resolve) => {
      const interval = setInterval(() => {
        if (player.currentGame.get("conclusionAI")) {
          resolve();
          clearInterval(interval);
        }
      }, 100);
    });
  } else {
    throw new Error("Invalid stage name");
  }

  Promise.all([timePromise, llmPromise]).then(() => {
    player.stage.set("submit", true);
    player.set("submitReady", false);
    Empirica.flush();
  });
});

// Logging
Empirica.on("player", "exitLogs", (ctx, { player, exitLogs }) => {
  if (exitLogs.split("-").length !== 2) return;

  [agreementPostTreatment, perceivedOpponent] = exitLogs.split("-");
  console.log(
    "Player",
    player.get("participantIdentifier"),
    "agreementPostTreatment changed to",
    agreementPostTreatment
  );
  console.log(
    "Player",
    player.get("participantIdentifier"),
    "perceivedOpponent changed to",
    perceivedOpponent
  );
});
