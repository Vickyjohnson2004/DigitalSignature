import { Schema, model, models, Types } from 'mongoose';

const schema = new Schema({
  userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  signatureId: { type: Types.ObjectId, ref: 'Signature', required: true },
  verificationStatus: {
    type: String,
    enum: ['Valid', 'Invalid', 'Error', 'Tampered'],
    required: true,
  },
  verificationTime: { type: Number, required: true },
  remarks: String,
  verifiedAt: { type: Date, default: Date.now },
});

export const VerificationLog = models.VerificationLog || model('VerificationLog', schema);
