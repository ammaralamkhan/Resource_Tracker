// ================================================================
// Maintenance Page
// ================================================================
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../services/api';
import { type IMaintenance, type MaintenanceStatus } from '@shared/maintenance';
import { useSocketEvent } from '../hooks/useSocketEvent';
import { useRBAC } from '../hooks/useRBAC';
import { SOCKET_EVENTS } from '@shared/socket-events';
import { IconPlus, IconWrench, IconLoader, IconCheck, IconSettings } from '../components/icons/Icons';
import MaintenanceModal from '../components/maintenance/MaintenanceModal';

export function MaintenancePage() {
  const { isStaff, isAdmin } = useRBAC();
  const [tickets, setTickets] = useState<IMaintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'all' | 'open'>('open');

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/maintenance');
      setTickets(data.data);
    } catch (err: any) {
      if (err.response?.status !== 401) {
          setError('Could not load maintenance data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Listen to ticket updates
  useSocketEvent<{ maintenanceId: string, status: string }>(
    SOCKET_EVENTS.MAINTENANCE_STATUS_CHANGE,
    (payload) => {
      setTickets(prev => prev.map(t => 
        t.maintenance_id === payload.maintenanceId
          ? { ...t, status: payload.status as any }
          : t
      ));
    }
  );

  // Listen to new tickets
  useSocketEvent<{ maintenanceId: string }>(
    SOCKET_EVENTS.MAINTENANCE_NEW_TICKET,
    () => {
       if (isStaff || isAdmin) fetchTickets(); // Refetch to show new request
    }
  );

  const handleStatusChange = async (id: string, newStatus: MaintenanceStatus) => {
    try {
      await api.patch(`/maintenance/${id}`, { status: newStatus });
      fetchTickets();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filtered = tickets.filter(t => {
    if (activeTab === 'open' && t.status === 'resolved') return false;
    if (activeTab === 'open' && t.status === 'closed') return false;
    return true;
  });

  return (
    <>
      <div className="animate-fade-in-up">
        <div className="page-header">
        <div className="page-header-left">
          <h1>Maintenance Desk</h1>
          <p>Track hardware failures, report issues, and monitor repairs.</p>
        </div>
        <div className="page-header-actions">
          {/* Faculty/Staff/Admin can trigger */}
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus size={16} /> Report Issue
          </button>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'open' ? 'active' : ''}`}
          onClick={() => setActiveTab('open')}
        >
          Open Tickets
        </button>
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Tickets
        </button>
      </div>

      <div className="data-table-wrapper">
        {loading ? (
          <div style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
             <IconLoader size={32} />
          </div>
        ) : error ? (
           <div className="empty-state">
             <div className="empty-state-icon"><IconWrench size={48} /></div>
             <h3>Connection Error</h3>
             <p>{error}</p>
           </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconWrench size={48} /></div>
            <h3>No tickets found</h3>
            <p>Perfect! There are no maintenance issues requiring attention.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Issue</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Reported On</th>
                <th>Assigned To</th>
                {(isStaff || isAdmin) && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(t => (
                <tr key={t.maintenance_id}>
                  <td style={{ fontWeight: 500 }}>{t.resource_name}</td>
                  <td style={{ maxWidth: '300px' }} className="truncate" title={t.issue}>{t.issue}</td>
                  <td>
                    <span className={`badge badge-${t.priority}`}>
                      {t.priority}
                    </span>
                  </td>
                  <td>
                     <span className={`badge badge-${t.status}`}>
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{format(new Date(t.created_at), 'MMM d, h:mm a')}</td>
                  <td>{t.assigned_to_name || <span className="text-muted">Unassigned</span>}</td>
                  {(isStaff || isAdmin) && (
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        {t.status === 'reported' && (
                          <button 
                            className="btn btn-sm btn-primary" 
                            title="Start Work"
                            onClick={() => handleStatusChange(t.maintenance_id, 'in_progress')}
                          >
                            <IconSettings size={14} /> Start
                          </button>
                        )}
                        {t.status === 'in_progress' && (
                          <button 
                            className="btn btn-sm btn-success" 
                            title="Mark Resolved"
                            onClick={() => handleStatusChange(t.maintenance_id, 'resolved')}
                          >
                            <IconCheck size={14} /> Resolve
                          </button>
                        )}
                        {isAdmin && t.status === 'resolved' && (
                           <button 
                             className="btn btn-sm btn-secondary" 
                             onClick={() => handleStatusChange(t.maintenance_id, 'closed')}
                           >
                              Close File
                           </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>

      <MaintenanceModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchTickets}
      />
    </>
  );
}
