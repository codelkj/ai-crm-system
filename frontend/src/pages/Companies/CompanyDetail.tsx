/**
 * Company Detail Page
 * View company details with related contacts, matters, and documents
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import Card from '../../components/common/Card';
import Loading from '../../components/common/Loading';
import Button from '../../components/common/Button';
import { crmService, Company } from '../../services/crm.service';
import './CompanyDetail.css';

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [matters, setMatters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadCompanyDetails();
    }
  }, [id]);

  const loadCompanyDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);

      // Load company details
      const companyResponse = await crmService.getCompanyById(id);
      setCompany(companyResponse.data);

      // Load related contacts (from CRM service - need to add this endpoint)
      // For now, we'll skip this until we add the endpoint

    } catch (error) {
      console.error('Failed to load company details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="company-detail-loading">
          <Loading message="Loading company details..." />
        </div>
      </Layout>
    );
  }

  if (!company) {
    return (
      <Layout>
        <div className="company-detail-error">
          <h2>Company not found</h2>
          <Button onClick={() => navigate('/companies')}>Back to Companies</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="company-detail-page">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb">
          <Link to="/dashboard">Dashboard</Link>
          <span className="breadcrumb-separator">›</span>
          <Link to="/companies">Companies</Link>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{company.name}</span>
        </nav>

        {/* Header */}
        <div className="page-header">
          <div>
            <h1>{company.name}</h1>
            {company.industry && <p className="company-industry">{company.industry}</p>}
          </div>
          <div className="header-actions">
            <Button variant="secondary" onClick={() => navigate('/companies')}>
              ← Back
            </Button>
            <Button onClick={() => navigate(`/companies/${id}/edit`)}>
              Edit Company
            </Button>
          </div>
        </div>

        {/* Company Info */}
        <Card title="Company Information">
          <div className="company-info-grid">
            {company.website && (
              <div className="info-item">
                <label>Website</label>
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  {company.website}
                </a>
              </div>
            )}
            {company.phone && (
              <div className="info-item">
                <label>Phone</label>
                <span>{company.phone}</span>
              </div>
            )}
            {company.email && (
              <div className="info-item">
                <label>Email</label>
                <a href={`mailto:${company.email}`}>{company.email}</a>
              </div>
            )}
            {(company.city || company.country) && (
              <div className="info-item">
                <label>Location</label>
                <span>
                  {[company.city, company.state, company.country].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
            {company.primary_director_name && (
              <div className="info-item">
                <label>Primary Director</label>
                <span>{company.primary_director_name}</span>
              </div>
            )}
            {company.department_name && (
              <div className="info-item">
                <label>Department</label>
                <span>{company.department_name}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Links */}
        <div className="quick-links">
          <Card title="Related Information">
            <div className="link-grid">
              <Link to={`/contacts?company_id=${id}`} className="link-card">
                <div className="link-icon">👥</div>
                <div className="link-content">
                  <h3>Contacts</h3>
                  <p>View all contacts for this company</p>
                </div>
              </Link>

              <Link to={`/matters?company_id=${id}`} className="link-card">
                <div className="link-icon">📁</div>
                <div className="link-content">
                  <h3>Matters</h3>
                  <p>View legal matters for this client</p>
                </div>
              </Link>

              <Link to={`/documents?company_id=${id}`} className="link-card">
                <div className="link-icon">📄</div>
                <div className="link-content">
                  <h3>Documents</h3>
                  <p>View documents for this company</p>
                </div>
              </Link>

              <Link to={`/invoicing?company_id=${id}`} className="link-card">
                <div className="link-icon">📋</div>
                <div className="link-content">
                  <h3>Invoices</h3>
                  <p>View billing and invoices</p>
                </div>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default CompanyDetail;
