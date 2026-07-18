import mongoose, { Document, Schema } from 'mongoose';

export type ApplicationStatus =
  | 'applied'
  | 'under_review'
  | 'shortlisted'
  | 'interview_scheduled'
  | 'interview_completed'
  | 'selected'
  | 'offer_released'
  | 'offer_accepted'
  | 'rejected'
  | 'withdrawn';

export interface IApplication extends Document {
  student: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  company: mongoose.Types.ObjectId;
  resume: mongoose.Types.ObjectId;
  coverLetter?: string;
  status: ApplicationStatus;
  statusHistory: Array<{
    status: ApplicationStatus;
    changedAt: Date;
    changedBy?: mongoose.Types.ObjectId;
    note?: string;
  }>;
  recruiterNote?: string;
  studentNote?: string;
  interviewRounds: Array<{
    round: number;
    type: 'technical' | 'hr' | 'managerial' | 'group_discussion' | 'aptitude' | 'coding';
    scheduledAt?: Date;
    completedAt?: Date;
    duration?: number;
    mode: 'online' | 'offline' | 'phone';
    meetingLink?: string;
    location?: string;
    interviewers?: string[];
    feedback?: string;
    rating?: number;
    result?: 'pass' | 'fail' | 'hold' | 'pending';
  }>;
  atsScore?: number;
  matchScore?: number;
  isStarred: boolean;
  appliedAt: Date;
  withdrawnAt?: Date;
  rejectedAt?: Date;
  selectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<IApplication>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    resume: { type: Schema.Types.ObjectId, ref: 'Resume' },
    coverLetter: { type: String, maxlength: 2000 },
    status: {
      type: String,
      enum: [
        'applied', 'under_review', 'shortlisted', 'interview_scheduled',
        'interview_completed', 'selected', 'offer_released', 'offer_accepted',
        'rejected', 'withdrawn',
      ],
      default: 'applied',
    },
    statusHistory: [
      {
        status: { type: String, required: true },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        note: { type: String },
      },
    ],
    recruiterNote: { type: String },
    studentNote: { type: String },
    interviewRounds: [
      {
        round: { type: Number, required: true },
        type: { type: String, enum: ['technical', 'hr', 'managerial', 'group_discussion', 'aptitude', 'coding'] },
        scheduledAt: { type: Date },
        completedAt: { type: Date },
        duration: { type: Number },
        mode: { type: String, enum: ['online', 'offline', 'phone'], default: 'online' },
        meetingLink: { type: String },
        location: { type: String },
        interviewers: [{ type: String }],
        feedback: { type: String },
        rating: { type: Number, min: 1, max: 5 },
        result: { type: String, enum: ['pass', 'fail', 'hold', 'pending'], default: 'pending' },
      },
    ],
    atsScore: { type: Number, min: 0, max: 100 },
    matchScore: { type: Number, min: 0, max: 100 },
    isStarred: { type: Boolean, default: false },
    appliedAt: { type: Date, default: Date.now },
    withdrawnAt: { type: Date },
    rejectedAt: { type: Date },
    selectedAt: { type: Date },
  },
  { timestamps: true }
);

applicationSchema.index({ student: 1, job: 1 }, { unique: true });
applicationSchema.index({ student: 1 });
applicationSchema.index({ job: 1 });
applicationSchema.index({ company: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ appliedAt: -1 });

export const Application = mongoose.model<IApplication>('Application', applicationSchema);
