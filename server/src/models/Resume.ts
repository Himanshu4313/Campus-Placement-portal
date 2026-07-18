import mongoose, { Document, Schema } from 'mongoose';

export interface IResume extends Document {
  student: mongoose.Types.ObjectId;
  name: string;
  url: string;
  publicId: string;
  fileType: 'pdf' | 'doc' | 'docx';
  fileSize: number;
  isDefault: boolean;
  version: number;
  atsScore?: number;
  atsAnalysis?: {
    keywords: string[];
    missingKeywords: string[];
    suggestions: string[];
    strengths: string[];
    weaknesses: string[];
    formatScore: number;
    contentScore: number;
    keywordScore: number;
    analyzedAt: Date;
  };
  downloadCount: number;
  viewCount: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const resumeSchema = new Schema<IResume>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'doc', 'docx'], default: 'pdf' },
    fileSize: { type: Number },
    isDefault: { type: Boolean, default: false },
    version: { type: Number, default: 1 },
    atsScore: { type: Number, min: 0, max: 100 },
    atsAnalysis: {
      keywords: [String],
      missingKeywords: [String],
      suggestions: [String],
      strengths: [String],
      weaknesses: [String],
      formatScore: Number,
      contentScore: Number,
      keywordScore: Number,
      analyzedAt: Date,
    },
    downloadCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

resumeSchema.index({ student: 1 });
resumeSchema.index({ isDefault: 1 });

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);
