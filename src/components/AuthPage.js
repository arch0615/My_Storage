import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from './LoginForm';
import ThemeToggle from './ThemeToggle';
import './Auth.css';

const AuthPage = () => {
  const { login } = useAuth();

  const handleLogin = async (identifier, password) => {
    await login(identifier, password);
  };

  return (
    <div className="auth-page">
      <div className="auth-header-absolute">
        <ThemeToggle />
      </div>
      <div className="auth-card">
        <div className="auth-card-header">
          <div className="auth-logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <h1 className="auth-title">My Storage</h1>
          <p className="auth-subtitle">Sign in to your workspace</p>
        </div>
        <div className="auth-card-body">
          <LoginForm onSuccess={handleLogin} />
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
