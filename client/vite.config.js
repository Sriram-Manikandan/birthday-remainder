import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// System design basics: this proxy routes frontend API calls to the Express backend.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": "http://localhost:5000" } },
});
