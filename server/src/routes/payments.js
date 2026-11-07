import express from "express";
import Payment from "../models/Payment.js";
import { protect, authorize } from "../middleware/auth.js";
const router = express.Router();
router.get("/", protect, authorize("admin","receptionist","accountant"),
  async (_req, res, next) => {
    try {
      const payments = await Payment.find()
        .populate("invoice", "invoiceNumber total paid balance")
        .populate("receivedBy", "name")
        .sort({ createdAt: -1 })
        .limit(500);
      res.json(payments);
    } catch (err) { next(err); }
  });
export default router;
