const fs = require("fs");
const { createHash } = require("crypto");

export function readFile(path) {
  try {
    const content = fs.readFileSync(path, "utf8");
    return content;
  } catch (err) {
    console.error(err);
    return null;
  }
}

export function waitRandomTime(min, max) {
  // min and max are in minutes, the function returns milliseconds
  let wait = Math.random() * (max - min);
  wait = Math.floor((wait + min) * 60 * 1000);
  return wait;
}

export function hash(string) {
  return createHash("sha256").update(string).digest("hex");
}

// Copied from https://github.com/Watts-Lab/deliberation-empirica/blob/main/server/src/utils.js#L50-L81
export function getOpenBatches(ctx) {
  // Return an array of open batches
  const batches = ctx.scopesByKind("batch"); // returns Map object
  const openBatches = [];
  for (const [, batch] of batches) {
    if (batch.get("status") === "running") openBatches.push(batch);
  }
  return openBatches;
}

export function selectOldestBatch(batches) {
  if (!Array.isArray(batches)) return undefined;
  if (!batches.length > 0) return undefined;

  let currentOldestBatch = batches[0];
  for (const comparisonBatch of batches) {
    try {
      if (
        Date.parse(currentOldestBatch.get("createdAt")) >
        Date.parse(comparisonBatch.get("createdAt"))
      )
        currentOldestBatch = comparisonBatch;
    } catch (err) {
      console.log(
        `Failed to parse createdAt timestamp for Batch ${comparisonBatch.id}`,
        err
      );
    }
  }

  return currentOldestBatch;
}

export function sortBatchesByCreationTime(batches) {
  if (!Array.isArray(batches)) return undefined;
  if (!batches.length > 0) return [];

  const sortedBatches = batches.sort((a, b) => {
    try {
      return Date.parse(a.get("createdAt")) - Date.parse(b.get("createdAt"));
    } catch (err) {
      console.log(
        `Failed to parse createdAt timestamp for Batch ${a.id} or Batch ${b.id}`,
        err
      );
    }
  });

  return sortedBatches;
}

export function setCurrentlyRecruitingBatch({ ctx }) {
  const openBatches = getOpenBatches(ctx);
  const batches = sortBatchesByCreationTime(openBatches);

  for (const batch of batches) {
    // It can happen that the batch changes status to running before the topic is set, leaving it undefined. https://github.com/empiricaly/empirica/issues/416
    if (!batch.get("customInitialised")) {
      batch.set("status", "failed");
      console.log(
        `Batch ${batch.id} was not finished initializing, setting status to failed. Try again.`
      );
      continue;
    }
    if (batch.get("allPlayersAssigned")) {
      console.log(`Batch ${batch.id} is full, skipping.`);
      continue;
    }

    const { config } = batch.get("config");
    console.log(
      `Currently recruiting for batch: ${config.name} - ${batch.id}, with config`
    );
    console.log(config);

    const mockGame = batch.games.filter(
      (game) => game.get("treatmentName") === "Waiting lobby"
    )[0];
    mockGame.set("configMock", true);
    ctx.globals.set("recruitingBatchId", batch.id);
    return;
  }

  console.log("No batches are recruiting. Resetting recruiting batch.");
  ctx.globals.set("recruitingBatchId", undefined);
}
