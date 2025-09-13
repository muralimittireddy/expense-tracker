import React, { useState } from "react";
import ViewExpense from "./ViewExpenses";
import OptionsMenu from "./OptionsMenu";
import { useAuth } from "./../../hooks/useAuth";

function GroupHeader({ group ,groupDetails}) {
  
  const [activeMenu, setActiveMenu] = useState(null);


  const toggleOptionsMenu = () => {
    setActiveMenu(activeMenu === "options" ? null : "options");
  };

  const toggleExpensesModal = () => {
    setActiveMenu(activeMenu === "expenses" ? null : "expenses");
  };

  const closeMenu = () => setActiveMenu(null);

  const isExpensesDisabled = activeMenu === "options";
  const isOptionsDisabled = activeMenu === "expenses";

  return (
    <div className="px-6 py-4">
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
            id="expenses-button"
            className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-200 transition-colors"
            onClick={toggleExpensesModal}
            disabled={isExpensesDisabled}
          >
            Expenses
          </button>

          <button
            id="options-button"
            className="p-2 bg-gray-100 text-gray-700 rounded-lg shadow-sm hover:bg-gray-200 transition-colors"
            onClick={toggleOptionsMenu}
            disabled={isOptionsDisabled}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>
      </header>

      {/* Menus */}
      {activeMenu === "options" && (
        <OptionsMenu
          toggleOptionsMenu={closeMenu}
          groupId={group.id}
          groupDetails={groupDetails}
        />
      )}
      {activeMenu === "expenses" && (
        <ViewExpense toggleExpensesModal={closeMenu} />
      )}
    </div>
  );
}

export default GroupHeader;
