import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY; ;

export class Auth {
    constructor() {}

    // Returns a middleware function
    middleware(roles = [], permissions = []) {
        return async (req, res) => {
            try {
                const authHeader = req.headers["authorization"];
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    res.writeHead(401, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ error: "Unauthorized: No token" }));
                }

                const token = authHeader.split(" ")[1];
                const decoded = jwt.verify(token, JWT_SECRET_KEY);

                const user = await User.findById(decoded.id);
                if (!user) {
                    res.writeHead(401, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ error: "Unauthorized: User not found" }));
                }

                if (roles.length && !roles.includes(user.role)) {
                    res.writeHead(403, { "Content-Type": "application/json" });
                    return res.end(JSON.stringify({ error: "Forbidden: Insufficient role" }));
                }

                if (permissions.length) {
                    const hasPermission = permissions.every(p =>
                        user.permissions?.includes(p)
                    );
                    if (!hasPermission) {
                        res.writeHead(403, { "Content-Type": "application/json" });
                        return res.end(JSON.stringify({ error: "Forbidden: Missing permission" }));
                    }
                }

                req.user = user;
                return true;
            } catch (err) {
                res.writeHead(401, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: "Unauthorized: " + err.message }));
                return false;
            }
        };
    }
}
