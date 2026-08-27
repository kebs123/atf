#!/usr/bin/env node
/**
 * Dev helper: open a public tunnel to the local API, print the URL, run the server.
 *
 * Usage:
 *   node scripts/dev-tunnel.mjs                 # auto provider (cloudflare, then ngrok)
 *   node scripts/dev-tunnel.mjs --provider=ngrok
 *   node scripts/dev-tunnel.mjs --tunnel-only   # do not start the server
 *
 * Env: TUNNEL_PROVIDER=cloudflare|ngrok, PORT, NGROK_DOMAIN (reserved ngrok domain).
 */
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(apiRoot, "..", "..");
dotenv.config({
  path: [path.join(apiRoot, ".env"), path.join(repoRoot, ".env")],
  quiet: true,
});

const args = process.argv.slice(2);
const flag = (name) => args.some((a) => a === `--${name}`);
const value = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split("=").slice(1).join("=");

const port = Number(process.env.PORT ?? 3001);
const tunnelOnly = flag("tunnel-only");
const requested = (value("provider") ?? process.env.TUNNEL_PROVIDER ?? "auto").toLowerCase();
const URL_TIMEOUT_MS = 45_000;

const isWin = process.platform === "win32";
const children = [];

function has(bin) {
  const probe = spawnSync(isWin ? "where" : "which", [bin], { stdio: "ignore", shell: false });
  return probe.status === 0;
}

function pickProvider() {
  if (requested === "cloudflare" || requested === "cloudflared") return "cloudflare";
  if (requested === "ngrok") return "ngrok";
  if (has("cloudflared")) return "cloudflare";
  if (has("ngrok")) return "ngrok";
  return null;
}

function track(child) {
  children.push(child);
  child.on("exit", () => {
    const i = children.indexOf(child);
    if (i >= 0) children.splice(i, 1);
  });
  return child;
}

function killTree(child) {
  if (!child.pid || child.exitCode !== null) return;
  if (isWin) {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore" });
  } else {
    child.kill("SIGTERM");
  }
}

let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of [...children]) killTree(child);
  process.exit(code);
}

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => shutdown(0));
}
process.on("exit", () => {
  for (const child of [...children]) killTree(child);
});

/** Spawn the tunnel and resolve with its public https URL. */
function startTunnel(provider) {
  const cmd =
    provider === "cloudflare"
      ? ["cloudflared", ["tunnel", "--no-autoupdate", "--url", `http://localhost:${port}`]]
      : [
          "ngrok",
          [
            "http",
            String(port),
            "--log=stdout",
            "--log-format=logfmt",
            ...(process.env.NGROK_DOMAIN ? [`--domain=${process.env.NGROK_DOMAIN}`] : []),
          ],
        ];

  const child = track(
    spawn(cmd[0], cmd[1], { cwd: apiRoot, stdio: ["ignore", "pipe", "pipe"] }),
  );

  return new Promise((resolve, reject) => {
    let settled = false;
    let noise = "";

    const finish = (url) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ child, url });
    };
    const fail = (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      reject(err);
    };

    const timer = setTimeout(() => {
      fail(
        new Error(
          `Timed out after ${URL_TIMEOUT_MS / 1000}s waiting for a ${provider} URL.\n` +
            `Last output:\n${noise.trim().split("\n").slice(-8).join("\n")}`,
        ),
      );
    }, URL_TIMEOUT_MS);

    const scan = (chunk) => {
      const text = chunk.toString();
      noise += text;
      const url =
        provider === "cloudflare"
          ? text.match(/https:\/\/[-\w]+\.trycloudflare\.com/)?.[0]
          : text.match(/url=(https:\/\/[^\s"]+)/)?.[1];
      if (url) finish(url);
      if (provider === "ngrok" && /ERR_NGROK|authtoken/i.test(text)) {
        process.stderr.write(text);
      }
    };

    child.stdout.on("data", scan);
    child.stderr.on("data", scan);
    child.on("error", (err) =>
      fail(new Error(`Could not launch \`${cmd[0]}\`: ${err.message}`)),
    );
    child.on("exit", (code) =>
      fail(new Error(`${provider} tunnel exited with code ${code}.\n${noise.trim()}`)),
    );

    // ngrok also exposes the URL on its local API; poll it as a backstop.
    if (provider === "ngrok") {
      const poll = setInterval(async () => {
        if (settled) return clearInterval(poll);
        try {
          const res = await fetch("http://127.0.0.1:4040/api/tunnels");
          const body = await res.json();
          const url = body.tunnels?.find((t) => t.public_url?.startsWith("https://"))?.public_url;
          if (url) {
            clearInterval(poll);
            finish(url);
          }
        } catch {
          /* inspector not up yet */
        }
      }, 1000);
    }
  });
}

function banner(provider, url) {
  const rows = [
    ["provider", provider],
    ["public URL", url],
    ["local URL", `http://localhost:${port}`],
    ["SMS webhook", `${url}/webhooks/sms`],
    ["verify", `${url}/verify`],
    ["health", `${url}/health`],
  ];
  const width = Math.max(...rows.map(([, v]) => v.length)) + 15;
  const line = "─".repeat(width);
  const out = [
    "",
    `┌${line}┐`,
    ...rows.map(([k, v]) => `│ ${k.padEnd(12)}${v.padEnd(width - 14)} │`),
    `└${line}┘`,
    "",
  ];
  process.stdout.write(out.join("\n"));
}

function startServer(url) {
  // Single-string command + shell: npm is a .cmd shim on Windows, which spawn cannot exec directly.
  const child = track(
    spawn("npm run dev", {
      cwd: apiRoot,
      shell: true,
      env: {
        ...process.env,
        PUBLIC_API_URL: url,
        SMS_WEBHOOK_URL: `${url}/webhooks/sms`,
        // The tunnel is one trusted hop, so per-IP rate limits see the real client IP.
        TRUST_PROXY: process.env.TRUST_PROXY ?? "1",
      },
      stdio: "inherit",
    }),
  );
  child.on("error", (err) => {
    console.error(`Could not start the server: ${err.message}`);
    shutdown(1);
  });
  child.on("exit", (code) => shutdown(code ?? 0));
}

const provider = pickProvider();
if (!provider) {
  console.error(
    "No tunnel binary found. Install one:\n" +
      "  cloudflared: winget install --id Cloudflare.cloudflared   (or `brew install cloudflared`)\n" +
      "  ngrok:       winget install --id ngrok.ngrok              (then `ngrok config add-authtoken <token>`)",
  );
  process.exit(1);
}

console.log(`Starting ${provider} tunnel to http://localhost:${port} …`);

try {
  const { url } = await startTunnel(provider);
  banner(provider, url);
  if (tunnelOnly) {
    console.log("Tunnel only (--tunnel-only). Press Ctrl+C to stop.");
  } else {
    startServer(url);
    // Re-print once the server has finished booting so the URL is the last thing on screen.
    setTimeout(() => {
      if (!shuttingDown) banner(provider, url);
    }, 4000);
  }
} catch (err) {
  console.error(err instanceof Error ? err.message : err);
  shutdown(1);
}
