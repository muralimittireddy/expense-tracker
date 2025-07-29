// frontend/src/components/Expenses/ExpenseForm.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Input from '../common/Input';
import Button from '../common/Button';

// Define expense categories matching backend enum
const categories = [
  "Food", "Travel", "Rent", "Utilities", "Entertainment",
  "Shopping", "Health", "Education", "Transportation", "Other"
];

function ExpenseForm({ onSubmit, initialData = {}, onCancel }) {
  const [formData, setFormData] = useState({
    description: initialData.description || '',
    amount: initialData.amount || '',
    date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    category: initialData.category || 'Food',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-gray-50 rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {initialData.id ? 'Edit Expense' : 'Add New Expense'}
      </h3>
      <Input
        label="Description"
        id="description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="e.g., Groceries, Dinner, Bus Ticket"
        required
      />
      <Input
        label="Amount ($)"
        id="amount"
        name="amount"
        type="number"
        step="0.01"
        value={formData.amount}
        onChange={handleChange}
        placeholder="e.g., 50.00"
        required
      />
      <Input
        label="Date"
        id="date"
        name="date"
        type="date"
        value={formData.date}
        onChange={handleChange}
        required
      />
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div className="flex space-x-4 pt-2">
        <Button type="submit" variant="primary" className="flex-grow">
          {initialData.id ? 'Update Expense' : 'Add Expense'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-grow">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

ExpenseForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  initialData: PropTypes.object,
  onCancel: PropTypes.func,
};

export default ExpenseForm;