import { serve } from "bun";
import index from "./index.html";
import Redis from "ioredis";
import "./polyfill.ts";
import { appConfig } from "./config/appConfig.ts";
const redisSubscriber = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
});

let serverRef: any = null;

const server = serve({
  port: 3030,
  routes: {
    "/": index,

    "/get/list_of_tokens": {
      GET() {
        return fetch(`${appConfig.grpcServiceBase}/get/list_of_tokens`);
      },
    },

    "/ws": {
      GET(req) {
        if (serverRef && serverRef.upgrade(req)) {
          return;
        }
        return new Response("Upgrade failed", { status: 400 });
      },
    },

    // "/*": {
    //   GET(req) {
    //     console.log("BLOCKED GET:", req.url);
    //     return new Response("Bad Request", { status: 400 });
    //   },
    //   POST(req) {
    //     console.log("BLOCKED GET:", req.url);
    //     return new Response("Bad Request", { status: 400 });
    //   },
    // },
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },

  websocket: {
    open(ws) {
      ws.subscribe("binance_prices");
    },
    message(ws, message) {},
    close(ws) {},
  },
});

serverRef = server;

redisSubscriber.psubscribe("binance:*");
redisSubscriber.on("pmessage", (pattern, channel, message) => {
  server.publish("binance_prices", JSON.stringify({ channel, message }));
});

console.log(`🚀 Server running at ${server.url}`);
