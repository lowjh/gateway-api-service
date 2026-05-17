import express from "express";
import morgan from "morgan";
import { spawn } from "child_process";
import { createWriteStream, existsSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const PROXY_USER = process.env.PROXY_USER || "openclaw001";
const PROXY_PASS = process.env.PROXY_PASSWORD || "";
const PROXY_PORT = parseInt(process.env.PROXY_PORT || "1080");

// Logging
app.use(morgan("combined"));

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
    node: process.version
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[gateway-api] Server running on port ${PORT}`);
});
