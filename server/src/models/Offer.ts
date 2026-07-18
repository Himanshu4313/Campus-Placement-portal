import mongoose, { Document, Schema } from 'mongoose';

export interface IOffer extends Document {
  student: mongoose.Types.ObjectId;
  application: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  releasedBy: mongoose.Types.ObjectId;
  offerLetterUrl?: string;
  offerLetterPublicId?: string;
  ctc: number;
  stipend?: number;
  role: string;
  department?: string;
  location: string;
  joiningDate?: Date;
  offerDeadline?: Date;
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'revoked';
  acceptedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
  conditions?: string[];
  releasedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<IOffer>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    application: { type: Schema.Types.ObjectId, ref: 'Application', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    releasedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    offerLetterUrl: String,
    offerLetterPublicId: String,
    ctc: { type: Number, required: true },
    stipend: Number,
    role: { type: String, required: true },
    department: String,
    location: { type: String, required: true },
    joiningDate: Date,
    offerDeadline: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'expired', 'revoked'],
      default: 'pending',
    },
    acceptedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
    conditions: [String],
    releasedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

offerSchema.index({ student: 1 });
offerSchema.index({ company: 1 });
offerSchema.index({ status: 1 });

export const Offer = mongoose.model<IOffer>('Offer', offerSchema);
