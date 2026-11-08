import express from 'express';
import Result from '../models/Result.js';
import Order from '../models/Order.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditLogger } from '../middleware/audit.js';

const router = express.Router();

// Helper for abnormal flags
function flagFor(value, param) {
  if (param.resultType !== 'numeric') return 'normal';
  const n = parseFloat(value);
  if (Number.isNaN(n)) return 'normal';
  if (param.low != null && n < param.low) return 'low';
  if (param.high != null && n > param.high) return 'high';
  return 'normal';
}

// 1. GET Patient's own results (Must be first!)
router.get('/me', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'patient') return res.status(400).json({ message: 'Only for patients' });
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

// 2. GET Result by Order ID (Must be before /:id)
router.get('/order/:orderId', protect, authorize('admin', 'technician'),
  async (req, res, next) => {
    try { 
      const r = await Result.findOne({ order: req.params.orderId }); 
      if (!r) return res.status(404).json({ message: 'No result entered yet' });
      res.json(r); 
    } catch (err) { next(err); }
  });

// 3. GET Result by Result ID (For printing)
router.get('/:id', protect, async (req, res, next) => {
  try {
    const r = await Result.findById(req.params.id)
      .populate('patient')
      .populate('test', 'testName testCode parameters category')
      .populate('order', 'orderNumber createdAt sampleType')
      .populate('verifiedBy', 'name')
      .populate('enteredBy', 'name');
    if (!r) return res.status(404).json({ message: 'Result not found' });

    if (req.user.role === 'patient') {
      if (String(r.patient._id) !== String(req.user.patientProfile))
        return res.status(403).json({ message: 'Forbidden' });
      if (r.status !== 'approved')
        return res.status(403).json({ message: 'Only approved results can be viewed' });
    }
    if (['receptionist', 'accountant'].includes(req.user.role))
      return res.status(403).json({ message: 'Forbidden' });

    res.json(r);
  } catch (err) { next(err); }
});

// 4. POST Save Draft
// POST Save Draft
router.post('/order/:orderId', protect, authorize('admin', 'technician'),
  async (req, res, next) => {
    try {
      const order = await Order.findById(req.params.orderId).populate('test');
      if (!order) return res.status(404).json({ message: 'Order not found' });

      const values = Array.isArray(req.body.values) ? req.body.values : [];
      
      let result = await Result.findOne({ order: order._id });
      
      if (values.length > 0) {
        const normalized = values.map((v, i) => {
          // Try to find by ID, otherwise fallback to the same index
          const p = order.test.parameters.find(param => String(param._id) === String(v.parameterId)) 
                 || order.test.parameters[i];
                 
          return {
            parameterId: p?._id || v.parameterId,
            parameterName: p?.name || v.parameterName || `Param ${i+1}`,
            value: String(v.value ?? ''),
            unit: p?.unit || '',
            referenceRange: p?.referenceRange || '',
            flag: 'normal'
          };
        });

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
      }

      if (order.status !== 'approved') {
        order.status = 'results_entered';
        await order.save();
      }
      res.json(result);
    } catch (err) { next(err); }
});

// 5. POST Submit for Verification
router.post('/:id/submit', protect, authorize('admin', 'technician'), async (req, res, next) => {
  try {
    const r = await Result.findByIdAndUpdate(req.params.id,
      { status: 'pending_verification' }, { new: true });
    if (!r) return res.status(404).json({ message: 'Result not found' });
    await Order.findByIdAndUpdate(r.order, { status: 'pending_verification' });
    res.json(r);
  } catch (err) { next(err); }
});

// 6. POST Approve
router.post('/:id/approve', protect, authorize('admin', 'technician'),
  auditLogger('APPROVE', 'Result'),
  async (req, res, next) => {
    try {
      const result = await Result.findById(req.params.id).populate('test', 'testName');
      if (!result) return res.status(404).json({ message: 'Result not found' });

      result.status = 'approved';
      result.verifiedBy = req.user._id;
      result.verifiedAt = new Date();
      await result.save();

      await Order.findByIdAndUpdate(result.order, { status: 'approved' });

      const io = req.app.get('io');
      if (io) {
        io.to(`patient_${result.patient}`).emit('result:approved', {
          resultId: result._id,
          testName: result.test?.testName || 'Lab Report',
          message: `Your ${result.test?.testName || 'test'} report is ready`
        });
      }

      res.json(result);
    } catch (err) { next(err); }
});

// 7. POST Reject / Reopen
router.post('/:id/reject', protect, authorize('admin', 'technician'), async (req, res, next) => {
  try {
    const r = await Result.findByIdAndUpdate(req.params.id,
      { status: 'rejected', rejectionReason: req.body.reason || 'Not specified', verifiedBy: req.user._id, verifiedAt: new Date() },
      { new: true });
    if (!r) return res.status(404).json({ message: 'Result not found' });
    await Order.findByIdAndUpdate(r.order, { status: 'rejected' });
    res.json(r);
  } catch (err) { next(err); }
});

export default router;