/**
 * Generate Billing Pack Wizard
 * Step-by-step wizard for creating billing packs
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/common/Layout';
import { billingPackService, timeEntryService, TimeEntry } from '../../services/time-tracking.service';
import { matterService } from '../../services/matter.service';
import './GenerateBillingPack.css';

interface Company {
  id: string;
  name: string;
}

const GenerateBillingPack: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [clients, setClients] = useState<Company[]>([]);
  const [formData, setFormData] = useState({
    client_id: '',
    period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    period_end: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [unbilledEntries, setUnbilledEntries] = useState<TimeEntry[]>([]);
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      // Load companies that have matters (potential clients)
      const response = await matterService.getAll({ limit: 1000 });
      const matters = response.data;

      // Get unique clients
      const uniqueClients = Array.from(
        new Map(
          matters
            .filter((m: any) => m.client_name)
            .map((m: any) => [m.company_id, { id: m.company_id, name: m.client_name }])
        ).values()
      );

      setClients(uniqueClients);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const loadUnbilledEntries = async () => {
    if (!formData.client_id) return;

    setLoading(true);
    try {
      const response = await timeEntryService.getAll({
        start_date: formData.period_start,
        end_date: formData.period_end,
        billable: true,
        billed: false,
        approved: true,
        limit: 1000
      });

      // Filter by client (matter's company_id)
      // Note: This would need backend support to filter by company_id
      // For now, we show all unbilled entries
      setUnbilledEntries(response.data);
      setSelectedEntries(response.data.map((e: TimeEntry) => e.id));
    } catch (error) {
      console.error('Failed to load unbilled entries:', error);
      alert('Failed to load unbilled entries');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!formData.client_id || !formData.period_start || !formData.period_end) {
        alert('Please fill in all required fields');
        return;
      }
      loadUnbilledEntries();
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleToggleEntry = (entryId: string) => {
    if (selectedEntries.includes(entryId)) {
      setSelectedEntries(selectedEntries.filter(id => id !== entryId));
    } else {
      setSelectedEntries([...selectedEntries, entryId]);
    }
  };

  const handleGenerate = async () => {
    if (selectedEntries.length === 0) {
      alert('Please select at least one time entry');
      return;
    }

    setGenerating(true);
    try {
      const response = await billingPackService.generate(formData);
      alert('Billing pack generated successfully!');
      navigate(`/time-tracking/billing-packs/${response.data.id}`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to generate billing pack');
    } finally {
      setGenerating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `R ${parseFloat(amount.toString()).toFixed(2)}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-ZA');
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getSelectedTotal = () => {
    return unbilledEntries
      .filter(e => selectedEntries.includes(e.id))
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const getSelectedHours = () => {
    return unbilledEntries
      .filter(e => selectedEntries.includes(e.id))
      .reduce((sum, e) => sum + e.duration_minutes, 0) / 60;
  };

  return (
    <Layout>
      <div className="generate-billing-pack">
        {/* Header */}
        <div className="wizard-header">
          <button className="btn-back" onClick={() => navigate('/time-tracking/billing-packs')}>
            ← Back to Billing Packs
          </button>
          <h1>Generate Billing Pack</h1>
          <div className="wizard-steps">
            <div className={`wizard-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Select Period</div>
            </div>
            <div className="wizard-connector"></div>
            <div className={`wizard-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Preview Entries</div>
            </div>
            <div className="wizard-connector"></div>
            <div className={`wizard-step ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Confirm</div>
            </div>
          </div>
        </div>

        {/* Step 1: Select Period */}
        {step === 1 && (
          <div className="wizard-content">
            <div className="wizard-card">
              <h2>Billing Period Details</h2>
              <div className="form-grid">
                <div className="form-group">
                  <label>Client *</label>
                  <select
                    value={formData.client_id}
                    onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                    required
                  >
                    <option value="">Select a client...</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Period Start *</label>
                  <input
                    type="date"
                    value={formData.period_start}
                    onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Period End *</label>
                  <input
                    type="date"
                    value={formData.period_end}
                    onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Notes (Optional)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    placeholder="Add any notes or special instructions..."
                  />
                </div>
              </div>

              <div className="wizard-actions">
                <button className="btn btn-primary" onClick={handleNext}>
                  Next: Preview Entries →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Preview Entries */}
        {step === 2 && (
          <div className="wizard-content">
            <div className="wizard-card">
              <h2>Unbilled Time Entries</h2>
              <p className="wizard-description">
                Review and select the time entries to include in this billing pack.
                Only approved, billable, and unbilled entries are shown.
              </p>

              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading unbilled entries...</p>
                </div>
              ) : unbilledEntries.length === 0 ? (
                <div className="empty-state">
                  <p>No unbilled entries found for the selected period</p>
                </div>
              ) : (
                <>
                  <div className="selection-summary">
                    <span>
                      {selectedEntries.length} of {unbilledEntries.length} entries selected
                    </span>
                    <span>
                      {getSelectedHours().toFixed(2)} hours • {formatCurrency(getSelectedTotal())}
                    </span>
                  </div>

                  <div className="entries-table-container">
                    <table className="entries-table">
                      <thead>
                        <tr>
                          <th>
                            <input
                              type="checkbox"
                              checked={selectedEntries.length === unbilledEntries.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedEntries(unbilledEntries.map(entry => entry.id));
                                } else {
                                  setSelectedEntries([]);
                                }
                              }}
                            />
                          </th>
                          <th>Date</th>
                          <th>Matter</th>
                          <th>User</th>
                          <th>Description</th>
                          <th>Duration</th>
                          <th>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unbilledEntries.map((entry) => (
                          <tr
                            key={entry.id}
                            className={selectedEntries.includes(entry.id) ? 'selected' : ''}
                          >
                            <td>
                              <input
                                type="checkbox"
                                checked={selectedEntries.includes(entry.id)}
                                onChange={() => handleToggleEntry(entry.id)}
                              />
                            </td>
                            <td className="date-cell">{formatDate(entry.entry_date)}</td>
                            <td className="matter-cell">{entry.matter_name || '—'}</td>
                            <td className="user-cell">{entry.user_name || '—'}</td>
                            <td className="description-cell">{entry.description}</td>
                            <td className="duration-cell">{formatDuration(entry.duration_minutes)}</td>
                            <td className="amount-cell">{formatCurrency(entry.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              <div className="wizard-actions">
                <button className="btn btn-secondary" onClick={handleBack}>
                  ← Back
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleNext}
                  disabled={selectedEntries.length === 0}
                >
                  Next: Confirm →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="wizard-content">
            <div className="wizard-card">
              <h2>Confirm Billing Pack</h2>
              <p className="wizard-description">
                Please review the details before generating the billing pack.
              </p>

              <div className="confirmation-summary">
                <div className="summary-section">
                  <h3>Billing Period</h3>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <label>Client:</label>
                      <span>
                        {clients.find(c => c.id === formData.client_id)?.name}
                      </span>
                    </div>
                    <div className="summary-item">
                      <label>Period:</label>
                      <span>
                        {formatDate(formData.period_start)} - {formatDate(formData.period_end)}
                      </span>
                    </div>
                    {formData.notes && (
                      <div className="summary-item full-width">
                        <label>Notes:</label>
                        <p>{formData.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="summary-section">
                  <h3>Totals</h3>
                  <div className="totals-grid">
                    <div className="total-card">
                      <div className="total-label">Time Entries</div>
                      <div className="total-value">{selectedEntries.length}</div>
                    </div>
                    <div className="total-card">
                      <div className="total-label">Total Hours</div>
                      <div className="total-value">{getSelectedHours().toFixed(2)}h</div>
                    </div>
                    <div className="total-card highlight">
                      <div className="total-label">Total Amount</div>
                      <div className="total-value">{formatCurrency(getSelectedTotal())}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="wizard-actions">
                <button className="btn btn-secondary" onClick={handleBack}>
                  ← Back
                </button>
                <button
                  className="btn btn-success"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate Billing Pack'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GenerateBillingPack;
