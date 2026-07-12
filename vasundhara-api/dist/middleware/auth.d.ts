import { Request, Response, NextFunction } from 'express';
import { IUser } from '@/models/User';
export interface AuthRequest extends Request {
    user?: any;
}
export declare const authenticate: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: string[]) => (req: AuthRequest, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const generateTokens: (user: IUser) => {
    accessToken: string;
    refreshToken: string;
};
export declare const verifyRefreshToken: (token: string) => any;
//# sourceMappingURL=auth.d.ts.map