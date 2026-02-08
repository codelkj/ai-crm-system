/**
 * Companies List Page
 */

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchCompanies } from '../../store/slices/crmSlice';
import Layout from '../../components/common/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import CompanyForm from './CompanyForm';
import { Company } from '../../services/crm.service';
import './Companies.css';

const Companies: React.FC = () => {
  const dispatch = useAppDispatch();
  const { companies, loading } = useAppSelector((state) => state.crm);
  const [showForm, setShowForm] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    dispatch(fetchCompanies());
  }, [dispatch]);

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedCompany(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedCompany(null);
  };

  const handleSuccess = () => {
    dispatch(fetchCompanies());
    handleCloseForm();
  };

  const handleView = (company: Company) => {
    window.location.href = `/companies/${company.id}`;
  };

  const columns = [
    {
      key: 'name',
      label: 'Company Name',
      render: (_: any, row: Company) => (
        <a
          href={`/companies/${row.id}`}
          style={{ color: '#007bff', textDecoration: 'none', fontWeight: 500 }}
          onClick={(e) => {
            e.preventDefault();
            handleView(row);
          }}
        >
          {row.name}
        </a>
      ),
    },
    { key: 'industry', label: 'Industry' },
    { key: 'website', label: 'Website' },
    { key: 'phone', label: 'Phone' },
    {
      key: 'city',
      label: 'Location',
      render: (_: any, row: Company) => {
        const parts = [row.city, row.state, row.country].filter(Boolean);
        return parts.join(', ') || '-';
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Company) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="small" variant="secondary" onClick={() => handleView(row)}>
            View
          </Button>
          <Button size="small" onClick={() => handleEdit(row)}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Layout>
      <div className="companies-page">
        <div className="page-header">
          <h1>Companies</h1>
          <Button onClick={handleCreate}>Add Company</Button>
        </div>

        <Card>
          {loading ? (
            <Loading message="Loading companies..." />
          ) : (
            <Table
              data={companies}
              columns={columns}
              emptyMessage="No companies found. Create your first company to get started."
            />
          )}
        </Card>

        {showForm && (
          <CompanyForm
            company={selectedCompany}
            onClose={handleCloseForm}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </Layout>
  );
};

export default Companies;
