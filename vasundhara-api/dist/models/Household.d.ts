import mongoose, { Document } from 'mongoose';
export interface IHousehold extends Document {
    _id: string;
    name: string;
    description?: string;
    members: Array<{
        user: mongoose.Types.ObjectId;
        role: 'owner' | 'member' | 'viewer';
        joinedAt: Date;
        isActive: boolean;
    }>;
    settings: {
        notifications: boolean;
        alerts: boolean;
        gamification: boolean;
        defaultStorage: 'fridge' | 'freezer' | 'pantry' | 'counter';
        expiryAlerts: {
            enabled: boolean;
            daysBefore: number[];
        };
        wasteTracking: boolean;
        carbonFootprint: boolean;
    };
    address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    statistics: {
        totalItemsTracked: number;
        itemsWasted: number;
        itemsConsumed: number;
        moneySaved: number;
        carbonFootprintReduced: number;
        streakDays: number;
        lastActivityAt: Date;
    };
    createdAt: Date;
    updatedAt: Date;
    addMember(userId: string, role: 'owner' | 'member' | 'viewer'): Promise<IHousehold>;
    removeMember(userId: string): Promise<IHousehold>;
    isMember(userId: string): boolean;
    getOwner(): any;
    updateStatistics(): Promise<IHousehold>;
}
export declare const Household: mongoose.Model<IHousehold, {}, {}, {}, mongoose.Document<unknown, {}, IHousehold, {}, {}> & IHousehold & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Household.d.ts.map