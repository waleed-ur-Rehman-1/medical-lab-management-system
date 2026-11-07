import express from "express";
import DoctorPatient from "../models/DoctorPatient.js";
import Patient from "../models/Patient.js";
import Result from "../models/Result.js";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

function activeReferralFilter(doctorId) {
  return {
    doctor: doctorId,
    $or: [
      { expiresAt: { $exists: false } },
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  };
}

router.get("/patients", protect, authorize("doctor"), async (req, res, next) => {
  try {
    const refs = await DoctorPatient.find(activeReferralFilter(req.user._id))
      .populate("patient", "mrNumber fullName gender age contactNumber");
    res.json(refs.map((r) => r.patient).filter(Boolean));
  } catch (err) { next(err); }
});

router.get("/patients/:id", protect, authorize("doctor"), async (req, res, next) => {
  try {
    const ref = await DoctorPatient.findOne({
      ...activeReferralFilter(req.user._id),
      patient: req.params.id
    });
    if (!ref) return res.status(403).json({ message: "Not authorized for this patient" });
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  } catch (err) { next(err); }
});

router.get("/patients/:id/results", protect, authorize("doctor"), async (req, res, next) => {
  try {
    const ref = await DoctorPatient.findOne({
      ...activeReferralFilter(req.user._id),
      patient: req.params.id
    });
    if (!ref) return res.status(403).json({ message: "Not authorized for this patient" });
    const results = await Result.find({ patient: req.params.id, status: "approved" })
      .populate("test", "testName testCode")
      .sort({ verifiedAt: -1 });
    res.json(results);
  } catch (err) { next(err); }
});

// Admin-only: authorize a doctor for a patient
router.post("/authorize", protect, authorize("admin"), async (req, res, next) => {
  try {
    const { doctorId, patientId, expiresAt, notes } = req.body;
    if (!doctorId || !patientId)
      return res.status(400).json({ message: "doctorId and patientId required" });
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== "doctor")
      return res.status(400).json({ message: "Invalid doctor" });
    const patient = await Patient.findById(patientId);
    if (!patient) return res.status(404).json({ message: "Patient not found" });

    const ref = await DoctorPatient.findOneAndUpdate(
      { doctor: doctorId, patient: patientId },
      { doctor: doctorId, patient: patientId, expiresAt: expiresAt || null, notes },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(ref);
  } catch (err) { next(err); }
});

router.delete("/authorize/:id", protect, authorize("admin"), async (req, res, next) => {
  try {
    const ref = await DoctorPatient.findByIdAndDelete(req.params.id);
    if (!ref) return res.status(404).json({ message: "Referral not found" });
    res.json({ success: true });
  } catch (err) { next(err); }
});

export default router;
