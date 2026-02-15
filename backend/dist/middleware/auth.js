import { verifyAccessToken } from '../lib/auth.js';
export function authMiddleware(_req, res, next) {
    const authHeader = _req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    try {
        const payload = verifyAccessToken(token);
        res.locals = { user: payload };
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
export function requireStudent(_req, res, next) {
    const locals = res.locals;
    if (!locals?.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    if (locals.user.role !== 'student') {
        res.status(403).json({ error: 'Student access only' });
        return;
    }
    next();
}
export function requireAdmin(_req, res, next) {
    const locals = res.locals;
    if (!locals?.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    if (locals.user.role !== 'admin') {
        res.status(403).json({ error: 'Admin access only' });
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map