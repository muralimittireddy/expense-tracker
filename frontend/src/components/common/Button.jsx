// frontend/src/components/common/Button.jsx
import React from 'react';
import PropTypes from 'prop-types';

function Button({ children, className = '', variant = 'primary', ...props }) {
  const baseStyle = 'w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-150 ease-in-out';

  const variants = {
    primary: 'text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500',
    secondary: 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
    outline: 'bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 focus:ring-indigo-500',
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'outline']),
};

export default Button;