export declare function hashPassword(plain: string): Promise<string>;
export declare function comparePassword(plain: string, hash: string): Promise<boolean>;
export type TokenPayload = {
    sub: string;
    role: 'student' | 'admin';
    type: 'access' | 'refresh';
};
export declare function signAccessToken(payload: Omit<TokenPayload, 'type'>): string;
export declare function signRefreshToken(payload: Omit<TokenPayload, 'type'>): string;
export declare function verifyAccessToken(token: string): TokenPayload;
export declare function verifyRefreshToken(token: string): TokenPayload;
//# sourceMappingURL=auth.d.ts.map