// ================================================================
// Rooms Page
// ================================================================
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useRBAC } from '../hooks/useRBAC';
import { IconPlus, IconBuilding, IconLoader } from '../components/icons/Icons';
import RoomModal from '../components/rooms/RoomModal';

export function RoomsPage() {
  const { isAdmin } = useRBAC();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/rooms');
      setRooms(data.data);
    } catch (err: any) {
      if (err.response?.status !== 401) {
          setError('Could not load room geometry data.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Geographic Locations</h1>
          <p>Manage the physical spaces housing IT resources.</p>
        </div>
        <div className="page-header-actions">
          {isAdmin && (
             <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
               <IconPlus size={16} /> Add Location
             </button>
          )}
        </div>
      </div>

      <div className="data-table-wrapper">
        {loading ? (
          <div style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
            <IconLoader size={32} />
          </div>
        ) : error ? (
           <div className="empty-state">
             <div className="empty-state-icon"><IconBuilding size={48} /></div>
             <h3>Connection Error</h3>
             <p>{error}</p>
           </div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconBuilding size={48} /></div>
            <h3>No locations established</h3>
            <p>Add your first lab or classroom to begin tracking spatial density.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Identifier</th>
                <th>Building Topology</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => (
                <tr key={room.room_id}>
                  <td style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>{room.name}</td>
                  <td>{room.building}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <RoomModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchRooms}
      />
    </div>
  );
}
