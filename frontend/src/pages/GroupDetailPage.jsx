// frontend/src/pages/GroupDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal'; // Keep this for the "Edit Group" modal
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';
import { formatCurrency, formatDate } from '../utils/helpers';
import SplitExpenseModal from '../components/modals/SplitExpenseModal';
// Import the new components
import RecordSettlementModal from '../components/modals/RecordSettlementModal';
import BalancesOverviewModal from '../components/modals/BalancesOverviewModal';

function GroupDetailPage() {
  const { groupId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [balancesSummary, setBalancesSummary] = useState({
    group_id: null,
    total_owed_by_you: 0,
    total_owed_to_you: 0,
    individual_balances: [],
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal visibility states
  const [showSplitExpenseModal, setShowSplitExpenseModal] = useState(false);
  const [showRecordSettlementModal, setShowRecordSettlementModal] = useState(false);
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showBalancesOverviewModal, setShowBalancesOverviewModal] = useState(false);

  // A single function to fetch all necessary data
  const fetchData = async () => {
    if (!isAuthenticated || !groupId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [groupRes, transactionsRes, balancesRes] = await Promise.all([
        axiosInstance.get(`/splits/groups/${groupId}`),
        axiosInstance.get(`/expenses/`, { params: { group_id: groupId } }),
        axiosInstance.get(`/splits/groups/${groupId}/balances`)
      ]);
      setGroup(groupRes.data);
      setMembers(groupRes.data.members || []);
      setTransactions(transactionsRes.data);
      setBalancesSummary(balancesRes.data);
    } catch (err) {
      console.error('Failed to fetch group details:', err.response?.data || err.message);
      setError('Failed to load group details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAuthenticated, groupId, user?.id]);

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
        <div className="flex space-x-2">
          <Button onClick={() => setShowEditGroupModal(true)} variant="secondary" className="px-3 py-1 text-sm">
            Edit Group
          </Button>
          <Button onClick={() => setShowBalancesOverviewModal(true)} variant="outline" className="px-3 py-1 text-sm">
            View Balances
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
        <Button onClick={() => setShowSplitExpenseModal(true)} variant="primary" className="md:w-1/2">
          Split New Expense
        </Button>
        <Button onClick={() => setShowRecordSettlementModal(true)} variant="outline" className="md:w-1/2">
          Record Settlement
        </Button>
      </div>

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

      {/* Render the new modal components */}
      <SplitExpenseModal
        isOpen={showSplitExpenseModal}
        onClose={() => setShowSplitExpenseModal(false)}
        groupId={groupId}
        members={members}
        onExpenseAdded={fetchData}
      />
      
      <RecordSettlementModal
        isOpen={showRecordSettlementModal}
        onClose={() => setShowRecordSettlementModal(false)}
        groupId={groupId}
        members={members}
        onSettlementRecorded={fetchData}
      />

      <BalancesOverviewModal
        isOpen={showBalancesOverviewModal}
        onClose={() => setShowBalancesOverviewModal(false)}
        balancesSummary={balancesSummary}
        members={members}
      />

      {/* Edit Group Modal (can also be extracted later) */}
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