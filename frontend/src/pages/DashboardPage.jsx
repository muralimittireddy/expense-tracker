// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import MonthlySpendingChart from '../components/Dashboard/MonthlySpendingChart';
import CategoryPieChart from '../components/Dashboard/CategoryPieChart';
import TrendsBarChart from '../components/Dashboard/TrendsBarChart'; // Placeholder for more complex trends
import { useAuth } from '../hooks/useAuth';
import axiosInstance from '../api/axiosInstance';
import { formatCurrency } from '../utils/helpers';

function DashboardPage() {
  const { user, isAuthenticated } = useAuth();
  const [monthlySpending, setMonthlySpending] = useState([]);
  const [categorySpending, setCategorySpending] = useState([]);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch Monthly Spending
        const monthlyRes = await axiosInstance.get('/analytics/monthly_spending');
        setMonthlySpending(monthlyRes.data);

        // Fetch Category Spending for current month
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const categoryRes = await axiosInstance.get('/analytics/spending_by_category', {
          params: { month: currentMonth, year: currentYear }
        });
        setCategorySpending(categoryRes.data);

        // Fetch Current Month's Budget and Remaining
        const budgetRes = await axiosInstance.get('/budgets/remaining', {
          params: { month: currentMonth, year: currentYear }
        });
        setCurrentBudget(budgetRes.data);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated]);

  if (loading) {
    return <div className="text-center p-8">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-600">{error}</div>;
  }

  // Calculate total spending for current month from monthlySpending data
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentMonthSpending = monthlySpending.find(
    item => item.month === currentMonth && item.year === currentYear
  )?.total_spent || 0;

  const remainingBudget = currentBudget?.remaining_amount !== undefined
    ? currentBudget.remaining_amount
    : (currentBudget?.total_budget || 0) - currentMonthSpending; // Fallback calculation

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Monthly Spending Card */}
        <div className="bg-indigo-500 text-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <h3 className="text-xl font-semibold mb-2">Monthly Spending</h3>
          <p className="text-4xl font-extrabold">{formatCurrency(currentMonthSpending)}</p>
          <p className="text-sm mt-2 opacity-80">As of {new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</p>
        </div>

        {/* Remaining Budget Card */}
        <div className="bg-green-500 text-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <h3 className="text-xl font-semibold mb-2">Remaining Budget</h3>
          <p className={`text-4xl font-extrabold ${remainingBudget < 0 ? 'text-red-300' : ''}`}>
            {formatCurrency(remainingBudget)}
          </p>
          <p className="text-sm mt-2 opacity-80">
            Budget: {formatCurrency(currentBudget?.total_budget || 0)}
          </p>
        </div>

        {/* Expense Prediction Card (Placeholder for ML service) */}
        <div className="bg-blue-500 text-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <h3 className="text-xl font-semibold mb-2">Next Month's Prediction</h3>
          <p className="text-4xl font-extrabold">{formatCurrency(1650.00)}</p> {/* Static mock for now */}
          <p className="text-sm mt-2 opacity-80">Based on past data (ML service integration pending)</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts */}
        <CategoryPieChart data={categorySpending} />
        <MonthlySpendingChart data={monthlySpending} />
        {/* <TrendsBarChart />  // Uncomment if you want a separate, more complex trends chart */}
      </div>
    </div>
  );
}

export default DashboardPage;