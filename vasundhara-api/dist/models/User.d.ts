import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    _id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'household' | 'shopkeeper' | 'admin' | 'user' | 'retail_partner';
    isActive: boolean;
    isEmailVerified: boolean;
    profileImage?: string;
    phoneNumber?: string;
    dateOfBirth?: Date;
    preferences: {
        notifications: boolean;
        alerts: boolean;
        gamification: boolean;
        language: string;
        timezone: string;
    };
    socialLogins: {
        google?: {
            id: string;
            email: string;
        };
        facebook?: {
            id: string;
            email: string;
        };
    };
    approvalStatus: 'pending' | 'approved' | 'rejected';
    approvalMetadata?: {
        reviewerId?: string;
        note?: string;
        reviewedAt?: Date;
    };
    flags?: {
        isFlagged: boolean;
        reason?: string;
        lastReviewedAt?: Date;
    };
    householdProfile?: {
        familySize?: number;
        address?: string;
        ward?: string;
    };
    shopkeeperProfile?: {
        businessName?: string;
        licenseNumber?: string;
        address?: string;
    };
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    toJSON(): any;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map