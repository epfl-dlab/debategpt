import { AdminContext } from "@empirica/core/admin";
import {
  Classic,
  classicKinds,
  ClassicLoader,
  Lobby,
} from "@empirica/core/admin/classic";
import { info, setLogLevel } from "@empirica/core/console";
import minimist from "minimist";
import process from "process";
import { Empirica } from "./callbacks";

const argv = minimist(process.argv.slice(2), { string: ["token"] });

setLogLevel(argv["loglevel"] || "info");

(async () => {
  const ctx = await AdminContext.init(
    argv["url"] || "http://localhost:3000/query",
    argv["sessionTokenPath"],
    "callbacks",
    argv["token"],
    {},
    classicKinds
  );

  ctx.register(ClassicLoader);
  ctx.register(
    Classic({
      disableAssignment: true,
      disableIntroCheck: true,
      disableGameCreation: false,
      disableBatchAutoend: false,
    })
  ); // ref https://github.com/empiricaly/empirica/blob/297d560424ab9a7ee8d53efabdfc09248e7ec271/lib/%40empirica/core/src/admin/classic/classic.ts
  ctx.register(Lobby());
  ctx.register(Empirica);
  ctx.register(function (_) {
    _.on("ready", function () {
      info("server: started");
    });
  });
})();

process.on("unhandledRejection", function (reason, p) {
  process.exitCode = 1;
  console.error("Unhandled Promise Rejection. Reason: ", reason);
});
