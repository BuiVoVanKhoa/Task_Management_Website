import User from "../models/user.models.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendVerificationEmail, sendWelcomeEmail } from "../helpers/mail.sender.js";

// Temporary storage for pending registrations
const pendingRegistrations = new Map();

// Hàm kiểm tra mã xác thực
const verifyCode = (email, code) => {
  const registration = pendingRegistrations.get(email);
  if (!registration) {
    return { valid: false, message: "No pending registration found" };
  }

  // Kiểm tra thời gian hết hạn (5 phút)
  if (Date.now() - registration.timestamp > 5 * 60 * 1000) {
    pendingRegistrations.delete(email);
    return { valid: false, message: "Verification code has expired" };
  }

  if (registration.verificationCode !== code) {
    return { valid: false, message: "Invalid verification code" };
  }

  return { valid: true };
};

// Hàm xử lý đăng ký tài khoản
export const initiateSignup = async (req, res) => {
  try {
    const { username, email, password, gender } = req.body;

    // Kiểm tra các trường bắt buộc
    if (!username || !email || !password || !gender) {
      return res.status(400).json({
        success: false,
        message: "Please provide all fields",
      });
    }

    // Kiểm tra xem email đã được sử dụng chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Tạo mã xác thực
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Store registration data temporarily
    pendingRegistrations.set(email, {
      username,
      password,
      gender,
      verificationCode,
      timestamp: Date.now()
    });

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (error) {
    console.error("Error in initiateSignup:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Hàm xác thực email và hoàn tất đăng ký
export const verifyAndCompleteSignup = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    // Verify the code
    const verificationResult = verifyCode(email, verificationCode);
    if (!verificationResult.valid) {
      return res.status(400).json({
        success: false,
        message: verificationResult.message,
      });
    }

    // Get pending registration data
    const registrationData = pendingRegistrations.get(email);
    if (!registrationData) {
      return res.status(400).json({
        success: false,
        message: "Registration data not found or expired",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(registrationData.password, salt);

    // Create new user
    const newUser = new User({
      username: registrationData.username,
      password: hashedPassword,
      gender: registrationData.gender,
      email,
      avatarUrl: "/avt_profile/avt_0.jpg",
      role: "user",
    });
    await newUser.save();

    // Clean up pending registration
    pendingRegistrations.delete(email);

    // Send welcome email
    await sendWelcomeEmail(email, registrationData.username);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Error in verifyAndCompleteSignup:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Hàm đăng nhập
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email và password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Tìm user theo email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Kiểm tra password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Tạo token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Đặt token làm cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        gender: user.gender,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
    });
  }
};

// Hàm đăng xuất
export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt");
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error logging out",
    });
  }
};

// Hàm kiểm tra trạng thái đăng nhập
export const verifyAuth = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    // Xác minh mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Lấy người dùng từ cơ sở dữ liệu
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role: user.role,
        gender: user.gender,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({
        success: false,
        message: "Token expired",
      });
    } else {
      console.error("Token verification error:", error);
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  }
};

// Hàm cập nhật thông tin người dùng
export const updateProfile = async (req, res) => {
  try {
    const { username, email, gender, avatarUrl } = req.body;
    const userId = req.user._id;

    // Kiểm tra các trường bắt buộc
    if (!username || !email || !gender) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Kiểm tra xem email mới có bị trùng không (nếu email thay đổi)
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already in use",
        });
      }
    }

    // Cập nhật thông tin người dùng
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        username,
        email,
        gender,
        avatarUrl: avatarUrl || '/avt_profile/avt_0.jpg',
      },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
    });
  }
};
