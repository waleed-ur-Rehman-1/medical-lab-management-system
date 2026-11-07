import mongoose from "mongoose";
const itemSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  name: String,
  price: Number
}, { _id: false });
const schema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  visit: { type: mongoose.Schema.Types.ObjectId, ref: "Visit", required: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: true },
  items: [itemSchema],
  subtotal: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  paid: { type: Number, default: 0 },
  balance: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ["unpaid","partially_paid","paid","cancelled"],
    default: "unpaid"
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });
export default mongoose.model("Invoice", schema);
