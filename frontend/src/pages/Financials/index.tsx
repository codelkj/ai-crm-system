/**
 * Financials Page
 */

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTransactions, fetchAccounts, fetchCategories } from '../../store/slices/financialSlice';
import Layout from '../../components/common/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import TransactionForm from './TransactionForm';
import CSVUpload from './CSVUpload';
import ProjectionChart from './ProjectionChart';
import AIInsights from '../../components/financial/AIInsights';
import SeasonalPatterns from '../../components/financial/SeasonalPatterns';
import { Transaction } from '../../services/financial.service';
import { format } from 'date-fns';
import './Financials.css';

const Financials: React.FC = () => {
  const dispatch = useAppDispatch();
  const { transactions, accounts, categories, loading } = useAppSelector(
    (state) => state.financial
  );
  const [showForm, setShowForm] = useState(false);
  const [showCSVUpload, setShowCSVUpload] = useState(false);
  const [showProjections, setShowProjections] = useState(false);
  const [accountFilter, setAccountFilter] = useState<string>('');

  useEffect(() => {
    dispatch(fetchTransactions());
    dispatch(fetchAccounts());
    dispatch(fetchCategories());
  }, [dispatch]);

  const handleSuccess = () => {
    dispatch(fetchTransactions());
    setShowForm(false);
  };

  const handleCSVSuccess = () => {
    dispatch(fetchTransactions());
    setShowCSVUpload(false);
  };

  const filteredTransactions = accountFilter
    ? transactions.filter((t) => t.account_id === accountFilter)
    : transactions;

  const getAccountName = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    return account?.account_name || 'N/A';
  };

  const getCategoryName = (categoryId?: string) => {
    if (!categoryId) return '-';
    const category = categories.find((c) => c.id === categoryId);
    return category?.name || '-';
  };

  const columns = [
    {
      key: 'date',
      label: 'Date',
      render: (date: string) => date ? format(new Date(date), 'MMM dd, yyyy') : '-',
    },
    { key: 'description', label: 'Description' },
    {
      key: 'account_id',
      label: 'Account',
      render: (accountId: string) => getAccountName(accountId),
    },
    {
      key: 'category_id',
      label: 'Category',
      render: (categoryId?: string, row?: Transaction) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{getCategoryName(categoryId)}</span>
          {row?.ai_confidence && (
            <span
              style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 600,
                background:
                  row.ai_confidence >= 0.9
                    ? '#e8f5e9'
                    : row.ai_confidence >= 0.8
                    ? '#fff3e0'
                    : '#ffebee',
                color:
                  row.ai_confidence >= 0.9
                    ? '#2e7d32'
                    : row.ai_confidence >= 0.8
                    ? '#ef6c00'
                    : '#c62828',
              }}
              title={`AI Confidence: ${(row.ai_confidence * 100).toFixed(0)}%`}
            >
              🤖 {(row.ai_confidence * 100).toFixed(0)}%
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      render: (type: string) => (
        <span
          style={{
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 500,
            background: type === 'credit' ? '#e8f5e9' : '#ffebee',
            color: type === 'credit' ? '#2e7d32' : '#c62828',
          }}
        >
          {type}
        </span>
      ),
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (amount: number, row: Transaction) => (
        <span
          style={{
            fontWeight: 600,
            color: row.type === 'credit' ? '#16c79a' : '#e94560',
          }}
        >
          {row.type === 'credit' ? '+' : '-'}${Math.abs(amount).toLocaleString()}
        </span>
      ),
    },
  ];

  // Calculate balance from all transactions (not just filtered)
  const totalBalance = transactions
    .reduce((sum, t) => sum + (t.type === 'credit' ? Number(t.amount) : -Number(t.amount)), 0);
  const totalIncome = filteredTransactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const totalExpenses = filteredTransactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <Layout>
      <div className="financials-page">
        <div className="page-header">
          <h1>Financials</h1>
          <div className="header-actions">
            <Button variant="secondary" onClick={() => setShowProjections(!showProjections)}>
              {showProjections ? 'Hide' : 'Show'} Projections
            </Button>
            <Button variant="secondary" onClick={() => setShowCSVUpload(true)}>
              Import CSV
            </Button>
            <Button onClick={() => setShowForm(true)}>Add Transaction</Button>
          </div>
        </div>

        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-label">Total Balance</div>
            <div className="stat-value">${totalBalance.toLocaleString()}</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-label">Total Income</div>
            <div className="stat-value income">${totalIncome.toLocaleString()}</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-label">Total Expenses</div>
            <div className="stat-value expense">${totalExpenses.toLocaleString()}</div>
          </Card>
          <Card className="stat-card">
            <div className="stat-label">Net</div>
            <div className="stat-value">
              ${(totalIncome - totalExpenses).toLocaleString()}
            </div>
          </Card>
        </div>

        {showProjections && (
          <>
            <ProjectionChart />
            <SeasonalPatterns />
          </>
        )}

        {/* AI Insights */}
        <AIInsights transactions={transactions} categories={categories} />

        <Card title="Transactions">
          <div className="filter-section">
            <label>Filter by Account:</label>
            <select
              value={accountFilter}
              onChange={(e) => setAccountFilter(e.target.value)}
              className="account-filter"
            >
              <option value="">All Accounts</option>
              {accounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.account_name} - {account.bank_name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <Loading message="Loading transactions..." />
          ) : (
            <Table
              data={filteredTransactions}
              columns={columns}
              emptyMessage="No transactions found. Add your first transaction to get started."
            />
          )}
        </Card>

        {showForm && (
          <TransactionForm onClose={() => setShowForm(false)} onSuccess={handleSuccess} />
        )}

        {showCSVUpload && (
          <CSVUpload
            onClose={() => setShowCSVUpload(false)}
            onSuccess={handleCSVSuccess}
          />
        )}
      </div>
    </Layout>
  );
};

export default Financials;
