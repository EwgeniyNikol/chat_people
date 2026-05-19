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
const connectedUsers = new Map();
const messageTimestamps = new Map();

app.post("/new-user", (req, res) => {
  let { name } = req.body;

  if (!name || typeof name !== "string") {
    return res.status(400).json({ status: "error", message: "Name is required!" });
  }

  name = name.trim().slice(0, 20);

  if (name.length === 0) {
    return res.status(400).json({ status: "error", message: "Name cannot be empty!" });
  }

  if (/[<>]/.test(name)) {
    return res.status(400).json({ status: "error", message: "Name contains forbidden characters!" });
  }

  const exists = userState.some(user => user.name === name);
  if (exists) {
    return res.status(409).json({ status: "error", message: "This name is already taken!" });
  }

  const user = { id: randomUUID(), name };
  userState.push(user);
  logger.info(`User registered: ${name}`);
  res.json({ status: "ok", user });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  let currentUser = null;

  ws.on("message", (data, isBinary) => {
    try {
      const msg = JSON.parse(data);

      if (msg.type === "auth" && msg.user) {
        const { id, name } = msg.user;
        if (!id || !name) return;

        const registered = userState.find(u => u.id === id && u.name === name);
        if (!registered) {
          ws.send(JSON.stringify({ type: "error", message: "Пользователь не зарегистрирован!" }));
          return;
        }

        if (connectedUsers.has(id)) {
          const oldWs = connectedUsers.get(id);
          if (oldWs.readyState === WebSocket.OPEN) {
            oldWs.close();
          }
          connectedUsers.delete(id);
          const idx = userState.findIndex(u => u.id === id);
          if (idx !== -1) userState.splice(idx, 1);
        }

        currentUser = { id, name: String(name) };
        connectedUsers.set(id, ws);

        if (!userState.find(u => u.id === id)) {
          userState.push(currentUser);
        }

        const joinMsg = JSON.stringify({
          type: "system",
          message: `${currentUser.name} присоединился к чату`
        });
        const userList = JSON.stringify(userState);

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            if (client !== ws) client.send(joinMsg);
            client.send(userList);
          }
        });

        logger.info(`User ${currentUser.name} connected`);
        return;
      }

      if (msg.type === "send") {
        if (!currentUser) {
          ws.send(JSON.stringify({ type: "error", message: "Вы не авторизованы!" }));
          return;
        }

        const now = Date.now();
        const last = messageTimestamps.get(currentUser.id) || 0;
        if (now - last < 500) {
          ws.send(JSON.stringify({ type: "error", message: "Слишком быстро! Сообщение не отправлено." }));
          return;
        }
        messageTimestamps.set(currentUser.id, now);

        const fullMessage = JSON.stringify({
          type: "send",
          user: { id: currentUser.id, name: currentUser.name },
          message: String(msg.message || "").slice(0, 2000),
          timestamp: now
        });

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(fullMessage);
          }
        });
        return;
      }

      if (msg.type === "exit" && currentUser) {
        const index = userState.findIndex(u => u.id === currentUser.id);
        if (index !== -1) userState.splice(index, 1);
        connectedUsers.delete(currentUser.id);
        messageTimestamps.delete(currentUser.id);

        const exitMsg = JSON.stringify({
          type: "system",
          message: `${currentUser.name} покинул чат`
        });
        const userList = JSON.stringify(userState);

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(exitMsg);
            client.send(userList);
          }
        });

        logger.info(`User ${currentUser.name} exited`);
        currentUser = null;
        return;
      }
    } catch (e) {
      logger.error("Parse error:", e);
      ws.send(JSON.stringify({ type: "error", message: "Неверный формат сообщения" }));
    }
  });

  ws.on("close", () => {
    if (currentUser) {
      const index = userState.findIndex(u => u.id === currentUser.id);
      if (index !== -1) userState.splice(index, 1);
      connectedUsers.delete(currentUser.id);
      messageTimestamps.delete(currentUser.id);

      const exitMsg = JSON.stringify({
        type: "system",
        message: `${currentUser.name} покинул чат`
      });
      const userList = JSON.stringify(userState);

      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(exitMsg);
          client.send(userList);
        }
      });

      logger.info(`User ${currentUser.name} disconnected`);
    }
  });

  ws.send(JSON.stringify(userState));
});

const gracefulShutdown = () => {
  logger.info("Shutting down gracefully...");
  wss.clients.forEach(client => {
    client.send(JSON.stringify({ type: "system", message: "Сервер перезагружается. Пожалуйста, переподключитесь." }));
    client.close();
  });
  wss.close();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 5000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));