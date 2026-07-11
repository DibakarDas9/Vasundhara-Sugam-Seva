import mongoose, { Document } from 'mongoose';
export interface IFoodItem extends Document {
    _id: string;
    name: string;
    category: string;
    subcategory?: string;
    brand?: string;
    description?: string;
    household: mongoose.Types.ObjectId;
    addedBy: mongoose.Types.ObjectId;
    purchaseDate: Date;
    purchasePrice?: number;
    purchaseLocation?: string;
    expiryDate?: Date;
    predictedExpiryDate?: Date;
    expiryConfidence?: number;
    spoilageCurve?: Array<{
        date: Date;
        probSpoiled: number;
    }>;
    storage: 'fridge' | 'freezer' | 'pantry' | 'counter' | 'outside';
    packaging: 'plastic' | 'glass' | 'metal' | 'paper' | 'clamshell' | 'vacuum' | 'none';
    temperature?: number;
    humidity?: number;
    quantity: number;
    unit: 'piece' | 'kg' | 'g' | 'l' | 'ml' | 'cup' | 'tbsp' | 'tsp' | 'oz' | 'lb';
    remainingQuantity: number;
    status: 'fresh' | 'expiring_soon' | 'expired' | 'consumed' | 'wasted';
    lastUsedAt?: Date;
    usageRate: number;
    imageUrl?: string;
    barcode?: string;
    qrCode?: string;
    mlFeatures?: {
        colorAnalysis?: any;
        freshnessScore?: number;
        qualityIndicators?: string[];
        spoilageIndicators?: string[];
    };
    tags: string[];
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
    updateStatus(): Promise<IFoodItem>;
    markAsConsumed(quantity?: number): Promise<IFoodItem>;
    markAsWasted(reason?: string): Promise<IFoodItem>;
    isExpiringSoon(days?: number): boolean;
    getDaysUntilExpiry(): number;
    calculateWasteValue(): number;
}
export declare const FoodItem: mongoose.Model<IFoodItem, {}, {}, {}, mongoose.Document<unknown, {}, IFoodItem, {}, {}> & IFoodItem & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=FoodItem.d.ts.map