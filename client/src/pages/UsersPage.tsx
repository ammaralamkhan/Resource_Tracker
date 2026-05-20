// ================================================================
// Users Page
// ================================================================
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../services/api';
import { IconPlus, IconUsers, IconLoader, IconAlertTriangle } from '../components/icons/Icons';
import UserModal from '../components/users/UserModal';
import { useAuth } from '../contexts/AuthContext';
import { useRBAC } from '../hooks/useRBAC';

export function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { isAdmin } = useRBAC();
  const { user: currentUser } = useAuth();
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);

  // Password reset requests
  const [resetRequests, setResetRequests] = useState<any[]>([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      // Filter out inactive users so they appear "deleted" in the UI
      setUsers(data.data.filter((u: any) => u.is_active !== false));
    } catch (err: any) {
      if (err.response?.status !== 401) {
          setError('Could not load user data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    if (isAdmin) fetchResetRequests();
  }, []);

  const fetchResetRequests = async () => {
    try {
      const { data } = await api.get('/auth/reset-requests');
      setResetRequests(data.data || []);
    } catch {
      // silently fail
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to deactivate/delete this user?")) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to delete user.');
      }
    }
  };

  const handleResetPassword = async (id: string, name: string, requestId?: string) => {
    if (window.confirm(`⚠️ VERIFY IDENTITY FIRST!\n\nMake sure you have confirmed this person's identity (in-person, phone, or official email) before resetting.\n\nReset password for "${name}"?`)) {
      try {
        const { data } = await api.post(`/users/${id}/reset-password`);
        // If it came from a reset request, resolve it
        if (requestId) {
          await api.patch(`/auth/reset-requests/${requestId}`, { status: 'resolved' });
          fetchResetRequests();
        }
        alert(`✅ Password for "${name}" has been reset.\n\n🔑 Temporary Password: ${data.tempPassword}\n\nShare this with the user securely. They must change it immediately in Settings.`);
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to reset password.');
      }
    }
  };

  const filteredUsers = users.filter(u => {
    if (activeTab === 'all') return true;
    if (activeTab === 'faculty') return u.role === 'faculty';
    if (activeTab === 'students') return u.role === 'student';
    if (activeTab === 'staff') return u.role === 'staff';
    if (activeTab === 'administrators') return u.role === 'admin' || u.role === 'chairman';
    return true;
  });

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Identity & Access Matrix</h1>
          <p>Control user provisioning and role-based permissions.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus size={16} /> Register Internal User
          </button>
        </div>
      </div>

      {/* Password Reset Requests Banner */}
      {isAdmin && resetRequests.length > 0 && (
        <div className="card" style={{ 
          padding: 'var(--space-4) var(--space-5)', 
          marginBottom: 'var(--space-5)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          background: 'rgba(251, 191, 36, 0.05)',
          borderRadius: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <IconAlertTriangle size={18} />
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>
              Password Reset Requests ({resetRequests.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {resetRequests.map((req: any) => {
              const matchedUser = users.find(u => u.email === req.email);
              return (
                <div key={req.request_id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--color-bg-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)'
                }}>
                  <div>
                    <span style={{ fontWeight: 500 }}>{req.user_name}</span>
                    <span style={{ color: 'var(--color-text-muted)', marginLeft: 'var(--space-2)', fontSize: '0.85rem' }}>
                      ({req.email})
                    </span>
                    <span style={{ color: 'var(--color-text-muted)', marginLeft: 'var(--space-3)', fontSize: '0.8rem' }}>
                      {format(new Date(req.created_at), 'MMM d, h:mm a')}
                    </span>
                  </div>
                  {matchedUser && (
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleResetPassword(matchedUser.user_id, matchedUser.name, req.request_id)}
                    >
                      Reset Password
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ borderBottom: '1px solid var(--color-border)', marginBottom: 'var(--space-6)', display: 'flex', gap: 'var(--space-6)', padding: '0 var(--space-4)' }}>
        {['all', 'faculty', 'students', 'staff', 'administrators'].map(tab => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab)}
             style={{
               background: 'none',
               border: 'none',
               borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
               color: activeTab === tab ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
               padding: 'var(--space-3) var(--space-2)',
               fontWeight: activeTab === tab ? 600 : 500,
               textTransform: 'capitalize',
               cursor: 'pointer',
               transition: 'all 0.2s ease',
               fontSize: '0.95rem'
             }}
           >
             {tab === 'administrators' ? 'Administrators' : tab}
             <span style={{ 
               marginLeft: '8px', 
               background: activeTab === tab ? 'var(--color-primary)' : 'var(--color-bg)', 
               color: activeTab === tab ? 'white' : 'var(--color-text-muted)', 
               padding: '2px 8px', 
               borderRadius: '12px', 
               fontSize: '0.75rem' 
             }}>
               {users.filter(u => tab === 'all' ? true : tab === 'administrators' ? (u.role === 'admin' || u.role === 'chairman') : u.role === tab.replace(/s$/, '') || u.role === tab).length}
             </span>
           </button>
        ))}
      </div>

      <div className="data-table-wrapper">
        {loading ? (
          <div style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
            <IconLoader size={32} />
          </div>
        ) : error ? (
           <div className="empty-state">
             <div className="empty-state-icon"><IconUsers size={48} /></div>
             <h3>Connection Error</h3>
             <p>{error}</p>
           </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Identity</th>
                <th>Role Tier</th>
                <th>Status</th>
                <th>Join Date</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.user_id}>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                       <span style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{u.name}</span>
                       <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>{u.email}</span>
                    </div>
                  </td>
                  <td>
                    <span 
                        className={`badge badge-${
                           u.role === 'chairman' ? 'success' : 
                           u.role === 'admin' ? 'info' : 
                           u.role === 'faculty' ? 'available' : 
                           u.role === 'staff' ? 'warning' : 'primary'
                        }`}
                        style={{ textTransform: 'uppercase' }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                      <span className="badge badge-success">Active</span>
                  </td>
                  <td>{format(new Date(u.created_at), 'MMM d, yyyy')}</td>
                  {isAdmin && (
                    <td style={{ display: 'flex', gap: 'var(--space-2)' }}>
                      <button 
                         className="btn btn-sm btn-ghost" 
                         style={{ color: 'var(--color-warning)' }}
                         disabled={u.user_id === currentUser?.user_id}
                         onClick={() => handleResetPassword(u.user_id, u.name)}
                      >
                        Reset Pass
                      </button>
                      <button 
                         className="btn btn-sm btn-ghost" 
                         style={{ color: 'var(--color-danger)' }}
                         disabled={u.user_id === currentUser?.user_id || u.role === 'chairman'}
                         onClick={() => handleDelete(u.user_id)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <UserModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchUsers}
      />
    </div>
  );
}
