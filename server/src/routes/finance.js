import express from "express";
import Expense from "../models/Expense.js";
import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

function dateFilter(from, to, field = "createdAt") {
  const f = {};
  if (from || to) {
    f[field] = {};
    if (from) f[field].$gte = new Date(from);
    if (to) f[field].$lte = new Date(to);
  }
  return f;
}

router.get("/summary", protect, authorize("admin", "accountant"), async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const f = dateFilter(from, to);
    const [invoices, payments, expenses] = await Promise.all([
      Invoice.find(f),
      Payment.find(f),
      Expense.find(dateFilter(from, to, "date"))
    ]);
    const grossBilled = invoices.reduce((s, i) => s + (i.subtotal || 0), 0);
    const totalDiscount = invoices.reduce((s, i) => s + (i.discount || 0), 0);
    const netBilled = invoices.reduce((s, i) => s + (i.total || 0), 0);
    const collected = payments.reduce((s, p) => s + (p.amount || 0), 0);
    const outstanding = invoices.reduce((s, i) => s + (i.balance || 0), 0);
    const totalExpenses = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    res.json({
      grossBilled, totalDiscount, netBilled,
      collected, outstanding, totalExpenses,
      netCash: collected - totalExpenses,
      invoiceCount: invoices.length,
      paymentCount: payments.length,
      expenseCount: expenses.length
    });
  } catch (err) { next(err); }
});

router.get("/expenses", protect, authorize("admin", "accountant"), async (req, res, next) => {
  try {
    const { from, to, category } = req.query;
    const filter = dateFilter(from, to, "date");
    if (category) filter.category = category;
    const expenses = await Expense.find(filter)
      .populate("recordedBy", "name")
      .sort({ date: -1 })
      .limit(500);
    res.json(expenses);
  } catch (err) { next(err); }
});

router.post("/expenses", protect, authorize("admin", "accountant"), async (req, res, next) => {
  try {
    const { category, amount, note, date } = req.body;
    if (!category || amount == null)
      return res.status(400).json({ message: "category and amount required" });
    const expense = await Expense.create({
      category,
      amount: Number(amount),
      note,
      date: date ? new Date(date) : new Date(),
      recordedBy: req.user._id
    });
    res.status(201).json(expense);
  } catch (err) { next(err); }
});

router.patch("/expenses/:id", protect, authorize("admin", "accountant"), async (req, res, next) => {
  try {
    const allowed = ["category", "amount", "note", "date"];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    const expense = await Expense.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (err) { next(err); }
});

router.delete("/expenses/:id", protect, authorize("admin"), async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ success: true });
  } catch (err) { next(err); }
});

router.get("/invoices", protect, authorize("admin", "accountant"), async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const invoices = await Invoice.find(dateFilter(from, to))
      .populate("patient", "mrNumber fullName")
      .sort({ createdAt: -1 })
      .limit(500);
    res.json(invoices);
  } catch (err) { next(err); }
});

router.get("/payments", protect, authorize("admin", "accountant"), async (req, res, next) => {
  try {
    const { from, to } = req.query;
    const payments = await Payment.find(dateFilter(from, to))
      .populate("invoice", "invoiceNumber")
      .populate("receivedBy", "name")
      .sort({ createdAt: -1 })
      .limit(500);
    res.json(payments);
  } catch (err) { next(err); }
});

export default router;
