import express from "express";
import { spawn } from "child_process";
import { existsSync } from "fs";

const HTTP_PORT = parseInt(process.env.PORT || "3000");
const PROXY_USER = process.env.PROXY_USER || "openclaw001";
const PROXY_PASS = process.env.PROXY_PASSWORD || "cdFEdRR6RwB2qzsB";
const PROXY_PORT = parseInt(process.env.PROXY_PORT || "1080");
const PROXY_BIN = "/tmp/mrproxy";

console.log(`[boot] starting on :${HTTP_PORT}`);

// 如果有mrproxy就启动
if (existsSync(PROXY_BIN)) {
  const mr = spawn(PROXY_BIN, [], {
    env: { ...process.env, PROXY_USER, PROXY_PASSWORD: PROXY_PASS, PROXY_PORT: String(PROXY_PORT) },
    stdio: "pipe",
  });
  mr.stdout.on("data", (d) => process.stdout.write("[mrproxy] " + d));
  mr.stderr.on("data", (d) => process.stderr.write("[mrproxy] " + d));
  mr.on("exit", (c) => console.log(`[mrproxy] exit ${c}`));
  console.log(`[boot] SOCKS5 proxy :${PROXY_PORT} ready`);
} else {
  console.log("[boot] mrproxy not found, skipping SOCKS5");
}

// Express壳
const app = express();
app.get(["/", "/health", "/api", "/api/status"], (req, res) => {
  res.json({
    ok: true,
    service: "gateway-api-service",
    version: "1.0.0",
    uptime: Math.floor(process.uptime()),
    node: process.version,
  });
});
app.listen(HTTP_PORT, "0.0.0.0", () => {
  console.log(`[http] OK :${HTTP_PORT}`);
});
