/**
 * Time Entry Modal Component
 * Create and edit time entries
 */

import React, { useState, useEffect } from 'react';
import { timeEntryService, TimeEntry, CreateTimeEntryDTO } from '../../services/time-tracking.service';
import './TimeEntryModal.css';

interface TimeEntryModalProps {
  entry?: TimeEntry | null;
  onClose: () => void;
  onSuccess: () => void;
}

const TimeEntryModal: React.FC<TimeEntryModalProps> = ({ entry, onClose, onSuccess }) => {
  const isEditMode = !!entry;

  const [formData, setFormData] = useState({
    matter_id: '',
    entry_date: new Date().toISOString().split('T')[0],
    hours: 0,
    minutes: 0,
    hourly_rate: 0,
    description: '',
    billable: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (entry) {
      const hours = Math.floor(entry.duration_minutes / 60);
      const minutes = entry.duration_minutes % 60;

      setFormData({
        matter_id: entry.matter_id || '',
        entry_date: entry.entry_date,
        hours,
        minutes,
        hourly_rate: entry.hourly_rate,
        description: entry.description,
        billable: entry.billable
      });
    }
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const duration_minutes = formData.hours * 60 + formData.minutes;

    if (duration_minutes <= 0) {
      alert('Duration must be greater than 0');
      return;
    }

    if (formData.hourly_rate <= 0) {
      alert('Hourly rate must be greater than 0');
      return;
    }

    if (!formData.description.trim()) {
      alert('Description is required');
      return;
    }

    const data: CreateTimeEntryDTO = {
      matter_id: formData.matter_id || undefined,
      entry_date: formData.entry_date,
      duration_minutes,
      hourly_rate: formData.hourly_rate,
      description: formData.description.trim(),
      billable: formData.billable
    };

    try {
      setSaving(true);
      if (isEditMode) {
        await timeEntryService.update(entry!.id, data);
        alert('Time entry updated');
      } else {
        await timeEntryService.create(data);
        alert('Time entry created');
      }
      onSuccess();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save time entry');
    } finally {
      setSaving(false);
    }
  };

  const calculateAmount = () => {
    const duration_minutes = formData.hours * 60 + formData.minutes;
    const hours = duration_minutes / 60;
    return hours * formData.hourly_rate;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content time-entry-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditMode ? 'Edit Time Entry' : 'New Time Entry'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="entry_date">Date *</label>
              <input
                type="date"
                id="entry_date"
                value={formData.entry_date}
                onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                required
                disabled={saving}
              />
            </div>

            <div className="form-group">
              <label htmlFor="matter_id">Matter (Optional)</label>
              <input
                type="text"
                id="matter_id"
                value={formData.matter_id}
                onChange={(e) => setFormData({ ...formData, matter_id: e.target.value })}
                placeholder="Matter ID"
                disabled={saving}
              />
              <small className="form-hint">Link this time entry to a specific matter</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="hours">Hours *</label>
                <input
                  type="number"
                  id="hours"
                  value={formData.hours}
                  onChange={(e) => setFormData({ ...formData, hours: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="24"
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="minutes">Minutes *</label>
                <input
                  type="number"
                  id="minutes"
                  value={formData.minutes}
                  onChange={(e) => setFormData({ ...formData, minutes: parseInt(e.target.value) || 0 })}
                  min="0"
                  max="59"
                  step="15"
                  required
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="hourly_rate">Hourly Rate (R) *</label>
                <input
                  type="number"
                  id="hourly_rate"
                  value={formData.hourly_rate}
                  onChange={(e) => setFormData({ ...formData, hourly_rate: parseFloat(e.target.value) || 0 })}
                  min="0"
                  step="0.01"
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                placeholder="Describe the work performed..."
                required
                disabled={saving}
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.billable}
                  onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                  disabled={saving}
                />
                <span>Billable</span>
              </label>
              <small className="form-hint">Check if this time should be billed to the client</small>
            </div>

            {/* Preview */}
            <div className="time-entry-preview">
              <div className="preview-row">
                <span className="preview-label">Total Duration:</span>
                <span className="preview-value">
                  {formData.hours}h {formData.minutes}m
                  ({((formData.hours * 60 + formData.minutes) / 60).toFixed(2)} hours)
                </span>
              </div>
              <div className="preview-row">
                <span className="preview-label">Estimated Amount:</span>
                <span className="preview-value amount">
                  R {calculateAmount().toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (isEditMode ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TimeEntryModal;
