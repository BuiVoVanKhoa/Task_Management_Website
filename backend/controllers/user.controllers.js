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
        
        res.status(201).json({ 
            success: true, 
            user: newUser,
            token: token 
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
    
        if (!user) {
          return res.status(400).json({ success: false, message: "User not found" });
        }
    
        const isMatch = await bcrypt.compare(password, user.password);
    
        if (!isMatch) {
          return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
    
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        
        res.status(200).json({ 
            success: true, 
            user,
            token: token 
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Server Error" });
      }
}

export const logout = async (req, res) => {
    try {
        res.status(200).json({success: true, message: "Logout successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Server Error"})
    }
}

export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: "No token provided"
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

      res.status(200).json({
        success: true,
        user
      });
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
  } catch (error) {
    console.error("Error in verifyToken:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};