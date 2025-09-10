import React, {useState, useEffect} from "react";
import ViewExpense from "./ViewExpenses";
import OptionsMenu from "./OptionsMenu";
import {useGroups} from "./../../hooks/useGroups"
import { useAuth } from "./../../hooks/useAuth";

function GroupHeader({ group }) {
  const { isAuthenticated } = useAuth();
  const [activeMenu, setActiveMenu] = useState(null);
  const {groupDetails, fetchGroup}=useGroups(isAuthenticated);

  useEffect(() => {
    if (group?.id) {
      fetchGroup(group.id);
    }
  }, [group?.id]);

  const toggleOptionsMenu = () => {
    setActiveMenu(activeMenu === 'options' ? null : 'options');
  };

  const toggleExpensesModal = () => {
    setActiveMenu(activeMenu === 'expenses' ? null : 'expenses');
  };

   const closeMenu = () => {
    setActiveMenu(null);
  };

 const isExpensesDisabled = activeMenu === 'options';
 const isOptionsDisabled = activeMenu === 'expenses';

  return (
    <div className="flex flex-col items-center justify-start p-4 min-h-screen">
      {/* Main Header Component */}
      <div className="bg-white shadow-lg rounded-xl p-4 w-full max-w-2xl relative">
        <header className="flex items-center justify-between">
          {/* Left section: Group Name and Description */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">{groupDetails?.name || "Loading..."}</h1>
            <p className="text-sm sm:text-base text-gray-500 truncate">{groupDetails?.description || "No description available."}</p>
          </div>

          {/* Right section: Expenses and Three Dots */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Expenses button with click handler */}
            <button
              id="expenses-button"
              className="bg-gray-100 text-gray-700 font-medium py-2 px-4 rounded-full shadow-sm hover:bg-gray-200 transition-colors duration-200"
              onClick={toggleExpensesModal} disabled={isExpensesDisabled}
            >
              Expenses
            </button>

            {/* Three Dots button with click handler */}
            <button
              id="options-button"
              className="bg-gray-100 text-gray-700 p-2 rounded-full shadow-sm hover:bg-gray-200 transition-colors duration-200"
              onClick={toggleOptionsMenu} disabled={isOptionsDisabled}
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

        {activeMenu === 'options' && (
          <OptionsMenu
            toggleOptionsMenu={closeMenu} // Pass the single close function
            groupId={group.id}
            groupDetails={groupDetails}
          />
        )}
        {activeMenu === 'expenses' && (
          <ViewExpense
            toggleExpensesModal={closeMenu} // Pass the single close function
          />
        )}
                
      </div>
    </div>
  );
  
}


export default GroupHeader;
