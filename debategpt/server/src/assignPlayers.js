import { setCurrentlyRecruitingBatch } from "./utils";

export async function assignplayer(ctx, player) {
  console.log(
    "Trying to assign player",
    player.get("participantIdentifier"),
    "to a batch"
  );

  if (player.get("batchId") && !player.get("replay")) {
    console.log(
      "Player",
      player.get("participantIdentifier"),
      "already assigned to a batch"
    );
    return;
  }

  const batchId = ctx.globals.get("recruitingBatchId");
  if (batchId === undefined) {
    console.log("No open batches");
    player.set("noExperiments", true);
    await player.currentGame.removePlayer(player);
    player.set("gameID", null);
    return;
  }
  console.log(
    "Assigning player",
    player.get("participantIdentifier"),
    "to batch",
    batchId
  );
  player.set("batchId", batchId);
  player.set("noExperiments", false);
  player.set("replay", false);

  const batches = ctx.scopesByKind("batch");
  const batch = batches.get(batchId);

  const mockGame = batch.games.filter(
    (game) => game.get("treatmentName") === "Waiting lobby"
  )[0];
  await mockGame.assignPlayer(player);

  batch.set("nCurrentPlayers", batch.get("nCurrentPlayers") + 1);
  if (batch.get("nCurrentPlayers") === batch.get("nPlayers")) {
    batch.set("allPlayersAssigned", true);
    setCurrentlyRecruitingBatch({ ctx });
  }
}

export async function matchplayers(batch, players, mode) {
  let nAvailablePlayers = players.length;
  let i = 0;

  for (const [j, game] of batch.games.reverse().entries()) {
    if (
      !game.hasStarted &&
      !game.hasEnded &&
      !game.get("allPlayersAssigned") &&
      game.get("treatmentName") !== "Waiting lobby"
    ) {
      if (mode === "clock") {
        const nRequiredPlayers = game.get("treatment")["playerCount"];
        if (nAvailablePlayers < nRequiredPlayers) {
          console.log(
            `Finished matching. ${nAvailablePlayers} players left unmatched.`
          );
          return;
        }

        for (let j = 0; j < nRequiredPlayers; j++) {
          console.log(
            "Assigning player",
            players[i].get("participantIdentifier"),
            "to game",
            game.id
          );
          await game.assignPlayer(players[i]);
          i++;
        }
        nAvailablePlayers -= nRequiredPlayers;
        game.set("assignedPlayers", nRequiredPlayers);
        game.set("allPlayersAssigned", true);
      } else if (mode === "continuous") {
        console.log(
          "Assigning player",
          players[0].get("participantIdentifier"),
          "to game",
          game.id
        );
        await game.assignPlayer(players[0]);
        game.set("assignedPlayers", game.get("assignedPlayers") + 1);
        if (
          game.get("assignedPlayers") !== game.get("treatment")["playerCount"]
        )
          return;

        game.set("allPlayersAssigned", true);
        players[0].set("introDone", true); // altenative to game.start(). The callback needs to be called again here, because otherwise when it's called from the frontend the game is not yet fully assigned due to the async nature of this function
        if (j !== batch.games.length - 1) return;
      } else {
        throw new Error(`Unknown mode ${mode}`);
      }
    }
  }

  // When all games are assigned, close the mock game
  console.log("Finished matching: all games are assigned. Closing mock game.");
  const mockGame = batch.games.filter(
    (game) => game.get("treatmentName") === "Waiting lobby"
  )[0];
  mockGame.end("ended", "all games filled");
}
