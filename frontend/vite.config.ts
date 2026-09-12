import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@backend": resolve(__dirname, "../backend/src"),
      "@assets": resolve(__dirname, "../assets"),
    },
  },
  root: __dirname,
});
