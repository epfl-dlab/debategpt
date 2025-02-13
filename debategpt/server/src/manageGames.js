const Database = require("better-sqlite3");

export async function createGames(batch, players, mode) {
  const quotient = Math.floor(players.length / 4);
  const remainder = players.length % 4;
  let nHumanGames, nHumanPersonalizedGames, nAIGames, nAIPersonalizedGames;
  switch (remainder) {
    case 0:
      nHumanGames = 0;
      nHumanPersonalizedGames = quotient * 2;
      nAIGames = 0;
      nAIPersonalizedGames = 0;
      break;
    case 1:
      nHumanGames = 0;
      nHumanPersonalizedGames = quotient * 2;
      random = Math.round(Math.random());
      nAIGames = random;
      nAIPersonalizedGames = random ^ 1;
      break;
    case 2:
      nHumanGames = 0;
      nHumanPersonalizedGames = quotient * 2 + 1;
      nAIGames = 0;
      nAIPersonalizedGames = 0;
      break;
    case 3:
      nHumanGames = 0;
      nHumanPersonalizedGames = quotient * 2 + 1;
      random = Math.round(Math.random());
      nAIGames = random;
      nAIPersonalizedGames = random ^ 1;
      break;
  }

  console.log(
    "Creating " +
      nHumanGames +
      " Human-Human games, " +
      nHumanPersonalizedGames +
      " Human-Human-Personalized games, " +
      nAIGames +
      " Human-AI games, and " +
      nAIPersonalizedGames +
      " Human-AI-Personalized games"
  );
  if (
    nHumanGames + nHumanPersonalizedGames + nAIGames + nAIPersonalizedGames ===
    0
  )
    return;

  const treatments = batch.get("treatments");
  let gameArray = new Array();

  if (mode == "unprovided") {
    const topics = batch.get("topics");
    const topic = topics[Math.floor(Math.random() * topics.length)];
    for (const [type, ntype] of [
      ["Human-Human", nHumanGames],
      ["Human-Human, personalized", nHumanPersonalizedGames],
      ["Human-AI, mixtral", nAIGames],
      ["Human-AI, personalized, mixtral", nAIPersonalizedGames],
    ]) {
      const treatment = treatments.filter(
        (treatment) => treatment.name === type
      )[0];
      for (let i = 0; i < ntype; i++) {
        const game = [
          {
            key: "treatment",
            value: treatment.factors,
            immutable: true,
          },
          {
            key: "treatmentName",
            value: treatment.name + " - " + topic + " - " + (i + 1),
            immutable: true,
          },
          { key: "topic", value: topic },
        ];
        gameArray.push(game);
      }
    }
  } else if (mode == "buffer") {
    const { gamesBufferPath } = batch.get("config").config;

    const db = new Database(gamesBufferPath, {
      verbose: console.log,
      fileMustExist: true,
      nativeBinding:
        "node_modules/better-sqlite3/build/Release/better_sqlite3.node",
    });
    db.pragma("journal_mode = WAL");
    console.log("[SQLITE] Connected to the games database", gamesBufferPath);

    const select_stmt = db.prepare(
      `
      SELECT *
      FROM games
      WHERE treatment = ?
      AND done = 0
      LIMIT ?
      `
    );
    let assignedGamesIDs = [];
    for (const [type, ntype] of [
      ["Human-Human", nHumanGames],
      ["Human-Human, personalized", nHumanPersonalizedGames],
      ["Human-AI, mixtral", nAIGames],
      ["Human-AI, personalized, mixtral", nAIPersonalizedGames],
    ]) {
      const treatment = treatments.filter(
        (treatment) => treatment.name === type
      )[0];

      // ! this does not guarantee that there are enough games in the buffer of the given type
      for (const row of select_stmt.iterate(type, ntype)) {
        const game = [
          {
            key: "treatment",
            value: treatment.factors,
            immutable: true,
          },
          {
            key: "treatmentName",
            value: row.treatmentName,
            immutable: true,
          },
          { key: "topic", value: row.topic },
          { key: "bufferID", value: row.id, immutable: true },
        ];
        assignedGamesIDs.push(row.id);
        gameArray.push(game);
      }
    }

    // Non-blocking update of the games buffer
    const update_stmt = db.prepare(
      `
      UPDATE games
      SET done = 1
      WHERE id IN (${assignedGamesIDs.map(() => "?").join(", ")})
      `
    );

    const transaction = async (ids) => {
      db.transaction((ids) => {
        update_stmt.run(ids);
      })(ids);
      console.log(
        "[SQLITE] Marked the following games as done in the buffer: " +
          ids.join(",")
      );
    };

    transaction(assignedGamesIDs).then(() => {
      db.close();
      console.log("[SQLITE] Closed the games database connection.");
    });
  } else {
    throw new Error("Invalid mode: " + mode);
  }

  // Randomize order of games
  gameArray = gameArray
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);

  let j = 0;
  for (let i = 0; i < gameArray.length; i++) {
    let game = gameArray[i];
    const playerCount = game[0].value.playerCount;
    game.push({
      key: "startingPlayersIds",
      value: players.slice(j, j + playerCount).map((p) => p.id),
      immutable: true,
    });
    j += playerCount;
  }

  // assert that all players were assigned
  if (j !== players.length) {
    console.error("Not all players were assigned in unprovided-games mode.");
  }

  // add games to batch
  await Promise.all(gameArray.map(async (game) => await batch.addGame(game)));
}

