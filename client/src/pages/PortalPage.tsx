// ================================================================
// Portal Page - Live Public Dashboard for the Department
// ================================================================
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useSocketEvent } from '../hooks/useSocketEvent';
import { SOCKET_EVENTS } from '@shared/socket-events';
import { IconLoader, IconBuilding } from '../components/icons/Icons';

export function PortalPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRoom, setExpandedRoom] = useState<number | null>(null);

  const fetchPortalData = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/rooms/portal');
      setRooms(data.data);
    } catch (err: any) {
      if (err.response?.status !== 401) {
        setError('Could not load live portal data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  // Real-time listener
  useSocketEvent<{ resourceId: string, newStatus: string }>(
    SOCKET_EVENTS.RESOURCE_STATUS_UPDATE,
    (payload) => {
      setRooms(prevRooms => prevRooms.map(room => {
        const updatedResources = room.resources.map((res: any) => 
          res.resource_id === payload.resourceId 
            ? { ...res, status: payload.newStatus } 
            : res
        );
        return { ...room, resources: updatedResources };
      }));
    }
  );

  // Group rooms by floor
  const groundFloor = rooms.filter(r => r.floor === 0);
  const firstFloor = rooms.filter(r => r.floor === 1);

  const renderRoomCard = (room: any) => {
    const totalResources = room.resources.length;
    const availableResources = room.resources.filter((r: any) => r.status === 'available').length;
    const inUseResources = room.resources.filter((r: any) => r.status === 'in_use').length;
    const offlineResources = room.resources.filter((r: any) => r.status === 'not_working').length;

    const isExpanded = expandedRoom === room.room_id;

    return (
      <div 
        key={room.room_id} 
        style={{
          background: 'var(--color-bg-secondary)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-5)',
          border: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: 'var(--color-text-primary)' }}>{room.name}</h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'capitalize' }}>
            {room.room_type.replace('_', ' ')}
          </span>
        </div>

        {totalResources > 0 ? (
          <div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
              <span className="badge badge-available">🟢 {availableResources} Available</span>
              {inUseResources > 0 && <span className="badge badge-in_use">🔵 {inUseResources} In Use</span>}
              {offlineResources > 0 && <span className="badge badge-not_working">🔴 {offlineResources} Offline</span>}
            </div>
            
            <button 
              className="btn btn-sm btn-ghost" 
              onClick={() => setExpandedRoom(isExpanded ? null : room.room_id)}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isExpanded ? 'Hide Details' : 'View Hardware Specs & Live Status'}
            </button>

            {isExpanded && (
              <div style={{ marginTop: 'var(--space-4)', display: 'grid', gap: 'var(--space-2)' }}>
                {room.resources.map((res: any) => (
                  <div key={res.resource_id} style={{
                    padding: 'var(--space-3)',
                    background: 'var(--color-bg-primary)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `4px solid var(--color-${res.status === 'available' ? 'success' : res.status === 'not_working' ? 'danger' : 'info'})`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{res.name}</strong>
                      <span style={{ fontSize: '0.7rem', textTransform: 'uppercase' }} className={`text-${res.status === 'available' ? 'success' : res.status === 'not_working' ? 'danger' : 'info'}`}>
                        {res.status.replace('_', ' ')}
                      </span>
                    </div>
                    {res.ip_address && (
                       <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--color-text-secondary)' }}>
                         IP: {res.ip_address} {res.mac_address ? `| MAC: ${res.mac_address}` : ''}
                       </div>
                    )}
                    {(res.cpu || res.ram) && (
                       <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                         {res.cpu} {res.ram ? `• ${res.ram}` : ''} {res.os ? `• ${res.os}` : ''}
                       </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>No resources tracked.</div>
        )}
      </div>
    );
  };

  return (
    <div className="animate-fade-in-up" style={{ padding: 'var(--space-6)', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
          Live Department Portal
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.1rem' }}>
          Real-time availability and configuration of all Computer Science facilities.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 'var(--space-10)' }}>
          <IconLoader size={48} />
        </div>
      ) : error ? (
        <div className="empty-state">
           <div className="empty-state-icon"><IconBuilding size={48} /></div>
           <h3>Cannot reach the server</h3>
           <p>{error}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
          
          {/* Ground Floor Section */}
          <section>
            <h2 style={{ borderBottom: '2px solid var(--color-border)', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
              Ground Floor (Floor 0)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-5)' }}>
              {groundFloor.map(renderRoomCard)}
              {groundFloor.length === 0 && <p className="text-muted">No rooms mapped for Ground Floor.</p>}
            </div>
          </section>

          {/* First Floor Section */}
          <section>
            <h2 style={{ borderBottom: '2px solid var(--color-border)', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
              First Floor (Floor 1)
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-5)' }}>
              {firstFloor.map(renderRoomCard)}
              {firstFloor.length === 0 && <p className="text-muted">No rooms mapped for First Floor.</p>}
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
