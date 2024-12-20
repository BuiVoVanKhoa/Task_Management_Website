import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';

export const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized - No token provided"
            });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId).select("-password");

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }

            req.user = user;
            next();
        } catch (jwtError) {
            if (jwtError.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: "Token has expired"
                });
            }
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
