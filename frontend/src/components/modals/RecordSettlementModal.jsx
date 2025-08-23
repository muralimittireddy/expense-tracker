// frontend/src/components/modals/RecordSettlementModal.jsx
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { useAuth } from '../../hooks/useAuth';
import axiosInstance from '../../api/axiosInstance';

function RecordSettlementModal({ isOpen, onClose, groupId, members, onSettlementRecorded }) {
  const { user } = useAuth();
  const [fromUser, setFromUser] = useState('');
  const [toUser, setToUser] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!fromUser || !toUser || !amount) {
      setError('Please select both users and enter an amount.');
      return;
    }

    try {
      const settlementData = {
        from_user_id: parseInt(fromUser),
        to_user_id: parseInt(toUser),
        group_id: parseInt(groupId),
        amount: parseFloat(amount),
      };
      await axiosInstance.post('/settlements/', settlementData);

      // Reset form and close modal
      setFromUser('');
      setToUser('');
      setAmount('');
      onClose();
      onSettlementRecorded(); // Notify the parent to re-fetch data
    } catch (err) {
      console.error('Failed to record settlement:', err.response?.data || err.message);
      setError('Failed to record settlement.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Settlement"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="recordSettlementForm" variant="primary">
            Record Payment
          </Button>
        </>
      }
    >
      <form id="recordSettlementForm" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fromUser" className="block text-sm font-medium text-gray-700 mb-1">
            From User
          </label>
          <select
            id="fromUser"
            name="fromUser"
            value={fromUser}
            onChange={(e) => setFromUser(e.target.value)}
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
            value={toUser}
            onChange={(e) => setToUser(e.target.value)}
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
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g., 25.00"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </form>
    </Modal>
  );
}

export default RecordSettlementModal;