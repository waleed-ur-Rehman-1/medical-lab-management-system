import express from 'express';
import Visit from '../models/Visit.js';
import Order from '../models/Order.js';
import Invoice from '../models/Invoice.js';
import Test from '../models/Test.js';
import Patient from '../models/Patient.js';
import { protect, authorize } from '../middleware/auth.js';
import { orderNumber, invoiceNumber } from '../utils/ids.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'receptionist'), async (req, res, next) => {
  try {
    const { patientId, testIds, referringDoctorName } = req.body;
    if (!patientId || !Array.isArray(testIds) || testIds.length === 0)
      return res.status(400).json({ message: 'patientId and testIds are required' });

    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const tests = await Test.find({ _id: { $in: testIds }, isActive: true });
    if (tests.length !== testIds.length)
      return res.status(400).json({ message: 'One or more tests are unavailable' });

    const visit = await Visit.create({
      patient: patientId, referringDoctorName, createdBy: req.user._id
    });

    const orders = [];
    for (const t of tests) {
      orders.push(await Order.create({
        orderNumber: orderNumber(),
        visit: visit._id,
        patient: patient._id,
        test: t._id,
        testNameSnapshot: t.testName,
        priceSnapshot: t.price,
        sampleType: t.sampleType
      }));
    }

    const items = tests.map((t, i) => ({
      order: orders[i]._id, name: t.testName, price: t.price
    }));
    const subtotal = items.reduce((s, it) => s + it.price, 0);

    const invoice = await Invoice.create({
      invoiceNumber: invoiceNumber(),
      visit: visit._id,
      patient: patient._id,
      items, subtotal,
      total: subtotal, balance: subtotal,
      createdBy: req.user._id
    });

    res.status(201).json({ visit, orders, invoice });
  } catch (err) { next(err); }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    const visit = await Visit.findById(req.params.id).populate('patient');
    if (!visit) return res.status(404).json({ message: 'Visit not found' });
    const orders = await Order.find({ visit: visit._id }).populate('test');
    const invoice = await Invoice.findOne({ visit: visit._id });
    res.json({ visit, orders, invoice });
  } catch (err) { next(err); }
});

export default router;