import mongoose, { Document } from 'mongoose';
export interface IRecipe extends Document {
    _id: string;
    name: string;
    description: string;
    instructions: string[];
    ingredients: Array<{
        name: string;
        quantity: number;
        unit: string;
        optional: boolean;
        notes?: string;
    }>;
    cookingTime: number;
    prepTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
    servings: number;
    category: string;
    subcategory?: string;
    tags: string[];
    dietaryRestrictions: string[];
    imageUrl?: string;
    videoUrl?: string;
    nutrition?: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber: number;
        sugar: number;
        sodium: number;
    };
    source: {
        type: 'user' | 'system' | 'partner';
        author?: string;
        url?: string;
        license?: string;
    };
    aiGenerated: boolean;
    priorityScore?: number;
    usesExpiringItems: string[];
    statistics: {
        timesCooked: number;
        averageRating: number;
        totalRatings: number;
        lastCookedAt?: Date;
    };
    createdAt: Date;
    updatedAt: Date;
    addRating(rating: number, userId: string): Promise<IRecipe>;
    incrementCookCount(): Promise<IRecipe>;
    calculatePriorityScore(expiringItems: string[]): number;
}
export declare const Recipe: mongoose.Model<IRecipe, {}, {}, {}, mongoose.Document<unknown, {}, IRecipe, {}, {}> & IRecipe & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Recipe.d.ts.map