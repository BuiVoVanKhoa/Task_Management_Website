import express from 'express';
import {
    createTeam,
    getTeam,
    addTeamMember,
    removeTeamMember,
    updateTeam
} from '../controllers/team.controllers.js';
import protectRoute from '../middleware/protectRoute.js';

const router = express.Router();

// Tất cả các routes đều cần xác thực
router.use(protectRoute);

// Routes cho team
router.post("/create", createTeam);
router.get("/:teamId", getTeam);
router.post("/:teamId/members", addTeamMember);
router.delete("/:teamId/members/:userId", removeTeamMember);
router.patch("/:teamId", updateTeam);

export default router;