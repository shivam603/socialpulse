const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token missing.' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const secret = process.env.JWT_SECRET || 'default_jwt_secret';
        const payload = jwt.verify(token, secret);
        req.user = { id: payload.id, email: payload.email, username: payload.username, role: payload.role || 'user' };
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};
