import mongoose from "mongoose";
import Team from '../models/team.models.js';
import { createNotification } from './notification.controllers.js';

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
        const { teamId, userId: memberIdToRemove } = req.params;
        const leaderId = req.user._id;

        const team = await Team.findById(teamId)
            .populate('leader', 'username')
            .populate({
                path: 'members.user',
                select: 'username'
            });

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Kiểm tra xem người thực hiện có phải là leader không
        if (team.leader._id.toString() !== leaderId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only team leader can remove members"
            });
        }

        // Kiểm tra xem thành viên cần xóa có tồn tại không
        const memberIndex = team.members.findIndex(
            member => member.user._id.toString() === memberIdToRemove
        );

        if (memberIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Member not found in team"
            });
        }

        // Lấy thông tin thành viên trước khi xóa
        const removedMember = team.members[memberIndex];

        // Xóa thành viên khỏi team
        team.members.splice(memberIndex, 1);
        await team.save();

        // Tạo thông báo cho thành viên bị kick
        await createNotification({
            recipientId: memberIdToRemove,
            senderId: leaderId,
            teamId: team._id,
            type: 'MEMBER_REMOVED',
            title: 'Removed from Team',
            message: `You have been removed from team "${team.name}" by the team leader`
        });

        res.status(200).json({
            success: true,
            message: "Member removed successfully",
            data: team
        });
    } catch (error) {
        console.error('Remove team member error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Error removing team member"
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
        const team = await Team.findById(teamId).populate('members.user', 'username');
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

        // Lưu thông tin cũ để so sánh
        const oldName = team.name;
        const oldDescription = team.description;

        // Cập nhật thông tin team
        team.name = name || team.name;
        team.description = description || team.description;
        if (avatar) {
            team.avatar = avatar;
        }

        await team.save();

        // Tạo thông báo cho tất cả thành viên
        const changes = [];
        if (oldName !== team.name) changes.push('name');
        if (oldDescription !== team.description) changes.push('description');
        if (avatar) changes.push('avatar');

        if (changes.length > 0) {
            const message = `Team ${changes.join(', ')} has been updated`;
            
            // Tạo thông báo cho tất cả thành viên (trừ leader)
            const notifications = team.members
                .filter(member => member.user._id.toString() !== userId.toString())
                .map(member => ({
                    recipientId: member.user._id,
                    senderId: userId,
                    teamId: team._id,
                    type: 'TEAM_UPDATE',
                    title: 'Team Update',
                    message: message
                }));

            // Tạo các thông báo
            await Promise.all(notifications.map(notification => 
                createNotification(notification)
            ));
        }

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

        const team = await Team.findOne({ teamCode }).populate('leader', 'username');
        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Kiểm tra xem người dùng đã là thành viên chưa
        const isMember = team.members.some(member => 
            member.user.toString() === userId.toString()
        );

        if (isMember) {
            return res.status(400).json({
                success: false,
                message: "You are already a member of this team"
            });
        }

        // Thêm người dùng vào team
        team.members.push({
            user: userId,
            role: 'member'
        });

        await team.save();

        // Tạo thông báo cho leader
        await createNotification({
            recipientId: team.leader._id,
            senderId: userId,
            teamId: team._id,
            type: 'MEMBER_ADDED',
            title: 'New Team Member',
            message: `${req.user.username} has joined your team using invite code`
        });

        res.status(200).json({
            success: true,
            message: "Successfully joined team",
            data: team
        });
    } catch (error) {
        console.error('Join team error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Error joining team"
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

        const team = await Team.findById(teamId)
            .populate('leader', 'username')
            .populate({
                path: 'members.user',
                select: 'username'
            });

        if (!team) {
            return res.status(404).json({
                success: false,
                message: "Team not found"
            });
        }

        // Không cho phép leader rời team
        if (team.leader._id.toString() === userId.toString()) {
            return res.status(400).json({
                success: false,
                message: "Team leader cannot leave the team. Transfer leadership or delete the team instead."
            });
        }

        // Kiểm tra xem người dùng có phải là thành viên không
        const memberIndex = team.members.findIndex(
            member => member.user._id.toString() === userId.toString()
        );

        if (memberIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "You are not a member of this team"
            });
        }

        // Lấy thông tin thành viên trước khi xóa
        const leavingMember = team.members[memberIndex];

        // Xóa thành viên khỏi team
        team.members.splice(memberIndex, 1);
        await team.save();

        // Tạo thông báo cho leader
        await createNotification({
            recipientId: team.leader._id,
            senderId: userId,
            teamId: team._id,
            type: 'MEMBER_REMOVED',
            title: 'Member Left Team',
            message: `${req.user.username} has left your team "${team.name}"`
        });

        res.status(200).json({
            success: true,
            message: "Successfully left the team",
            data: team
        });
    } catch (error) {
        console.error('Leave team error:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Error leaving team"
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
