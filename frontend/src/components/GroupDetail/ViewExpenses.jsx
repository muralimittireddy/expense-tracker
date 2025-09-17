import React from "react";

function ViewExpense({ toggleExpensesModal }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      {/* Modal box */}
      <div className="w-96 bg-white rounded-lg shadow-xl p-4 border border-gray-200 relative">
        {/* Close button */}
        <button
          onClick={toggleExpensesModal}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 
                 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 
                 1.414L10 11.414l-4.293 4.293a1 1 
                 0 01-1.414-1.414L8.586 10 4.293 
                 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Modal content */}
        <p className="text-center font-bold">Expenses Modal Placeholder</p>
        <p className="text-sm text-gray-500 mt-2">
          This is where the expenses details will be displayed.
        </p>
      </div>
    </div>
  );
}

export default ViewExpense;
