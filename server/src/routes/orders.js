import express from 'express';
import Order from '../models/Order.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    const filter = {};

    if (req.user.role === 'patient') {
      if (!req.user.patientProfile) return res.json([]);
      filter.patient = req.user.patientProfile;
    } else if (req.user.role === 'doctor') {
      return res.status(403).json({ message: 'Use doctor portal (not implemented yet)' });
    } else {
      if (req.query.status)  filter.status  = req.query.status;
      if (req.query.patient) filter.patient = req.query.patient;
    }

    const orders = await Order.find(filter)
      .populate('patient', 'mrNumber fullName gender')
      .populate('test', 'testName testCode parameters')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json(orders);
  } catch (err) { next(err); }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('patient', 'mrNumber fullName gender')
      .populate('test', 'testName testCode parameters');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.role === 'patient' &&
        String(order.patient._id) !== String(req.user.patientProfile))
      return res.status(403).json({ message: 'Forbidden' });
    res.json(order);
  } catch (err) { next(err); }
});

router.patch('/:id/status', protect, authorize('admin', 'technician', 'receptionist'),
  async (req, res, next) => {
    try {
      const o = await Order.findByIdAndUpdate(req.params.id,
        { status: req.body.status }, { new: true });
      if (!o) return res.status(404).json({ message: 'Order not found' });
      res.json(o);
    } catch (err) { next(err); }
  });

router.patch('/:id/assign', protect, authorize('admin'), async (req, res, next) => {
  try {
    const o = await Order.findByIdAndUpdate(req.params.id,
      { technician: req.body.technicianId }, { new: true });
    if (!o) return res.status(404).json({ message: 'Order not found' });
    res.json(o);
  } catch (err) { next(err); }
});

export default router;