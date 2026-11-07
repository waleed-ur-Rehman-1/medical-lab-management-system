import mongoose from "mongoose";
const schema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  visit: { type: mongoose.Schema.Types.ObjectId, ref: "Visit", required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  testNameSnapshot: String,
  priceSnapshot: Number,
  sampleType: String,
  technician: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    enum: ["booked","sample_collected","in_process","results_entered",
           "pending_verification","approved","rejected"],
    default: "booked"
  }
}, { timestamps: true });
export default mongoose.model("Order", schema);
