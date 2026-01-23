import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-htaccess",
      closeBundle() {
        try {
          const distDir = resolve(__dirname, "dist");
          if (!existsSync(distDir)) {
            mkdirSync(distDir, { recursive: true });
          }
          const htaccessSource = resolve(__dirname, ".htaccess");
          const htaccessDest = resolve(distDir, ".htaccess");
          if (existsSync(htaccessSource)) {
            copyFileSync(htaccessSource, htaccessDest);
            console.log("✓ .htaccess copied to dist/");
          }
        } catch (error) {
          console.warn("Warning: Could not copy .htaccess:", error.message);
        }
      },
    },
  ],
  server: {
    port: 8080,
    host: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": ["framer-motion", "lucide-react"],
          "form-vendor": ["react-hook-form", "react-datepicker"],
          utils: ["date-fns", "zustand"],
          dashboard: [
            "./src/pages/Dashboard.tsx",
            "./src/pages/dashboard/Profile.tsx",
            "./src/pages/dashboard/Reservations.tsx",
            "./src/pages/dashboard/Settings.tsx",
          ],
          admin: [
            "./src/pages/dashboard/admin/Users.tsx",
            "./src/pages/dashboard/admin/Spaces.tsx",
            "./src/pages/dashboard/admin/Reservations.tsx",
          ],
          erp: [
            "./src/components/erp/Dashboard.tsx",
            "./src/components/erp/AnalyticsAndReporting.tsx",
          ],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "zustand", "date-fns"],
  },
});
