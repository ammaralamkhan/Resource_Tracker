import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { IconX, IconLoader } from '../icons/Icons';
import api from '../../services/api';
import { type IAllocationRequest } from '@shared/allocation';
import { type IResource } from '@shared/resource';

interface AllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AllocationModal({ isOpen, onClose, onSuccess }: AllocationModalProps) {
  const [formData, setFormData] = useState<Partial<IAllocationRequest>>({
    resource_id: '',
    start_time: '',
    end_time: '',
  });
  
  const [resources, setResources] = useState<IResource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch available resources for dropdown
  useEffect(() => {
    if (isOpen) {
      api.get('/resources?status=available')
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
      // Need ISO dates for API
      const payload = {
        ...formData,
        start_time: new Date(formData.start_time as string).toISOString(),
        end_time: new Date(formData.end_time as string).toISOString()
      };
      
      await api.post('/allocations', payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to request allocation');
    } finally {
      setLoading(false);
    }
  }

  // Format datetime-local string
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  const minDate = now.toISOString().slice(0, 16);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request Resource Allocation</h2>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">
            <IconX size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <form id="allocation-form" onSubmit={handleSubmit} className="form-field stagger-children">
            
            <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="alloc-resource">Select Resource</label>
              <select
                id="alloc-resource"
                required
                value={formData.resource_id}
                onChange={(e) => setFormData({ ...formData, resource_id: e.target.value })}
              >
                <option value="">-- Choose an available resource --</option>
                {resources.map(res => (
                  <option key={res.resource_id} value={res.resource_id}>
                    {res.name} ({res.type})
                  </option>
                ))}
              </select>
            </div>



            <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="alloc-start">Start Time</label>
              <input
                id="alloc-start"
                type="datetime-local"
                required
                min={minDate}
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>

            <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="alloc-end">End Time</label>
              <input
                id="alloc-end"
                type="datetime-local"
                required
                min={formData.start_time || minDate}
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
            
          </form>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit" form="allocation-form" disabled={loading}>
            {loading ? <IconLoader size={16} /> : null}
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
}
