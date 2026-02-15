import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const SALT_ROUNDS = 10;
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET ?? 'dev-access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'dev-refresh-secret';
const ACCESS_EXPIRES_SEC = 15 * 60; // 15 min
const REFRESH_EXPIRES_SEC = 7 * 24 * 3600; // 7 days
export async function hashPassword(plain) {
    return bcrypt.hash(plain, SALT_ROUNDS);
}
export async function comparePassword(plain, hash) {
    return bcrypt.compare(plain, hash);
}
export function signAccessToken(payload) {
    return jwt.sign({ ...payload, type: 'access' }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_SEC });
}
export function signRefreshToken(payload) {
    return jwt.sign({ ...payload, type: 'refresh' }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_SEC });
}
export function verifyAccessToken(token) {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    if (decoded.type !== 'access')
        throw new Error('Invalid token type');
    return decoded;
}
export function verifyRefreshToken(token) {
    const decoded = jwt.verify(token, REFRESH_SECRET);
    if (decoded.type !== 'refresh')
        throw new Error('Invalid token type');
    return decoded;
}
//# sourceMappingURL=auth.js.map