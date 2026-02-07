/**
 * Main Application Component
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';

// Components
import PrivateRoute from './components/common/PrivateRoute';

// Pages
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import Contacts from './pages/Contacts';
import SalesPipeline from './pages/SalesPipeline';
import LegalDocuments from './pages/LegalDocuments';
import Financials from './pages/Financials';
import Login from './pages/Login';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/companies"
              element={
                <PrivateRoute>
                  <Companies />
                </PrivateRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <PrivateRoute>
                  <Contacts />
                </PrivateRoute>
              }
            />
            <Route
              path="/sales"
              element={
                <PrivateRoute>
                  <SalesPipeline />
                </PrivateRoute>
              }
            />
            <Route
              path="/legal"
              element={
                <PrivateRoute>
                  <LegalDocuments />
                </PrivateRoute>
              }
            />
            <Route
              path="/financials"
              element={
                <PrivateRoute>
                  <Financials />
                </PrivateRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
