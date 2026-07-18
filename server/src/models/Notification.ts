import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  type: 'application_status' | 'interview_scheduled' | 'offer_released' | 'drive_reminder' | 'system' | 'announcement' | 'message' | 'profile_update';
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  actionUrl?: string;
  icon?: string;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['application_status', 'interview_scheduled', 'offer_released', 'drive_reminder', 'system', 'announcement', 'message', 'profile_update'],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
    priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
    actionUrl: { type: String },
    icon: { type: String },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
