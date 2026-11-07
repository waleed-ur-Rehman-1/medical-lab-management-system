import mongoose from "mongoose";

const schema = new mongoose.Schema({
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  authorizedAt: { type: Date, default: Date.now },
  expiresAt: Date,
  notes: String
}, { timestamps: true });

schema.index({ doctor: 1, patient: 1 }, { unique: true });

export default mongoose.model("DoctorPatient", schema);
