/**
 * Main Layout Component with Sidebar Navigation
 */

import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import AIAssistant from '../ai/AIAssistant';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/companies', label: 'Companies', icon: '🏢' },
    { path: '/contacts', label: 'Contacts', icon: '👥' },
    { path: '/sales', label: 'Sales Pipeline', icon: '💰' },
    { path: '/lightning-path', label: 'Lightning Path', icon: '⚡' },
    { path: '/matters', label: 'Matters', icon: '📁' },
    { path: '/legal', label: 'Legal Documents', icon: '📄' },
    { path: '/time-tracking/timesheet', label: 'Time Tracking', icon: '⏱' },
    { path: '/invoicing/invoices', label: 'Invoicing', icon: '📋' },
    { path: '/financials', label: 'Financials', icon: '💵' },
    { path: '/reporting', label: 'Reporting', icon: '📈' },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1>AI CRM</h1>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path));

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="nav-label">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-name">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="user-email">{user?.email}</div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">{children}</div>
      </main>

      {/* AI Assistant - Global */}
      <AIAssistant />
    </div>
  );
};

export default Layout;
