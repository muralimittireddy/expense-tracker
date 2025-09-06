// frontend/src/pages/SplitsPage.jsx
import React, { useState } from "react";
import Button from "../components/common/Button";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useGroups } from "../hooks/useGroups";
import GroupsList from "../components/splits/GroupsList";
import AddGroupModal from "../components/splits/AddGroupModal";

function SplitsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const { groups, loading, error, addGroup } = useGroups(isAuthenticated);

  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupMembers, setNewGroupMembers] = useState([]);
  const [memberInput, setMemberInput] = useState("");
  const [formError, setFormError] = useState(null);

  const handleAddGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setFormError("Group name cannot be empty.");
      return;
    }
    try {
      await addGroup({ name: newGroupName, members: newGroupMembers });
      setNewGroupName("");
      setNewGroupMembers([]);
      setShowAddGroupModal(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  const handleAddMember = (email) => {
      setNewGroupMembers([...newGroupMembers, email]);
      setMemberInput("");
  };

  const handleRemoveMember = (index) => {
    setNewGroupMembers(newGroupMembers.filter((_, i) => i !== index));
  };

  if (loading) return <div className="text-center p-8 text-gray-600">Loading groups...</div>;
  if (error) return <div className="text-center p-8 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Your Splits Groups</h1>
        <Button onClick={() => setShowAddGroupModal(true)} variant="primary">
          Add New Group
        </Button>
      </div>

      <GroupsList groups={groups} onGroupClick={(id) => navigate(`/splits/${id}`)} />

      <AddGroupModal
        isOpen={showAddGroupModal}
        onClose={() => setShowAddGroupModal(false)}
        onSubmit={handleAddGroup}
        newGroupName={newGroupName}
        setNewGroupName={setNewGroupName}
        memberInput={memberInput}
        setMemberInput={setMemberInput}
        newGroupMembers={newGroupMembers}
        addMember={handleAddMember}
        removeMember={handleRemoveMember}
        error={formError}
      />
    </div>
  );
}

export default SplitsPage;
