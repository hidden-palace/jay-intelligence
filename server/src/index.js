import "dotenv/config";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runChatCompletion } from "./chatService.js";

const app = express();
const port = Number(process.env.PORT || 8787);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

function buildCorsOrigin(originSetting) {
  if (originSetting === "*") {
    return true;
  }

  return originSetting.split(",").map((origin) => origin.trim());
}

app.use(
  helmet({
    contentSecurityPolicy: false,
    frameguard: false
  })
);
app.use(
  cors({
    origin: buildCorsOrigin(clientOrigin)
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "jays-intelligence-api" });
});

app.post("/chat", async (req, res, next) => {
  try {
    const { message, history, userId } = req.body ?? {};

    if (typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "A non-empty message is required." });
    }

    const result = await runChatCompletion({
      message: message.trim(),
      history,
      userId
    });

    return res.json(result);
  } catch (error) {
    return next(error);
  }
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const clientDistPath = resolve(__dirname, "../../client/dist");

if (existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get("*", (_req, res) => {
    res.sendFile(resolve(clientDistPath, "index.html"));
  });
}

app.use((error, _req, res, _next) => {
  console.error(error);

  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 && !error.expose
      ? "Jay's Intelligence could not complete the request."
      : error.message;

  res.status(statusCode).json({
    error: message
  });
});

app.listen(port, () => {
  console.log(`Jay's Intelligence API listening on http://localhost:${port}`);
});
