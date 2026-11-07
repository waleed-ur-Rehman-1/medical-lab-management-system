import express from 'express';
import Patient from '../models/Patient.js';
import { protect, authorize } from '../middleware/auth.js';
import { mrNumber } from '../utils/ids.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// IMPORTANT: /me MUST be declared BEFORE /:id
// otherwise Express treats "me" as an id and returns 404
// ─────────────────────────────────────────────────────────────

router.get('/me', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'patient')
      return res.status(400).json({ message: 'Only for patient accounts' });
    if (!req.user.patientProfile)
      return res.status(404).json({ message: 'Account not linked', needsLink: true });
    const p = await Patient.findById(req.user.patientProfile);
    if (!p) return res.status(404).json({ message: 'Patient not found' });
    res.json(p);
  } catch (err) { next(err); }
});

router.post('/', protect, authorize('admin', 'receptionist'), async (req, res, next) => {
  try {
    const patient = await Patient.create({
      ...req.body,
      mrNumber: mrNumber(),
      createdBy: req.user._id
    });
    res.status(201).json(patient);
  } catch (err) { next(err); }
});

router.get('/', protect, async (req, res, next) => {
  try {
    if (req.user.role === 'patient')
      return res.status(403).json({ message: 'Use /patients/me' });

    const q = req.query.q;
    const filter = q ? {
      $or: [
        { fullName: new RegExp(q, 'i') },
        { contactNumber: new RegExp(q, 'i') },
        { mrNumber: new RegExp(q, 'i') }
      ]
    } : {};
    const patients = await Patient.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(patients);
  } catch (err) { next(err); }
});

router.get('/:id', protect, async (req, res, next) => {
  try {
    if (req.user.role === 'patient' &&
        String(req.user.patientProfile) !== String(req.params.id))
      return res.status(403).json({ message: 'Forbidden' });

    const p = await Patient.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Patient not found' });
    res.json(p);
  } catch (err) { next(err); }
});

router.patch('/:id', protect, authorize('admin', 'receptionist'), async (req, res, next) => {
  try {
    const p = await Patient.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!p) return res.status(404).json({ message: 'Patient not found' });
    res.json(p);
  } catch (err) { next(err); }
});

export default router;