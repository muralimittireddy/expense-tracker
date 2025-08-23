import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function LandingPage(){
    return (
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
    </div> );
}

export default LandingPage;