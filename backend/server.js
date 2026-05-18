import { randomUUID } from "node:crypto";
import http from "node:http";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import pino from "pino";
import pinoPretty from "pino-pretty";
import WebSocket, { WebSocketServer } from "ws";

const app = express();
const logger = pino(pinoPretty());

app.use(cors());
app.use(bodyParser.json({ type(req) { return true; } }));
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

const userState = [];

app.post("/new-user", async (request, response) => {
  const { name } = request.body;
  const isExist = userState.find((user) => user.name === name);
  if (isExist) {
    return response.status(409).send(JSON.stringify({ status: "error", message: "This name is already taken!" }));
  }
  const newUser = { id: randomUUID(), name };
  userState.push(newUser);
  response.send(JSON.stringify({ status: "ok", user: newUser }));
});

const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });

wsServer.on("connection", (ws) => {
  let currentUser = null;

  ws.on("message", (msg, isBinary) => {
    const receivedMSG = JSON.parse(msg);
    if (receivedMSG.user && !currentUser) {
      currentUser = receivedMSG.user;
    }
    if (receivedMSG.type === "exit") {
      const idx = userState.findIndex((user) => user.id === currentUser?.id);
      if (idx !== -1) userState.splice(idx, 1);
      [...wsServer.clients].forEach((o) => o.send(JSON.stringify(userState)));
      return;
    }
    if (receivedMSG.type === "send") {
      [...wsServer.clients].forEach((o) => o.send(msg, { binary: isBinary }));
    }
  });

  ws.on("close", () => {
    if (currentUser) {
      const idx = userState.findIndex((user) => user.id === currentUser.id);
      if (idx !== -1) {
        userState.splice(idx, 1);
        [...wsServer.clients].forEach((o) => o.send(JSON.stringify(userState)));
        logger.info(`User "${currentUser.name}" disconnected`);
      }
    }
  });

  ws.send(JSON.stringify(userState));
});

const port = process.env.PORT || 3000;
server.listen(port, () => logger.info(`Server started on port ${port}`));