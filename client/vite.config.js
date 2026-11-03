import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The proxy sends any "/api/..." call from React to the Express server (port 5000)
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": "http://localhost:5000" } },
});
