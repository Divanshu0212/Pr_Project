import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import { FaPlus, FaTrash, FaEdit, FaGripVertical, FaArrowLeft, FaStar } from 'react-icons/fa';
import { MdClose, MdCheck } from 'react-icons/md';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Button from '../common/Button';
import Card from '../common/Card';
import Form from '../common/Form';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import SummaryApi from '../../config';
import { useNavigate } from 'react-router-dom';
import '../../styles/animations.css';
import clsx from 'clsx';

const SkillManagement = () => {
    const { currentUser } = useContext(AuthContext);
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [isEditing, setIsEditing] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(null);
    const [newSkill, setNewSkill] = useState({
        name: '',
        category: 'Other',
        proficiency: 5,
        icon: '',
        isFeatured: false
    });
    const [addSkillLoading, setAddSkillLoading] = useState(false);

    const categories = ['Languages', 'Frontend', 'Backend', 'Database', 'DevOps', 'Other'];

    const { data: skillsData, isLoading, isError, error, refetch: refetchSkills } = useQuery(
        ['skills', currentUser?.uid],
        async () => {
            if (!currentUser?.uid) return [];

            const token = localStorage.getItem('token');
            const response = await fetch(SummaryApi.skills.get.url, {
                method: SummaryApi.skills.get.method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 404 || response.status === 204) return [];
                const errorBody = await response.json();
                throw new Error(errorBody.message || 'Failed to fetch skills');
            }
            return response.json();
        },
        {
            enabled: !!currentUser?.uid,
            staleTime: 5 * 60 * 1000,
            cacheTime: 10 * 60 * 1000,
        }
    );

    const skills = skillsData || [];

    const addSkillMutation = useMutation(
        async (skillData) => {
            const token = localStorage.getItem('token');
            const response = await fetch(SummaryApi.skills.create.url, {
                method: SummaryApi.skills.create.method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(skillData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return response.json();
        },
        {
            onMutate: () => { setAddSkillLoading(true); },
            onSuccess: () => {
                // Invalidate both skills queries to ensure immediate updates everywhere
                queryClient.invalidateQueries(['skills']);
                queryClient.refetchQueries(['skills']);
                setNewSkill({ name: '', category: 'Other', proficiency: 5, icon: '', isFeatured: false });
                alert('Skill added successfully!');
            },
            onError: (err) => { alert(`Error adding skill: ${err.message}`); },
            onSettled: () => { setAddSkillLoading(false); }
        }
    );

    const updateSkillMutation = useMutation(
        async (skillData) => {
            const token = localStorage.getItem('token');
            const response = await fetch(SummaryApi.skills.update.url.replace(':id', skillData._id), {
                method: SummaryApi.skills.update.method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(skillData)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return response.json();
        },
        {
            onMutate: () => { setAddSkillLoading(true); },
            onSuccess: () => {
                // Invalidate both skills queries to ensure immediate updates everywhere
                queryClient.invalidateQueries(['skills']);
                queryClient.refetchQueries(['skills']);
                setIsEditing(false);
                setEditingSkill(null);
                alert('Skill updated successfully!');
            },
            onError: (err) => { alert(`Error updating skill: ${err.message}`); },
            onSettled: () => { setAddSkillLoading(false); }
        }
    );

    const deleteSkillMutation = useMutation(
        async (id) => {
            const token = localStorage.getItem('token');
            const response = await fetch(SummaryApi.skills.delete.url.replace(':id', id), {
                method: SummaryApi.skills.delete.method,
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return response.json();
        },
        {
            onMutate: () => { setAddSkillLoading(true); },
            onSuccess: () => {
                // Invalidate both skills queries to ensure immediate updates everywhere
                queryClient.invalidateQueries(['skills']);
                queryClient.refetchQueries(['skills']);
                setShowDeleteModal(null);
                alert('Skill deleted successfully!');
            },
            onError: (err) => { alert(`Error deleting skill: ${err.message}`); },
            onSettled: () => { setAddSkillLoading(false); }
        }
    );

    const reorderSkillsMutation = useMutation(
        async (data) => {
            const token = localStorage.getItem('token');
            const response = await fetch(SummaryApi.skills.reorder.url, {
                method: SummaryApi.skills.reorder.method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            return response.json();
        },
        {
            onSuccess: () => { 
                queryClient.invalidateQueries(['skills']);
                queryClient.refetchQueries(['skills']);
            },
            onError: (err) => { console.error('Error reordering skills:', err); alert(`Failed to reorder: ${err.message}`); },
        }
    );

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setNewSkill(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleEditInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingSkill(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const onSubmitAddSkill = () => {
        if (!newSkill.name.trim()) return;
        addSkillMutation.mutate(newSkill);
    };

    const onSubmitUpdateSkill = () => {
        if (!editingSkill?.name.trim()) return;
        updateSkillMutation.mutate(editingSkill);
    };

    const onDeleteSkillConfirm = (id) => {
        deleteSkillMutation.mutate(id);
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(skills);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        reorderSkillsMutation.mutate({
            skillIds: items.map(item => item._id),
            userId: currentUser?._id
        });
    };

    const handleEditClick = (skill) => {
        setEditingSkill({ ...skill }); // Create a copy to avoid direct mutation
        setIsEditing(true);
    };

    const getProficiencyColor = (level) => {
        if (level >= 8) return isDark ? 'text-green-400' : 'text-green-600';
        if (level >= 6) return isDark ? 'text-yellow-400' : 'text-yellow-600';
        if (level >= 4) return isDark ? 'text-orange-400' : 'text-orange-600';
        return isDark ? 'text-red-400' : 'text-red-600';
    };

    return (
        <div className={clsx(
            "min-h-screen py-8 px-4 transition-all duration-300",
            isDark ? 'bg-gradient-to-br from-[#0D1117] via-[#161B22] to-[#0D1117]' : 'bg-gradient-to-br from-slate-50 via-white to-blue-50'
        )}>
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="animate-on-scroll mb-8">
                    <Button
                        onClick={() => navigate('/portfolio')}
                        variant="ghost"
                        className={clsx(
                            "mb-6 group transition-colors duration-300",
                            isDark ? 'text-[#00FFFF] hover:text-[#9C27B0]' : 'text-blue-600 hover:text-purple-600'
                        )}
                    >
                        <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                        Back to Portfolio
                    </Button>

                    <div className="text-center mb-8">
                        <h1 className={clsx(
                            "text-4xl font-bold mb-4 bg-gradient-to-r bg-clip-text text-transparent animate-gradient-x",
                            isDark ? 'from-[#00FFFF] to-[#9C27B0]' : 'from-blue-600 to-purple-600'
                        )}>
                            Skill Management
                        </h1>
                        <p className={clsx(
                            "text-lg",
                            isDark ? 'text-gray-300' : 'text-gray-600'
                        )}>
                            Manage and showcase your technical expertise
                        </p>
                    </div>
                </div>

                {/* Add New Skill Form */}
                <Card className="animate-on-scroll mb-8 hover-lift">
                    <div className="p-6">
                        <h2 className={clsx(
                            "text-2xl font-semibold mb-6",
                            isDark ? 'text-[#E5E5E5]' : 'text-gray-800'
                        )}>
                            Add New Skill
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                            <Form.Input
                                label="Skill Name"
                                name="name"
                                value={newSkill.name}
                                onChange={handleInputChange}
                                placeholder="e.g. JavaScript"
                                required
                            />

                            <Form.Select
                                label="Category"
                                name="category"
                                value={newSkill.category}
                                onChange={handleInputChange}
                                options={categories.map(cat => ({ value: cat, label: cat }))}
                            />

                            <Form.Input
                                label="Proficiency (1-10)"
                                type="number"
                                name="proficiency"
                                min="1"
                                max="10"
                                value={newSkill.proficiency}
                                onChange={handleInputChange}
                            />

                            <div className="flex items-end">
                                <Button
                                    onClick={onSubmitAddSkill}
                                    disabled={addSkillLoading || !newSkill.name.trim()}
                                    className="w-full bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] text-black font-medium hover:shadow-lg hover:scale-105 transition-all duration-200"
                                >
                                    {addSkillLoading ? 'Adding...' : (
                                        <>
                                            <FaPlus className="mr-2" /> Add Skill
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>

                        <Form.Checkbox
                            label="Featured Skill"
                            name="isFeatured"
                            checked={newSkill.isFeatured}
                            onChange={handleInputChange}
                            className="text-sm"
                        />
                    </div>
                </Card>

                {/* Skills List */}
                <Card className="animate-on-scroll">
                    <div className="p-6">
                        <h2 className={clsx(
                            "text-2xl font-semibold mb-6",
                            isDark ? 'text-[#E5E5E5]' : 'text-gray-800'
                        )}>
                            Your Skills ({skills.length})
                        </h2>

                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader />
                                <p className={clsx("ml-4", isDark ? 'text-gray-300' : 'text-gray-700')}>Loading skills...</p>
                            </div>
                        ) : isError ? (
                            <div className={clsx("text-center py-12", isDark ? 'text-red-400' : 'text-red-600')}>
                                <p className="text-lg font-semibold mb-4">Error loading skills:</p>
                                <p>{error?.message || 'An unknown error occurred'}</p>
                                <Button onClick={refetchSkills} className="mt-4">Retry</Button>
                            </div>
                        ) : skills.length === 0 ? (
                            <div className="text-center py-12">
                                <div className={clsx("text-6xl mb-4", isDark ? 'text-gray-600' : 'text-gray-400')}>
                                    🎯
                                </div>
                                <p className={clsx("text-lg", isDark ? 'text-gray-400' : 'text-gray-500')}>
                                    No skills added yet. Add your first skill above!
                                </p>
                            </div>
                        ) : (
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="skills">
                                    {(provided, snapshot) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className={clsx(
                                                "space-y-3 transition-colors duration-200 p-2 rounded-lg",
                                                snapshot.isDraggingOver ? (isDark ? 'bg-[#0D1117]/50' : 'bg-blue-50/50') : ''
                                            )}
                                        >
                                            {skills.map((skill, index) => (
                                                <Draggable key={skill._id} draggableId={skill._id} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            className={clsx(
                                                                "group p-4 rounded-xl border-2 transition-all duration-300",
                                                                skill.isFeatured
                                                                    ? `border-[#9C27B0] ${isDark ? 'bg-gradient-to-r from-purple-900/20 to-cyan-900/20' : 'bg-gradient-to-r from-purple-50 to-cyan-50'} shadow-lg shadow-purple-500/20`
                                                                    : `${isDark ? 'border-gray-700 bg-[#161B22]' : 'border-gray-200 bg-white'} hover:border-[#00FFFF]`,
                                                                snapshot.isDragging
                                                                    ? `shadow-2xl ${isDark ? 'shadow-cyan-500/30' : 'shadow-blue-500/30'} scale-105 rotate-1`
                                                                    : 'hover:shadow-lg hover:scale-[1.02]'
                                                            )}
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4 flex-1">
                                                                    <div
                                                                        {...provided.dragHandleProps}
                                                                        className={clsx(
                                                                            "cursor-move transition-colors duration-200 p-1 rounded",
                                                                            isDark ? 'text-gray-400 hover:text-[#00FFFF]' : 'text-gray-500 hover:text-blue-600'
                                                                        )}
                                                                    >
                                                                        <FaGripVertical size={16} />
                                                                    </div>

                                                                    <div className="flex-1">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <h4 className={clsx("font-semibold text-lg", isDark ? 'text-[#E5E5E5]' : 'text-gray-800')}>
                                                                                {skill.name}
                                                                            </h4>
                                                                            {skill.isFeatured && (
                                                                                <FaStar className="text-[#9C27B0] animate-pulse" size={16} />
                                                                            )}
                                                                        </div>

                                                                        <div className="flex items-center gap-4 text-sm">
                                                                            <span className={clsx("px-2 py-1 rounded-full text-xs font-medium", isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')}>
                                                                                {skill.category}
                                                                            </span>

                                                                            <div className="flex items-center gap-2">
                                                                                <span className={clsx(isDark ? 'text-gray-400' : 'text-gray-600')}>
                                                                                    Proficiency:
                                                                                </span>
                                                                                <span className={clsx("font-bold", getProficiencyColor(skill.proficiency))}>
                                                                                    {skill.proficiency}/10
                                                                                </span>
                                                                                <div className={clsx("w-16 h-1 rounded-full", isDark ? 'bg-gray-700' : 'bg-gray-200')}>
                                                                                    <div
                                                                                        className="h-full rounded-full bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] transition-all duration-500"
                                                                                        style={{ width: `${skill.proficiency * 10}%` }}
                                                                                    />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                                    <Button
                                                                        onClick={() => handleEditClick(skill)}
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className={clsx(
                                                                            "p-2 rounded-lg transition-all duration-300 transform hover:scale-110",
                                                                            isDark ? 'text-[#00FFFF] hover:bg-cyan-900/20' : 'text-blue-600 hover:bg-blue-50'
                                                                        )}
                                                                    >
                                                                        <FaEdit size={16} />
                                                                    </Button>
                                                                    <Button
                                                                        onClick={() => setShowDeleteModal(skill._id)}
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="text-red-500 hover:bg-red-900/20 transition-colors duration-200 p-2 rounded-lg transform hover:scale-110"
                                                                    >
                                                                        <FaTrash size={16} />
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        )}
                    </div>
                </Card>

                {/* Edit Modal */}
                {isEditing && editingSkill && (
                    <Modal
                        isOpen={isEditing}
                        onClose={() => {
                            setIsEditing(false);
                            setEditingSkill(null);
                        }}
                        title="Edit Skill"
                    >
                        <div className="space-y-4">
                            <Form.Input
                                label="Skill Name"
                                name="name"
                                value={editingSkill.name || ''}
                                onChange={handleEditInputChange}
                                placeholder="e.g. JavaScript"
                                required
                            />

                            <Form.Select
                                label="Category"
                                name="category"
                                value={editingSkill.category || 'Other'}
                                onChange={handleEditInputChange}
                                options={categories.map(cat => ({ value: cat, label: cat }))}
                            />

                            <Form.Input
                                label="Proficiency (1-10)"
                                type="number"
                                name="proficiency"
                                min="1"
                                max="10"
                                value={editingSkill.proficiency || 5}
                                onChange={handleEditInputChange}
                            />

                            <Form.Checkbox
                                label="Featured Skill"
                                name="isFeatured"
                                checked={editingSkill.isFeatured || false}
                                onChange={handleEditInputChange}
                            />

                            <div className="flex gap-3 pt-4">
                                <Button
                                    onClick={onSubmitUpdateSkill}
                                    disabled={addSkillLoading || !editingSkill.name?.trim()}
                                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                >
                                    {addSkillLoading ? 'Saving...' : (
                                        <>
                                            <MdCheck className="mr-2" size={18} /> Save
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditingSkill(null);
                                    }}
                                    variant="outline"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </Modal>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <Modal
                        isOpen={!!showDeleteModal}
                        onClose={() => setShowDeleteModal(null)}
                        title="Confirm Deletion"
                    >
                        <p className={clsx("mb-6", isDark ? 'text-gray-300' : 'text-gray-600')}>
                            Are you sure you want to delete this skill? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => onDeleteSkillConfirm(showDeleteModal)}
                                disabled={addSkillLoading}
                                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white"
                            >
                                {addSkillLoading ? 'Deleting...' : 'Delete'}
                            </Button>
                            <Button
                                onClick={() => setShowDeleteModal(null)}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </Modal>
                )}
            </div>
        </div>
    );
};

SkillManagement.propTypes = {};

export default SkillManagement;