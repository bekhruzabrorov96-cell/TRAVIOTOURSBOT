import { createServer } from "node:http";
import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";

const root = join(process.cwd(), "outputs");
const port = Number(process.env.PORT || 8787);

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml; charset=utf-8"
};

createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  const requested = url.pathname === "/" ? "/travio-tour-lead-bot.html" : url.pathname;
  const safePath = normalize(decodeURIComponent(requested)).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath);

  if (!filePath.startsWith(root) || !existsSync(filePath)) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }

  res.writeHead(200, { "content-type": types[extname(filePath)] || "application/octet-stream" });
  createReadStream(filePath).pipe(res);
}).listen(port, "127.0.0.1", () => {
  console.log(`Travio demo is running: http://127.0.0.1:${port}/travio-tour-lead-bot.html`);
});
