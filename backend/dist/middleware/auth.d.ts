import type { Request, Response, NextFunction } from 'express';
import { type TokenPayload } from '../lib/auth.js';
export type AuthLocals = {
    user: TokenPayload;
};
export declare function authMiddleware(_req: Request, res: Response, next: NextFunction): void;
export declare function requireStudent(_req: Request, res: Response, next: NextFunction): void;
export declare function requireAdmin(_req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=auth.d.ts.map