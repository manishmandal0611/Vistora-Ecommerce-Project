import { Router } from "express";
import {
  createMockPaymentOrder,
  verifyMockPayment,
  getMyOrders,
  getOrderById,
} from "../controllers/paymentController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(protect);

router.post("/create-order", createMockPaymentOrder);
router.post("/verify", verifyMockPayment);
router.get("/orders", getMyOrders);
router.get("/orders/:id", getOrderById);

export default router;
