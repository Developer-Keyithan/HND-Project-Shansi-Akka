import Router from "../router.js";
import { handleLogs } from "../controllers/log.controller.js";

const router = new Router();

// All methods handled in single controller
router.get("/", handleLogs);
router.post("/", handleLogs);

export default router;
