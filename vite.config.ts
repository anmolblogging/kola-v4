import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  process.env.EMAIL_USER = env.EMAIL_USER || process.env.EMAIL_USER;
  process.env.EMAIL_PASS = env.EMAIL_PASS || process.env.EMAIL_PASS;

  return {
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      react(),
      mode === "development" && componentTagger(),
      {
        name: "api-contact-middleware",
        configureServer(server: any) {
          server.middlewares.use(async (req: any, res: any, next: any) => {
            if (req.url === "/api/contact" && req.method === "POST") {
              let body = "";
              req.on("data", (chunk: any) => {
                body += chunk;
              });
              req.on("end", async () => {
                try {
                  req.body = JSON.parse(body || "{}");
                  // @ts-ignore
                  const handlerModule = await import("./api/contact.js");
                  const handler = handlerModule.default;
                  const mockRes = {
                    status(code: number) {
                      res.statusCode = code;
                      return this;
                    },
                    json(data: any) {
                      res.setHeader("Content-Type", "application/json");
                      res.end(JSON.stringify(data));
                    },
                  };
                  await handler(req, mockRes);
                } catch (err: any) {
                  res.statusCode = 500;
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ error: err?.message || "Internal error" }));
                }
              });
              return;
            }
            next();
          });
        },
      },
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
  };
});

