import mongoose from "mongoose";
const valueSchema = new mongoose.Schema({
  parameterId: mongoose.Schema.Types.ObjectId,
  parameterName: String,
  value: String,
  unit: String,
  referenceRange: String,
  flag: { type: String, enum: ["normal","low","high","abnormal"], default: "normal" }
}, { _id: false });
const schema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  values: [valueSchema],
  status: {
    type: String,
    enum: ["draft","pending_verification","approved","rejected"],
    default: "draft"
  },
  enteredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  verifiedAt: Date,
  rejectionReason: String,
  revision: { type: Number, default: 1 }
}, { timestamps: true });
export default mongoose.model("Result", schema);
