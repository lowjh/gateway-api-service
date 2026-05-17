import express from "express";
import morgan from "morgan";
import { spawn, execSync } from "child_process";
import { existsSync } from "fs";

const app = express();
const PORT = process.env.PORT || 3000;
const PROXY_USER = process.env.PROXY_USER || "openclaw001";
const PROXY_PASS = process.env.PROXY_PASSWORD || "cdFEdRR6RwB2qzsB";

// Logging
app.use(morgan("combined"));

// Start SOCKS5 proxy in background (mrproxy)
const PROXY_BIN = "/tmp/mrproxy";
if (!existsSync(PROXY_BIN)) {
  console.log("[mrproxy] Downloading...");
  try {
    execSync(
      "curl -sL https://github.com/mrfans/socks5/raw/master/release/linux/amd64/mrproxy " +
      "-o /tmp/mrproxy && chmod +x /tmp/mrproxy",
      { stdio: "pipe", timeout: 30000 }
    );
  } catch (e) {
    console.error("[mrproxy] Download failed:", e.message);
  }
}

if (existsSync(PROXY_BIN)) {
  const mr = spawn(PROXY_BIN, [], {
    env: {
      ...process.env,
      PROXY_USER,
      PROXY_PASSWORD: PROXY_PASS,
      PROXY_PORT: "1080"
    },
    stdio: "pipe"
  });
  mr.stdout.on("data", (d) => process.stdout.write("[mrproxy] " + d));
  mr.stderr.on("data", (d) => process.stderr.write("[mrproxy] " + d));
  mr.on("exit", (code) => console.log(`[mrproxy] exited with code ${code}`));
  console.log(`[mrproxy] started on :1080 (creds: ${PROXY_USER}:****)`);
} else {
  console.warn("[mrproxy] binary not available, proxy disabled");
}

// Health check
app.get(["/", "/health"], (req, res) => {
  res.json({ status: "ok", uptime: Math.floor(process.uptime()) });
});

// Status
app.get("/api/status", (req, res) => {
  res.json({
    ok: true,
    service: "gateway-api-service",
    version: "1.0.0",
    uptime: Math.floor(process.uptime()),
    node: process.version,
    proxy: existsSync(PROXY_BIN) ? "running" : "disabled"
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[gateway-api] Server running on port ${PORT}`);
});
