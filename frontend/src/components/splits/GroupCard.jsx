// frontend/src/components/splits/GroupCard.jsx
import React from "react";

function GroupCard({ group, onClick }) {
  return (
    <li
      className="bg-gray-50 p-4 rounded-lg shadow-md flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors duration-200"
      onClick={() => onClick(group.id)}
    >
      <div>
        <h2 className="text-xl font-semibold text-indigo-700">{group.name}</h2>
        <p className="text-sm text-gray-600">
          {group.members ? group.members.length : 1} Members
        </p>
      </div>
    </li>
  );
}

export default GroupCard;
