// frontend/src/components/modals/BalancesOverviewModal.jsx
import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/helpers';

function BalancesOverviewModal({ isOpen, onClose, balancesSummary, members }) {
  const { user } = useAuth();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Balances Overview"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center mb-4">
          <div className="bg-red-100 p-4 rounded-lg">
            <p className="text-sm text-red-700">You Owe</p>
            <p className="text-2xl font-bold text-red-800">{formatCurrency(balancesSummary.total_owed_by_you)}</p>
          </div>
          <div className="bg-green-100 p-4 rounded-lg">
            <p className="text-sm text-green-700">Others Owe You</p>
            <p className="text-2xl font-bold text-green-800">{formatCurrency(balancesSummary.total_owed_to_you)}</p>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-800 mb-2">Individual Balances</h3>
        {balancesSummary.individual_balances.length === 0 ? (
          <p className="text-gray-500 text-center">No balances to display.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {balancesSummary.individual_balances.map((balance) => {
              // Get the member's username from the members array
              const member = members.find(m => m.id === balance.user_id);
              if (!member) return null; // Handle case where member is not found
              
              // Don't show your own balance in this list
              if (member.id === user?.id) return null;

              const isOwedByYou = balance.net_balance < 0;
              const displayAmount = formatCurrency(Math.abs(balance.net_balance));
              const textColorClass = isOwedByYou ? 'text-red-600' : 'text-green-600';
              const message = isOwedByYou
                ? `You owe ${member.username}`
                : `${member.username} owes you`;

              return (
                <li key={balance.user_id} className="py-2 flex justify-between items-center">
                  <span className="text-gray-700">{message}</span>
                  <span className={`font-bold ${textColorClass}`}>{displayAmount}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}

export default BalancesOverviewModal;