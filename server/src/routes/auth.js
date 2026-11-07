import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
const sign = (u) =>
  jwt.sign({ id: u._id, role: u.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '1d' });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role)
      return res.status(400).json({ message: 'Missing fields' });
    if (await User.findOne({ email }))
      return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      user: {
        id: user._id, name, email, role,
        patientProfile: user.patientProfile || null
      },
      token: sign(user)
    });
  } catch (err) { next(err); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });
    res.json({
      user: {
        id: user._id, name: user.name, email: user.email, role: user.role,
        patientProfile: user.patientProfile || null
      },
      token: sign(user)
    });
  } catch (err) { next(err); }
});

router.get('/me', protect, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      patientProfile: req.user.patientProfile || null
    }
  });
});

// NEW — one-time link for `patient` role accounts
router.post('/link-patient', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'patient')
      return res.status(400).json({ message: 'Only patient accounts can link' });

    const { mrNumber, contactNumber } = req.body;
    if (!mrNumber || !contactNumber)
      return res.status(400).json({ message: 'MR number and contact number required' });

    const patient = await Patient.findOne({ mrNumber, contactNumber });
    if (!patient)
      return res.status(404).json({ message: 'No patient record matches the provided MR + contact' });

    const alreadyLinked = await User.findOne({
      patientProfile: patient._id,
      _id: { $ne: req.user._id }
    });
    if (alreadyLinked)
      return res.status(409).json({ message: 'This patient record is already linked to another account' });

    req.user.patientProfile = patient._id;
    await req.user.save();

    res.json({
      message: 'Account linked successfully',
      patient: {
        id: patient._id,
        mrNumber: patient.mrNumber,
        fullName: patient.fullName
      }
    });
  } catch (err) { next(err); }
});

export default router;