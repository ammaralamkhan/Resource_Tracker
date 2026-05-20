// ================================================================
// Dashboard Page — overview stats, charts, and recent activity
// ================================================================
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRBAC } from '../hooks/useRBAC';
import {
  IconMonitor,
  IconCalendar,
  IconWrench,
  IconUsers,
  IconLoader,
} from '../components/icons/Icons';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area
} from 'recharts';
import './DashboardPage.css';

// Chart color palettes
const PIE_COLORS = ['#6C5CE7', '#00B894', '#FDCB6E', '#E17055', '#74B9FF', '#A29BFE', '#55EFC4', '#FF7675'];
const STATUS_COLORS: Record<string, string> = {
  available: '#00B894',
  allocated: '#6C5CE7',
  maintenance: '#FDCB6E',
  retired: '#636E72',
  pending: '#FDCB6E',
  approved: '#00B894',
  rejected: '#E17055',
  released: '#74B9FF',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { isAdmin } = useRBAC();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard');
        setData(res.data.data);
      } catch (err: any) {
        if (err.response?.status !== 401) {
          setError('Failed to load dashboard statistics.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = [
    {
      label: 'Total Resources',
      value: data ? data.stats.totalResources : '--',
      icon: <IconMonitor size={20} />,
      color: 'blue' as const,
      trend: 'Hardware & software inventory',
    },
    {
      label: 'Active Allocations',
      value: data ? data.stats.activeAllocations : '--',
      icon: <IconCalendar size={20} />,
      color: 'green' as const,
      trend: 'Pending or currently active',
    },
    {
      label: 'Open Tickets',
      value: data ? data.stats.openTickets : '--',
      icon: <IconWrench size={20} />,
      color: 'yellow' as const,
      trend: 'Maintenance issues requiring attention',
    },
    ...(isAdmin
      ? [
          {
            label: 'Registered Users',
            value: data ? data.stats.registeredUsers : '--',
            icon: <IconUsers size={20} />,
            color: 'red' as const,
            trend: 'Across all role tiers',
          },
        ]
      : []),
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '0.85rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}>
          <p style={{ margin: 0, fontWeight: 600, marginBottom: '4px' }}>{label || payload[0].name}</p>
          {payload.map((entry: any, idx: number) => (
            <p key={idx} style={{ margin: '2px 0', color: entry.color || 'var(--color-text-secondary)' }}>
              {entry.name || entry.dataKey}: <strong>{entry.value}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };


  return (
    <div className="animate-fade-in-up">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}</h1>
        <p>Here is an overview of your department's resource landscape.</p>
      </div>

      <div className="stat-grid stagger-children">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card animate-fade-in-up">
            <div className="stat-card-header">
              <span className="stat-card-label">{stat.label}</span>
              <div className={`stat-card-icon ${stat.color}`}>{stat.icon}</div>
            </div>
            <div className="stat-card-value">{stat.value}</div>
            <div className="stat-card-trend">{stat.trend}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      {data?.charts && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', 
          gap: 'var(--space-5)', 
          marginTop: 'var(--space-6)',
          marginBottom: 'var(--space-6)'
        }}>

          {/* Resource Distribution by Type */}
          {data.charts.resourcesByType?.length > 0 && (
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
                Resource Distribution
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data.charts.resourcesByType}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    dataKey="value"
                    stroke="var(--color-bg-primary)"
                    strokeWidth={2}
                  >
                    {data.charts.resourcesByType.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-2)' }}>
                {data.charts.resourcesByType.map((item: any, idx: number) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: PIE_COLORS[idx % PIE_COLORS.length] }} />
                    <span style={{ color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resource Status Overview */}
          {data.charts.resourcesByStatus?.length > 0 && (
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
                Resource Status Overview
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={data.charts.resourcesByStatus} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--color-text-muted)" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis stroke="var(--color-text-muted)" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" name="Count" radius={[6, 6, 0, 0]}>
                    {data.charts.resourcesByStatus.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || PIE_COLORS[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Allocation Status Breakdown */}
          {data.charts.allocationsByStatus?.length > 0 && (
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
                Allocation Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data.charts.allocationsByStatus}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={50}
                    dataKey="value"
                    stroke="var(--color-bg-primary)"
                    strokeWidth={2}
                  >
                    {data.charts.allocationsByStatus.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || PIE_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', justifyContent: 'center', marginTop: 'var(--space-2)' }}>
                {data.charts.allocationsByStatus.map((item: any, idx: number) => (
                  <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: STATUS_COLORS[item.name] || PIE_COLORS[idx] }} />
                    <span style={{ color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monthly Allocation Trends */}
          {data.charts.monthlyAllocations?.length > 0 && (
            <div className="card" style={{ padding: 'var(--space-5)' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
                Monthly Allocation Trends
              </h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.charts.monthlyAllocations}>
                  <defs>
                    <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00B894" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#00B894" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" stroke="var(--color-text-muted)" tick={{ fontSize: 12 }} />
                  <YAxis stroke="var(--color-text-muted)" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area type="monotone" dataKey="requests" stroke="#6C5CE7" fillOpacity={1} fill="url(#colorRequests)" name="Requests" />
                  <Area type="monotone" dataKey="approved" stroke="#00B894" fillOpacity={1} fill="url(#colorApproved)" name="Approved" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {isAdmin && (
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="activity-list">
            {loading ? (
               <div style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
                 <IconLoader size={24} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
               </div>
            ) : error ? (
               <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
                 <p style={{ color: 'var(--color-danger)' }}>{error}</p>
               </div>
            ) : data && data.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity: any) => (
                <div key={activity.log_id} className="activity-item animate-fade-in-up" style={{ padding: 'var(--space-4)', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ margin: 0, fontWeight: 500 }}>
                      {activity.actor_name || activity.actor_email || 'System'}{' '}
                      <span style={{ color: 'var(--color-text-secondary)', fontWeight: 'normal' }}>
                        {activity.action.replace(/_/g, ' ').toLowerCase()}
                      </span>{' '}
                      {activity.entity_type.toLowerCase()}
                    </p>
                    {activity.details?.issue && (
                      <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                        "{activity.details.issue}"
                      </p>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', marginLeft: 'var(--space-4)' }}>
                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <IconCalendar size={48} />
                </div>
                <h3>No recent activity</h3>
                <p>Activity from resource allocations, maintenance reports, and status changes will appear here.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
