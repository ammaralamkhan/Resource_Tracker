import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { IconX, IconLoader } from '../icons/Icons';
import api from '../../services/api';
import { type IMaintenanceReport } from '@shared/maintenance';
import { type IResource } from '@shared/resource';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MaintenanceModal({ isOpen, onClose, onSuccess }: MaintenanceModalProps) {
  const [formData, setFormData] = useState<Partial<IMaintenanceReport>>({
    resource_id: '',
    issue: '',
    priority: 'low',
  });
  
  const [resources, setResources] = useState<IResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.get('/resources')
        .then(res => setResources(res.data.data))
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/maintenance', formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Report Maintenance Issue</h2>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">
            <IconX size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <form id="maintenance-form" onSubmit={handleSubmit} className="form-field stagger-children">
            
            <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="maint-resource">Resource Payload</label>
              <select
                id="maint-resource"
                required
                value={formData.resource_id}
                onChange={(e) => setFormData({ ...formData, resource_id: e.target.value })}
              >
                <option value="">-- Identify the broken resource --</option>
                {resources.map(res => (
                  <option key={res.resource_id} value={res.resource_id}>
                    {res.name} (Current Status: {res.status.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="maint-priority">Priority</label>
              <select
                id="maint-priority"
                required
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
              >
                <option value="low">Low - Routine issue</option>
                <option value="medium">Medium - Partially degraded</option>
                <option value="high">High - Completely unusable</option>
                <option value="critical">Critical - Blocking operations</option>
              </select>
            </div>

            <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="maint-desc">Full Description</label>
              <textarea
                id="maint-desc"
                required
                rows={4}
                value={formData.issue}
                onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                placeholder="Describe exactly what's wrong with the device..."
              />
            </div>
            
          </form>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit" form="maintenance-form" disabled={loading}>
            {loading ? <IconLoader size={16} /> : null}
            Submit Report
          </button>
        </div>
      </div>
    </div>
  );
}
