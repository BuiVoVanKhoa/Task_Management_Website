import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FaUsers, FaCrown, FaRegCopy } from 'react-icons/fa';
import { BsCodeSquare } from 'react-icons/bs';
import { MdDescription } from 'react-icons/md';
import useCUD_TeamData from '../../hooks/useCUD_TeamData';
import { TrashIcon, EyeIcon } from '@heroicons/react/24/outline';
import DeleteConfirmDialog from '../DeleteConfirmDialog';

const TeamCard = (team) => {
    const [showCopied, setShowCopied] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const { deleteTeam, loading, getTeamMembers, removeTeamMember } = useCUD_TeamData();
    // console.log('Rendering TeamCard with team:', team);
    const [showDeleteTeamDialog, setShowDeleteTeamDialog] = useState(false);
    const [showDeleteMemberDialog, setShowDeleteMemberDialog] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);


    useEffect(() => {
        // Lấy thông tin người dùng từ localStorage
        const user = JSON.parse(localStorage.getItem('user'));
        setCurrentUser(user); // Cập nhật currentUser
    }, []);

    const isTeamLeader = currentUser && team.leader._id === currentUser._id;

    const handleRemoveMember = async () => {
        if (!selectedMember) {
            toast.error('No member selected');
            return;
        }

        try {
            const success = await removeTeamMember(team._id, selectedMember._id);
            if (success) {
                // Cập nhật lại danh sách thành viên
                const updatedMembers = await getTeamMembers(team._id);
                setMembers(updatedMembers);
                setShowDeleteMemberDialog(false);
                setSelectedMember(null);
                // toast.success('Member removed successfully');
            }
        } catch (error) {
            console.error('Error removing member:', error);
            toast.error('Failed to remove member');
        }
    };

    const handleCopyCode = () => {
        if (team.teamCode) {
            navigator.clipboard.writeText(team.teamCode)
                .then(() => {
                    setShowCopied(true);
                    toast.success('Team code copied!');
                    setTimeout(() => setShowCopied(false), 2000);
                })
                .catch(() => {
                    toast.error('Failed to copy team code');
                });
        }
    };

    const handleDeleteTeam = async () => {
        
        try {
            await deleteTeam(team._id);
            // Refresh trang sau khi xóa thành công
            window.location.reload();
            setShowDeleteTeamDialog(false);
        } catch (error) {
            console.error('Error deleting team:', error);
        }
    };

    const [members, setMembers] = useState([]);
    const [showMembersModal, setShowMembersModal] = useState(false);

    const handleViewMembers = async () => {
        try {
            const teamId = team._id;

            if (!teamId) {
                console.error('TeamID is undefined or null');
                toast.error('Unable to determine team ID');
                return;
            }

            const teamMembers = await getTeamMembers(teamId);
            console.log('Người trong team:', teamMembers);

            if (teamMembers) {
                setMembers(teamMembers);
                setShowMembersModal(true);
            } else {
                toast.error('Unable to fetch team members');
            }
        } catch (error) {
            console.error('Error fetching team members:', error);
            toast.error('An error occurred while fetching team members');
        }
    };

    // Sử dụng avatar trực tiếp từ backend
    const imgUrl = imgError ? '/avt_group/avt-0.jpg' : team.avatar;
    // console.log('Loading image from:', imgUrl);

    return (
        <div className="bg-gray-50 dark:bg-gray-800/50 shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">

            {/* Header with Team Avatar and Name */}
            <div className="relative">
                <div className="h-32 bg-gradient-to-r from-indigo-500/90 via-purple-500/90 to-pink-500/90 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600"></div>
                <div className="absolute -bottom-12 left-6">
                    <div className="relative">
                        <img
                            className="h-24 w-24 rounded-xl shadow-lg border-4 border-gray-50 dark:border-gray-800 object-cover"
                            src={imgUrl}
                            alt={team.name}
                            onError={(e) => {
                                // console.log('Image failed to load, URL was:', e.target.src);
                                setImgError(true);
                                e.target.src = '/avt_group/avt-0.jpg';
                            }}
                        />
                        <div className="absolute -bottom-2 -right-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-xs font-bold px-3 py-1 rounded-full shadow flex items-center gap-1">
                            <FaUsers className="text-green-600 dark:text-green-400" />
                            {team.members?.length || 0}
                        </div>
                    </div>
                </div>
            </div>
            {/* Các nút action ở góc phải */}
            <div className="absolute top-4 right-4 flex space-x-2">
                {/* Nút Xem thành viên */}
                <button
                    className="w-8 h-8 flex items-center justify-center bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 rounded-full shadow-md focus:outline-none"
                    onClick={handleViewMembers}
                    disabled={loading}
                    title="View members"
                >
                    <EyeIcon className="w-4 h-4" />
                </button>

                {/* Nút Xóa - chỉ hiển thị nếu là người lãnh đạo */}
                {isTeamLeader && (
                    <button
                        className="w-8 h-8 flex items-center justify-center bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-300 rounded-full shadow-md focus:outline-none"
                        onClick={() => setShowDeleteTeamDialog(true)}
                        disabled={loading}
                        title="Delete team"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                )}
            </div>


            {/* Team Info */}
            <div className="pt-16 px-6 pb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                    {team.name}
                </h3>
                {team.description && (
                    <div className="flex items-start gap-2 mb-4">
                        <MdDescription className="text-gray-400 dark:text-gray-500 mt-1 flex-shrink-0" />
                        <p className="text-gray-600 dark:text-gray-300 text-sm">
                            {team.description}
                        </p>
                    </div>

                )}


                {/* Team Code Section */}
                <div className="mb-4 p-4 bg-gradient-to-r from-amber-50/50 to-yellow-50/50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-amber-800 dark:text-amber-200 flex items-center gap-2">
                            <BsCodeSquare />
                            Team Code
                        </span>

                        <div className="flex items-center gap-2">
                            <code className="text-sm font-bold bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 px-4 py-1.5 rounded-md">
                                {team.teamCode || 'N/A'}
                            </code>
                            <button
                                onClick={handleCopyCode}
                                disabled={!team.teamCode}
                                className="flex items-center justify-center w-8 h-8 rounded-md bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200 hover:bg-amber-200 dark:hover:bg-amber-800/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title={showCopied ? 'Copied!' : 'Copy team code'}
                            >
                                <FaRegCopy className={showCopied ? 'text-green-600 dark:text-green-400' : ''} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Team Leader Section */}
                <div className="border-t border-gray-200 dark:border-gray-700/50 pt-4">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 relative">
                            <img
                                className="h-10 w-10 rounded-full border-2 border-indigo-200 dark:border-indigo-700"
                                src={team.leader?.avatarUrl || 'https://via.placeholder.com/40'}
                                alt={team.leader?.username}
                                onError={(e) => {
                                    console.log('Image failed to load:', e);
                                    e.target.src = 'https://via.placeholder.com/40';
                                }}
                            />
                            <FaCrown className="absolute -top-1 -right-1 text-yellow-400 bg-gray-50 dark:bg-gray-800 rounded-full p-0.5" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                {team.leader?.username}
                            </p>
                            <p className="text-xs text-indigo-500 dark:text-indigo-400">
                                Team Leader
                            </p>
                        </div>
                    </div>
                </div>

                {/* Nút Xem Thành Viên */}
                {/* <button
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={handleViewMembers}
                >
                    Xem Thành Viên
                </button> */}

                {/* Modal hiển thị thành viên */}
                {showMembersModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
                            <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Team member</h3>
                            <div className="space-y-4">
                                {members.map((member) => (
                                    <div key={member._id} className="flex items-center space-x-4 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                                        <img
                                            src={member.avatarUrl}
                                            alt={member.username}
                                            className="w-10 h-10 rounded-full object-cover"
                                            onError={(e) => {
                                                e.target.src = '/avt_group/avt-0.jpg';
                                            }}
                                        />
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 dark:text-white">{member.username}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{member.role}</p>
                                        </div>
                                        {currentUser &&
                                            isTeamLeader &&
                                            member._id !== team.leader._id &&
                                            member._id !== currentUser._id && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                        setShowDeleteMemberDialog(true);
                                                    }}
                                                    className="p-2 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                                                    title="Delete member"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            )}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowMembersModal(false)}
                                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Delete Team Dialog */}
            <DeleteConfirmDialog
                isOpen={showDeleteTeamDialog}
                onClose={() => setShowDeleteTeamDialog(false)}
                onConfirm={handleDeleteTeam}
                title={team.name}
                isDeleting={loading}
            />

            {/* Delete Member Dialog */}
            <DeleteConfirmDialog
                isOpen={showDeleteMemberDialog}
                onClose={() => {
                    setShowDeleteMemberDialog(false);
                    setSelectedMember(null);
                }}
                onConfirm={handleRemoveMember}
                title={selectedMember?.username || ''}
                isDeleting={loading}
            />
        </div>
    );
}

export default TeamCard