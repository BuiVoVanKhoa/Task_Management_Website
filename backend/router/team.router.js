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

const router = express.Router();

// Áp dụng middleware auth cho tất cả các route
router.use(auth);

// Reset database route - CHỈ DÙNG TRONG DEVELOPMENT
router.post('/reset-db', async (req, res) => {
    try {
        // Xóa tất cả documents trong collection teams
        await Team.deleteMany({});
        
        res.status(200).json({
            success: true,
            message: 'Database reset successfully'
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

export default router;