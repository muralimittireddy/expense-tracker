// frontend/src/pages/SplitsPage.jsx
import React, { useState, useEffect } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import axiosInstance from '../api/axiosInstance'; // axiosInstance will be used for API calls
import { useAuth } from '../hooks/useAuth'; // To check authentication status
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function SplitsPage() {
  const { isAuthenticated } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  // Function to fetch groups from the backend
  const fetchGroups = async () => {
    if (!isAuthenticated) {
      setLoading(false); // Stop loading if not authenticated
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Assuming a backend endpoint for fetching groups exists
      const response = await axiosInstance.get('/splits/groups');
      setGroups(response.data);
    } catch (err) {
      console.error('Failed to fetch groups:', err.response?.data || err.message);
      setError('Failed to load groups. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // useEffect to fetch groups on component mount or authentication status change
  useEffect(() => {
    fetchGroups();
  }, [isAuthenticated]); // Re-fetch when authentication status changes

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setError('Group name cannot be empty.');
      return;
    }

    setError(null);
    try {
      // Assuming a backend endpoint for adding a new group exists
      await axiosInstance.post('/splits/groups', { name: newGroupName });
      setNewGroupName('');
      setShowAddGroupModal(false);
      fetchGroups(); // Refresh the list of groups after adding a new one
    } catch (err) {
      console.error('Failed to add group:', err.response?.data || err.message);
      setError('Failed to add group. Please try again.');
    }
  };

  // Function to handle clicking on a group card
  const handleGroupCardClick = (groupId) => {
    navigate(`/splits/${groupId}`); // Navigate to the new group detail page
  };

  if (loading) {
    return <div className="text-center p-8 text-gray-600">Loading groups...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Your Splits Groups</h1>
        <Button onClick={() => setShowAddGroupModal(true)} variant="primary">
          Add New Group
        </Button>
      </div>

      {groups.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded-md">
          <p className="text-gray-500 mb-4">You haven't created any groups yet.</p>
          <Button onClick={() => setShowAddGroupModal(true)} variant="secondary">
            Create Your First Group
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <li
              key={group.id}
              className="bg-gray-50 p-4 rounded-lg shadow-md flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors duration-200"
              onClick={() => handleGroupCardClick(group.id)} // Make the whole card clickable
            >
              <div>
                <h2 className="text-xl font-semibold text-indigo-700">{group.name}</h2>
                <p className="text-sm text-gray-600">
                  {/* Assuming members are returned in the group object from backend */}
                  {group.members ? group.members.length : 1} Members
                </p>
              </div>
              {/* Removed "View Details" button */}
            </li>
          ))}
        </ul>
      )}

      {/* Add New Group Modal */}
      <Modal
        isOpen={showAddGroupModal}
        onClose={() => setShowAddGroupModal(false)}
        title="Create New Group"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowAddGroupModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="addGroupForm" variant="primary">
              Create Group
            </Button>
          </>
        }
      >
        <form id="addGroupForm" onSubmit={handleAddGroup} className="space-y-4">
          <Input
            label="Group Name"
            id="newGroupName"
            name="newGroupName"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="e.g., Trip to Goa, Housemates"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </Modal>
    </div>
  );
}

export default SplitsPage;
