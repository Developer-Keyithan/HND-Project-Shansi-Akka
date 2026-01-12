import jwt from "jsonwebtoken";
import User from "../models/user.model.js";



export class Auth {
    constructor() { }

    // Returns a middleware function
    middleware(roles = [], permissions = []) {
        return async (req, res, next) => {
            try {
                const authHeader = req.headers["authorization"];
                if (!authHeader || !authHeader.startsWith("Bearer ")) {
                    return res.status(401).json({ error: "Unauthorized: No token" });
                }

                const token = authHeader.split(" ")[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

                const user = await User.findById(decoded.id);
                if (!user) {
                    return res.status(401).json({ error: "Unauthorized: User not found" });
                }

                if (roles.length && !roles.includes(user.role)) {
                    return res.status(403).json({ error: "Forbidden: Insufficient role" });
                }

                if (permissions.length) {
                    const hasPermission = permissions.every(p =>
                        user.permissions?.includes(p)
                    );
                    if (!hasPermission) {
                        return res.status(403).json({ error: "Forbidden: Missing permission" });
                    }
                }

                req.user = user;
                next();
            } catch (err) {
                return res.status(401).json({ error: "Unauthorized: " + err.message });
            }
        };
    }
}
