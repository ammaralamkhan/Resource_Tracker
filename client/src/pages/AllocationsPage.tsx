// ================================================================
// Allocations Page
// ================================================================
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../services/api';
import { type IAllocation, type AllocationStatus } from '@shared/allocation';
import { useSocketEvent } from '../hooks/useSocketEvent';
import { useRBAC } from '../hooks/useRBAC';
import { SOCKET_EVENTS } from '@shared/socket-events';
import { IconPlus, IconCalendar, IconLoader, IconCheck, IconX } from '../components/icons/Icons';
import AllocationModal from '../components/allocations/AllocationModal';

export function AllocationsPage() {
  const { isAdmin } = useRBAC();
  const [allocations, setAllocations] = useState<IAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/allocations');
      setAllocations(data.data);
    } catch (err: any) {
      if (err.response?.status !== 401) {
          setError('Could not load allocation data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllocations();
  }, []);

  // Listen to allocation updates
  useSocketEvent<{ allocationId: string, status: string }>(
    SOCKET_EVENTS.ALLOCATION_STATUS_CHANGE,
    (payload) => {
      setAllocations(prev => prev.map(alloc => 
        alloc.allocation_id === payload.allocationId
          ? { ...alloc, status: payload.status as any }
          : alloc
      ));
    }
  );

  // Listen to new requests (admins)
  useSocketEvent<{ allocationId: string }>(
    SOCKET_EVENTS.ALLOCATION_NEW_REQUEST,
    () => {
       if (isAdmin) fetchAllocations(); // Refetch to show new request
    }
  );

  const handleStatusChange = async (id: string, newStatus: AllocationStatus) => {
    try {
      await api.patch(`/allocations/${id}`, { status: newStatus });
      fetchAllocations();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filtered = allocations.filter(a => {
    if (activeTab === 'pending' && a.status !== 'pending') return false;
    return true;
  });

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Allocations</h1>
          <p>Request and manage access to department resources.</p>
        </div>
        <div className="page-header-actions">
          {/* Faculty/Staff/Admin can request */}
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <IconPlus size={16} /> New Request
          </button>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Allocations
        </button>
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Review
        </button>
      </div>

      <div className="data-table-wrapper">
        {loading ? (
          <div style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
            <IconLoader size={32} />
          </div>
        ) : error ? (
           <div className="empty-state">
             <div className="empty-state-icon"><IconCalendar size={48} /></div>
             <h3>Connection Error</h3>
             <p>{error}</p>
           </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconCalendar size={48} /></div>
            <h3>No allocations found</h3>
            <p>There are no resource requests matching your criteria.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Resource</th>
                <th>Requested By</th>
                <th>Timeframe</th>
                <th>Status</th>
                {isAdmin && <th>Approvals</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map(alloc => (
                <tr key={alloc.allocation_id}>
                  <td style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{alloc.resource_name}</td>
                  <td>{alloc.requester_name || alloc.requested_by}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span>{format(new Date(alloc.start_time), 'MMM d, h:mm a')}</span>
                      <span className="text-muted" style={{ fontSize: 'var(--font-size-xs)' }}>to {format(new Date(alloc.end_time), 'MMM d, h:mm a')}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${alloc.status}`}>
                      {alloc.status.replace('_', ' ')}
                    </span>
                  </td>
                  {isAdmin && (
                    <td>
                      {alloc.status === 'pending' && (
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button 
                            className="btn btn-sm btn-success" 
                            title="Approve"
                            onClick={() => handleStatusChange(alloc.allocation_id, 'approved')}
                          >
                            <IconCheck size={14} />
                          </button>
                          <button 
                            className="btn btn-sm btn-danger" 
                            title="Reject"
                            onClick={() => handleStatusChange(alloc.allocation_id, 'rejected')}
                          >
                            <IconX size={14} />
                          </button>
                        </div>
                      )}
                      {alloc.status === 'approved' && (
                         <button 
                          className="btn btn-sm btn-secondary" 
                          onClick={() => handleStatusChange(alloc.allocation_id, 'released')}
                        >
                          Release
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AllocationModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchAllocations}
      />
    </div>
  );
}
