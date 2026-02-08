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
import CompanyDetail from './pages/Companies/CompanyDetail';
import Contacts from './pages/Contacts';
import SalesPipeline from './pages/SalesPipeline';
import LegalDocuments from './pages/LegalDocuments';
import Financials from './pages/Financials';
import InvoiceList from './pages/Invoicing/InvoiceList';
import InvoiceForm from './pages/Invoicing/InvoiceForm';
import InvoiceView from './pages/Invoicing/InvoiceView';
import Timesheet from './pages/TimeTracking/Timesheet';
import BillingPackList from './pages/TimeTracking/BillingPackList';
import BillingPackView from './pages/TimeTracking/BillingPackView';
import GenerateBillingPack from './pages/TimeTracking/GenerateBillingPack';
import LightningPath from './pages/LightningPath';
import MatterList from './pages/Matters/MatterList';
import MatterView from './pages/Matters/MatterView';
import MatterForm from './pages/Matters/MatterForm';
import DepartmentManagement from './pages/Settings/DepartmentManagement';
import RoleManagement from './pages/Settings/RoleManagement';
import AuditLogs from './pages/AuditLogs';
import ReportingDashboard from './pages/LegalNexus/ReportingDashboard';
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
              path="/companies/:id"
              element={
                <PrivateRoute>
                  <CompanyDetail />
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
            <Route
              path="/invoicing/invoices"
              element={
                <PrivateRoute>
                  <InvoiceList />
                </PrivateRoute>
              }
            />
            <Route
              path="/invoicing/invoices/new"
              element={
                <PrivateRoute>
                  <InvoiceForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/invoicing/invoices/:id"
              element={
                <PrivateRoute>
                  <InvoiceView />
                </PrivateRoute>
              }
            />
            <Route
              path="/invoicing/invoices/:id/edit"
              element={
                <PrivateRoute>
                  <InvoiceForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/time-tracking/timesheet"
              element={
                <PrivateRoute>
                  <Timesheet />
                </PrivateRoute>
              }
            />
            <Route
              path="/time-tracking/billing-packs"
              element={
                <PrivateRoute>
                  <BillingPackList />
                </PrivateRoute>
              }
            />
            <Route
              path="/time-tracking/billing-packs/new"
              element={
                <PrivateRoute>
                  <GenerateBillingPack />
                </PrivateRoute>
              }
            />
            <Route
              path="/time-tracking/billing-packs/:id"
              element={
                <PrivateRoute>
                  <BillingPackView />
                </PrivateRoute>
              }
            />
            <Route
              path="/lightning-path"
              element={
                <PrivateRoute>
                  <LightningPath />
                </PrivateRoute>
              }
            />
            <Route
              path="/matters"
              element={
                <PrivateRoute>
                  <MatterList />
                </PrivateRoute>
              }
            />
            <Route
              path="/matters/new"
              element={
                <PrivateRoute>
                  <MatterForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/matters/:id"
              element={
                <PrivateRoute>
                  <MatterView />
                </PrivateRoute>
              }
            />
            <Route
              path="/matters/:id/edit"
              element={
                <PrivateRoute>
                  <MatterForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings/departments"
              element={
                <PrivateRoute>
                  <DepartmentManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/settings/roles"
              element={
                <PrivateRoute>
                  <RoleManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <PrivateRoute>
                  <AuditLogs />
                </PrivateRoute>
              }
            />
            <Route
              path="/reporting"
              element={
                <PrivateRoute>
                  <ReportingDashboard />
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
