// ================================================================
// Audit Log Page
// ================================================================
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import api from '../services/api';
import { IconClipboard, IconLoader } from '../components/icons/Icons';

export function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/audit?limit=50&page=1');
      setLogs(data.data || []);
    } catch (err: any) {
      if (err.response?.status !== 401) {
          setError('Could not load secure audit trail.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="animate-fade-in-up">
      <div className="page-header">
        <div className="page-header-left">
          <h1>Immutable Audit Trail</h1>
          <p>Cryptographically secure action history across all system components.</p>
        </div>
      </div>

      <div className="data-table-wrapper">
        {loading ? (
          <div style={{ padding: 'var(--space-10)', textAlign: 'center' }}>
             <IconLoader size={32} />
          </div>
        ) : error ? (
           <div className="empty-state">
             <div className="empty-state-icon"><IconClipboard size={48} /></div>
             <h3>Connection Error</h3>
             <p>{error}</p>
           </div>
        ) : logs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconClipboard size={48} /></div>
            <h3>No audit entries yet</h3>
            <p>Actions will be recorded here as users interact with the system.</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor Email</th>
                <th>Action Signature</th>
                <th>Resource Topology</th>
                <th>State Delta (Target ID)</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.log_id}>
                  <td>{format(new Date(log.timestamp), 'MMM d, h:mm:ss a')}</td>
                  <td style={{ fontWeight: 500 }}>{log.actor_email || log.user_id}</td>
                  <td>
                     <span className="badge badge-info">{log.action}</span>
                  </td>
                  <td>{log.entity_type}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    {log.entity_id || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
