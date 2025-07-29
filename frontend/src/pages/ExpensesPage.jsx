// frontend/src/pages/ExpensesPage.jsx
import React, { useState, useEffect } from 'react';
import ExpenseForm from '../components/Expenses/ExpenseForm';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';
import { formatCurrency, formatDate } from '../utils/helpers';
import Modal from '../components/common/Modal'; // Import Modal

// Define expense categories matching backend enum
const categories = [
  "Food", "Travel", "Rent", "Utilities", "Entertainment",
  "Shopping", "Health", "Education", "Transportation", "Other"
];

function ExpensesPage() {
  const { isAuthenticated } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null); // State to hold expense being edited

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Modal state for delete confirmation
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);

  const fetchExpenses = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (startDate) params.start_date = startDate + 'T00:00:00Z'; // Ensure full ISO format
      if (endDate) params.end_date = endDate + 'T23:59:59Z';     // Ensure full ISO format
      if (selectedCategory) params.category = selectedCategory;

      const response = await axiosInstance.get('/expenses/', { params });
      setExpenses(response.data);
    } catch (err) {
      console.error('Failed to fetch expenses:', err);
      setError('Failed to load expenses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [isAuthenticated, startDate, endDate, selectedCategory]); // Re-fetch on filter change

  const handleAddExpense = async (formData) => {
    try {
      await axiosInstance.post('/expenses/', formData);
      setShowAddForm(false);
      fetchExpenses(); // Refresh expenses list
    } catch (err) {
      console.error('Failed to add expense:', err.response?.data || err.message);
      setError('Failed to add expense.');
    }
  };

  const handleUpdateExpense = async (formData) => {
    try {
      await axiosInstance.put(`/expenses/${editingExpense.id}`, formData);
      setEditingExpense(null); // Exit edit mode
      fetchExpenses(); // Refresh expenses list
    } catch (err) {
      console.error('Failed to update expense:', err.response?.data || err.message);
      setError('Failed to update expense.');
    }
  };

  const confirmDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (expenseToDelete) {
      try {
        await axiosInstance.delete(`/expenses/${expenseToDelete.id}`);
        setIsDeleteModalOpen(false);
        setExpenseToDelete(null);
        fetchExpenses(); // Refresh expenses list
      } catch (err) {
        console.error('Failed to delete expense:', err.response?.data || err.message);
        setError('Failed to delete expense.');
      }
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading expenses...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Expenses</h1>

      {/* Expense Filter and Add Button */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <div className="flex-grow flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full">
          <Input
            type="date"
            className="flex-grow"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            label="Start Date"
          />
          <Input
            type="date"
            className="flex-grow"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            label="End Date"
          />
          <div>
            <label htmlFor="filterCategory" className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              id="filterCategory"
              className="p-2 border border-gray-300 rounded-md shadow-sm flex-grow w-full"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
        {!showAddForm && !editingExpense && (
          <Button onClick={() => setShowAddForm(true)} variant="primary" className="w-full md:w-auto">
            Add New Expense
          </Button>
        )}
      </div>

      {/* Expense Form (Add/Edit) */}
      {(showAddForm || editingExpense) && (
        <div className="mb-6">
          <ExpenseForm
            onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
            initialData={editingExpense || {}}
            onCancel={() => { setShowAddForm(false); setEditingExpense(null); }}
          />
        </div>
      )}

      {/* Expense List */}
      <div className="bg-gray-50 p-4 rounded-lg shadow-sm">
        {expenses.length === 0 ? (
          <p className="text-center text-gray-500">No expenses found.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {expenses.map((expense) => (
              <li key={expense.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex-grow mb-2 md:mb-0">
                  <p className="text-lg font-semibold text-gray-800">{expense.description}</p>
                  <p className="text-sm text-gray-500">{expense.category} - {formatDate(expense.date)}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xl font-bold text-red-600">-{formatCurrency(expense.amount)}</span>
                  <Button variant="secondary" onClick={() => setEditingExpense(expense)} className="px-3 py-1">Edit</Button>
                  <Button variant="danger" onClick={() => confirmDeleteExpense(expense)} className="px-3 py-1">Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirmed}>
              Delete
            </Button>
          </>
        }
      >
        <p>Are you sure you want to delete the expense: "{expenseToDelete?.description}"?</p>
        <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
      </Modal>
    </div>
  );
}

export default ExpensesPage;