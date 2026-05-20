// ================================================================
// Profile Page
// ================================================================
import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IconMail, IconShield, IconActivity, IconLoader } from '../components/icons/Icons';
import api from '../services/api';

export function ProfilePage() {
  const { user, updateLocalUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadingImage, setLoadingImage] = useState(false);

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024) {
      alert('Image size should be less than 500KB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setLoadingImage(true);
      try {
        await api.patch('/auth/profile', { profile_picture: base64String });
        updateLocalUser({ profile_picture: base64String });
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to upload image');
      } finally {
        setLoadingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };


  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1>My Profile</h1>
          <p>View and manage your personal account details.</p>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 'var(--space-6)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {/* Profile Header Card */}
        <div className="card" style={{ 
          padding: 'var(--space-8)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'var(--space-6)',
          background: 'linear-gradient(145deg, var(--color-surface) 0%, rgba(20, 25, 35, 0.8) 100%)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
            <div 
              onClick={handleImageClick}
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: user.profile_picture ? `url(${user.profile_picture}) center/cover` : 'var(--color-primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: '600',
                boxShadow: '0 8px 16px rgba(108, 92, 231, 0.3)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              title="Click to upload new profile picture"
            >
              {!user.profile_picture && !loadingImage && initials}
              {loadingImage && <IconLoader size={30} />}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/png, image/jpeg, image/jpg"
                style={{ display: 'none' }} 
              />
            </div>
            <div>
              <h2 style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>{user.name}</h2>
              <div style={{ display: 'flex', gap: 'var(--space-3)', color: 'var(--color-text-secondary)', alignItems: 'center' }}>
                <span className="badge" style={{ 
                  background: 'rgba(108, 92, 231, 0.1)', 
                  color: 'var(--color-primary)',
                  padding: '4px 12px',
                  fontSize: '0.85rem',
                  textTransform: 'uppercase'
                }}>
                  {user.role}
                </span>
              </div>
            </div>
          </div>
          
        </div>

        {/* Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
              <IconMail size={18} />
              <span style={{ fontSize: '0.9rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{user.email}</div>
          </div>

          <div className="card" style={{ padding: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-2)' }}>
              <IconShield size={18} />
              <span style={{ fontSize: '0.9rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Access Level</span>
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 500, textTransform: 'capitalize' }}>
              {user.role} Privileges
            </div>
          </div>
          
          <div className="card" style={{ padding: 'var(--space-6)', gridColumn: '1 / -1' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              <IconActivity size={18} />
              <span style={{ fontSize: '0.9rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Account Status</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 10px var(--color-success)' }} />
              <span style={{ fontWeight: 500 }}>Active and verified</span>
            </div>
            <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              Your account is currently active and authenticated. As a <b>{user.role}</b>, you have access to the corresponding modules in the sidebar. For any permission changes, please contact the department chairman or a system administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
