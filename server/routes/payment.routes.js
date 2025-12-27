import Router from "../router.js";
import { createPaymentIntent, confirmPayment } from "../controllers/payment.controller.js";
import { Auth } from "../middlewares/auth.middleware.js";

const router = new Router();
const auth = new Auth();

// router.post("/create-intent", auth.middleware(["consumer"], ["create_transaction"]), createPaymentIntent);
router.post("/create-intent", createPaymentIntent);
router.post("/confirm", confirmPayment);

export default router;
