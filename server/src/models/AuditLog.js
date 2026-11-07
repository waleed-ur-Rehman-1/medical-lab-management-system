import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  action: { type: String, required: true },   // CREATE, UPDATE, APPROVE, LOGIN, PAYMENT …
  entity: { type: String, required: true },   // Patient, Result, Invoice, User …
  entityId: mongoose.Schema.Types.ObjectId,
  changes: Object,
  ip: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: false });

schema.index({ timestamp: -1 });
schema.index({ actor: 1, timestamp: -1 });
schema.index({ entity: 1, entityId: 1 });

export default mongoose.model('AuditLog', schema);