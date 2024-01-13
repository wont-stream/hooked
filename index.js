const { createServer } = require("http");
const express = require("express");
const { WebSocketServer, WebSocket } = require("ws");
const bot = require("./bot");
const DB = require("simple-json-db");
const config = require("./config");

const app = express();
const server = createServer(app)
const wss = new WebSocketServer({ server });
const db = new DB("discord.json");

app.disable("etag");

app.on("upgrade", (request, socket, head) => {console.log("1")
  wss.handleUpgrade(request, socket, head, (socket) => {
    wss.emit("connection", socket, request);
  });
});

bot(db, async (data) => {
  wss.clients.forEach(async (ws) => {
    if (ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify(data));
  });
});

wss.on("connection", async (ws) => {
  ws.send(JSON.stringify(db.get("data")));
});

app.get("/", async (req, res) => {
  res.send(db.get("data"));
});

app.all("*", async (req, res) => {
  res.redirect(config.webserver.notfound.redirect + req.path);
});

server.listen(config.webserver.port);