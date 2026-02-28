import { Buffer } from "buffer";

if (typeof window !== "undefined") {
  (window as any).Buffer = (window as any).Buffer || Buffer;
}

if (typeof globalThis !== "undefined") {
  (globalThis as any).Buffer = (globalThis as any).Buffer || Buffer;
}

// Sometimes Web3 libraries also expect a minimal `process` object in the browser
if (typeof process === "undefined") {
  (globalThis as any).process = {
    env: {},
    version: "",
    nextTick: (fn: Function) => setTimeout(fn, 0),
  };
}
