import mongoose, { Document } from 'mongoose';
export interface IInventoryItem extends Document {
    id: string;
    userId: mongoose.Types.ObjectId;
    name: string;
    category: string;
    expiryDate: string | null;
    quantity: number;
    unit: string;
    addedDate: string;
    status: string;
    price: number;
    photo: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const InventoryItem: mongoose.Model<any, {}, {}, {}, any, any>;
//# sourceMappingURL=InventoryItem.d.ts.map