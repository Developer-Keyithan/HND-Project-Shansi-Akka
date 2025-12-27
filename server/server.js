import http from "http";
import app from "./app.js";

const server = http.createServer((req, res) => app.handle(req, res));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
