import Team from '../models/team.models.js';

// Tạo team mới
export const createTeam = async (req, res) => {
    try {
        const { name, description } = req.body;
        const leader = req.user._id;

        const newTeam = new Team({
            name,
            description,
            leader,
            members: [{
                user: leader,
                role: 'admin'
            }]
        });

        const savedTeam = await newTeam.save();
        
        res.status(201).json({
            success: true,
            data: savedTeam
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Lấy thông tin team
export const getTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const team = await Team.findById(teamId)
            .populate('leader', 'username avatarUrl')
            .populate('members.user', 'username avatarUrl');

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        res.status(200).json({
            success: true,
            data: team
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Thêm thành viên vào team
export const addTeamMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId, role = 'member' } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Kiểm tra quyền (chỉ leader hoặc admin mới có thể thêm thành viên)
        const requestingUser = team.members.find(member => 
            member.user.toString() === req.user._id.toString()
        );
        
        if (team.leader.toString() !== req.user._id.toString() && 
            (!requestingUser || requestingUser.role !== 'admin')) {
            return res.status(403).json({
                success: false,
                message: "Not authorized to add members"
            });
        }

        // Kiểm tra xem thành viên đã tồn tại chưa
        if (team.members.some(member => member.user.toString() === userId)) {
            return res.status(400).json({
                success: false,
                message: "User is already a team member"
            });
        }

        team.members.push({
            user: userId,
            role
        });

        await team.save();

        res.status(200).json({
            success: true,
            data: team
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Xóa thành viên khỏi team
export const removeTeamMember = async (req, res) => {
    try {
        const { teamId, userId } = req.params;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Kiểm tra quyền
        if (team.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only team leader can remove members"
            });
        }

        // Không thể xóa leader
        if (userId === team.leader.toString()) {
            return res.status(400).json({
                success: false,
                message: "Cannot remove team leader"
            });
        }

        team.members = team.members.filter(
            member => member.user.toString() !== userId
        );

        await team.save();

        res.status(200).json({
            success: true,
            data: team
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Cập nhật thông tin team
export const updateTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { name, description } = req.body;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Chỉ leader mới có thể cập nhật thông tin team
        if (team.leader.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only team leader can update team information"
            });
        }

        team.name = name || team.name;
        team.description = description || team.description;

        await team.save();

        res.status(200).json({
            success: true,
            data: team
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};