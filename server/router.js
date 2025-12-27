import { URL } from "url";

// parse JSON body
async function parseBody(req) {
    return new Promise((resolve) => {
        let data = "";
        req.on("data", chunk => data += chunk);
        req.on("end", () => {
            try { resolve(data ? JSON.parse(data) : {}); }
            catch { resolve({}); }
        });
    });
}

export default class Router {
    constructor(prefix = "") {
        this.prefix = prefix;
        this.stack = [];
    }

    // ===== register methods =====
    get(path, ...handlers) { this._add("GET", path, handlers); }
    post(path, ...handlers) { this._add("POST", path, handlers); }
    put(path, ...handlers) { this._add("PUT", path, handlers); }
    patch(path, ...handlers) { this._add("PATCH", path, handlers); }
    delete(path, ...handlers) { this._add("DELETE", path, handlers); }


    use(path, router) {
        router.stack.forEach(r => {
            const fullPath = (this.prefix + path + r.path)
                .replace(/\/+/g, "/")
                .replace(/\/$/, "");

            this.stack.push({
                method: r.method,
                path: fullPath,
                handlers: r.handlers
            });
        });
    }


    _add(method, path, handlers) {
        const fullPath = (this.prefix + path)
            .replace(/\/+/g, "/")
            .replace(/\/$/, "");

        this.stack.push({
            method,
            path: fullPath,
            handlers
        });
    }


    // ===== request handler =====
    async handle(req, res) {
        const reqUrl = new URL(req.url, `http://${req.headers.host}`);
        const pathname = reqUrl.pathname.replace(/\/$/, "") || "/";
        const method = req.method.toUpperCase();

        // CORS
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        if (method === "OPTIONS") return res.end();

        // body
        req.body = await parseBody(req);

        // helpers
        res.json = (data, status = 200) => {
            res.writeHead(status, { "Content-Type": "application/json" });
            res.end(JSON.stringify(data));
        };
        res.status = (code) => { res.statusCode = code; return res; };

        for (const route of this.stack) {
            const match = this._match(route.path, pathname);
            if (!match || route.method !== method) continue;

            req.params = match;

            for (const fn of route.handlers) {
                const result = await fn(req, res);
                if (res.writableEnded || result === false) return;
            }
            return;
        }

        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not Found" }));
    }

    _match(routePath, urlPath) {
        routePath = routePath.replace(/\/$/, "");
        urlPath = urlPath.replace(/\/$/, "");

        const r = routePath.split("/").filter(Boolean);
        const u = urlPath.split("/").filter(Boolean);

        if (r.length !== u.length) return null;

        const params = {};
        for (let i = 0; i < r.length; i++) {
            if (r[i].startsWith(":")) {
                params[r[i].slice(1)] = u[i];
            } else if (r[i] !== u[i]) {
                return null;
            }
        }
        return params;
    }

}
