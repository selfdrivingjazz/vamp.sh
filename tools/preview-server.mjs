// Private live preview of site/: every request reads the working tree, so edits show on refresh.
// Dependency-free (Node 18+). Serves only what a static deploy would: no tools/, README.md,
// dotfiles, directory listings, or paths that resolve outside site/.
import { createServer } from "node:http";
import { open, realpath, stat } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { extname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";

const host = process.env.HOST ?? "127.0.0.1";
const port = Number(process.env.PORT ?? 4332);
const siteRoot = fileURLToPath(new URL("../site/", import.meta.url));
const HEALTH_BODY = "vamp-site-ready";
// Top-level entries that live in site/ but are not deployed (see site/README.md).
const UNDEPLOYED = new Set(["tools", "README.md"]);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".log": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".webm": "video/webm",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".wav": "audio/wav",
  ".pdf": "application/pdf",
};

// Refuse to report ready without the page the preview exists for.
await stat(join(siteRoot, "index.html"));

// Map a request path to a file under site/, or null. Directories resolve only to their index.html.
async function resolveFile(pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const segments = decoded.split("/").slice(1);
  if (segments.at(-1) === "") segments[segments.length - 1] = "index.html";
  if (UNDEPLOYED.has(segments[0])) return null;
  for (const segment of segments) {
    if (!segment || segment.startsWith(".") || /[\\\0]/.test(segment)) return null;
  }
  const root = await realpath(siteRoot);
  for (const candidate of [join(root, ...segments), join(root, ...segments, "index.html")]) {
    try {
      const real = await realpath(candidate);
      if (!real.startsWith(root + sep)) return null;
      if ((await stat(real)).isFile()) return real;
    } catch {
      // Missing: try the next candidate.
    }
  }
  return null;
}

function parseRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header ?? "");
  if (!match || (match[1] === "" && match[2] === "")) return null;
  let start;
  let end;
  if (match[1] === "") {
    start = Math.max(0, size - Number(match[2]));
    end = size - 1;
  } else {
    start = Number(match[1]);
    end = match[2] === "" ? size - 1 : Math.min(Number(match[2]), size - 1);
  }
  return start <= end && start < size ? { start, end } : "unsatisfiable";
}

const server = createServer(async (request, response) => {
  const headers = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
  const head = request.method === "HEAD";
  const sendText = (status, body, extra = {}) => {
    response.writeHead(status, {
      ...headers,
      ...extra,
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Length": Buffer.byteLength(body),
    });
    response.end(head ? undefined : body);
  };
  if (request.method !== "GET" && !head) {
    sendText(405, "Method not allowed", { Allow: "GET, HEAD" });
    return;
  }
  let pathname;
  try {
    pathname = new URL(request.url, "http://localhost").pathname;
  } catch {
    sendText(400, "Bad request");
    return;
  }
  if (pathname === "/healthz") {
    sendText(200, HEALTH_BODY);
    return;
  }
  let file = await resolveFile(pathname);
  let status = 200;
  if (!file) {
    status = 404;
    file = await resolveFile("/404.html");
    if (!file) {
      sendText(404, "Not found");
      return;
    }
  }
  let handle;
  try {
    handle = await open(file, "r");
    const { size } = await handle.stat();
    const fileHeaders = {
      ...headers,
      "Content-Type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream",
      "Accept-Ranges": "bytes",
    };
    let start = 0;
    let end = size - 1;
    if (status === 200 && request.headers.range) {
      const range = parseRange(request.headers.range, size);
      if (range === "unsatisfiable") {
        await handle.close();
        sendText(416, "Range not satisfiable", { "Content-Range": `bytes */${size}` });
        return;
      }
      if (range) {
        ({ start, end } = range);
        status = 206;
        fileHeaders["Content-Range"] = `bytes ${start}-${end}/${size}`;
      }
    }
    fileHeaders["Content-Length"] = Math.max(0, end - start + 1);
    response.writeHead(status, fileHeaders);
    if (head || size === 0) {
      await handle.close();
      response.end();
      return;
    }
    // pipeline closes the file when the client disconnects mid-transfer.
    await pipeline(handle.createReadStream({ start, end }), response);
  } catch (error) {
    if (error?.code !== "ERR_STREAM_PREMATURE_CLOSE") console.error(error);
    await handle?.close().catch(() => {});
    if (response.headersSent) response.destroy();
    else sendText(500, "Unable to read the vamp.sh site");
  }
});

server.listen(port, host, () => console.log(`vamp.sh preview ready at http://${host}:${port}`));
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
