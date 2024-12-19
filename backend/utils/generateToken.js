import jwt from 'jsonwebtoken';

const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: '15d'
    });

    res.cookie('jwt', token, {
        httpOnly: true, // Prevents client-side access to the cookie
        maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
        sameSite: 'strict', // CSRF protection
        secure: process.env.NODE_ENV === 'production' // Only use HTTPS in production
    });

    return token;
};

export default generateTokenAndSetCookie;
