// ================================================================
// Settings Page
// ================================================================
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IconSettings, IconLoader } from '../components/icons/Icons';
import api from '../services/api';

export function SettingsPage() {
  const { user, updateLocalUser } = useAuth();

  // Edit Name State
  const [editName, setEditName] = useState(user?.name || '');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  if (!user) return null;

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess('');
    setEditLoading(true);
    try {
      await api.patch('/auth/profile', { name: editName });
      updateLocalUser({ name: editName });
      setEditSuccess('Profile name updated successfully.');
      setTimeout(() => setEditSuccess(''), 3000);
    } catch (err: any) {
      setEditError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');
    
    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match');
      return;
    }

    setPassLoading(true);
    try {
      await api.patch('/auth/password', { oldPassword, newPassword });
      setPassSuccess('Password changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(''), 3000);
    } catch (err: any) {
      setPassError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1><IconSettings size={28} style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: 'var(--space-3)' }} />Account Settings</h1>
          <p>Manage your account settings and update your password.</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 'var(--space-6)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        
        {/* Edit Profile Form */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>Personal Information</h2>
          {editError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{editError}</div>}
          {editSuccess && <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>{editSuccess}</div>}
          
          <form id="edit-form" onSubmit={handleEditProfile} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '500px' }}>
            <div className="form-field">
              <label htmlFor="name">Full Name</label>
              <input id="name" type="text" value={editName} onChange={e => setEditName(e.target.value)} required />
            </div>
            <div>
              <button className="btn btn-primary" type="submit" disabled={editLoading}>
                {editLoading ? <IconLoader size={16} /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card" style={{ padding: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)' }}>Security</h2>
          {passError && <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>{passError}</div>}
          {passSuccess && <div className="alert alert-success" style={{ marginBottom: 'var(--space-4)' }}>{passSuccess}</div>}
          
          <form id="password-form" onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', maxWidth: '500px' }}>
            <div className="form-field">
              <label htmlFor="oldpass">Current Password</label>
              <input id="oldpass" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
            </div>
            <div className="form-field">
              <label htmlFor="newpass">New Password</label>
              <input id="newpass" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} />
            </div>
            <div className="form-field">
              <label htmlFor="confpass">Confirm New Password</label>
              <input id="confpass" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required minLength={8} />
            </div>
            <div>
              <button className="btn btn-primary" type="submit" disabled={passLoading} style={{ background: 'var(--color-danger)', borderColor: 'var(--color-danger)' }}>
                {passLoading ? <IconLoader size={16} /> : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
