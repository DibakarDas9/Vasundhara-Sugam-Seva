import { Document } from 'mongoose';
export interface IMarketplaceListing extends Document {
    id: string;
    title: string;
    expiryDate: string;
    location: string;
    postedBy: string;
    postedTime: string;
    category: string;
    price: number;
    isFree: boolean;
    image?: string;
    ownerId: string;
    phone: string;
    status: 'available' | 'claimed';
    createdAt: Date;
}
export declare const MarketplaceListing: import("mongoose").Model<IMarketplaceListing, {}, {}, {}, Document<unknown, {}, IMarketplaceListing, {}, {}> & IMarketplaceListing & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=MarketplaceListing.d.ts.map