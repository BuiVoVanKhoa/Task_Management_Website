import Team from '../models/team.models.js';

// Tạo team mới
export const createTeam = async (req, res) => {
    try {
        const { name, description, avatar } = req.body;
        const leader = req.user._id;

        const newTeam = new Team({
            name,
            description,
            avatar: avatar || '/avt_group/avt-0.jpg',
            leader,
            members: [{
                user: leader,
                role: 'admin'
            }]
        });

        console.log('Before save - newTeam:', {
            name: newTeam.name,
            description: newTeam.description,
            avatar: newTeam.avatar,
            teamCode: newTeam.teamCode
        });

        const savedTeam = await newTeam.save();
        
        console.log('After save - savedTeam:', {
            name: savedTeam.name,
            description: savedTeam.description,
            avatar: savedTeam.avatar,
            teamCode: savedTeam.teamCode
        });

     // Điền thông tin người Leader và chọn thêm teamCode
        const populatedTeam = await Team.findById(savedTeam._id)
            .select('name description avatar teamCode members leader')
            .populate('leader', 'username avatarUrl')
            .populate('members.user', 'username avatarUrl');

        console.log('After populate - populatedTeam:', {
            name: populatedTeam.name,
            description: populatedTeam.description,
            avatar: populatedTeam.avatar,
            teamCode: populatedTeam.teamCode,
            leader: populatedTeam.leader
        });

        res.status(201).json({
            success: true,
            data: populatedTeam
        });
    } catch (error) {
        console.error('Create team error:', error);
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
            .populate([
                { path: 'leader', select: 'username avatarUrl' },
                { path: 'members.user', select: 'username avatarUrl' }
            ]);

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
        console.error('Get team error:', error);
        res.status(500).json({
            success: false,
            message: "Error getting team"
        });
    }
};

// Thêm thành viên vào team
export const addTeamMember = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { userId, role = 'member' } = req.body;
        const requestingUser = req.user._id;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Kiểm tra quyền
        const isAdmin = team.members.some(member => 
            member.user.toString() === requestingUser.toString() && 
            member.role === 'admin'
        );

        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Only admin can add members"
            });
        }

        // Kiểm tra xem user đã là thành viên chưa
        const isMember = team.members.some(member => 
            member.user.toString() === userId.toString()
        );

        if (isMember) {
            return res.status(400).json({
                success: false,
                message: "User is already a member"
            });
        }

        team.members.push({
            user: userId,
            role
        });

        await team.save();
        await team.populate([
            { path: 'leader', select: 'username avatarUrl' },
            { path: 'members.user', select: 'username avatarUrl' }
        ]);

        res.status(200).json({
            success: true,
            data: team
        });
    } catch (error) {
        console.error('Add member error:', error);
        res.status(500).json({
            success: false,
            message: "Error adding member"
        });
    }
};

// Xóa thành viên khỏi team
export const removeTeamMember = async (req, res) => {
    try {
        const { teamId, userId } = req.params;
        const requestingUser = req.user._id;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Kiểm tra quyền
        const isAdmin = team.members.some(member => 
            member.user.toString() === requestingUser.toString() && 
            member.role === 'admin'
        );

        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Only admin can remove members"
            });
        }

        // Không thể xóa leader
        if (team.leader.toString() === userId) {
            return res.status(400).json({
                success: false,
                message: "Cannot remove team leader"
            });
        }

        team.members = team.members.filter(member => 
            member.user.toString() !== userId
        );

        await team.save();
        await team.populate([
            { path: 'leader', select: 'username avatarUrl' },
            { path: 'members.user', select: 'username avatarUrl' }
        ]);

        res.status(200).json({
            success: true,
            data: team
        });
    } catch (error) {
        console.error('Remove member error:', error);
        res.status(500).json({
            success: false,
            message: "Error removing member"
        });
    }
};

