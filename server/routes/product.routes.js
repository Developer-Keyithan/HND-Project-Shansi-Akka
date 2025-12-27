import Router from "../router.js";
import { getProducts, createProduct } from "../controllers/product.controller.js";

const router = new Router();

router.get("/products", getProducts);
router.post("/products", createProduct);

export default router;
