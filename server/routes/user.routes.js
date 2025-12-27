import Router from "../router.js";
import { getUserById, getUsers } from "../controllers/user.controller.js";
import { Auth } from "../middlewares/auth.middleware.js";

const router = new Router();
const auth = new Auth();

router.get("/", getUsers);
router.get("/:id", getUserById);
// router.post("/", auth.middleware(["admin"], ["create_user"]), createUser);

export default router;
