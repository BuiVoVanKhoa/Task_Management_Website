import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import { 
    createTeam,
    getTeam,
    updateTeam,
    addTeamMember,
    removeTeamMember
} from '../controllers/team.controllers.js';

const router = express.Router();

// Áp dụng middleware auth cho tất cả các route
router.use(auth);

// Team routes
router.post('/', createTeam);
router.get('/:teamId', getTeam);
router.put('/:teamId', updateTeam);
router.post('/:teamId/members', addTeamMember);
router.delete('/:teamId/members/:userId', removeTeamMember);

export default router;