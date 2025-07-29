// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../api/axiosInstance'; // Axios instance for API calls

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // To indicate auth status is being checked

  useEffect(() => {
    // Check for token in localStorage on app load
    const token = localStorage.getItem('accessToken');
    if (token) {
      // In a real app, you'd validate the token with the backend
      // For now, presence of token implies authenticated
      setIsAuthenticated(true);
      // Optionally decode user info from token or fetch user profile
      // setUser(decodeToken(token)); // If you have a decode function
    }
    setLoading(false); // Finished checking auth status
  }, []);

  const login = async (username, password) => {
    try {
      const response = await axiosInstance.post('/auth/token', new URLSearchParams({
        username: username,
        password: password
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const { access_token } = response.data;
      localStorage.setItem('accessToken', access_token);
      setIsAuthenticated(true);
      // In a real app, you might fetch user details after login
      // For now, a mock user
      setUser({ username: username });
      return true;
    } catch (error) {
      console.error('Login failed:', error.response?.data || error.message);
      setIsAuthenticated(false);
      setUser(null);
      return false;
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        username,
        email,
        password
      });
      // After successful registration, you might automatically log them in
      // or redirect to login page
      console.log('Registration successful:', response.data);
      return true;
    } catch (error) {
      console.error('Registration failed:', error.response?.data || error.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login'; // Redirect to login after logout
  };

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};