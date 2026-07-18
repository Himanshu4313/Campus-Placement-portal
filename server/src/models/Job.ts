import mongoose, { Document, Schema } from 'mongoose';

export type JobType = 'full-time' | 'internship' | 'part-time' | 'contract' | 'freelance';
export type WorkMode = 'on-site' | 'remote' | 'hybrid';
export type JobStatus = 'draft' | 'published' | 'closed' | 'expired' | 'cancelled';

export interface IJob extends Document {
  title: string;
  company: mongoose.Types.ObjectId;
  postedBy: mongoose.Types.ObjectId;
  description: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];
  skills: string[];
  type: JobType;
  workMode: WorkMode;
  location: string;
  locations?: string[];
  salary: {
    min: number;
    max: number;
    currency: string;
    period: 'annual' | 'monthly';
    isNegotiable: boolean;
    isDisclosed: boolean;
  };
  stipend?: {
    amount: number;
    currency: string;
    period: 'monthly';
  };
  experience: {
    min: number;
    max?: number;
  };
  eligibility: {
    minCGPA?: number;
    maxBacklogs?: number;
    maxActiveBacklogs?: number;
    branches?: string[];
    departments?: string[];
    graduationYear?: number[];
    tenthPercentage?: number;
    twelfthPercentage?: number;
    skills?: string[];
    degree?: string[];
  };
  applicationProcess: string[];
  benefits: string[];
  status: JobStatus;
  applicationDeadline?: Date;
  startDate?: Date;
  duration?: string;
  openings: number;
  category: string;
  tags: string[];
  isCampusHiring: boolean;
  views: number;
  applicationCount: number;
  shortlistedCount: number;
  selectedCount: number;
  expiresAt?: Date;
  publishedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true, trim: true },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    responsibilities: [{ type: String }],
    requirements: [{ type: String }],
    niceToHave: [{ type: String }],
    skills: [{ type: String, required: true }],
    type: {
      type: String,
      enum: ['full-time', 'internship', 'part-time', 'contract', 'freelance'],
      required: true,
    },
    workMode: {
      type: String,
      enum: ['on-site', 'remote', 'hybrid'],
      required: true,
    },
    location: { type: String, required: true },
    locations: [{ type: String }],
    salary: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: 'INR' },
      period: { type: String, enum: ['annual', 'monthly'], default: 'annual' },
      isNegotiable: { type: Boolean, default: false },
      isDisclosed: { type: Boolean, default: true },
    },
    stipend: {
      amount: { type: Number },
      currency: { type: String, default: 'INR' },
      period: { type: String, default: 'monthly' },
    },
    experience: {
      min: { type: Number, default: 0 },
      max: { type: Number },
    },
    eligibility: {
      minCGPA: { type: Number },
      maxBacklogs: { type: Number },
      maxActiveBacklogs: { type: Number },
      branches: [{ type: String }],
      departments: [{ type: String }],
      graduationYear: [{ type: Number }],
      tenthPercentage: { type: Number },
      twelfthPercentage: { type: Number },
      skills: [{ type: String }],
      degree: [{ type: String }],
    },
    applicationProcess: [{ type: String }],
    benefits: [{ type: String }],
    status: {
      type: String,
      enum: ['draft', 'published', 'closed', 'expired', 'cancelled'],
      default: 'draft',
    },
    applicationDeadline: { type: Date },
    startDate: { type: Date },
    duration: { type: String },
    openings: { type: Number, default: 1, min: 1 },
    category: { type: String, required: true },
    tags: [{ type: String }],
    isCampusHiring: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
    shortlistedCount: { type: Number, default: 0 },
    selectedCount: { type: Number, default: 0 },
    expiresAt: { type: Date },
    publishedAt: { type: Date },
    closedAt: { type: Date },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', description: 'text', skills: 'text' });
jobSchema.index({ company: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ type: 1 });
jobSchema.index({ workMode: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ 'salary.min': 1, 'salary.max': 1 });
jobSchema.index({ applicationDeadline: 1 });
jobSchema.index({ isCampusHiring: 1 });
jobSchema.index({ createdAt: -1 });

export const Job = mongoose.model<IJob>('Job', jobSchema);
