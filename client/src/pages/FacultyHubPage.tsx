// ================================================================
// Faculty Hub Page — location status + study materials
// ================================================================
import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRBAC } from '../hooks/useRBAC';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import {
  IconMapPin,
  IconBookOpen,
  IconUpload,
  IconDownload,
  IconTrash,
  IconFileText,
  IconLoader,
  IconUsers,
  IconX,
} from '../components/icons/Icons';
import './FacultyHubPage.css';

// ─── Types ────────────────────────────────────────────────────
type LocationStatus = 'in_department' | 'in_classroom' | 'outside';

interface FacultyStatus {
  user_id: string;
  name: string;
  email: string;
  profile_picture: string | null;
  status: LocationStatus;
  updated_at: string | null;
}

interface Material {
  material_id: string;
  uploaded_by: string;
  uploader_name: string;
  uploader_email: string;
  title: string;
  subject: string | null;
  description: string | null;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  uploaded_at: string;
}

// ─── Helpers ──────────────────────────────────────────────────
const STATUS_CONFIG: Record<LocationStatus, { label: string; emoji: string; color: string }> = {
  in_department: { label: 'In Department', emoji: '🏢', color: '#00B894' },
  in_classroom:  { label: 'In Classroom',  emoji: '🏫', color: '#6C5CE7' },
  outside:       { label: 'Outside',        emoji: '🌐', color: '#636E72' },
};

function formatBytes(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mime: string): string {
  if (mime?.includes('pdf')) return '📄';
  if (mime?.includes('word') || mime?.includes('document')) return '📝';
  if (mime?.includes('presentation') || mime?.includes('powerpoint')) return '📊';
  if (mime?.includes('sheet') || mime?.includes('excel')) return '📈';
  if (mime?.includes('image')) return '🖼️';
  return '📎';
}

