import mongoose, { Document } from 'mongoose';
export interface IAlert extends Document {
    _id: string;
    type: 'expiry' | 'low_stock' | 'recipe_suggestion' | 'achievement' | 'system';
    title: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    household: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    relatedItem?: mongoose.Types.ObjectId;
    data?: any;
    isRead: boolean;
    isDismissed: boolean;
    readAt?: Date;
    dismissedAt?: Date;
    channels: ('push' | 'email' | 'sms' | 'in_app')[];
    sentAt?: Date;
    deliveryStatus: 'pending' | 'sent' | 'delivered' | 'failed';
    createdAt: Date;
    updatedAt: Date;
    markAsRead(): Promise<IAlert>;
    dismiss(): Promise<IAlert>;
    isExpired(): boolean;
}
export declare const Alert: mongoose.Model<IAlert, {}, {}, {}, mongoose.Document<unknown, {}, IAlert, {}, {}> & IAlert & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Alert.d.ts.map