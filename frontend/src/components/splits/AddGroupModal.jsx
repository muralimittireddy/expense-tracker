// frontend/src/components/splits/AddGroupModal.jsx
import React from "react";
import Modal from "../common/Modal";
import Input from "../common/Input";
import Button from "../common/Button";
import MemberList from "./MemberList";

function AddGroupModal({
  isOpen,
  onClose,
  onSubmit,
  newGroupName,
  setNewGroupName,
  memberInput,
  setMemberInput,
  newGroupMembers,
  addMember,
  removeMember,
  error,
}) {

  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Group"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="addGroupForm" variant="primary">
            Create Group
          </Button>
        </>
      }
    >
      <form id="addGroupForm" onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Group Name"
          id="newGroupName"
          name="newGroupName"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="e.g., Trip to Goa, Housemates"
          required
        />
        <MemberList
          memberInput={memberInput}
          setMemberInput={setMemberInput}
          newGroupMembers={newGroupMembers}
          addMember={addMember}
          removeMember={removeMember}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </Modal>
  );
}

export default AddGroupModal;
