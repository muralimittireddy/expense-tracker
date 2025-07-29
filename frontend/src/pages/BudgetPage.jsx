// frontend/src/pages/BudgetPage.jsx
import React, { useState, useEffect } from 'react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';
import { formatCurrency } from '../utils/helpers';

function BudgetPage() {
  const { isAuthenticated } = useAuth();
  const [budgetAmount, setBudgetAmount] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [currentBudgetSummary, setCurrentBudgetSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBudgetSummary = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get('/budgets/remaining', {
        params: { month, year }
      });
      setCurrentBudgetSummary(response.data);
      // If a budget is set, pre-fill the form with its amount
      if (response.data.budget_set) {
        setBudgetAmount(response.data.total_budget);
      } else {
        setBudgetAmount(''); // Clear if no budget set
      }
    } catch (err) {
      console.error('Failed to fetch budget summary:', err);
      setError('Failed to load budget data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgetSummary();
  }, [isAuthenticated, month, year]); // Re-fetch when month/year changes

  const handleSetUpdateBudget = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        month: parseInt(month),
        year: parseInt(year),
        amount: parseFloat(budgetAmount),
      };
      await axiosInstance.post('/budgets/', payload);
      // alert('Budget updated successfully!'); // Replace with custom modal later
      fetchBudgetSummary(); // Refresh summary
    } catch (err) {
      console.error('Failed to set/update budget:', err.response?.data || err.message);
      setError('Failed to set/update budget.');
    }
  };

  if (loading) {
    return <div className="text-center p-8">Loading budget data...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  const remainingBudget = currentBudgetSummary?.remaining_amount;
  const totalBudget = currentBudgetSummary?.total_budget;
  const totalSpent = currentBudgetSummary?.total_spent;
  const budgetSet = currentBudgetSummary?.budget_set;

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Monthly Budget</h1>

      {/* Budget Summary Card */}
      <div className="bg-indigo-600 text-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-2">Budget for {new Date(year, month - 1).toLocaleString('default', { month: 'long' })} {year}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm opacity-80">Total Budget</p>
            <p className="text-3xl font-extrabold">{formatCurrency(totalBudget)}</p>
          </div>
          <div>
            <p className="text-sm opacity-80">Total Spent</p>
            <p className="text-3xl font-extrabold">{formatCurrency(totalSpent)}</p>
          </div>
          <div>
            <p className="text-sm opacity-80">Remaining</p>
            <p className={`text-3xl font-extrabold ${remainingBudget < 0 ? 'text-red-300' : 'text-green-300'}`}>
              {formatCurrency(remainingBudget)}
            </p>
          </div>
        </div>
        {!budgetSet && (
          <p className="text-center text-yellow-200 mt-4 text-sm">No budget set for this month.</p>
        )}
        {budgetSet && remainingBudget < 0 && (
          <p className="text-center text-red-300 mt-4 text-sm">You are over budget!</p>
        )}
      </div>

      {/* Set/Update Budget Form */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Set or Update Monthly Budget</h3>
        <form onSubmit={handleSetUpdateBudget} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="budgetMonth" className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                id="budgetMonth"
                name="budgetMonth"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={month}
                onChange={(e) => setMonth(parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="budgetYear" className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <Input
                type="number"
                id="budgetYear"
                name="budgetYear"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="budgetAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Budget Amount ($)
              </label>
              <Input
                type="number"
                id="budgetAmount"
                name="budgetAmount"
                step="0.01"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
                placeholder="e.g., 2000.00"
                required
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}
          <Button type="submit" variant="primary">
            Set/Update Budget
          </Button>
        </form>
      </div>
    </div>
  );
}

export default BudgetPage;