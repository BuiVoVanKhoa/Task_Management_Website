import bcrypt from 'bcryptjs'
import generateTokenAndSetCookie from '../utils/generateToken.js'
import User from '../models/user.models.js'

export const signup = async (req, res) => {
    try {
        const {username, password,gender,email,role} = req.body


        // check if username or password is empty
        if (!username || !password || !gender || !email) {
            return res.status(400).json({success: false, message: "Please provide all fields"})
        }


        // check if user already exists
        const existingUser = await User.findOne({username: username})
        if (existingUser) {
            return res.status(400).json({success: false, message: "User already exists"})
        }

        
        // check email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({success: false, message: "Invalid email format"})
        }
        
        // check password length
        if (password.length < 6) {
            return res.status(400).json({success: false, message: "Password must be at least 6 characters"})
        }

        // avatar
        let avatar = ''
        if(gender === "male"){
            avatar = 'https://avatar.iran.liara.run/public/boy'
        }
        else if(gender === "female"){
            avatar = 'https://avatar.iran.liara.run/public/girl'
        }
        else{
            avatar = 'https://avatar.iran.liara.run/public'
        }

        // hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // set role 
        const userRole = role || "user"

        const newUser  = new User({username, password: hashedPassword,gender,email,avatarUrl: avatar, role: userRole})
        if(newUser){
            await generateTokenAndSetCookie(newUser._id, res)
            await newUser.save()
            res.status(201).json({success: true, message: newUser})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Server Error"})
    }
}

export const login = async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email: email})
        if (!user) {
            return res.status(400).json({success: false, message: "User not found"})
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({success: false, message: "Invalid credentials"})
        }

        generateTokenAndSetCookie(user._id, res)
        res.status(200).json({success: true, message: user})
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Server Error"})
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie("jwt")
        res.status(200).json({success: true, message: "Logout successfully"})
    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Server Error"})
    }
}