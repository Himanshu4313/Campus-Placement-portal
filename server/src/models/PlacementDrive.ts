import mongoose, { Document, Schema } from 'mongoose';

export interface IPlacementDrive extends Document {
  title: string;
  description?: string;
  company: mongoose.Types.ObjectId;
  jobs: mongoose.Types.ObjectId[];
  organizedBy: mongoose.Types.ObjectId;
  eligibility: {
    minCGPA?: number;
    maxBacklogs?: number;
    branches?: string[];
    departments?: string[];
    graduationYear?: number[];
  };
  schedule: {
    registrationStart: Date;
    registrationEnd: Date;
    driveDate: Date;
    resultDate?: Date;
  };
  venue?: string;
  mode: 'on-campus' | 'off-campus' | 'virtual';
  meetingLink?: string;
  maxRegistrations?: number;
  registeredStudents: mongoose.Types.ObjectId[];
  attendedStudents: mongoose.Types.ObjectId[];
  selectedStudents: mongoose.Types.ObjectId[];
  rounds: Array<{
    name: string;
    type: 'aptitude' | 'coding' | 'gd' | 'technical' | 'hr' | 'final';
    date?: Date;
    description?: string;
    duration?: number;
  }>;
  status: 'upcoming' | 'registration_open' | 'registration_closed' | 'in_progress' | 'completed' | 'cancelled';
  isPublished: boolean;
  announcements: Array<{
    message: string;
    createdAt: Date;
    createdBy: mongoose.Types.ObjectId;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const placementDriveSchema = new Schema<IPlacementDrive>(
  {
    title: { type: String, required: true },
    description: { type: String },
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    jobs: [{ type: Schema.Types.ObjectId, ref: 'Job' }],
    organizedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    eligibility: {
      minCGPA: Number,
      maxBacklogs: Number,
      branches: [String],
      departments: [String],
      graduationYear: [Number],
    },
    schedule: {
      registrationStart: { type: Date, required: true },
      registrationEnd: { type: Date, required: true },
      driveDate: { type: Date, required: true },
      resultDate: Date,
    },
    venue: String,
    mode: { type: String, enum: ['on-campus', 'off-campus', 'virtual'], default: 'on-campus' },
    meetingLink: String,
    maxRegistrations: Number,
    registeredStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    attendedStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    selectedStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    rounds: [
      {
        name: { type: String, required: true },
        type: { type: String, enum: ['aptitude', 'coding', 'gd', 'technical', 'hr', 'final'] },
        date: Date,
        description: String,
        duration: Number,
      },
    ],
    status: {
      type: String,
      enum: ['upcoming', 'registration_open', 'registration_closed', 'in_progress', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    isPublished: { type: Boolean, default: false },
    announcements: [
      {
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

placementDriveSchema.index({ company: 1 });
placementDriveSchema.index({ status: 1 });
placementDriveSchema.index({ 'schedule.driveDate': 1 });

export const PlacementDrive = mongoose.model<IPlacementDrive>('PlacementDrive', placementDriveSchema);
