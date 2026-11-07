import express from "express";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import { protect, authorize } from "../middleware/auth.js";
import { auditLogger } from '../middleware/audit.js';

const router = express.Router();

// NEW â€” patient's own invoices (must be BEFORE `/:id`)
router.get("/me", protect, async (req, res, next) => {
  try {
    if (req.user.role !== "patient")
      return res.status(400).json({ message: "Only for patient accounts" });
    if (!req.user.patientProfile) return res.json([]);

    const invoices = await Invoice.find({
      patient: req.user.patientProfile,
    }).sort({ createdAt: -1 });
    res.json(invoices);
  } catch (err) {
    next(err);
  }
});

// NEW â€” patient's own payments (must be BEFORE `/:id`)
router.get("/me/payments", protect, async (req, res, next) => {
  try {
    if (req.user.role !== "patient")
      return res.status(400).json({ message: "Only for patient accounts" });
    if (!req.user.patientProfile) return res.json([]);

    const invoiceIds = await Invoice.find({
      patient: req.user.patientProfile,
    }).distinct("_id");
    const payments = await Payment.find({ invoice: { $in: invoiceIds } })
      .populate("invoice", "invoiceNumber")
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    next(err);
  }
});

router.get(
  "/",
  protect,
  authorize("admin", "receptionist", "accountant"),
  async (_req, res, next) => {
    try {
      res.json(
        await Invoice.find()
          .populate("patient", "mrNumber fullName")
          .sort({ createdAt: -1 })
          .limit(200),
      );
    } catch (err) {
      next(err);
    }
  },
);

router.get("/:id", protect, async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate("patient");
    if (!invoice) return res.status(404).json({ message: "Invoice not found" });

    if (
      req.user.role === "patient" &&
      String(invoice.patient._id) !== String(req.user.patientProfile)
    )
      return res.status(403).json({ message: "Forbidden" });

    if (req.user.role === "patient" && invoice.status === "cancelled")
      return res.status(403).json({ message: "Forbidden" });

    const payments = await Payment.find({ invoice: invoice._id }).sort({
      createdAt: 1,
    });
    res.json({ invoice, payments });
  } catch (err) {
    next(err);
  }
});

router.post(
  "/:id/discount",
  protect,
  authorize("admin", "receptionist"),
  async (req, res, next) => {
    try {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice)
        return res.status(404).json({ message: "Invoice not found" });
      const d = Number(req.body.discount);
      if (Number.isNaN(d) || d < 0 || d > invoice.subtotal)
        return res.status(400).json({ message: "Invalid discount" });
      invoice.discount = d;
      invoice.total = invoice.subtotal - d;
      invoice.balance = invoice.total - invoice.paid;
      invoice.status =
        invoice.balance <= 0
          ? "paid"
          : invoice.paid > 0
            ? "partially_paid"
            : "unpaid";
      await invoice.save();
      res.json(invoice);
    } catch (err) {
      next(err);
    }
  },
);

router.post(
  "/:id/payments",
  protect,
  authorize("admin", "receptionist", "accountant"),
  auditLogger("CREATE_PAYMENT", "Invoice"),
  async (req, res, next) => {
    try {
      const invoice = await Invoice.findById(req.params.id);
      if (!invoice)
        return res.status(404).json({ message: "Invoice not found" });
      if (invoice.status === "cancelled")
        return res.status(400).json({ message: "Invoice is cancelled" });

      const amt = Number(req.body.amount);
      if (!amt || amt <= 0)
        return res.status(400).json({ message: "Invalid amount" });
      if (invoice.paid + amt > invoice.total)
        return res.status(400).json({ message: "Payment exceeds balance" });
      // ─── Real-time broadcast ───
const io = req.app.get('io');
if (io) {
  io.to('role_admin').to('role_accountant').to('role_receptionist').emit('payment:recorded', {
    invoiceId: invoice._id,
    amount: amt,
    invoiceNumber: invoice.invoiceNumber
  });
  io.to(`patient_${invoice.patient}`).emit('invoice:updated', {
    invoiceId: invoice._id,
    balance: invoice.balance,
    status: invoice.status
  });
}
      const payment = await Payment.create({
        invoice: invoice._id,
        amount: amt,
        method: req.body.method || "cash",
        receivedBy: req.user._id,
      });
      invoice.paid += amt;
      invoice.balance = invoice.total - invoice.paid;
      invoice.status =
        invoice.balance <= 0
          ? "paid"
          : invoice.paid > 0
            ? "partially_paid"
            : "unpaid";
      await invoice.save();
      res.status(201).json({ payment, invoice });
    } catch (err) {
      next(err);
    }
  },
);




export default router;
