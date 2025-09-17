import React from "react";

function GroupHeader({ group, groupDetails, onMenuChange }) {
  return (
    <div className="px-6 py-4 border-b shadow-sm bg-white z-10">
      <header className="flex items-center justify-between">
        {/* Group title */}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-gray-800 truncate">
            {groupDetails?.name || "Loading..."}
          </h1>
          <p className="text-sm text-gray-500 truncate">
            {groupDetails?.description || "No description available."}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-2">
          <button
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg shadow-sm hover:bg-gray-200 transition-colors"
            onClick={() => onMenuChange("expenses")}
          >
            Expenses
          </button>
          <button
            className="p-2 bg-gray-100 text-gray-700 rounded-lg shadow-sm hover:bg-gray-200 transition-colors"
            onClick={() => onMenuChange("options")}
          >
            ⋮
          </button>
        </div>
      </header>
    </div>
  );
}

export default GroupHeader;
