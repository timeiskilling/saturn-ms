import { serve } from "bun";
import index from "./index.html";
import Redis from "ioredis";
import "./polyfill.ts";
const redisSubscriber = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
});

let serverRef: any = null;

const server = serve({
  port: 3001,
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/ws": {
      GET(req) {
        if (serverRef && serverRef.upgrade(req)) {
          return;
        }
        return new Response("Upgrade failed", { status: 400 });
      },
    },

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        });
      },
    },

    "/api/hello/:name": async (req) => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      });
    },
  },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
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
