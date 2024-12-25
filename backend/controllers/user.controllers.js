import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken';
import User from '../models/user.models.js'

export const signup = async (req, res) => {
    try {
        const { username, email, password, gender } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!username || !email || !password || !gender) {
            return res.status(400).json({
                success: false,
                message: "Please provide all fields"
            });
        }

        // Kiểm tra xem email đã được sử dụng chưa
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email already in use"
            });
        }

        // Tạo avatar dựa trên giới tính
        let avatar;
        if (gender === "male") {
            avatar = 'https://avatar.iran.liara.run/public/boy';
        } else if (gender === "female") {
            avatar = 'https://avatar.iran.liara.run/public/girl';
        } else {
            avatar = 'https://avatar.iran.liara.run/public';
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Set role 
        const userRole = "user";

        const newUser = new User({ username, password: hashedPassword, gender, email, avatarUrl: avatar, role: userRole });
        await newUser.save();

        // Generate token
        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        // Set token as cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.status(201).json({ 
            success: true, 
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                avatarUrl: newUser.avatarUrl,
                role: newUser.role
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: "Error creating user"
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Kiểm tra email và password
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            });
        }

        // Tìm user theo email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Kiểm tra password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Tạo token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Set token as cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: "Error logging in"
        });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie('jwt');
        res.json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error logging out"
        });
    }
};

export const verifyToken = async (req, res) => {
    try {
        const token = req.cookies.jwt;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
                role: user.role
            }
        });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                message: "Token expired"
            });
        } else {
            console.error('Token verification error:', error);
            res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
    }
};