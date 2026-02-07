/**
 * Dashboard Page
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCompanies, fetchContacts } from '../../store/slices/crmSlice';
import { fetchDeals } from '../../store/slices/salesSlice';
import { fetchDocuments } from '../../store/slices/legalSlice';
import { fetchTransactions } from '../../store/slices/financialSlice';
import Layout from '../../components/common/Layout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { companies, contacts } = useAppSelector((state) => state.crm);
  const { deals } = useAppSelector((state) => state.sales);
  const { documents } = useAppSelector((state) => state.legal);
  const { transactions } = useAppSelector((state) => state.financial);

  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(fetchCompanies()),
          dispatch(fetchContacts()),
          dispatch(fetchDeals()),
          dispatch(fetchDocuments()),
          dispatch(fetchTransactions()),
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  if (loading) {
    return (
      <Layout>
        <Loading message="Loading dashboard..." />
      </Layout>
    );
  }

  const totalPipelineValue = deals.reduce((sum, deal) => sum + Number(deal.value), 0);
  const recentCompanies = companies.slice(0, 5);
  const recentTransactions = transactions.slice(0, 5);

  return (
    <Layout>
      <div className="dashboard">
        <h1>Dashboard</h1>

        <div className="metrics-grid">
          <Card className="metric-card" onClick={() => navigate('/companies')}>
            <div className="metric-icon">🏢</div>
            <div className="metric-value">{companies.length}</div>
            <div className="metric-label">Companies</div>
          </Card>

          <Card className="metric-card" onClick={() => navigate('/contacts')}>
            <div className="metric-icon">👥</div>
            <div className="metric-value">{contacts.length}</div>
            <div className="metric-label">Contacts</div>
          </Card>

          <Card className="metric-card" onClick={() => navigate('/sales')}>
            <div className="metric-icon">💰</div>
            <div className="metric-value">{deals.length}</div>
            <div className="metric-label">Deals</div>
          </Card>

          <Card className="metric-card" onClick={() => navigate('/legal')}>
            <div className="metric-icon">📄</div>
            <div className="metric-value">{documents.length}</div>
            <div className="metric-label">Legal Documents</div>
          </Card>
        </div>

        <div className="dashboard-row">
          <Card title="Pipeline Value" className="pipeline-card">
            <div className="pipeline-value">${totalPipelineValue.toLocaleString()}</div>
            <p className="pipeline-subtitle">Total value of all active deals</p>
          </Card>

          <Card title="Transactions" className="transactions-card">
            <div className="transaction-count">{transactions.length}</div>
            <p className="transactions-subtitle">Total financial transactions</p>
          </Card>
        </div>

        <div className="dashboard-grid">
          <Card title="Recent Companies">
            {recentCompanies.length > 0 ? (
              <ul className="activity-list">
                {recentCompanies.map((company) => (
                  <li key={company.id} className="activity-item">
                    <div className="activity-title">{company.name}</div>
                    <div className="activity-meta">{company.industry || 'N/A'}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">No companies yet</div>
            )}
          </Card>

          <Card title="Recent Transactions">
            {recentTransactions.length > 0 ? (
              <ul className="activity-list">
                {recentTransactions.map((transaction) => (
                  <li key={transaction.id} className="activity-item">
                    <div className="activity-title">{transaction.description}</div>
                    <div
                      className="activity-meta"
                      style={{
                        color: transaction.type === 'credit' ? '#16c79a' : '#e94560',
                      }}
                    >
                      {transaction.type === 'credit' ? '+' : '-'}$
                      {Math.abs(Number(transaction.amount)).toLocaleString()}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">No transactions yet</div>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
