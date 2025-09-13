import React, { useState, useEffect } from 'react';
import { FaPaperPlane } from "react-icons/fa6";
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGroups } from "./../hooks/useGroups";
import GroupHeader from '../components/GroupDetail/GroupDetailHeader';
import SplitExpenseModal from '../components/GroupDetail/SplitExpense';

function GroupDetailPage() {
  
  const { groupId } = useParams();
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { groupDetails, fetchGroup } = useGroups(isAuthenticated);

   useEffect(() => {
      if (groupId) {
        fetchGroup(groupId);
      }
    }, [groupId]);

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 text-lg">
        Please log in to view group details.
      </div>
    );
  }

  const group = { id: groupId };

  return (
    <div className="flex justify-center bg-gray-100 h-screen overflow-hidden">
  {/* Panel */}
  <div className="flex flex-col w-full max-w-3xl h-full bg-white shadow-lg" >

    {/* Header */}
    <div className="flex-shrink-0 border-b shadow-sm bg-white z-10">
      <GroupHeader group={group} groupDetails={groupDetails} />
    </div>

    {/* Scrollable content */}
    <div className="flex-1 overflow-y-auto p-6">
      <p className="text-gray-500 text-center italic">
        Group activity will appear here...
      </p>
      <div className="space-y-4 mt-4">
        {[...Array(5)].map((_, i) => (
          <p key={i}>Scrollable item #{i + 1}</p>
        ))}
      </div>
    </div>

    {/* Footer */}
    <div className="flex-shrink-0 border-t shadow-sm bg-white p-4 flex justify-between items-center z-10">
      {/* Split button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-5 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
      >
        Split an Expense
      </button>

      {/* Message input + send button */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          placeholder="Message..."
          className="w-48 px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
        />
        <button className="p-2 bg-blue-500 text-white rounded-lg shadow-sm hover:bg-blue-600 transition-colors flex items-center justify-center">
          <FaPaperPlane className="h-5 w-5" />
        </button>
      </div>
    </div>




        {/* Modal */}
        {isModalOpen && (
          <SplitExpenseModal onClose={() => setIsModalOpen(false)} groupDetails={groupDetails}  />
        )}
      </div>
    </div>

  );
}

export default GroupDetailPage;