// ─── Component ────────────────────────────────────────────────
export function FacultyHubPage() {
  const { user } = useAuth();
  const { isFaculty, isAdmin, hasRole } = useRBAC();
  const canUpload = isFaculty; // faculty, admin, chairman

  // Location status state
  const [statuses, setStatuses] = useState<FacultyStatus[]>([]);
  const [myStatus, setMyStatus] = useState<LocationStatus>('outside');
  const [statusLoading, setStatusLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Materials state
  const [materials, setMaterials] = useState<Material[]>([]);
  const [matLoading, setMatLoading] = useState(true);
  const [matError, setMatError] = useState('');

  // Upload form state
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Search/filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // ─── Fetch on mount ─────────────────────────────────────────
  useEffect(() => {
    fetchStatuses();
    fetchMaterials();
  }, []);

  const fetchStatuses = async () => {
    try {
      setStatusLoading(true);
      const { data } = await api.get('/faculty/status');
      setStatuses(data.data);
      // Pre-fill my status if I am faculty
      if (hasRole('faculty', 'admin', 'chairman')) {
        const me = data.data.find((f: FacultyStatus) => f.user_id === user?.user_id);
        if (me) setMyStatus(me.status);
      }
    } catch {
      /* silently fail */
    } finally {
      setStatusLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      setMatLoading(true);
      const { data } = await api.get('/faculty/materials');
      setMaterials(data.data);
    } catch {
      setMatError('Failed to load materials.');
    } finally {
      setMatLoading(false);
    }
  };

  // ─── Handlers ────────────────────────────────────────────────
  const handleStatusChange = async (newStatus: LocationStatus) => {
    if (statusUpdating || newStatus === myStatus) return;
    try {
      setStatusUpdating(true);
      await api.patch('/faculty/status', { status: newStatus });
      setMyStatus(newStatus);
      // Optimistically update in the list
      setStatuses(prev =>
        prev.map(f => f.user_id === user?.user_id ? { ...f, status: newStatus, updated_at: new Date().toISOString() } : f)
      );
    } catch {
      /* silently fail */
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    formData.append('subject', subject.trim());
    formData.append('description', description.trim());

    try {
      setUploading(true);
      setUploadError('');
      const { data } = await api.post('/faculty/materials', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMaterials(prev => [{ ...data.data, uploader_name: user?.name || '', uploader_email: user?.email || '' }, ...prev]);
      // Reset form
      setTitle(''); setSubject(''); setDescription(''); setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowUpload(false);
    } catch (err: any) {
      setUploadError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (materialId: string) => {
    if (!window.confirm('Delete this material? This cannot be undone.')) return;
    try {
      await api.delete(`/faculty/materials/${materialId}`);
      setMaterials(prev => prev.filter(m => m.material_id !== materialId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  // ─── Derived data ────────────────────────────────────────────
  const filteredStatuses = statuses.filter(f =>
    statusFilter === 'all' || f.status === statusFilter
  );

  const filteredMaterials = materials.filter(m => {
    const q = search.toLowerCase();
    return !q || m.title.toLowerCase().includes(q) || m.subject?.toLowerCase().includes(q) || m.uploader_name?.toLowerCase().includes(q);
  });

  // ─── Render ──────────────────────────────────────────────────
  return (
    <div className="fh-page animate-fade-in-up">

      {/* ── Page Header ── */}
      <div className="fh-header">
        <div>
          <h1>Faculty Hub</h1>
          <p>Live faculty directory and shared study materials for the CS Department.</p>
        </div>
        {canUpload && (
          <button className="btn btn-primary fh-upload-trigger" onClick={() => setShowUpload(true)}>
            <IconUpload size={16} />
            Upload Material
          </button>
        )}
      </div>

      {/* ── My Location Status (faculty/admin/chairman only) ── */}
      {hasRole('faculty', 'admin', 'chairman') && (
        <section className="fh-section fh-my-status">
          <div className="fh-section-title">
            <IconMapPin size={18} />
            <span>My Current Location</span>
            {statusUpdating && <IconLoader size={14} />}
          </div>
          <div className="fh-status-buttons">
            {(Object.entries(STATUS_CONFIG) as [LocationStatus, typeof STATUS_CONFIG[LocationStatus]][]).map(([key, cfg]) => (
              <button
                key={key}
                className={`fh-status-btn ${myStatus === key ? 'active' : ''}`}
                style={{ '--status-color': cfg.color } as React.CSSProperties}
                onClick={() => handleStatusChange(key)}
                disabled={statusUpdating}
                id={`status-btn-${key}`}
              >
                <span className="fh-status-emoji">{cfg.emoji}</span>
                <span>{cfg.label}</span>
                {myStatus === key && <span className="fh-status-dot" />}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── Faculty Directory ── */}
      <section className="fh-section">
        <div className="fh-section-header">
          <div className="fh-section-title">
            <IconUsers size={18} />
            <span>Faculty Directory</span>
            <span className="fh-badge">{statuses.length}</span>
          </div>
          <div className="fh-filter-tabs">
            {['all', 'in_department', 'in_classroom', 'outside'].map(s => (
              <button
                key={s}
                className={`fh-tab ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === 'all' ? 'All' : STATUS_CONFIG[s as LocationStatus].label}
              </button>
            ))}
          </div>
        </div>

        {statusLoading ? (
          <div className="fh-center"><IconLoader size={28} /></div>
        ) : filteredStatuses.length === 0 ? (
          <div className="fh-empty">
            <IconUsers size={40} />
            <p>No faculty members found.</p>
          </div>
        ) : (
          <div className="fh-directory-grid">
            {filteredStatuses.map(f => {
              const cfg = STATUS_CONFIG[f.status] || STATUS_CONFIG.outside;
              return (
                <div key={f.user_id} className="fh-faculty-card">
                  <div className="fh-faculty-avatar">
                    {f.profile_picture
                      ? <img src={f.profile_picture} alt={f.name} />
                      : <span>{f.name?.charAt(0)?.toUpperCase()}</span>
                    }
                    <span
                      className="fh-faculty-status-dot"
                      style={{ background: cfg.color }}
                      title={cfg.label}
                    />
                  </div>
                  <div className="fh-faculty-info">
                    <strong>{f.name}</strong>
                    <span className="fh-faculty-email">{f.email}</span>
                  </div>
                  <span className="fh-status-badge" style={{ '--status-color': cfg.color } as React.CSSProperties}>
                    {cfg.emoji} {cfg.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Study Materials ── */}
      <section className="fh-section">
        <div className="fh-section-header">
          <div className="fh-section-title">
            <IconBookOpen size={18} />
            <span>Study Materials</span>
            <span className="fh-badge">{materials.length}</span>
          </div>
          <input
            className="fh-search"
            placeholder="Search by title, subject or faculty…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {matLoading ? (
          <div className="fh-center"><IconLoader size={28} /></div>
        ) : matError ? (
          <div className="fh-empty"><p style={{ color: 'var(--color-danger)' }}>{matError}</p></div>
        ) : filteredMaterials.length === 0 ? (
          <div className="fh-empty">
            <IconFileText size={40} />
            <p>{search ? 'No materials match your search.' : 'No materials uploaded yet.'}</p>
          </div>
        ) : (
          <div className="fh-materials-list">
            {filteredMaterials.map(m => {
              const canDelete =
                m.uploaded_by === user?.user_id || isAdmin;
              return (
                <div key={m.material_id} className="fh-material-item">
                  <div className="fh-material-icon">{getFileIcon(m.mime_type)}</div>
                  <div className="fh-material-info">
                    <strong className="fh-material-title">{m.title}</strong>
                    <div className="fh-material-meta">
                      {m.subject && <span className="fh-tag">{m.subject}</span>}
                      <span>by {m.uploader_name || m.uploader_email}</span>
                      <span>{formatDistanceToNow(new Date(m.uploaded_at), { addSuffix: true })}</span>
                      <span>{formatBytes(m.file_size)}</span>
                    </div>
                    {m.description && (
                      <p className="fh-material-desc">{m.description}</p>
                    )}
                  </div>
                  <div className="fh-material-actions">
                    <a
                      className="btn btn-sm btn-ghost"
                      href={`${api.defaults.baseURL?.replace('/api', '')}/uploads/materials/${m.file_path.split(/[\\/]/).pop()}`}
                      download={m.file_name}
                      target="_blank"
                      rel="noreferrer"
                      title="Download"
                    >
                      <IconDownload size={16} />
                    </a>
                    {canDelete && (
                      <button
                        className="btn btn-sm btn-ghost fh-btn-danger"
                        onClick={() => handleDelete(m.material_id)}
                        title="Delete"
                      >
                        <IconTrash size={16} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Upload Modal ── */}
      {showUpload && (
        <div className="modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="modal-content fh-upload-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Upload Study Material</h2>
              <button className="btn-ghost" onClick={() => setShowUpload(false)}><IconX size={20} /></button>
            </div>
            <div className="modal-body">
              {uploadError && (
                <div className="alert alert-danger" style={{ marginBottom: 'var(--space-4)' }}>
                  {uploadError}
                </div>
              )}
              <form onSubmit={handleUpload} className="fh-upload-form">
                <div className="form-field">
                  <label htmlFor="mat-title">Title <span className="required">*</span></label>
                  <input
                    id="mat-title"
                    type="text"
                    placeholder="e.g. Operating Systems — Lecture 5 Notes"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="mat-subject">Subject / Course</label>
                  <input
                    id="mat-subject"
                    type="text"
                    placeholder="e.g. CS-401 Operating Systems"
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="mat-desc">Description</label>
                  <textarea
                    id="mat-desc"
                    rows={3}
                    placeholder="Brief description of the material…"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="mat-file">File <span className="required">*</span></label>
                  <div
                    className={`fh-dropzone ${file ? 'has-file' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      id="mat-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.png,.jpg,.jpeg"
                      style={{ display: 'none' }}
                      onChange={e => setFile(e.target.files?.[0] || null)}
                      required
                    />
                    {file ? (
                      <div className="fh-dropzone-preview">
                        <span>{getFileIcon(file.type)}</span>
                        <span>{file.name}</span>
                        <span className="fh-file-size">{formatBytes(file.size)}</span>
                      </div>
                    ) : (
                      <div className="fh-dropzone-placeholder">
                        <IconUpload size={28} />
                        <p>Click to select a file</p>
                        <small>PDF, Word, PowerPoint, Excel, Image — max 50 MB</small>
                      </div>
                    )}
                  </div>
                </div>
                <div className="fh-upload-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowUpload(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={uploading || !file || !title.trim()}>
                    {uploading ? <IconLoader size={16} /> : <IconUpload size={16} />}
                    {uploading ? 'Uploading…' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
