import mongoose from "mongoose";
const schema = new mongoose.Schema({
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", required: true },
  amount: { type: Number, required: true, min: 0 },
  method: { type: String, enum: ["cash","card","bank","other"], default: "cash" },
  note: String,
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });
export default mongoose.model("Payment", schema);
