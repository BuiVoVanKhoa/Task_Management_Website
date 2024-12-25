import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        role: {
            type: String,
            enum: ['member', 'admin'],
            default: 'member'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        }
    }],
    avatar: {
        type: String,
        default: "https://via.placeholder.com/150"
    },
    teamCode: {
        type: String,
        default: function() {
            return Math.random().toString(36).substring(2, 8).toUpperCase();
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Tạo index cho teamCode
teamSchema.index({ teamCode: 1 }, { unique: true });

export default mongoose.model('Team', teamSchema);