// frontend/src/components/Dashboard/MonthlySpendingChart.jsx
import React from 'react';
import PropTypes from 'prop-types';
// For actual charts, you would import a charting library like Chart.js or Recharts
// import { Bar } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function MonthlySpendingChart({ data }) {
  // Example data structure for chart
  const chartData = {
    labels: data.map(item => `${item.month}/${item.year}`),
    datasets: [
      {
        label: 'Total Spending ($)',
        data: data.map(item => item.total_spent),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Monthly Spending Trends',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Month/Year',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Amount ($)',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md h-96">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Monthly Spending Trends</h3>
      {data.length > 0 ? (
        // <Bar data={chartData} options={options} />
        <div className="h-full flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-md">
          [Placeholder for Bar Chart with actual data]
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-md">
          No monthly spending data available.
        </div>
      )}
    </div>
  );
}

MonthlySpendingChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    year: PropTypes.number.isRequired,
    month: PropTypes.number.isRequired,
    total_spent: PropTypes.number.isRequired,
  })).isRequired,
};

export default MonthlySpendingChart;