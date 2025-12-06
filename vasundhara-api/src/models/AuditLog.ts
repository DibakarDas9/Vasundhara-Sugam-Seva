import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  actorId: string;
  action: string;
  targetUserId?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  actorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true,
    maxlength: 120,
  },
  targetUserId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  metadata: {
    type: Schema.Types.Mixed,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ targetUserId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
