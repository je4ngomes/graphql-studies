import jwt from 'jsonwebtoken';

const getUserId = req => ( req.isAuthenticated && req.user.id ) || null;

const generateToken = data => jwt.sign(data, process.env.JWT_SECRET, { expiresIn: '7d' });

export {
    getUserId,
    generateToken
};