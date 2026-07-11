import mongoose, { Document } from 'mongoose';
export interface IAuditLog extends Document {
    actorId: string;
    action: string;
    targetUserId?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
}
export declare const AuditLog: mongoose.Model<IAuditLog, {}, {}, {}, mongoose.Document<unknown, {}, IAuditLog, {}, {}> & IAuditLog & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AuditLog.d.ts.map