import mongoose, { Document, Schema } from 'mongoose';

export interface IBookmark extends Document {
  student: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  note?: string;
  folder?: string;
  createdAt: Date;
}

const bookmarkSchema = new Schema<IBookmark>(
  {
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    job: { type: Schema.Types.ObjectId, ref: 'Job', required: true },
    note: { type: String },
    folder: { type: String, default: 'General' },
  },
  { timestamps: true }
);

bookmarkSchema.index({ student: 1, job: 1 }, { unique: true });
bookmarkSchema.index({ student: 1 });

export const Bookmark = mongoose.model<IBookmark>('Bookmark', bookmarkSchema);
