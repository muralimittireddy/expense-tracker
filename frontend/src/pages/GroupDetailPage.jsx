import React, { useState, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa6";
import { useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useGroups } from "./../hooks/useGroups";
import GroupHeader from "../components/GroupDetail/GroupDetailHeader";
import SplitExpenseModal from "../components/GroupDetail/SplitExpense";
import ViewExpense from "../components/GroupDetail/ViewExpenses";
import OptionsMenu from "../components/GroupDetail/OptionsMenu";
import axiosInstance from "../api/axiosInstance";

function GroupDetailPage() {
  const { groupId } = useParams();
  const { isAuthenticated } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { groupDetails, fetchGroup } = useGroups(isAuthenticated);
  const [expenses, setExpenses] = useState([]);

  // central state for toggle menus
  const [activeMenu, setActiveMenu] = useState(null); // null | "options" | "expenses"

  useEffect(() => {
    if (groupId) {
      fetchGroup(groupId);
      fetchExpenses(groupId);
    }
  }, [groupId]);

  const fetchExpenses = async (groupId) => {
    try {
      const res = await axiosInstance.get(`/splits/groups/${groupId}/expenses`);
      setExpenses(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch expenses", err);
    }
  };

  // WebSocket effect
  useEffect(() => {
    if (!groupId) return;

    const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL;
    const ws = new WebSocket(`${WS_BASE_URL}/ws/groups/${groupId}`);

    ws.onopen = () =>
      console.log(`✅ WebSocket connection established for group ${groupId}`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.event === "NEW_EXPENSE") {
        const newExpense = {
          ...data.expense,
          expense_shares: data.expense.shares || [],
        };
        setExpenses((prevExpenses) => [...prevExpenses, newExpense]);
      }
    };
    ws.onclose = () => console.log("🔌 WebSocket connection closed.");
    ws.onerror = (error) => console.error("❌ WebSocket error:", error);

    return () => ws.close();
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
      <div className="flex flex-col w-full max-w-3xl h-full bg-white shadow-lg">
        {/* Header */}
        <GroupHeader
          group={group}
          groupDetails={groupDetails}
          onMenuChange={(menu) =>
            setActiveMenu((prev) => (prev === menu ? null : menu))
          }
        />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-6">
          {expenses.length === 0 ? (
            <p className="text-gray-500 text-center italic">
              No expenses yet. Add one!
            </p>
          ) : (
            <div className="space-y-4">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="p-4 border rounded-lg shadow-sm bg-gray-50"
                >
                  <p className="font-medium text-gray-800">
                    {exp.description} - ₹{exp.amount}
                  </p>
                  <p className="text-sm text-gray-600">
                    Paid by User {exp.paid_by_user_id}
                  </p>
                  <ul className="mt-2 text-sm text-gray-700">
                    {exp.expense_shares.map((s, i) => (
                      <li key={i}>
                        👤 User {s.user_id}: owes ₹{s.share_amount.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
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

          {/* Message input */}
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

        {/* Popups */}
        {isModalOpen && (
          <SplitExpenseModal
            onClose={() => setIsModalOpen(false)}
            groupDetails={groupDetails}
            group={group}
          />
        )}

        {activeMenu === "options" && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <OptionsMenu
              toggleOptionsMenu={() => setActiveMenu(null)}
              groupId={group.id}
              groupDetails={groupDetails}
            />
          </div>
        )}

        {activeMenu === "expenses" && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <ViewExpense toggleExpensesModal={() => setActiveMenu(null)} />
          </div>
        )}
      </div>
    </div>
  );
}

export default GroupDetailPage;
