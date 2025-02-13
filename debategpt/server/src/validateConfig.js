export function validateConfig(config) {
  if (!("custom" in config)) return;

  if (!("lobbyConfig" in config)) {
    throw new Error("Invalid config: lobbyConfig is required");
  }

  if ("launchDate" in config && !Number.isInteger(config.launchDate)) {
    const parsedLaunchDate = new Date(config.launchDate);
    if (parsedLaunchDate < new Date(Date.now()))
      throw new Error(
        "Invalid config: for set-clock matching, launchDate must be a future date"
      );
  }

  if ("gamesPath" in config) return; // provided-games mode

  if (!("launchDate" in config))
    throw new Error(
      "Invalid config: unprovided-games mode is not supported with continuous matching"
    );

  if (
    !("treatmentsPath" in config) ||
    (!("gamesBufferPath" in config) && !("topicsPath" in config))
  )
    throw new Error(
      "Invalid config: either gamesPath, both treatmentsPath and topicsPath, or both treatmentsPath and gamesBufferPath must be provided"
    );
}
