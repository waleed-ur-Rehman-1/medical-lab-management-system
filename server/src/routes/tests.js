import express from 'express';
import Test from '../models/Test.js';
import { protect, authorize } from '../middleware/auth.js';
import { auditLogger } from '../middleware/audit.js';


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


// DELETE a whole test (Admin only)
router.delete('/:id', protect, authorize('admin'), auditLogger('DELETE', 'Test'), async (req, res, next) => {
  try {
    const test = await Test.findByIdAndDelete(req.params.id);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    res.json({ message: 'Test deleted successfully' });
  } catch (err) { next(err); }
});

// DELETE a single parameter from a test (Admin only)
router.delete('/:testId/parameters/:paramId', protect, authorize('admin'), auditLogger('DELETE', 'TestParameter'), async (req, res, next) => {
  try {
    const test = await Test.findById(req.params.testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    
    // Filter out the parameter we want to delete
    test.parameters = test.parameters.filter(p => p._id.toString() !== req.params.paramId);
    await test.save();
    
    res.json(test);
  } catch (err) { next(err); }
});

export default router;