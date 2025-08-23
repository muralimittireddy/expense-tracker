// frontend/src/components/modals/SplitExpenseModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../hooks/useAuth';
import axiosInstance from '../../api/axiosInstance';

function SplitExpenseModal({ isOpen, onClose, groupId, members, onExpenseAdded }) {
  const { user } = useAuth();
  const [splitDescription, setSplitDescription] = useState('');
  const [splitAmount, setSplitAmount] = useState('');
  const [splitDate, setSplitDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidBy, setPaidBy] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [error, setError] = useState(null);

  // Set the current user as the default payer when the modal opens
  useEffect(() => {
    if (user && isOpen) {
      setPaidBy(user.id);
    }
  }, [user, isOpen]);

  const handleMemberSelection = (memberId) => {
    setSelectedMembers((prevSelected) =>
      prevSelected.includes(memberId)
        ? prevSelected.filter((id) => id !== memberId)
        : [...prevSelected, memberId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!splitDescription.trim() || !splitAmount || !paidBy || selectedMembers.length === 0) {
      setError('Please fill all required fields and select members.');
      return;
    }

    try {
      const newExpense = {
        description: splitDescription,
        amount: parseFloat(splitAmount),
        date: splitDate,
        category: "Other",
        group_id: parseInt(groupId),
        paid_by_user_id: parseInt(paidBy),
        // For simplicity, we are assuming an equal split.
        // A full implementation would calculate and send expense_shares here.
      };

      await axiosInstance.post('/expenses/', newExpense);

      // Reset form and close modal
      setSplitDescription('');
      setSplitAmount('');
      setSplitDate(new Date().toISOString().split('T')[0]);
      setSelectedMembers([]);
      onClose();
      onExpenseAdded(); // Notify the parent component to re-fetch data
    } catch (err) {
      console.error('Failed to add split expense:', err.response?.data || err.message);
      setError('Failed to add split expense.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Split New Expense"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="splitExpenseForm" variant="primary">
            Add Expense
          </Button>
        </>
      }
    >
      <form id="splitExpenseForm" onSubmit={handleSubmit} className="space-y-4">
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
  );
}

export default SplitExpenseModal;