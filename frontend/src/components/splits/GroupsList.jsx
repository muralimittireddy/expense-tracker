// frontend/src/components/splits/GroupsList.jsx
import React from "react";
import GroupCard from "./GroupCard";

function GroupsList({ groups, onGroupClick }) {
  if (groups.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded-md">
        <p className="text-gray-500 mb-4">You haven't created any groups yet.</p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {groups.map((group) => (
        <GroupCard key={group.id} group={group} onClick={onGroupClick} />
      ))}
    </ul>
  );
}

export default GroupsList;
