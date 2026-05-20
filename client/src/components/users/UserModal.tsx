import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { IconX, IconLoader } from '../icons/Icons';
import api from '../../services/api';
export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  role_id: number;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserModal({ isOpen, onClose, onSuccess }: UserModalProps) {
  const [formData, setFormData] = useState<RegisterData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    role_id: 1, // Student 1, Staff 2, Faculty 3, Admin 4
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill form
  useEffect(() => {
    if (isOpen) {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        role_id: 1,
      });
      setError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: `${formData.first_name} ${formData.last_name}`.trim(),
        email: formData.email,
        password: formData.password,
        role: formData.role_id === 1 ? 'student' : formData.role_id === 2 ? 'staff' : formData.role_id === 3 ? 'faculty' : 'admin'
      };
      await api.post('/auth/register', payload);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create User Profile</h2>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">
            <IconX size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <form id="user-form" onSubmit={handleSubmit} className="form-field stagger-children">
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div className="form-field">
                <label htmlFor="usr-fn">First Name</label>
                <input id="usr-fn" type="text" required value={formData.first_name} onChange={(e) => setFormData({ ...formData, first_name: e.target.value })} />
              </div>
              <div className="form-field">
                <label htmlFor="usr-ln">Last Name</label>
                <input id="usr-ln" type="text" required value={formData.last_name} onChange={(e) => setFormData({ ...formData, last_name: e.target.value })} />
              </div>
            </div>

            <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="usr-email">Email Address</label>
              <input id="usr-email" type="email" required placeholder="name@cs.amu.ac.in" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            
            <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="usr-pass">Initial Password</label>
              <input id="usr-pass" type="text" required placeholder="min 8 characters" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
            </div>

            <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="usr-role">Access Authorization Tier</label>
              <select id="usr-role" required value={formData.role_id} onChange={(e) => setFormData({ ...formData, role_id: parseInt(e.target.value) })}>
                <option value={1}>Tier 1: Student</option>
                <option value={2}>Tier 2: Technical Staff</option>
                <option value={3}>Tier 3: Faculty Member</option>
                <option value={4}>Tier 4: System Administrator</option>
              </select>
            </div>
            
          </form>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-primary" type="submit" form="user-form" disabled={loading}>
            {loading ? <IconLoader size={16} /> : null}
            Provision User
          </button>
        </div>
      </div>
    </div>
  );
}
