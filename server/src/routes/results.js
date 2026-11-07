import express from 'express';
import Result from '../models/Result.js';
import Order from '../models/Order.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditLogger } from '../middleware/audit.js';

const router = express.Router();

function flagFor(value, param) {
  if (param.resultType !== 'numeric') return 'normal';
  const n = parseFloat(value);
  if (Number.isNaN(n)) return 'normal';
  if (param.low != null && n < param.low) return 'low';
  if (param.high != null && n > param.high) return 'high';
  return 'normal';
}

// ─────────────────────────────────────────────────────────────
// ORDER MATTERS: /me BEFORE /:id  (else "me" becomes an id)
// ─────────────────────────────────────────────────────────────

router.get('/me', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'patient')
      return res.status(400).json({ message: 'Only for patient accounts' });
    if (!req.user.patientProfile) return res.json([]);

    const results = await Result.find({
      patient: req.user.patientProfile,
      status: 'approved'
    })
      .populate('test', 'testName testCode')
      .populate('order', 'orderNumber createdAt')
      .sort({ createdAt: -1 });
    res.json(results);
  } catch (err) { next(err); }
});

router.get('/order/:orderId', protect, authorize('admin', 'technician'),
  async (req, res, next) => {
    try { res.json(await Result.findOne({ order: req.params.orderId })); }
    catch (err) { next(err); }
  });

// NEW — full populated result for printing
router.get('/:id', protect, async (req, res, next) => {
  try {
    const r = await Result.findById(req.params.id)
      .populate('patient')
      .populate('test', 'testName testCode parameters category')
      .populate('order', 'orderNumber createdAt sampleType')
      .populate('verifiedBy', 'name')
      .populate('enteredBy', 'name');
    if (!r) return res.status(404).json({ message: 'Result not found' });

    // Patients see only their own APPROVED results
    if (req.user.role === 'patient') {
      if (String(r.patient._id) !== String(req.user.patientProfile))
        return res.status(403).json({ message: 'Forbidden' });
      if (r.status !== 'approved')
        return res.status(403).json({ message: 'Only approved results can be viewed' });
    }

    // Receptionists & accountants have no medical-record access
    if (['receptionist', 'accountant'].includes(req.user.role))
      return res.status(403).json({ message: 'Forbidden' });

    res.json(r);
  } catch (err) { next(err); }
});

router.post('/order/:orderId', protect, authorize('admin', 'technician'),
  async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.orderId).populate('test');
      if (!order) return res.status(404).json({ message: 'Order not found' });

      const values = Array.isArray(req.body.values) ? req.body.values : [];
      const normalized = order.test.parameters.map((p) => {
        const provided = values.find((v) => String(v.parameterId) === String(p._id));
        const val = provided ? String(provided.value ?? '') : '';
        return {
          parameterId: p._id,
          parameterName: p.name,
          value: val,
          unit: p.unit,
          referenceRange: p.referenceRange,
          flag: val === '' ? 'normal' : flagFor(val, p)
        };
      });

      let result = await Result.findOne({ order: order._id });
      if (result) {
        result.values = normalized;
        result.enteredBy = req.user._id;
        result.status = 'draft';
        result.revision += 1;
        await result.save();
      } else {
        result = await Result.create({
          order: order._id,
          patient: order.patient,
          test: order.test._id,
          values: normalized,
          enteredBy: req.user._id,
          status: 'draft'
        });
      }

      if (order.status !== 'approved') {
        order.status = 'results_entered';
        await order.save();
      }
      res.json(result);
    } catch (err) { next(err); }
  });

router.post('/:id/submit', protect, authorize('admin', 'technician'), async (req, res, next) => {
  try {
    const r = await Result.findByIdAndUpdate(req.params.id,
      { status: 'pending_verification' }, { new: true });
    if (!r) return res.status(404).json({ message: 'Result not found' });
    await Order.findByIdAndUpdate(r.order, { status: 'pending_verification' });
    res.json(r);
  } catch (err) { next(err); }
});

router.post('/:id/approve', protect, authorize('admin', 'technician'), async (req, res, next) => {
  try {
    const r = await Result.findByIdAndUpdate(req.params.id,
      { status: 'approved', verifiedBy: req.user._id, verifiedAt: new Date() },
      { new: true });
    if (!r) return res.status(404).json({ message: 'Result not found' });
    await Order.findByIdAndUpdate(r.order, { status: 'approved' });
    res.json(r);
  } catch (err) { next(err); }
});

router.post('/:id/reject', protect, authorize('admin', 'technician'), async (req, res, next) => {
  try {
    const r = await Result.findByIdAndUpdate(req.params.id,
      { status: 'rejected',
        rejectionReason: req.body.reason || 'Not specified',
        verifiedBy: req.user._id, verifiedAt: new Date() },
      { new: true });
    if (!r) return res.status(404).json({ message: 'Result not found' });
    await Order.findByIdAndUpdate(r.order, { status: 'rejected' });
    res.json(r);
  } catch (err) { next(err); }
});


router.post('/:id/approve', protect, authorize('admin', 'technician'),
  auditLogger('APPROVE', 'Result'),
  async (req, res, next) => {
    try {
      const r = await Result.findByIdAndUpdate(req.params.id,
        { status: 'approved', verifiedBy: req.user._id, verifiedAt: new Date() },
        { new: true }).populate('test', 'testName');
      if (!r) return res.status(404).json({ message: 'Result not found' });
      await Order.findByIdAndUpdate(r.order, { status: 'approved' });

      // ─── Real-time broadcast ───
      const io = req.app.get('io');
      if (io) {
        io.to(`patient_${r.patient}`).emit('result:approved', {
          resultId: r._id,
          testName: r.test?.testName || 'Lab Report',
          message: `Your ${r.test?.testName || 'test'} report is ready`
        });
        io.to('role_admin').to('role_technician').emit('result:status', {
          resultId: r._id,
          status: 'approved'
        });
      }

      res.json(r);
    } catch (err) { next(err); }
  });

export default router;