// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import BudgetPage from './pages/BudgetPage.jsx';
import SplitsPage from './pages/SplitsPage.jsx';
import GroupDetailPage from './pages/GroupDetailPage.jsx';
import ProtectedRoute from './components/Layout/ProtectedRoute.jsx';
// import { useAuth } from './hooks/useAuth'; // Import useAuth to check auth status for logout button
import { AuthProvider } from './contexts/AuthContext.jsx';
import Navbar from './components/Layout/Navbar.jsx';

function App() {
    // const { isAuthenticated, logout } = useAuth(); // Use useAuth hook

    return (
        <Router>
            <AuthProvider>
                {/* AuthProvider wraps the entire application to provide authentication context */}
            {/* <AuthProvider> */}
                <div className="min-h-screen bg-gray-100 font-inter antialiased">
                    {/* Navigation Header */}
                    {/* <nav className="bg-white shadow-md p-4">
                        <div className="container mx-auto flex justify-between items-center">
                            <Link to="/" className="text-2xl font-bold text-indigo-700">
                                Expense Tracker
                            </Link>
                            <div className="flex items-center space-x-4">
                                { Conditional rendering for navigation links based on authentication }
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
                    </nav> */}

                    <Navbar />

                    {/* Main Content Area */}
                    <main className="container mx-auto p-6">
                        <Routes>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />

                            {/* Protected Routes */}
                            <Route element={<ProtectedRoute />}>
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/expenses" element={<ExpensesPage />} />
                                <Route path="/budget" element={<BudgetPage />} />
                                <Route path="/splits" element={<SplitsPage />} />
                                <Route path="/splits/:groupId" element={<GroupDetailPage />} />
                            </Route>

                            {/* Home Page */}
                            <Route path="/" element={
                                <div className="flex flex-col items-center justify-center h-[calc(100vh-150px)]">
                                    <h1 className="text-4xl font-extrabold text-gray-800 mb-4">Welcome to Expense Tracker!</h1>
                                    <p className="text-lg text-gray-600 mb-8">Manage your finances efficiently.</p>
                                    <div className="space-x-4">
                                        <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
                                            Get Started
                                        </Link>
                                        <Link to="/register" className="bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 font-bold py-3 px-6 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105">
                                            Sign Up
                                        </Link>
                                    </div>
                                </div>
                            } />
                        </Routes>
                    </main>
                </div>
            {/* </AuthProvider> */}
            </AuthProvider>
            
        </Router>
    );
}

export default App;