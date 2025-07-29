// frontend/src/components/Dashboard/CategoryPieChart.jsx
import React from 'react';
import PropTypes from 'prop-types';
// For actual charts, you would import a charting library like Chart.js or Recharts
// import { Pie } from 'react-chartjs-2';
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// ChartJS.register(ArcElement, Tooltip, Legend);

function CategoryPieChart({ data }) {
  // Example data structure for chart
  const chartData = {
    labels: data.map(item => item.category),
    datasets: [
      {
        data: data.map(item => item.total_spent),
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#8A2BE2', '#7FFF00', '#D2691E', '#6495ED'
        ],
        hoverOffset: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: 'Spending by Category',
      },
      legend: {
        position: 'right',
      },
    },
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg shadow-md h-96">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Spending by Category</h3>
      {data.length > 0 ? (
        // <Pie data={chartData} options={options} />
        <div className="h-full flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-md">
          [Placeholder for Pie Chart with actual data]
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      ) : (
        <div className="h-full flex items-center justify-center text-gray-500 border-2 border-dashed border-gray-300 rounded-md">
          No category spending data available.
        </div>
      )}
    </div>
  );
}

CategoryPieChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    category: PropTypes.string.isRequired,
    total_spent: PropTypes.number.isRequired,
  })).isRequired,
};

export default CategoryPieChart;