// ================================================================
// Sidebar — role-aware navigation panel
// ================================================================
import { NavLink } from 'react-router-dom';
import { useRBAC } from '../../hooks/useRBAC';
import {
  IconDashboard,
  IconMonitor,
  IconCalendar,
  IconWrench,
  IconClipboard,
  IconUsers,
  IconBuilding,
  IconShield,
  IconChevronLeft,
  IconChevronRight,
  IconBookOpen,
} from '../icons/Icons';
import './Sidebar.css';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  section: string;
  minRole?: string;
  roles?: string[];
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { hasRole, hasMinRole } = useRBAC();

  const navItems: NavItem[] = [
    { to: '/',              label: 'Dashboard',   icon: <IconDashboard />,  section: 'Overview' },
    { to: '/portal',        label: 'Live Portal', icon: <IconBuilding />,   section: 'Overview' },
    { to: '/resources',     label: 'Resources',   icon: <IconMonitor />,    section: 'Management' },
    { to: '/allocations',   label: 'Allocations', icon: <IconCalendar />,   section: 'Management' },
    { to: '/rooms',         label: 'Rooms',       icon: <IconBuilding />,   section: 'Management' },
    { to: '/maintenance',   label: 'Maintenance', icon: <IconWrench />,     section: 'Operations', minRole: 'staff' },
    { to: '/faculty-hub',   label: 'Faculty Hub', icon: <IconBookOpen />,   section: 'Faculty' },
    { to: '/users',         label: 'Users',       icon: <IconUsers />,      section: 'Administration', minRole: 'admin' },
    { to: '/audit',         label: 'Audit Log',   icon: <IconClipboard />,  section: 'Administration', minRole: 'admin' },
  ];

  // Filter items by role
  const visibleItems = navItems.filter((item) => {
    if (item.roles && !hasRole(...item.roles)) return false;
    if (item.minRole && !hasMinRole(item.minRole)) return false;
    return true;
  });

  // Group items by section
  const sections = visibleItems.reduce<Record<string, NavItem[]>>((acc, item) => {
    if (!acc[item.section]) acc[item.section] = [];
    acc[item.section].push(item);
    return acc;
  }, {});

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`} aria-label="Main navigation">
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <IconShield size={18} color="#fff" />
        </div>
        <div className="sidebar-brand-text">
          <h2>Resource Tracker</h2>
          <span>CS Department</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section}>
            <div className="sidebar-section-label">{section}</div>
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="sidebar-link-icon">{item.icon}</span>
                <span className="sidebar-link-text">{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-toggle"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <IconChevronRight size={18} /> : <IconChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
