import React, {useState} from "react";

function ViewExpense({toggleExpensesModal}){

    return(
         <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-96 bg-white rounded-lg shadow-xl z-10 p-4 border border-gray-200">
      {/* Close button */}
      <div className="flex justify-end">
        <button onClick={toggleExpensesModal} className="text-gray-400 hover:text-gray-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Modal content */}
      <p className="text-center font-bold">Expenses Modal Placeholder</p>
      <p className="text-sm text-gray-500 mt-2">This is where the expenses details will be displayed.</p>
    </div>
    );

}
export default ViewExpense;