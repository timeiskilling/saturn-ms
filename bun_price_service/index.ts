import Redis from "ioredis";
import { serve } from "bun";

const redisSubscriber = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
});

let serverRef: any = null;

const server = Bun.serve({
  port: 3030,
  websocket: {
    open(ws) {
      ws.subscribe("binance_prices");
    },
    message(ws, message) {},
    close(ws) {},
  },
  fetch(req, server) {
    const url = new URL(req.url);
    if (url.pathname === "/ws") {
      if (server.upgrade(req)) return;
      return new Response("Upgrade failed", { status: 400 });
    }
    return new Response("Not found", { status: 404 });
  },
});

serverRef = server;

redisSubscriber.psubscribe("binance:*");
redisSubscriber.on("pmessage", (pattern, channel, message) => {
  server.publish("binance_prices", JSON.stringify({ channel, message }));
});

console.log(`WS Price Service running at ${server.url}`);
