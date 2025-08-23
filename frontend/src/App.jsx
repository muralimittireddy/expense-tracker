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
import LandingPage from './pages/LandingPage.jsx';

// import { useAuth } from './hooks/useAuth'; // Import useAuth to check auth status for logout button
import { AuthProvider } from './contexts/AuthContext.jsx';
import Navbar from './components/Layout/Navbar.jsx';

function App() {
    // const { isAuthenticated, logout } = useAuth(); // Use useAuth hook

    return (
        <Router>
            <AuthProvider>
                {/* AuthProvider wraps the entire application to provide authentication context */}

                <div className="min-h-screen bg-gray-100 font-inter antialiased">


                    <Navbar />

                    {/* Main Content Area */}
                    <main className="container mx-auto p-6">
                        <Routes>
                            <Route path="/" element={<LandingPage />} />
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
                        
                        </Routes>
                    </main>
                </div>
            </AuthProvider>
            
        </Router>
    );
}

export default App;