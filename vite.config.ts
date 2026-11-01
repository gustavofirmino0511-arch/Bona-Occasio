import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.resolve(path.dirname(__filename));

function spaStaticRoutesPlugin(): Plugin {
  return {
    name: "spa-static-routes",
    closeBundle() {
      const distDir = path.resolve(__dirname, "dist");
      const indexFile = path.join(distDir, "index.html");
      if (!fs.existsSync(indexFile)) return;

      const html = fs.readFileSync(indexFile, "utf-8");
      const staticRoutes = [
        "admin",
        "comparar",
        "catalogo",
        "sobre",
        "estudio-ia",
      ];

      for (const route of staticRoutes) {
        const routeDir = path.join(distDir, route);
        fs.mkdirSync(routeDir, { recursive: true });
        fs.writeFileSync(path.join(routeDir, "index.html"), html, "utf-8");
      }

      fs.writeFileSync(path.join(distDir, "404.html"), html, "utf-8");
      fs.writeFileSync(
        path.join(distDir, "_redirects"),
        "/* /index.html 200\n",
        "utf-8",
      );
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), spaStaticRoutesPlugin()],
  server: {
    port: 3000,
    host: "0.0.0.0",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
