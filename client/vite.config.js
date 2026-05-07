import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        "/chat": {
          target: env.VITE_API_BASE_URL || "http://localhost:8787",
          changeOrigin: true
        },
        "/health": {
          target: env.VITE_API_BASE_URL || "http://localhost:8787",
          changeOrigin: true
        }
      }
    }
  };
});
