const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const contentPath = path.join(root, "cms-data.json");
const assetsDir = path.join(root, "assets");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8"
};

const readBody = (request) => new Promise((resolve, reject) => {
  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
    if (body.length > 15 * 1024 * 1024) {
      request.destroy();
      reject(new Error("Request body too large"));
    }
  });
  request.on("end", () => resolve(body));
  request.on("error", reject);
});

const send = (response, status, payload, type = "application/json; charset=utf-8") => {
  response.writeHead(status, {
    "Content-Type": type,
    "Cache-Control": "no-store"
  });
  response.end(typeof payload === "string" ? payload : JSON.stringify(payload));
};

const safeAssetName = (filename) => {
  const ext = path.extname(filename).toLowerCase() || ".jpg";
  const base = path.basename(filename, ext).replace(/[^a-z0-9-_]+/gi, "-").replace(/^-|-$/g, "") || "upload";
  return `${base}-${Date.now()}${ext}`;
};

const handleApi = async (request, response) => {
  if (request.url === "/api/content" && request.method === "GET") {
    send(response, 200, fs.readFileSync(contentPath, "utf8"));
    return true;
  }

  if (request.url === "/api/content" && request.method === "PUT") {
    const body = await readBody(request);
    const parsed = JSON.parse(body);
    fs.writeFileSync(contentPath, `${JSON.stringify(parsed, null, 2)}\n`);
    send(response, 200, { ok: true });
    return true;
  }

  if (request.url === "/api/upload" && request.method === "POST") {
    const { filename, dataUrl } = JSON.parse(await readBody(request));
    const match = /^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/.exec(dataUrl || "");
    if (!match) {
      send(response, 400, { error: "Invalid image data" });
      return true;
    }
    const name = safeAssetName(filename || "upload.jpg");
    fs.writeFileSync(path.join(assetsDir, name), Buffer.from(match[1], "base64"));
    send(response, 200, { path: `assets/${name}` });
    return true;
  }

  return false;
};

const serveStatic = (request, response) => {
  const urlPath = decodeURIComponent(new URL(request.url, `http://localhost:${port}`).pathname);
  const requestedPath = urlPath === "/" ? "/index.html" : urlPath;
  const filePath = path.normalize(path.join(root, requestedPath));

  if (!filePath.startsWith(root)) {
    send(response, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    send(response, 404, "Not found", "text/plain; charset=utf-8");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  response.writeHead(200, {
    "Content-Type": mimeTypes[ext] || "application/octet-stream",
    "Cache-Control": ext === ".html" || ext === ".json" ? "no-store" : "public, max-age=60"
  });
  fs.createReadStream(filePath).pipe(response);
};

const server = http.createServer(async (request, response) => {
  try {
    if (request.url.startsWith("/api/") && await handleApi(request, response)) return;
    serveStatic(request, response);
  } catch (error) {
    send(response, 500, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`CMS server running at http://localhost:${port}`);
});
