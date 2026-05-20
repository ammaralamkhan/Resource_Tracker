import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { IconX, IconLoader } from '../icons/Icons';
import api from '../../services/api';
import { type IResource, type IResourceCreate } from '@shared/resource';

interface ResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resource?: IResource | null;
}

export default function ResourceModal({ isOpen, onClose, onSuccess, resource }: ResourceModalProps) {
  const isEditing = !!resource;

  const [formData, setFormData] = useState<Partial<IResourceCreate>>({
    name: '',
    type: 'computer',
    status: 'available',
    room_id: '' as any,
    ip_address: '',
    mac_address: '',
    cpu: '',
    ram: '',
    storage: '',
    os: '',
    specs: {},
  });
  
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch rooms for the dropdown
  useEffect(() => {
    if (isOpen) {
      api.get('/rooms').then(res => setRooms(res.data.data)).catch(() => {});
    }
  }, [isOpen]);

  // Pre-fill form when editing
  useEffect(() => {
    if (isOpen && resource) {
      setFormData({
        name: resource.name,
        type: resource.type,
        status: resource.status,
        room_id: (resource.room_id || '') as any,
        ip_address: resource.ip_address || '',
        mac_address: resource.mac_address || '',
        cpu: resource.cpu || '',
        ram: resource.ram || '',
        storage: resource.storage || '',
        os: resource.os || '',
        specs: resource.specs || {},
      });
    } else if (isOpen && !resource) {
      setFormData({
        name: '',
        type: 'computer',
        status: 'available',
        room_id: '' as any,
        ip_address: '',
        mac_address: '',
        cpu: '',
        ram: '',
        storage: '',
        os: '',
        specs: {},
      });
    }
  }, [isOpen, resource]);

  const setSpec = (key: string, value: any) => {
    setFormData({ ...formData, specs: { ...(formData.specs || {}), [key]: value } });
  };

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEditing) {
        await api.patch(`/resources/${resource?.resource_id}`, formData);
      } else {
        await api.post('/resources', formData);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save resource');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Resource' : 'Add New Resource'}</h2>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">
            <IconX size={20} />
          </button>
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-danger">{error}</div>}

          <form id="resource-form" onSubmit={handleSubmit} className="form-field stagger-children">
            
            <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="res-name">Resource Name</label>
              <input
                id="res-name"
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Lab 2 PC-01"
              />
            </div>

            <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="res-type">Type</label>
              <select
                id="res-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              >
                <option value="computer">Computer</option>
                <option value="projector">Projector</option>
                <option value="ups">UPS Unit</option>
                <option value="cctv">CCTV Camera</option>
                <option value="switch">Switch</option>
                <option value="router">Router</option>
                <option value="printer">Printer</option>
                <option value="lab_equipment">Lab Equipment</option>
                <option value="furniture">Furniture</option>
                <option value="software">Software License</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="res-room">Primary Room / Location</label>
              <select
                id="res-room"
                value={formData.room_id}
                onChange={(e) => setFormData({ ...formData, room_id: e.target.value ? Number(e.target.value) : undefined })}
              >
                <option value="">-- Select Room (Optional) --</option>
                {rooms.map(room => (
                  <option key={room.room_id} value={room.room_id}>
                    {room.name} ({room.building})
                  </option>
                ))}
              </select>
            </div>

            {['computer', 'cctv', 'switch', 'router', 'printer'].includes(formData.type as string) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: 'var(--space-4)' }}>
                <div className="form-field">
                  <label htmlFor="res-ip">IP Address</label>
                  <input
                    id="res-ip"
                    type="text"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    placeholder="e.g. 192.168.1.10"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="res-mac">MAC Address</label>
                  <input
                    id="res-mac"
                    type="text"
                    value={formData.mac_address}
                    onChange={(e) => setFormData({ ...formData, mac_address: e.target.value })}
                    placeholder="e.g. 00:1A:2B:3C:4D:5E"
                  />
                </div>
              </div>
            )}

            {formData.type === 'computer' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: 'var(--space-4)' }}>
                  <div className="form-field">
                    <label htmlFor="res-cpu">CPU / Processor</label>
                    <input
                      id="res-cpu"
                      type="text"
                      value={formData.cpu}
                      onChange={(e) => setFormData({ ...formData, cpu: e.target.value })}
                      placeholder="e.g. Intel Core i5"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="res-ram">RAM</label>
                    <input
                      id="res-ram"
                      type="text"
                      value={formData.ram}
                      onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                      placeholder="e.g. 16GB DDR4"
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: 'var(--space-4)' }}>
                  <div className="form-field">
                    <label htmlFor="res-storage">Storage</label>
                    <input
                      id="res-storage"
                      type="text"
                      value={formData.storage}
                      onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                      placeholder="e.g. 512GB SSD"
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="res-os">Operating System</label>
                    <input
                      id="res-os"
                      type="text"
                      value={formData.os}
                      onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                      placeholder="e.g. Windows 11 Pro"
                    />
                  </div>
                </div>
              </>
            )}

            {formData.type === 'switch' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: 'var(--space-4)' }}>
                <div className="form-field">
                  <label>Port Count</label>
                  <input type="number" value={formData.specs?.port_count || ''} onChange={(e) => setSpec('port_count', parseInt(e.target.value))} placeholder="e.g. 24" />
                </div>
                <div className="form-field">
                  <label>Speed</label>
                  <input type="text" value={formData.specs?.speed || ''} onChange={(e) => setSpec('speed', e.target.value)} placeholder="e.g. 1G/10G" />
                </div>
              </div>
            )}

            {formData.type === 'router' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: 'var(--space-4)' }}>
                <div className="form-field">
                  <label>WAN Ports</label>
                  <input type="number" value={formData.specs?.wan_ports || ''} onChange={(e) => setSpec('wan_ports', parseInt(e.target.value))} placeholder="e.g. 2" />
                </div>
                <div className="form-field">
                  <label>Wi-Fi Standard</label>
                  <input type="text" value={formData.specs?.wifi_standard || ''} onChange={(e) => setSpec('wifi_standard', e.target.value)} placeholder="e.g. Wi-Fi 6" />
                </div>
              </div>
            )}

            {formData.type === 'printer' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: 'var(--space-4)' }}>
                <div className="form-field">
                  <label>Printer Type</label>
                  <select value={formData.specs?.printer_type || ''} onChange={(e) => setSpec('printer_type', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Laser">Laser</option>
                    <option value="Inkjet">Inkjet</option>
                  </select>
                </div>
                <div className="form-field">
                  <label>Color</label>
                  <select value={formData.specs?.color || ''} onChange={(e) => setSpec('color', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>
              </div>
            )}

            {formData.type === 'cctv' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: 'var(--space-4)' }}>
                <div className="form-field">
                  <label>Resolution</label>
                  <input type="text" value={formData.specs?.resolution || ''} onChange={(e) => setSpec('resolution', e.target.value)} placeholder="e.g. 1080p, 4K" />
                </div>
                <div className="form-field">
                  <label>Camera Type</label>
                  <input type="text" value={formData.specs?.camera_type || ''} onChange={(e) => setSpec('camera_type', e.target.value)} placeholder="e.g. Dome, Bullet" />
                </div>
              </div>
            )}

            {formData.type === 'projector' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: 'var(--space-4)' }}>
                <div className="form-field">
                  <label>Resolution</label>
                  <input type="text" value={formData.specs?.resolution || ''} onChange={(e) => setSpec('resolution', e.target.value)} placeholder="e.g. 1920x1080" />
                </div>
                <div className="form-field">
                  <label>Lamp Life (Hours)</label>
                  <input type="number" value={formData.specs?.lamp_life || ''} onChange={(e) => setSpec('lamp_life', parseInt(e.target.value))} placeholder="e.g. 4000" />
                </div>
              </div>
            )}

            {formData.type === 'ups' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: 'var(--space-4)' }}>
                <div className="form-field">
                  <label>Capacity</label>
                  <input type="text" value={formData.specs?.capacity || ''} onChange={(e) => setSpec('capacity', e.target.value)} placeholder="e.g. 1000VA" />
                </div>
                <div className="form-field">
                  <label>Battery Type</label>
                  <input type="text" value={formData.specs?.battery_type || ''} onChange={(e) => setSpec('battery_type', e.target.value)} placeholder="e.g. Lead-Acid" />
                </div>
              </div>
            )}

            {formData.type === 'software' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: 'var(--space-4)' }}>
                <div className="form-field">
                  <label>License Key</label>
                  <input type="text" value={formData.specs?.license_key || ''} onChange={(e) => setSpec('license_key', e.target.value)} placeholder="e.g. XXXX-XXXX-XXXX" />
                </div>
                <div className="form-field">
                  <label>Expiry Date</label>
                  <input type="date" value={formData.specs?.expiry_date || ''} onChange={(e) => setSpec('expiry_date', e.target.value)} />
                </div>
              </div>
            )}

            {isEditing && (
               <div className="form-field" style={{ marginBottom: 'var(--space-4)' }}>
               <label htmlFor="res-status">Status</label>
               <select
                 id="res-status"
                 value={formData.status}
                 onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
               >
                 <option value="available">Available</option>
                 <option value="in_use">In Use</option>
                 <option value="maintenance">Maintenance</option>
                 <option value="decommissioned">Decommissioned</option>
               </select>
             </div>
            )}

          </form>
        </div>

        <div className="modal-footer" style={{ display: 'flex', justifyContent: isEditing ? 'space-between' : 'flex-end', width: '100%' }}>
          {isEditing && (
             <button 
               className="btn btn-ghost" 
               type="button" 
               onClick={async () => {
                 if (window.confirm('Are you sure you want to delete this resource?')) {
                   setLoading(true);
                   try {
                     await api.delete(`/resources/${resource?.resource_id}`);
                     onSuccess();
                     onClose();
                   } catch (err: any) {
                     setError(err.response?.data?.message || 'Failed to delete resource');
                     setLoading(false);
                   }
                 }
               }} 
               disabled={loading}
               style={{ color: 'var(--color-danger)' }}
             >
               Delete
             </button>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn-ghost" type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button className="btn btn-primary" type="submit" form="resource-form" disabled={loading}>
              {loading ? <IconLoader size={16} /> : null}
              {isEditing ? 'Save Changes' : 'Create Resource'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
