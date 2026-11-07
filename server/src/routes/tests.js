import express from 'express';
import Test from '../models/Test.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, async (_req, res, next) => {
  try { res.json(await Test.find().sort({ testName: 1 })); }
  catch (err) { next(err); }
});

router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try { res.status(201).json(await Test.create(req.body)); }
  catch (err) { next(err); }
});

router.patch('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    const t = await Test.findByIdAndUpdate(req.params.id, req.body,
      { new: true, runValidators: true });
    if (!t) return res.status(404).json({ message: 'Test not found' });
    res.json(t);
  } catch (err) { next(err); }
});

export default router;