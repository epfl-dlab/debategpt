import React from "react";
import * as Sentry from "@sentry/react";
import { createRoot } from "react-dom/client";
import "@unocss/reset/tailwind-compat.css";
import "virtual:uno.css";
import "../node_modules/@empirica/core/dist/player.css";
import App from "./App";
import "./index.css";

Sentry.init({
  dsn: "https://fe68cd19a1f242383b457565955e477f@o4506349242941440.ingest.sentry.io/4506349245497344",

  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 1.0,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Replay({
      maskAllText: false,
    }),
    new Sentry.BrowserTracing(),
  ],

  enabled: process.env.NODE_ENV === "production",
});

const container = document.getElementById("root");
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
