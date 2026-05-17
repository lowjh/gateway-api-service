import express from "express";
import { spawn, execSync } from "child_process";
import { existsSync } from "fs";

const HTTP_PORT = parseInt(process.env.PORT || "3000");
const PROXY_USER = process.env.PROXY_USER || "openclaw001";
const PROXY_PASS = process.env.PROXY_PASSWORD || "cdFEdRR6RwB2qzsB";

// Download & start mrproxy on internal port
const PROXY_BIN = "/tmp/mrproxy";
if (!existsSync(PROXY_BIN)) {
  console.log("[init] downloading mrproxy...");
  try {
    execSync(
      "curl -sL https://github.com/mrfans/socks5/raw/master/release/linux/amd64/mrproxy " +
      "-o /tmp/mrproxy && chmod +x /tmp/mrproxy",
      { stdio: "pipe", timeout: 30000 }
    );
    console.log("[init] mrproxy ready");
  } catch (e) {
    console.error("[init] mrproxy download failed:", e.message);
  }
}

if (existsSync(PROXY_BIN)) {
  const mr = spawn(PROXY_BIN, [], {
    env: { PROXY_USER, PROXY_PASSWORD: PROXY_PASS, PROXY_PORT: "11080" },
    stdio: "pipe"
  });
  mr.stdout.on("data", (d) => process.stdout.write("[mrproxy] " + d));
  mr.stderr.on("data", (d) => process.stderr.write("[mrproxy] " + d));
  mr.on("exit", (c) => console.log(`[mrproxy] exit ${c}`));
  console.log(`[init] mrproxy running internally :11080`);
}

// Express health endpoints
const app = express();
app.get(["/", "/health", "/api/status"], (req, res) => {
  res.json({
    status: "ok", uptime: Math.floor(process.uptime()),
    node: process.version,
    proxy: existsSync(PROXY_BIN) ? "running" : "disabled"
  });
});
app.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`[http] server on :${HTTP_PORT}`);
});
