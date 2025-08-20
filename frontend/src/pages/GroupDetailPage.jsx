// frontend/src/pages/GroupDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';
import { formatCurrency, formatDate } from '../utils/helpers'; // Assuming these helpers exist

function GroupDetailPage() {
  const { groupId } = useParams(); // Get groupId from URL
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [transactions, setTransactions] = useState([]); // Group expenses/transactions
  const [balances, setBalances] = useState([]); // Who owes whom
  const [members, setMembers] = useState([]); // Group members
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [showSplitExpenseModal, setShowSplitExpenseModal] = useState(false);
  const [showRecordSettlementModal, setShowRecordSettlementModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);

  // Split Expense Form State
  const [splitDescription, setSplitDescription] = useState('');
  const [splitAmount, setSplitAmount] = useState('');
  const [splitDate, setSplitDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState(''); // User ID who paid
  const [selectedMembers, setSelectedMembers] = useState([]); // Members involved in split

  // Settlement Form State
  const [settlementFromUser, setSettlementFromUser] = useState('');
  const [settlementToUser, setSettlementToUser] = useState('');
  const [settlementAmount, setSettlementAmount] = useState('');

  // Fetch group details, transactions, and members
  useEffect(() => {
    if (!isAuthenticated || !groupId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch Group Details
        const groupRes = await axiosInstance.get(`/splits/groups/${groupId}`);
        setGroup(groupRes.data);
        setMembers(groupRes.data.members || []); // Assuming members are part of group response

        // Set initial paidBy for split expense form to current user
        if (user && !paidBy) {
          setPaidBy(user.id);
        }

        // Fetch Group Transactions (expenses associated with this group)
        // Assuming an endpoint like /expenses?group_id=X
        const transactionsRes = await axiosInstance.get(`/expenses/`, { params: { group_id: groupId } });
        setTransactions(transactionsRes.data);

        // Fetch Balances (who owes whom)
        // This endpoint needs to be implemented on the backend
        // For now, use mock data or a simplified calculation
        const mockBalances = [
          { from_user: 'Alice', to_user: 'Bob', amount: 15.50, status: 'owes' },
          { from_user: 'Charlie', to_user: 'Alice', amount: 20.00, status: 'owes' },
          { from_user: 'You', to_user: 'Bob', amount: 5.00, status: 'owes' },
        ];
        setBalances(mockBalances); // Replace with actual API call later

      } catch (err) {
        console.error('Failed to fetch group details:', err.response?.data || err.message);
        setError('Failed to load group details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, groupId, user]); // Refetch when auth, group ID, or user changes

  // Handle Split Expense Submission
  const handleSplitExpense = async (e) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!splitDescription.trim() || !splitAmount || !paidBy || selectedMembers.length === 0) {
      setError('Please fill all required fields and select members.');
      return;
    }

    try {
      // Assuming an endpoint for adding group expenses
      const newExpense = {
        description: splitDescription,
        amount: parseFloat(splitAmount),
        date: splitDate,
        category: "Other", // Default category for group expenses, can be made selectable
        group_id: parseInt(groupId),
        paid_by_user_id: parseInt(paidBy),
        // For simplicity, assuming equal split for now.
        // In a full implementation, you'd calculate and send expense_shares here.
        // For now, backend will likely just store the main expense.
      };

      await axiosInstance.post('/expenses/', newExpense); // Use existing expense endpoint
      
      // Reset form and close modal
      setSplitDescription('');
      setSplitAmount('');
      setSplitDate(new Date().toISOString().split('T')[0]);
      setSelectedMembers([]);
      setShowSplitExpenseModal(false);
      // Re-fetch data to update transactions and balances
      // You'll need to re-call fetchData() or specific parts of it
      // For now, a simple refresh:
      window.location.reload(); // Temporary for full refresh, replace with targeted fetch
    } catch (err) {
      console.error('Failed to add split expense:', err.response?.data || err.message);
      setError('Failed to add split expense.');
    }
  };

  // Handle Record Settlement Submission
  const handleRecordSettlement = async (e) => {
    e.preventDefault();
    setError(null);

    if (!settlementFromUser || !settlementToUser || !settlementAmount) {
      setError('Please select both users and enter an amount.');
      return;
    }

    try {
      // Assuming a backend endpoint for settlements
      const settlementData = {
        from_user_id: parseInt(settlementFromUser),
        to_user_id: parseInt(settlementToUser),
        group_id: parseInt(groupId),
        amount: parseFloat(settlementAmount),
      };
      await axiosInstance.post('/settlements/', settlementData); // This endpoint needs to be implemented

      // Reset form and close modal
      setSettlementFromUser('');
      setSettlementToUser('');
      setSettlementAmount('');
      setShowRecordSettlementModal(false);
      window.location.reload(); // Temporary for full refresh, replace with targeted fetch
    } catch (err) {
      console.error('Failed to record settlement:', err.response?.data || err.message);
      setError('Failed to record settlement.');
    }
  };

  // Handle member selection for split expense
  const handleMemberSelection = (memberId) => {
    setSelectedMembers((prevSelected) =>
      prevSelected.includes(memberId)
        ? prevSelected.filter((id) => id !== memberId)
        : [...prevSelected, memberId]
    );
  };

  if (loading) {
    return <div className="text-center p-8 text-gray-600">Loading group details...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  if (!group) {
    return <div className="text-center p-8 text-gray-600">Group not found or an error occurred.</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{group.name}</h1>
          {group.description && <p className="text-gray-600 mt-1">{group.description}</p>}
        </div>
        <Button onClick={() => setShowEditGroupModal(true)} variant="secondary">
          Edit Group
        </Button>
      </div>

      {/* Action Buttons: Split Expense and Record Settlement */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
        <Button onClick={() => setShowSplitExpenseModal(true)} variant="primary" className="md:w-1/2">
          Split New Expense
        </Button>
        <Button onClick={() => setShowRecordSettlementModal(true)} variant="outline" className="md:w-1/2">
          Record Settlement
        </Button>
      </div>

      {/* Balances Section */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Who Owes Whom</h2>
        {balances.length === 0 ? (
          <p className="text-gray-500 text-center">No outstanding balances.</p>
        ) : (
          <ul className="space-y-2">
            {balances.map((balance, index) => (
              <li key={index} className="flex justify-between items-center bg-white p-3 rounded-md shadow-sm">
                <span className="text-gray-700">
                  {balance.from_user} owes {balance.to_user}
                </span>
                <span className="font-bold text-red-600">
                  {formatCurrency(balance.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Transactions Section */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Transactions</h2>
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center">No transactions in this group yet.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold text-gray-800">{transaction.description}</p>
                  <p className="text-sm text-gray-600">
                    Paid by {members.find(m => m.id === transaction.paid_by_user_id)?.username || 'Unknown'} on {formatDate(transaction.date)}
                  </p>
                </div>
                <span className="text-xl font-bold text-red-600">-{formatCurrency(transaction.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modals */}

      {/* Split New Expense Modal */}
      <Modal
        isOpen={showSplitExpenseModal}
        onClose={() => setShowSplitExpenseModal(false)}
        title="Split New Expense"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowSplitExpenseModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="splitExpenseForm" variant="primary">
              Add Expense
            </Button>
          </>
        }
      >
        <form id="splitExpenseForm" onSubmit={handleSplitExpense} className="space-y-4">
          <Input
            label="Description"
            id="splitDescription"
            name="splitDescription"
            value={splitDescription}
            onChange={(e) => setSplitDescription(e.target.value)}
            placeholder="e.g., Dinner, Groceries"
            required
          />
          <Input
            label="Amount ($)"
            id="splitAmount"
            name="splitAmount"
            type="number"
            step="0.01"
            value={splitAmount}
            onChange={(e) => setSplitAmount(e.target.value)}
            placeholder="e.g., 75.00"
            required
          />
          <Input
            label="Date"
            id="splitDate"
            name="splitDate"
            type="date"
            value={splitDate}
            onChange={(e) => setSplitDate(e.target.value)}
            required
          />
          <div>
            <label htmlFor="paidBy" className="block text-sm font-medium text-gray-700 mb-1">
              Paid By
            </label>
            <select
              id="paidBy"
              name="paidBy"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select Payer</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.username} {member.id === user?.id ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Split Among (Select All Applicable)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {members.map((member) => (
                <div key={member.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`member-${member.id}`}
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleMemberSelection(member.id)}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor={`member-${member.id}`} className="ml-2 text-sm text-gray-700">
                    {member.username} {member.id === user?.id ? '(You)' : ''}
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Currently, expenses are split equally among selected members.
            </p>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </Modal>

      {/* Record Settlement Modal */}
      <Modal
        isOpen={showRecordSettlementModal}
        onClose={() => setShowRecordSettlementModal(false)}
        title="Record Settlement"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowRecordSettlementModal(false)}>
              Cancel
            </Button>
            <Button type="submit" form="recordSettlementForm" variant="primary">
              Record Payment
            </Button>
          </>
        }
      >
        <form id="recordSettlementForm" onSubmit={handleRecordSettlement} className="space-y-4">
          <div>
            <label htmlFor="fromUser" className="block text-sm font-medium text-gray-700 mb-1">
              From User
            </label>
            <select
              id="fromUser"
              name="fromUser"
              value={settlementFromUser}
              onChange={(e) => setSettlementFromUser(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select Payer</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.username} {member.id === user?.id ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="toUser" className="block text-sm font-medium text-gray-700 mb-1">
              To User
            </label>
            <select
              id="toUser"
              name="toUser"
              value={settlementToUser}
              onChange={(e) => setSettlementToUser(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            >
              <option value="">Select Receiver</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.username} {member.id === user?.id ? '(You)' : ''}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Amount ($)"
            id="settlementAmount"
            name="settlementAmount"
            type="number"
            step="0.01"
            value={settlementAmount}
            onChange={(e) => setSettlementAmount(e.target.value)}
            placeholder="e.g., 25.00"
            required
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </form>
      </Modal>

      {/* Edit Group Modal */}
      <Modal
        isOpen={showEditGroupModal}
        onClose={() => setShowEditGroupModal(false)}
        title="Edit Group"
        footer={
          <Button variant="outline" onClick={() => setShowEditGroupModal(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <Button variant="secondary" className="w-full">
            Add/Remove People (Coming Soon)
          </Button>
          <Button variant="secondary" className="w-full">
            View All Members (Coming Soon)
          </Button>
          <Button variant="danger" className="w-full">
            Leave Group (Coming Soon)
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default GroupDetailPage;
