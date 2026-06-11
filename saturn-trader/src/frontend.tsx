import "./polyfill";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AppTest } from "./App_tester";
import "@fontsource/jetbrains-mono";
import BigNumber from "bignumber.js";

BigNumber.config({ EXPONENTIAL_AT: 1e9 });
console.log("Welcome to Saturn");
const elem = document.getElementById("root")!;
const app = <AppTest />;

if (import.meta.hot) {
  // With hot module reloading, `import.meta.hot.data` is persisted.
  const root = (import.meta.hot.data.root ??= createRoot(elem));
  root.render(app);
} else {
  // The hot module reloading API is not available in production.
  createRoot(elem).render(app);
}
