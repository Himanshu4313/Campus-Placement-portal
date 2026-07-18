import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  slug: string;
  logo?: string;
  logoPublicId?: string;
  website?: string;
  description?: string;
  industry: string;
  companySize: '1-10' | '11-50' | '51-200' | '201-500' | '501-1000' | '1001-5000' | '5000+';
  founded?: number;
  headquarters?: string;
  locations: string[];
  linkedinUrl?: string;
  glassdoorUrl?: string;
  isVerified: boolean;
  verifiedAt?: Date;
  verifiedBy?: mongoose.Types.ObjectId;
  isActive: boolean;
  rating?: number;
  totalReviews?: number;
  techStack: string[];
  perks: string[];
  culture?: string;
  workLifeBalance?: string;
  createdBy: mongoose.Types.ObjectId;
  admins: mongoose.Types.ObjectId[];
  recruiters: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const companySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    logo: { type: String },
    logoPublicId: { type: String },
    website: { type: String },
    description: { type: String, maxlength: 2000 },
    industry: { type: String, required: true },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5000+'],
      required: true,
    },
    founded: { type: Number },
    headquarters: { type: String },
    locations: [{ type: String }],
    linkedinUrl: { type: String },
    glassdoorUrl: { type: String },
    isVerified: { type: Boolean, default: false },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isActive: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5 },
    totalReviews: { type: Number, default: 0 },
    techStack: [{ type: String }],
    perks: [{ type: String }],
    culture: { type: String },
    workLifeBalance: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    recruiters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

companySchema.pre('save', function (this: any) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
});

companySchema.index({ name: 'text', description: 'text' });
companySchema.index({ industry: 1 });
companySchema.index({ isVerified: 1 });

export const Company = mongoose.model<ICompany>('Company', companySchema);
