import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import type { ProxyOptions } from "vite";
import type { ServerResponse } from "http";

function tunnelProxy(apiOrigin: string): ProxyOptions {
  const closed = JSON.stringify({ error: "Cannot reach Vero. The API tunnel is down." });
  return {
    target: apiOrigin,
    changeOrigin: true,
    secure: true,
    timeout: 4000,
    configure(proxy) {
      proxy.on("error", (_err, _req, res) => {
        const response = res as ServerResponse;
        if (response && typeof response.writeHead === "function" && !response.headersSent) {
          response.writeHead(502, { "Content-Type": "application/json" });
          response.end(closed);
        }
      });
      proxy.on("proxyRes", (proxyRes) => {
        if (proxyRes.statusCode === 530) proxyRes.statusCode = 502;
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiOrigin = (env.VITE_API_BASE_URL || "").replace(/\/$/, "");

  return {
    server: {
      host: "127.0.0.1",
      port: 5173,
      proxy: apiOrigin
        ? {
            "/api": tunnelProxy(apiOrigin),
            "/health": tunnelProxy(apiOrigin),
          }
        : undefined,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
