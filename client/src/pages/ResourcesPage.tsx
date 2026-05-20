// ================================================================
// Resources Page
// ================================================================
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../services/api';
import { type IResource } from '@shared/resource';
import { useSocketEvent } from '../hooks/useSocketEvent';
import { useRBAC } from '../hooks/useRBAC';
import { SOCKET_EVENTS } from '@shared/socket-events';
import { IconPlus, IconMonitor, IconLoader, IconFilter } from '../components/icons/Icons';
import ResourceModal from '../components/resources/ResourceModal';

export function ResourcesPage() {
  const { isAdmin } = useRBAC();
  const [resources, setResources] = useState<IResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<IResource | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchResources = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/resources');
      setResources(data.data);
    } catch (err: any) {
      if (err.response?.status !== 401) {
          setError('Could not connect to database to load resources.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Real-time listener
  useSocketEvent<{ resourceId: string, newStatus: string }>(
    SOCKET_EVENTS.RESOURCE_STATUS_UPDATE,
    (payload) => {
      setResources(prev => prev.map(res => 
        res.resource_id === payload.resourceId
          ? { ...res, status: payload.newStatus as any }
          : res
      ));
    }
  );

  const filteredResources = resources.filter(res => {
    if (typeFilter && res.type !== typeFilter) return false;
    if (statusFilter && res.status !== statusFilter) return false;
    return true;
  });

  const handleEdit = (res: IResource) => {
    setSelectedResource(res);
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setSelectedResource(null);
    setModalOpen(true);
  };

  return (
    <>
      <div className="animate-fade-in-up">
        <div className="page-header">
        <div className="page-header-left">
          <h1>Resources</h1>
          <p>Manage and track all hardware and software inventory.</p>
        </div>
        <div className="page-header-actions">
          {isAdmin && (
            <button className="btn btn-primary" onClick={handleAddNew}>
              <IconPlus size={16} /> Add Resource
            </button>
          )}
        </div>
      </div>

      <div className="toolbar">
         <IconFilter size={18} className="text-muted" />
         <select 
            className="toolbar-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="computer">Computers</option>
            <option value="projector">Projectors</option>
            <option value="ups">UPS Units</option>
            <option value="cctv">CCTV</option>
            <option value="switch">Switches</option>
            <option value="router">Routers</option>
            <option value="printer">Printers</option>
            <option value="lab_equipment">Lab Equipment</option>
            <option value="furniture">Furniture</option>
            <option value="software">Software</option>
            <option value="other">Other</option>
         </select>

         <select 
            className="toolbar-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="available">Available</option>
            <option value="in_use">In Use</option>
            <option value="maintenance">Maintenance</option>
         </select>
      </div>

      <div className="data-table-wrapper">
        {loading ? (
          <div style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
            <IconLoader size={32} />
          </div>
        ) : error ? (
           <div className="empty-state">
             <div className="empty-state-icon"><IconMonitor size={48} /></div>
             <h3>Database Disconnected</h3>
             <p>{error}</p>
           </div>
        ) : filteredResources.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconMonitor size={48} /></div>
            <h3>No resources found</h3>
            <p>Adjust your filters or add a new resource to get started.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Room</th>
                <th>Added</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredResources.map(res => (
                <tr key={res.resource_id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{res.name}</div>
                    {(res.ip_address || res.mac_address) && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                        {res.ip_address && <span style={{ fontFamily: 'monospace' }}>IP: {res.ip_address}</span>}
                        {res.ip_address && res.mac_address && ' | '}
                        {res.mac_address && <span style={{ fontFamily: 'monospace' }}>MAC: {res.mac_address}</span>}
                      </div>
                    )}
                  </td>
                  <td>
                    <div style={{ textTransform: 'capitalize' }}>{res.type}</div>
                    {res.type === 'computer' && (res.cpu || res.ram) && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                        {res.cpu} {res.ram ? `• ${res.ram}` : ''}
                      </div>
                    )}
                    {res.type !== 'computer' && res.specs && Object.keys(res.specs).length > 0 && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px', textTransform: 'capitalize' }}>
                        {Object.entries(res.specs)
                          .filter(([_, val]) => val !== null && val !== '')
                          .map(([key, val]) => `${key.replace('_', ' ')}: ${val}`)
                          .join(' • ')}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${res.status}`} style={{ transition: 'all 0.3s ease' }}>
                      {res.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>{res.room_name || <span className="text-muted">Unassigned</span>}</td>
                  <td>{format(new Date(res.created_at), 'MMM d, yyyy')}</td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-sm btn-ghost" onClick={() => handleEdit(res)}>
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>

      <ResourceModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchResources}
        resource={selectedResource}
      />
    </>
  );
}
