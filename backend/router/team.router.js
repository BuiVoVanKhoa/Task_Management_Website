import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import { 
    createTeam,
    getTeam,
    updateTeam,
    addTeamMember,
    removeTeamMember,
    joinTeam,
    getTeams
} from '../controllers/team.controllers.js';
import Team from '../models/team.models.js';
import mongoose from 'mongoose';
import { deleteTeam } from '../controllers/team.controllers.js';

const router = express.Router();

// Áp dụng middleware auth cho tất cả các route
router.use(auth);

// Get team members
router.get('/:teamId/members', async (req, res) => {
    try {
        const team = await Team.findById(req.params.teamId)
            .populate('members.user', 'username avatarUrl');
        
        if (!team) {
            return res.status(404).json({ success: false, message: 'Team not found' });
        }

        const members = team.members.map(member => ({
            _id: member.user._id,
            username: member.user.username,
            avatarUrl: member.user.avatarUrl,
            role: member.role
        }));
        console.log('Members found:', members);

        res.json({ success: true, members });
    } catch (error) {
        console.error('Error getting team members:', error);
        res.status(500).json({ success: false, message: 'Error getting team members' });
    }
});

// Reset database route - CHỈ DÙNG TRONG DEVELOPMENT
router.post('/reset-db', async (req, res) => {
    try {
        // Xóa collection teams
        await mongoose.connection.collection('teams').drop();
        
        // Xóa tất cả indexes
        await mongoose.connection.collection('teams').dropIndexes();
        
        // Tạo lại index mới cho teamCode
        await mongoose.connection.collection('teams').createIndex({ teamCode: 1 }, { unique: true });

        res.status(200).json({
            success: true,
            message: 'Database and indexes reset successfully'
        });
    } catch (error) {
        console.error('Reset database error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// Team routes
router.get('/', getTeams);
router.post('/', createTeam);
router.post('/join/:teamCode', joinTeam);  // Đặt trước các route có :teamId
router.get('/:teamId', getTeam);
router.put('/:teamId', updateTeam);
router.post('/:teamId/members', addTeamMember);
router.delete('/:teamId/members/:userId', removeTeamMember);
router.delete('/:teamId', auth, deleteTeam);

export default router;