export async function restoreGames(games) {
  let bufferIDs = [];
  for (const game of games) {
    const bufferID = game.get("bufferID");
    if (!bufferID) continue;
    bufferIDs.push(bufferID);
  }
  if (bufferIDs.length === 0) return;

  const { gamesBufferPath } = games[0].batch.get("config").config;
  const db = new Database(gamesBufferPath, {
    verbose: console.log,
    fileMustExist: true,
    nativeBinding:
      "node_modules/better-sqlite3/build/Release/better_sqlite3.node",
  });
  db.pragma("journal_mode = WAL");

  // Non-blocking update of the games buffer
  const update_stmt = db.prepare(
    `
    UPDATE games
    SET done = 0
    WHERE id IN (${bufferIDs.map(() => "?").join(", ")})
    `
  );

  const transaction = async (ids) => {
    db.transaction((ids) => {
      update_stmt.run(ids);
    })(ids);
    console.log(
      "[SQLITE] Reset the following games as not done in the buffer: " +
        ids.join(",")
    );
  };

  transaction(bufferIDs).then(() => {
    db.close();
    console.log("[SQLITE] Closed the games database connection.");
  });
}

export async function createReparatoryGame(player, mode) {
  const game = player.currentGame;

  if (["provided", "unprovided"].includes(mode)) {
    const newGame = [
      {
        key: "treatment",
        value: {
          opponentKind: "ai",
          playerCount: 1,
          llm: "gpt4",
        },
        immutable: true,
      },
      {
        key: "treatmentName",
        value: game.get("treatmentName") + " - reparatory",
        immutable: true,
      },
      {
        key: "topic",
        value: game.get("topic"),
      },
      {
        key: "startingPlayersIds",
        value: [player.id],
        immutable: true,
      },
      {
        key: "reparatoryAgreementPreTreatment",
        value: player.game.get("agreementPreTreatment"),
        immutable: true,
      },
      {
        key: "reparatorySide",
        value: player.game.get("role"),
        immutable: true,
      },
    ];
    return newGame;
  } else if (mode == "buffer") {
    const { gamesBufferPath } = game.batch.get("config").config;
    const db = new Database(gamesBufferPath, {
      verbose: console.log,
      fileMustExist: true,
      nativeBinding:
        "node_modules/better-sqlite3/build/Release/better_sqlite3.node",
    });
    db.pragma("journal_mode = WAL");

    const select_stmt = db.prepare(
      `
    SELECT *
    FROM games
    WHERE topic = ?
    AND done = 0
    AND treatment IN ('Human-AI', 'Human-AI, personalized', 'Human-AI, mixtral', 'Human-AI, personalized, mixtral')
    LIMIT 1
    `
    );

    console.log("prepared statement");

    const topic = game.get("topic");
    const row = select_stmt.get(topic);
    if (!row) {
      console.log("No reparatory game found for topic " + topic);
      return;
    }

    const treatments = game.batch.get("treatments");
    const treatment = treatments.filter(
      (treatment) => treatment.name === row.treatment
    )[0];

    const newGame = [
      {
        key: "treatment",
        value: treatment.factors,
        immutable: true,
      },
      {
        key: "treatmentName",
        value: row.treatmentName,
        immutable: true,
      },
      {
        key: "topic",
        value: game.get("topic"),
      },
      {
        key: "startingPlayersIds",
        value: [player.id],
        immutable: true,
      },
      {
        key: "reparatoryAgreementPreTreatment",
        value: player.game.get("agreementPreTreatment"),
        immutable: true,
      },
      {
        key: "reparatorySide",
        value: player.game.get("role"),
        immutable: true,
      },
      {
        key: "bufferID",
        value: row.id,
        immutable: true,
      },
    ];

    // Non-blocking update of the games buffer
    const update_stmt = db.prepare(
      `
    UPDATE games
    SET done = 1
    WHERE id = ?
    `
    );

    const transaction = async (id) => {
      db.transaction((id) => {
        update_stmt.run(id);
      })(id);
      console.log(
        "[SQLITE] Found a reparatory game: marked as done in the buffer: " + id
      );
    };

    transaction(row.id).then(() => {
      db.close();
      console.log("[SQLITE] Closed the games database connection.");
    });
    return newGame;
  } else {
    throw new Error("Invalid mode: " + mode);
  }
}
