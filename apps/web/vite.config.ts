import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiOrigin = (env.VITE_API_BASE_URL || "").replace(/\/$/, "");

  return {
    server: {
      host: "127.0.0.1",
      port: 5173,
      proxy: apiOrigin
        ? {
            "/api": { target: apiOrigin, changeOrigin: true, secure: true, timeout: 8000 },
            "/health": { target: apiOrigin, changeOrigin: true, secure: true, timeout: 8000 },
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
