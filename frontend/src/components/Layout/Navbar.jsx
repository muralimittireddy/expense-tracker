// frontend/src/components/Layout/Navbar.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Import useAuth hook

function Navbar() {
    const { isAuthenticated, logout } = useAuth(); // Safely useAuth here as Navbar will be inside AuthProvider

    return (
        <nav className="bg-white shadow-md p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-indigo-700">
                    Expense Tracker
                </Link>
                <div className="flex items-center space-x-4">
                    {/* Conditional rendering for navigation links based on authentication */}
                    {!isAuthenticated ? (
                        <>
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md text-sm font-medium">
                                Login
                            </Link>
                            <Link to="/register" className="text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md text-sm font-medium">
                                Register
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/dashboard" className="text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md text-sm font-medium">
                                Dashboard
                            </Link>
                            <Link to="/splits" className="text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md text-sm font-medium">
                                Splits Group
                            </Link>
                            <Link to="/expenses" className="text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md text-sm font-medium">
                                Expenses
                            </Link>
                            <Link to="/budget" className="text-indigo-600 hover:text-indigo-800 px-3 py-2 rounded-md text-sm font-medium">
                                Budget
                            </Link>
                            
                            <button
                                onClick={logout}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md text-sm transition duration-150 ease-in-out"
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
