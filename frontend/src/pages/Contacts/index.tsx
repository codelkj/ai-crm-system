/**
 * Contacts List Page
 */

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchContacts, fetchCompanies } from '../../store/slices/crmSlice';
import Layout from '../../components/common/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Table from '../../components/common/Table';
import Loading from '../../components/common/Loading';
import ContactForm from './ContactForm';
import { Contact } from '../../services/crm.service';
import './Contacts.css';

const Contacts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { contacts, companies, loading } = useAppSelector((state) => state.crm);
  const [showForm, setShowForm] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [companyFilter, setCompanyFilter] = useState<string>('');

  useEffect(() => {
    dispatch(fetchContacts());
    dispatch(fetchCompanies());
  }, [dispatch]);

  const handleEdit = (contact: Contact) => {
    setSelectedContact(contact);
    setShowForm(true);
  };

  const handleCreate = () => {
    setSelectedContact(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedContact(null);
  };

  const handleSuccess = () => {
    dispatch(fetchContacts());
    handleCloseForm();
  };

  const filteredContacts = companyFilter
    ? contacts.filter((c) => c.company_id === companyFilter)
    : contacts;

  const getCompanyName = (companyId: string) => {
    const company = companies.find((c) => c.id === companyId);
    return company?.name || 'N/A';
  };

  const columns = [
    {
      key: 'first_name',
      label: 'Name',
      render: (_: any, row: Contact) => `${row.first_name} ${row.last_name}`,
    },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'position', label: 'Position' },
    {
      key: 'company_id',
      label: 'Company',
      render: (companyId: string) => getCompanyName(companyId),
    },
    {
      key: 'is_primary',
      label: 'Primary',
      render: (isPrimary: boolean) => (isPrimary ? 'Yes' : 'No'),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Contact) => (
        <Button size="small" onClick={() => handleEdit(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Layout>
      <div className="contacts-page">
        <div className="page-header">
          <h1>Contacts</h1>
          <Button onClick={handleCreate}>Add Contact</Button>
        </div>

        <Card>
          <div className="filter-section">
            <label>Filter by Company:</label>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="company-filter"
            >
              <option value="">All Companies</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <Loading message="Loading contacts..." />
          ) : (
            <Table
              data={filteredContacts}
              columns={columns}
              emptyMessage="No contacts found. Create your first contact to get started."
            />
          )}
        </Card>

        {showForm && (
          <ContactForm
            contact={selectedContact}
            onClose={handleCloseForm}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </Layout>
  );
};

export default Contacts;
