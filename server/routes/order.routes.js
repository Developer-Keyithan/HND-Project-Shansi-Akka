import Router from "../router.js";
import { getOrders, createOrder, updateOrder } from "../controllers/order.controller.js";

const router = new Router();

router.get("/", getOrders);
router.post("/", createOrder);
router.put("/", updateOrder);

export default router;
