import mongoose, { Document, Schema } from 'mongoose';

export interface IStudentProfile extends Document {
  user: mongoose.Types.ObjectId;
  rollNumber: string;
  department: string;
  branch: string;
  semester: number;
  year: number;
  graduationYear: number;
  cgpa: number;
  backlogs: number;
  activeBacklogs: number;
  tenthPercentage: number;
  twelfthPercentage: number;
  college: string;
  university: string;
  skills: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    endorsements: number;
  }>;
  experience: Array<{
    title: string;
    company: string;
    type: 'internship' | 'full-time' | 'part-time' | 'freelance';
    startDate: Date;
    endDate?: Date;
    isCurrent: boolean;
    description: string;
    skills: string[];
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    githubUrl?: string;
    liveUrl?: string;
    thumbnail?: string;
    startDate?: Date;
    endDate?: Date;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    issueDate: Date;
    expiryDate?: Date;
    credentialId?: string;
    credentialUrl?: string;
    image?: string;
  }>;
  achievements: Array<{
    title: string;
    description: string;
    date: Date;
    category: string;
  }>;
  languages: Array<{
    name: string;
    proficiency: 'basic' | 'conversational' | 'professional' | 'native';
  }>;
  socialLinks: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
    twitter?: string;
    leetcode?: string;
    hackerrank?: string;
    codechef?: string;
    codeforces?: string;
  };
  bio?: string;
  headline?: string;
  location?: string;
  isAvailableForPlacement: boolean;
  placementStatus: 'not_placed' | 'placed' | 'opted_out';
  placedAt?: mongoose.Types.ObjectId;
  placedRole?: string;
  placedSalary?: number;
  profileCompletion: number;
  isVerified: boolean;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const studentProfileSchema = new Schema<IStudentProfile>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    rollNumber: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    branch: { type: String, required: true },
    semester: { type: Number, min: 1, max: 12 },
    year: { type: Number, min: 1, max: 6 },
    graduationYear: { type: Number, required: true },
    cgpa: { type: Number, min: 0, max: 10, default: 0 },
    backlogs: { type: Number, default: 0 },
    activeBacklogs: { type: Number, default: 0 },
    tenthPercentage: { type: Number, min: 0, max: 100 },
    twelfthPercentage: { type: Number, min: 0, max: 100 },
    college: { type: String, required: true },
    university: { type: String, required: true },
    skills: [
      {
        name: { type: String, required: true },
        level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
        endorsements: { type: Number, default: 0 },
      },
    ],
    experience: [
      {
        title: { type: String, required: true },
        company: { type: String, required: true },
        type: { type: String, enum: ['internship', 'full-time', 'part-time', 'freelance'] },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        isCurrent: { type: Boolean, default: false },
        description: { type: String },
        skills: [{ type: String }],
      },
    ],
    projects: [
      {
        name: { type: String, required: true },
        description: { type: String },
        technologies: [{ type: String }],
        githubUrl: { type: String },
        liveUrl: { type: String },
        thumbnail: { type: String },
        startDate: { type: Date },
        endDate: { type: Date },
      },
    ],
    certifications: [
      {
        name: { type: String, required: true },
        issuer: { type: String, required: true },
        issueDate: { type: Date, required: true },
        expiryDate: { type: Date },
        credentialId: { type: String },
        credentialUrl: { type: String },
        image: { type: String },
      },
    ],
    achievements: [
      {
        title: { type: String, required: true },
        description: { type: String },
        date: { type: Date },
        category: { type: String },
      },
    ],
    languages: [
      {
        name: { type: String, required: true },
        proficiency: { type: String, enum: ['basic', 'conversational', 'professional', 'native'] },
      },
    ],
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      twitter: String,
      leetcode: String,
      hackerrank: String,
      codechef: String,
      codeforces: String,
    },
    bio: { type: String, maxlength: 500 },
    headline: { type: String, maxlength: 150 },
    location: { type: String },
    isAvailableForPlacement: { type: Boolean, default: true },
    placementStatus: { type: String, enum: ['not_placed', 'placed', 'opted_out'], default: 'not_placed' },
    placedAt: { type: Schema.Types.ObjectId, ref: 'Company' },
    placedRole: { type: String },
    placedSalary: { type: Number },
    profileCompletion: { type: Number, default: 0, min: 0, max: 100 },
    isVerified: { type: Boolean, default: false },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
  },
  { timestamps: true }
);

studentProfileSchema.index({ user: 1 });
studentProfileSchema.index({ rollNumber: 1 });
studentProfileSchema.index({ department: 1 });
studentProfileSchema.index({ cgpa: -1 });
studentProfileSchema.index({ graduationYear: 1 });
studentProfileSchema.index({ placementStatus: 1 });

export const StudentProfile = mongoose.model<IStudentProfile>('StudentProfile', studentProfileSchema);