// Cập nhật thông tin team
export const updateTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const { name, description, avatar } = req.body;
        const userId = req.user._id;

        // Kiểm tra team có tồn tại không
        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Kiểm tra người dùng có phải là leader không
        if (team.leader.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only team leader can update team information"
            });
        }

        // Cập nhật thông tin team
        team.name = name || team.name;
        team.description = description || team.description;
        if (avatar) {
            team.avatar = avatar;
        }

        await team.save();

        res.status(200).json({
            success: true,
            message: "Team updated successfully",
            data: team
        });
    } catch (error) {
        console.error("Error updating team:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Error updating team"
        });
    }
};

// Tham gia team bằng mã
export const joinTeam = async (req, res) => {
    try {
        const { teamCode } = req.params;
        const userId = req.user._id;

        const team = await Team.findOne({ teamCode });
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Invalid team code"
            });
        }

        // Kiểm tra xem user đã là thành viên chưa
        const isMember = team.members.some(member => 
            member.user.toString() === userId.toString()
        );

        if (isMember) {
            return res.status(400).json({
                success: false,
                message: "You are already a member of this team"
            });
        }

        team.members.push({
            user: userId,
            role: 'member'
        });

        await team.save();
        await team.populate([
            { path: 'leader', select: 'username avatarUrl' },
            { path: 'members.user', select: 'username avatarUrl' }
        ]);

        res.status(200).json({
            success: true,
            data: team
        });
    } catch (error) {
        console.error('Join team error:', error);
        res.status(500).json({
            success: false,
            message: "Error joining team"
        });
    }
};

// Lấy danh sách team của user
export const getTeams = async (req, res) => {
    try {
        const userId = req.user._id;

        let teams = await Team.find({
            'members.user': userId
        })
        .select('name description avatar teamCode members leader')
        .populate('leader', 'username avatarUrl')
        .populate('members.user', 'username avatarUrl');

        // Xử lý avatar cho mỗi team
        teams = teams.map(team => {
            // Đảm bảo avatar là đường dẫn đầy đủ
            const avatar = team.avatar?.startsWith('/') ? team.avatar : `/avt_group/${team.avatar || 'avt-0'}.jpg`;
            return {
                ...team.toObject(),
                avatar
            };
        });

        // Log để kiểm tra
        console.log('Teams with processed avatars:', teams.map(team => ({
            name: team.name,
            avatar: team.avatar,
            teamCode: team.teamCode,
            leader: team.leader
        })));

        res.status(200).json({
            success: true,
            data: teams
        });
    } catch (error) {
        console.error('Get teams error:', error);
        res.status(500).json({
            success: false,
            message: "Error getting teams"
        });
    }
};

// Thành viên tự rời team
export const leaveTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const userId = req.user._id;

        const team = await Team.findById(teamId);
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Kiểm tra xem người dùng có phải là leader không
        if (team.leader.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "Team leader cannot leave the team. Transfer leadership or delete the team instead."
            });
        }

        // Kiểm tra xem người dùng có trong team không
        const memberIndex = team.members.findIndex(member => member.user.toString() === userId.toString());
        if (memberIndex === -1) {
            return res.status(400).json({
                success: false,
                message: "You are not a member of this team"
            });
        }

        // Xóa thành viên khỏi team
        team.members.splice(memberIndex, 1);
        await team.save();

        res.status(200).json({
            success: true,
            message: "Successfully left the team"
        });
    } catch (error) {
        console.error('Leave team error:', error);
        res.status(500).json({
            success: false,
            message: "Error leaving team"
        });
    }
};

// Xóa một team
export const deleteTeam = async (req, res) => {
    try {
        const userId = req.user._id; // Lấy userId từ thông tin user đã đăng nhập
        const { teamId } = req.params; // Lấy teamId từ URL params

        // Tìm team cần xóa
        const team = await Team.findById(teamId).populate('leader', '_id username');

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        // Kiểm tra quyền (chỉ leader của team mới có quyền xóa)
        if (team.leader._id.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this team'
            });
        }

        // Xóa team
        await Team.findByIdAndDelete(teamId);

        // Log để kiểm tra
        console.log(`Team deleted successfully: ${team.name} (ID: ${teamId})`);

        res.status(200).json({
            success: true,
            message: 'Team deleted successfully'
        });
    } catch (error) {
        console.error('Delete team error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting team'
        });
    }
};
