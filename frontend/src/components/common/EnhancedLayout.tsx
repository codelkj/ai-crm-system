/**
 * Enhanced Layout Component with Smooth Navigation & Optimized UX
 * Features:
 * - Collapsible menu groups
 * - Breadcrumb navigation
 * - Search functionality
 * - Keyboard shortcuts
 * - Page transitions
 * - Loading states
 * - Mobile optimization
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import AIAssistant from '../ai/AIAssistant';
import './EnhancedLayout.css';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: string;
  group?: string;
  keywords?: string[];
}

interface NavGroup {
  name: string;
  icon: string;
  items: NavItem[];
}

const EnhancedLayout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['core', 'legal']));
  const [pageLoading, setPageLoading] = useState(false);

  // Navigation structure with groups
  const navGroups: NavGroup[] = [
    {
      name: 'Core',
      icon: '⭐',
      items: [
        { path: '/', label: 'Dashboard', icon: '📊', group: 'core', keywords: ['home', 'overview', 'stats'] },
        { path: '/companies', label: 'Companies', icon: '🏢', group: 'core', keywords: ['clients', 'organizations'] },
        { path: '/contacts', label: 'Contacts', icon: '👥', group: 'core', keywords: ['people', 'clients'] },
      ],
    },
    {
      name: 'Legal',
      icon: '⚖️',
      items: [
        { path: '/matters', label: 'Matters', icon: '📁', group: 'legal', keywords: ['cases', 'files'] },
        { path: '/legal', label: 'Legal Documents', icon: '📄', group: 'legal', keywords: ['contracts', 'documents'] },
        { path: '/lightning-path', label: 'Lightning Path', icon: '⚡', group: 'legal', keywords: ['wizard', 'guided'] },
      ],
    },
    {
      name: 'Sales & Revenue',
      icon: '💰',
      items: [
        { path: '/sales', label: 'Sales Pipeline', icon: '💼', group: 'sales', keywords: ['deals', 'opportunities'] },
        { path: '/time-tracking/timesheet', label: 'Time Tracking', icon: '⏱️', group: 'sales', keywords: ['hours', 'timesheet'] },
        { path: '/invoicing/invoices', label: 'Invoicing', icon: '📋', group: 'sales', keywords: ['billing', 'invoices'] },
        { path: '/financials', label: 'Financials', icon: '💵', group: 'sales', keywords: ['money', 'finances', 'transactions'] },
      ],
    },
    {
      name: 'Insights',
      icon: '📈',
      items: [
        { path: '/reporting', label: 'Reporting Dashboard', icon: '📊', group: 'insights', keywords: ['analytics', 'reports', 'legalnexus'] },
      ],
    },
    {
      name: 'Settings',
      icon: '⚙️',
      items: [
        { path: '/settings/departments', label: 'Departments', icon: '🏛️', group: 'settings', keywords: ['practice areas'] },
        { path: '/settings/roles', label: 'Roles', icon: '🔐', group: 'settings', keywords: ['permissions', 'access'] },
        { path: '/audit-logs', label: 'Audit Logs', icon: '📜', group: 'settings', keywords: ['history', 'logs'] },
      ],
    },
  ];

  // Flatten all items for search
  const allNavItems = useMemo(() => {
    return navGroups.flatMap(group => group.items);
  }, []);

  // Filter items based on search
  const filteredGroups = useMemo(() => {
    if (!searchQuery) return navGroups;

    const query = searchQuery.toLowerCase();
    return navGroups
      .map(group => ({
        ...group,
        items: group.items.filter(item =>
          item.label.toLowerCase().includes(query) ||
          item.keywords?.some(k => k.includes(query)) ||
          item.path.includes(query)
        ),
      }))
      .filter(group => group.items.length > 0);
  }, [searchQuery, navGroups]);

  // Generate breadcrumbs
  const breadcrumbs = useMemo(() => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const crumbs = [{ label: 'Home', path: '/' }];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const navItem = allNavItems.find(item => item.path === currentPath);

      if (navItem) {
        crumbs.push({ label: navItem.label, path: currentPath });
      } else {
        // Try to create readable label from path segment
        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        crumbs.push({ label, path: currentPath });
      }
    });

    return crumbs;
  }, [location.pathname, allNavItems]);

  // Toggle group expansion
  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupName)) {
        newSet.delete(groupName);
      } else {
        newSet.add(groupName);
      }
      return newSet;
    });
  };

  // Handle navigation with loading state
  const handleNavigate = (path: string) => {
    setPageLoading(true);
    navigate(path);
    setTimeout(() => setPageLoading(false), 300); // Smooth transition
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('nav-search')?.focus();
      }

      // Ctrl/Cmd + B to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        setSidebarOpen(prev => !prev);
      }

      // Escape to clear search
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [searchQuery]);

  // Auto-expand group of current page
  useEffect(() => {
    const currentItem = allNavItems.find(item =>
      location.pathname === item.path ||
      (item.path !== '/' && location.pathname.startsWith(item.path))
    );

    if (currentItem?.group) {
      setExpandedGroups(prev => new Set([...prev, currentItem.group!]));
    }
  }, [location.pathname, allNavItems]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="enhanced-layout">
      {/* Sidebar */}
      <aside className={`enhanced-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon">⚡</div>
            {sidebarOpen && (
              <div className="logo-text">
                <h1>LegalNexus</h1>
                <p className="logo-subtitle">Powered by Vicktoria AI</p>
              </div>
            )}
          </div>
          <button
            className="sidebar-toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? 'Collapse (Ctrl+B)' : 'Expand (Ctrl+B)'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Search */}
        {sidebarOpen && (
          <div className="nav-search-container">
            <input
              id="nav-search"
              type="text"
              className="nav-search"
              placeholder="Search navigation... (Ctrl+K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="search-clear"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>
        )}

        {/* Navigation Groups */}
        <nav className="sidebar-nav">
          {filteredGroups.map((group) => {
            const isExpanded = expandedGroups.has(group.name.toLowerCase());

            return (
              <div key={group.name} className="nav-group">
                {sidebarOpen && (
                  <button
                    className="group-header"
                    onClick={() => toggleGroup(group.name.toLowerCase())}
                  >
                    <span className="group-icon">{group.icon}</span>
                    <span className="group-name">{group.name}</span>
                    <span className={`group-arrow ${isExpanded ? 'expanded' : ''}`}>
                      ▼
                    </span>
                  </button>
                )}

                <div className={`group-items ${isExpanded || !sidebarOpen ? 'expanded' : 'collapsed'}`}>
                  {group.items.map((item) => {
                    const isActive =
                      location.pathname === item.path ||
                      (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                        onClick={() => handleNavigate(item.path)}
                        title={!sidebarOpen ? item.label : ''}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        {sidebarOpen && (
                          <span className="nav-label">{item.label}</span>
                        )}
                        {isActive && <span className="active-indicator"></span>}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {sidebarOpen && (
            <>
              <div className="user-info">
                <div className="user-avatar">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </div>
                <div className="user-details">
                  <div className="user-name">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className="user-email">{user?.email}</div>
                </div>
              </div>
              <button className="logout-btn" onClick={handleLogout}>
                <span className="logout-icon">🚪</span>
                Logout
              </button>
            </>
          )}
          {!sidebarOpen && (
            <button
              className="logout-btn-icon"
              onClick={handleLogout}
              title="Logout"
            >
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Breadcrumb Navigation */}
        <div className="breadcrumb-bar">
          <nav className="breadcrumb">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.path}>
                {index > 0 && <span className="breadcrumb-separator">›</span>}
                {index === breadcrumbs.length - 1 ? (
                  <span className="breadcrumb-current">{crumb.label}</span>
                ) : (
                  <Link to={crumb.path} className="breadcrumb-link">
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button
              className="quick-action-btn"
              title="Search (Ctrl+K)"
              onClick={() => document.getElementById('nav-search')?.focus()}
            >
              🔍
            </button>
            <button
              className="quick-action-btn"
              title="Notifications"
            >
              🔔
            </button>
          </div>
        </div>

        {/* Page Content with Transition */}
        <div className={`content-wrapper ${pageLoading ? 'loading' : 'loaded'}`}>
          {pageLoading && (
            <div className="page-loader">
              <div className="loader-spinner"></div>
            </div>
          )}
          <div className="page-content">
            {children}
          </div>
        </div>
      </main>

      {/* AI Assistant - Global */}
      <AIAssistant />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default EnhancedLayout;
