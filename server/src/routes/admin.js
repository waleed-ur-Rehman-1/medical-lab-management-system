import express from "express";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import Patient from "../models/Patient.js";
import Order from "../models/Order.js";
import Invoice from "../models/Invoice.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.get("/audit-logs", protect, authorize("admin"), async (req, res, next) => {
  try {
    const { entity, actor, from, to, limit = 200 } = req.query;
    const filter = {};
    if (entity) filter.entity = entity;
    if (actor) filter.actor = actor;
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }
    const logs = await AuditLog.find(filter)
      .populate("actor", "name email role")
      .sort({ timestamp: -1 })
      .limit(Math.min(Number(limit), 1000));
    res.json(logs);
  } catch (err) { next(err); }
});

router.get("/users", protect, authorize("admin"), async (_req, res, next) => {
  try {
    const users = await User.find()
      .select("-password")
      .populate("patientProfile", "mrNumber fullName")
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { next(err); }
});

router.post("/users", protect, authorize("admin"), async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: "Missing fields" });
    if (await User.findOne({ email }))
      return res.status(409).json({ message: "Email already registered" });
    const user = await User.create({ name, email, password, role });
    const { password: _pw, ...safe } = user.toObject();
    res.status(201).json(safe);
  } catch (err) { next(err); }
});

router.patch("/users/:id", protect, authorize("admin"), async (req, res, next) => {
  try {
    const allowed = ["name", "role", "isActive"];
    const patch = {};
    for (const k of allowed) if (k in req.body) patch[k] = req.body[k];
    const user = await User.findByIdAndUpdate(req.params.id, patch, { new: true, runValidators: true })
      .select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) { next(err); }
});

router.get("/stats", protect, authorize("admin"), async (_req, res, next) => {
  try {
    const [patients, orders, invoices] = await Promise.all([
      Patient.countDocuments(),
      Order.countDocuments(),
      Invoice.countDocuments()
    ]);
    res.json({ patients, orders, invoices });
  } catch (err) { next(err); }
});

export default router;
