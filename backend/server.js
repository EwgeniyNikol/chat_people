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

app.post("/new-user", (req, res) => {
  const { name } = req.body;
  const exists = userState.some(user => user.name === name);
  if (exists) {
    return res.status(409).json({ status: "error", message: "This name is already taken!" });
  }
  const user = { id: randomUUID(), name };
  userState.push(user);
  res.json({ status: "ok", user });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  let currentUser = null;

  ws.on("message", (data, isBinary) => {
    try {
      const msg = JSON.parse(data);
      if (msg.user && !currentUser) {
        currentUser = { id: msg.user.id, name: String(msg.user.name) };
      }

      if (msg.type === "send") {
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(data, { binary: isBinary });
          }
        });
      }

      if (msg.type === "exit" && currentUser) {
        const index = userState.findIndex(u => u.id === currentUser.id);
        if (index !== -1) userState.splice(index, 1);
        const userList = JSON.stringify(userState);
        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) client.send(userList);
        });
      }
    } catch (e) {
      logger.error("Parse error:", e);
    }
  });

  ws.on("close", () => {
    if (currentUser) {
      const index = userState.findIndex(u => u.id === currentUser.id);
      if (index !== -1) userState.splice(index, 1);
      const userList = JSON.stringify(userState);
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) client.send(userList);
      });
      logger.info(`User ${currentUser.name} disconnected`);
    }
  });

  ws.send(JSON.stringify(userState));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));