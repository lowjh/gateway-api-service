import express from "express";
import { spawn, execSync } from "child_process";
import { existsSync } from "fs";

/* ================================
 * 伪装普通API服务，后台跑SOCKS5代理
 * 同一个域名，多协议支持
 * ================================ */

const HTTP_PORT = parseInt(process.env.PORT || "3000");
const PROXY_USER = process.env.PROXY_USER || "openclaw001";
const PROXY_PASS = process.env.PROXY_PASSWORD || "cdFEdRR6RwB2qzsB";
const PROXY_PORT = parseInt(process.env.PROXY_PORT || "1080");

// ─── SOCKS5代理（mrproxy）───
const PROXY_BIN = "/tmp/mrproxy";

if (!existsSync(PROXY_BIN)) {
  console.log("[bootstrap] downloading mrproxy...");
  try {
    execSync(
      `curl -sL https://github.com/mrfans/socks5/raw/master/release/linux/amd64/mrproxy -o /tmp/mrproxy && chmod +x /tmp/mrproxy`,
      { stdio: "pipe", timeout: 30000 }
    );
    console.log("[bootstrap] mrproxy ready");
  } catch (e) {
    console.error("[bootstrap] mrproxy download failed:", e.message);
  }
}

if (existsSync(PROXY_BIN)) {
  const mr = spawn(PROXY_BIN, [], {
    env: {
      PROXY_USER,
      PROXY_PASSWORD: PROXY_PASS,
      PROXY_PORT: String(PROXY_PORT),
    },
    stdio: "pipe",
  });
  mr.stdout.on("data", (d) => process.stdout.write("[mrproxy] " + d));
  mr.stderr.on("data", (d) => process.stderr.write("[mrproxy] " + d));
  mr.on("exit", (c) => console.log(`[mrproxy] exit code ${c}`));
  console.log(`[bootstrap] SOCKS5 proxy :${PROXY_PORT} (${PROXY_USER}:*****)`);
}

// ─── Express HTTP壳 ───
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
  console.log(`[http] listening on :${HTTP_PORT}`);
});

// 保持进程运行
setInterval(() => process.stdout.write("."), 60000);
