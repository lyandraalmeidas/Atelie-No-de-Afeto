import { Router } from "express";
import { CartController } from "../controllers/cart.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();
const cartController = new CartController();

router.use(authenticate);

router.get("/", cartController.getCart);
router.post("/itens", cartController.addItem);
router.put("/itens/:produtoId", cartController.updateItem);
router.delete("/itens/:produtoId", cartController.removeItem);
router.delete("", cartController.clearCart);

export default router;
