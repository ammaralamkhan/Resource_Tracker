// ================================================================
// Navbar — top bar with search, notifications, user menu
// ================================================================
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import { useSocketEvent } from '../../hooks/useSocketEvent';
import { SOCKET_EVENTS } from '@shared/socket-events';
import { type INotification } from '@shared/notification';
import api from '../../services/api';
import { IconBell, IconSearch, IconLogOut, IconUser, IconSettings, IconLoader } from '../icons/Icons';
import './Navbar.css';

interface NavbarProps {
  sidebarCollapsed: boolean;
}

export default function Navbar({ sidebarCollapsed }: NavbarProps) {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    if (user) {
      const fetchNotifs = async () => {
        try {
          setLoadingNotifs(true);
          const { data } = await api.get('/notifications');
          setNotifications(data.data);
        } catch (err) {
          console.error("Failed to fetch notifications");
        } finally {
          setLoadingNotifs(false);
        }
      };
      fetchNotifs();
    }
  }, [user]);

  // Real-time notifications
  useSocketEvent<any>(SOCKET_EVENTS.NOTIFICATION_NEW, (payload) => {
    setNotifications((prev) => [
      {
        notification_id: payload.notificationId,
        user_id: payload.userId,
        type: payload.type,
        message: payload.message,
        is_read: false,
        related_entity_id: payload.relatedEntityId,
        created_at: payload.timestamp
      },
      ...prev
    ]);
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error("Failed to mark all as read");
    }
  };

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??';

  return (
    <header className={`navbar ${sidebarCollapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      <div className="navbar-left">
        <div className="navbar-search">
          <span className="navbar-search-icon">
            <IconSearch size={16} />
          </span>
          <input
            type="text"
            placeholder="Search resources, users..."
            id="global-search"
            aria-label="Global search"
          />
        </div>
      </div>

      <div className="navbar-right">
        {/* Connection indicator */}
        <div
          className="navbar-icon-btn"
          title={isConnected ? 'Real-time: Connected' : 'Real-time: Disconnected'}
          style={{ color: isConnected ? 'var(--color-success)' : 'var(--color-danger)' }}
        >
          <svg width="8" height="8" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="4" fill="currentColor" />
          </svg>
        </div>

        {/* Notifications */}
        <div className="navbar-notif-wrapper" ref={notifRef} style={{ position: 'relative' }}>
          <button 
            className="navbar-icon-btn" 
            id="notifications-btn" 
            aria-label="Notifications"
            onClick={() => setNotifOpen(!notifOpen)}
          >
            <IconBell size={18} />
            {unreadCount > 0 && (
              <span className="navbar-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {notifOpen && (
            <div className="navbar-notif-dropdown">
              <div className="notif-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="notif-mark-all" onClick={handleMarkAllAsRead}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="notif-body">
                {loadingNotifs ? (
                  <div className="notif-empty"><IconLoader className="animate-spin" /></div>
                ) : notifications.length === 0 ? (
                  <div className="notif-empty">No notifications yet.</div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.notification_id} 
                      className={`notif-item ${notif.is_read ? 'read' : 'unread'}`}
                      onClick={() => !notif.is_read && handleMarkAsRead(notif.notification_id)}
                    >
                      <div className="notif-icon">
                        {notif.type === 'allocation' ? '📅' : notif.type === 'maintenance' ? '🔧' : '📢'}
                      </div>
                      <div className="notif-content">
                        <p>{notif.message}</p>
                        <span>{formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}</span>
                      </div>
                      {!notif.is_read && <div className="notif-dot" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="navbar-divider" />

        {/* User menu */}
        <div className="navbar-user-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            className="navbar-user"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            id="user-menu-btn"
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="navbar-user-avatar" style={{
              background: user?.profile_picture ? `url(${user.profile_picture}) center/cover` : 'var(--color-primary)',
              color: 'white',
              border: user?.profile_picture ? 'none' : undefined
            }}>
              {!user?.profile_picture && initials}
            </div>
            <div className="navbar-user-info">
              <span className="navbar-user-name">{user?.name}</span>
              <span className="navbar-user-role">{user?.role}</span>
            </div>
          </button>

          {dropdownOpen && (
            <div className="navbar-dropdown" role="menu">
              <button 
                className="navbar-dropdown-item" 
                role="menuitem"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/profile');
                }}
              >
                <IconUser size={16} />
                Profile
              </button>

              <button 
                className="navbar-dropdown-item" 
                role="menuitem"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/settings');
                }}
              >
                <IconSettings size={16} />
                Settings
              </button>

              <button
                className="navbar-dropdown-item danger"
                onClick={logout}
                role="menuitem"
                id="logout-btn"
              >
                <IconLogOut size={16} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
