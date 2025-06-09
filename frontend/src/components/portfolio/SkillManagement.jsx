// components/SkillManagement.jsx
import React, { useState, useEffect, useContext } from 'react';
import { FaPlus, FaTrash, FaEdit, FaGripVertical, FaArrowLeft } from 'react-icons/fa';
import { MdClose, MdCheck } from 'react-icons/md';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { AuthContext } from '../../context/AuthContext';
import SummaryApi from '../../config';
import { useNavigate } from 'react-router-dom';

const SkillManagement = () => {
  const { currentUser, fetchUserDetails } = useContext(AuthContext);
  const [skills, setSkills] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Other',
    proficiency: 5,
    icon: '',
    isFeatured: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const categories = ['Languages', 'Frontend', 'Backend', 'Database', 'DevOps', 'Other'];

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(SummaryApi.skills.get.url, {
        method: SummaryApi.skills.get.method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch skills');
      }

      const data = await response.json();
      setSkills(data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    }
  };

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

  const handleAddSkill = async () => {
    if (!newSkill.name) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(SummaryApi.skills.create.url, {
        method: SummaryApi.skills.create.method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSkill)
      });

      // First check if the response is OK
      if (!response.ok) {
        // Try to parse error as JSON, fallback to text
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: await response.text() };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSkills(prev => [...prev, data]);
      setNewSkill({
        name: '',
        category: 'Other',
        proficiency: 5,
        icon: '',
        isFeatured: false
      });

      console.log('Sending request to:', SummaryApi.skills.create.url);
      console.log('Request payload:', JSON.stringify({
        name: newSkill.name,
        category: newSkill.category,
        proficiency: Number(newSkill.proficiency),
        isFeatured: newSkill.isFeatured
      }));
    } catch (error) {
      console.error('Error adding skill:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateSkill = async () => {
    if (!editingSkill) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(SummaryApi.skills.update.url.replace(':id', editingSkill._id), {
        method: SummaryApi.skills.update.method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingSkill)
      });

      if (!response.ok) {
        throw new Error('Failed to update skill');
      }

      const data = await response.json();
      setSkills(prev => prev.map(skill => skill._id === data._id ? data : skill));
      setIsEditing(false);
      setEditingSkill(null);
    } catch (error) {
      console.error('Error updating skill:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSkill = async (id) => {
    if (!window.confirm('Are you sure you want to delete this skill?')) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(SummaryApi.skills.delete.url.replace(':id', id), {
        method: SummaryApi.skills.delete.method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete skill');
      }

      setSkills(prev => prev.filter(skill => skill._id !== id));
    } catch (error) {
      console.error('Error deleting skill:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(skills);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSkills(items);

    // Update order in backend
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const response = await fetch(SummaryApi.skills.reorder.url, {
        method: SummaryApi.skills.reorder.method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          skillIds: items.map(item => item._id),
          userId: currentUser?._id // Assuming currentUser is available in context
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reorder skills');
      }

      await fetchSkills();
    } catch (error) {
      console.error('Error reordering skills:', error);
      // Revert if error
      setSkills([...skills]);
      fetchSkills();
    }
  };

  return (
    <div className="bg-[#161B22] p-6 rounded-lg shadow-md border border-gray-800 mb-8">
      <h2 className="text-2xl font-bold text-[#00FFFF] mb-6">Manage Skills</h2>

      {/* Add New Skill Form */}
      <button
        onClick={() => navigate('/portfolioHome')}
        className="flex items-center gap-2 mb-6 text-[#00FFFF] hover:underline"
      >
        <FaArrowLeft /> Back to Portfolio
      </button>
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-[#E5E5E5] mb-4">Add New Skill</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-gray-400 text-sm mb-2">Skill Name</label>
            <input
              type="text"
              name="name"
              value={newSkill.name}
              onChange={handleInputChange}
              className="w-full bg-[#0D1117] border border-gray-700 rounded py-2 px-3 text-white focus:outline-none focus:border-[#00FFFF]"
              placeholder="e.g. JavaScript"
            />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Category</label>
            <select
              name="category"
              value={newSkill.category}
              onChange={handleInputChange}
              className="w-full bg-[#0D1117] border border-gray-700 rounded py-2 px-3 text-white focus:outline-none focus:border-[#00FFFF]"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-2">Proficiency (1-10)</label>
            <input
              type="number"
              name="proficiency"
              min="1"
              max="10"
              value={newSkill.proficiency}
              onChange={handleInputChange}
              className="w-full bg-[#0D1117] border border-gray-700 rounded py-2 px-3 text-white focus:outline-none focus:border-[#00FFFF]"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleAddSkill}
              disabled={isLoading || !newSkill.name}
              className="w-full py-2 bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] text-black font-medium rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              {isLoading ? 'Adding...' : (
                <>
                  <FaPlus /> Add Skill
                </>
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isFeatured"
            name="isFeatured"
            checked={newSkill.isFeatured}
            onChange={handleInputChange}
            className="mr-2"
          />
          <label htmlFor="isFeatured" className="text-gray-400">Featured Skill</label>
        </div>
      </div>

      {/* Skills List */}
      <div>
        <h3 className="text-lg font-semibold text-[#E5E5E5] mb-4">Your Skills</h3>

        {isEditing ? (
          <div className="mb-6 p-4 bg-[#0D1117] rounded-lg border border-[#00FFFF]">
            <h4 className="text-md font-semibold text-[#E5E5E5] mb-3">Edit Skill</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Skill Name</label>
                <input
                  type="text"
                  name="name"
                  value={editingSkill.name}
                  onChange={handleEditInputChange}
                  className="w-full bg-[#161B22] border border-gray-700 rounded py-2 px-3 text-white focus:outline-none focus:border-[#00FFFF]"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Category</label>
                <select
                  name="category"
                  value={editingSkill.category}
                  onChange={handleEditInputChange}
                  className="w-full bg-[#161B22] border border-gray-700 rounded py-2 px-3 text-white focus:outline-none focus:border-[#00FFFF]"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Proficiency</label>
                <input
                  type="number"
                  name="proficiency"
                  min="1"
                  max="10"
                  value={editingSkill.proficiency}
                  onChange={handleEditInputChange}
                  className="w-full bg-[#161B22] border border-gray-700 rounded py-2 px-3 text-white focus:outline-none focus:border-[#00FFFF]"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  onClick={handleUpdateSkill}
                  disabled={isLoading}
                  className="flex-1 py-2 bg-gradient-to-r from-[#00FFFF] to-[#9C27B0] text-black font-medium rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  {isLoading ? 'Saving...' : (
                    <>
                      <MdCheck size={18} /> Save
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-2 bg-[#2D333B] text-[#E5E5E5] rounded hover:bg-[#444C56] transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editIsFeatured"
                name="isFeatured"
                checked={editingSkill.isFeatured}
                onChange={handleEditInputChange}
                className="mr-2"
              />
              <label htmlFor="editIsFeatured" className="text-gray-400">Featured Skill</label>
            </div>
          </div>
        ) : null}

        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="skills">
            {(provided, snapshot) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className={`space-y-3 ${snapshot.isDraggingOver ? 'bg-[#0D1117]' : ''}`}>
                {skills.length === 0 ? (
                  <p className="text-gray-500 italic">No skills added yet. Add your first skill above.</p>
                ) : (
                  skills.map((skill, index) => (
                    <Draggable key={skill._id} draggableId={skill._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-4 rounded-lg border ${skill.isFeatured ? 'border-[#9C27B0] bg-[#1A1A2E]' : 'border-gray-700 bg-[#161B22]'} flex items-center justify-between ${snapshot.isDragging ? 'shadow-lg bg-[#0D1117]' : ''
                            }`}
                        >
                          <div className="flex items-center gap-4">
                            <div {...provided.dragHandleProps} className="text-gray-400 hover:text-[#00FFFF] cursor-move">
                              <FaGripVertical size={16} />
                            </div>
                            <div>
                              <h4 className="font-medium text-[#E5E5E5]">{skill.name}</h4>
                              <div className="flex items-center gap-4 text-sm text-gray-400">
                                <span>{skill.category}</span>
                                <span>Proficiency: {skill.proficiency}/10</span>
                                {skill.isFeatured && (
                                  <span className="text-[#9C27B0]">Featured</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingSkill(skill);
                                setIsEditing(true);
                              }}
                              className="p-2 text-[#00FFFF] hover:bg-[#0D1117] rounded"
                            >
                              <FaEdit size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteSkill(skill._id)}
                              className="p-2 text-red-500 hover:bg-[#0D1117] rounded"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default SkillManagement;