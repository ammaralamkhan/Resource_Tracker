import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { IconX, IconLoader } from '../icons/Icons';
import api from '../../services/api';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RoomModal({ isOpen, onClose, onSuccess }: RoomModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    building: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData({ name: '', building: '' });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/rooms', formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Geographic Location</h2>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">
            <IconX size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <form id="room-form" onSubmit={handleSubmit} className="form-field stagger-children">
            
            <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="room-name">Space/Room Identifier</label>
              <input id="room-name" type="text" required placeholder="e.g., Computer Lab 02" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            
            <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="room-building">Building</label>
              <input id="room-building" type="text" required placeholder="e.g., Main Block" value={formData.building} onChange={(e) => setFormData({ ...formData, building: e.target.value })} />
            </div>
            
          </form>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit" form="room-form" disabled={loading}>
            {loading ? <IconLoader size={16} /> : null}
            Establish Location
          </button>
        </div>
      </div>
    </div>
  );
}
