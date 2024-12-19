import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true, 
        unique: true 
    },
    password: {
        type: String, 
        minlength: 6,
        required: true 
    },
    gender: {
        type: String, 
        enum: ['male', 'female'] 
    },
    email: {
        type: String, 
        required: true,
        unique: true
    },
    avatarUrl: {
        type: String, 
    },
    role: { 
        type: String, 
        enum: ['user', 'admin'] 
    }, // or use roles collection for more complex roles
    progress: [
        {
            courseId:{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Course',
            },
            completedLessons: [String],
            averageProgress: {
                type: Number ,
            }
        }
    ]
},{timestamps: true})

const User = mongoose.model('User',userSchema)
export default User