const express = require("express");
const { WebSocketServer, WebSocket } = require("ws");
const bot = require("./bot");
const DB = require("simple-json-db");
const config = require("./config");

const app = express();
const wss = new WebSocketServer({ server: app });
const db = new DB("discord.json");

app.disable("etag");

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

app.listen(3000);
