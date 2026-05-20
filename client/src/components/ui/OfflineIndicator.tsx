// ================================================================
// OfflineIndicator — shows a banner when WebSocket disconnects
// ================================================================
import { useSocket } from '../../contexts/SocketContext';
import { IconWifiOff } from '../icons/Icons';
import './OfflineIndicator.css';

export default function OfflineIndicator() {
  const { isConnected } = useSocket();

  if (isConnected) return null;

  return (
    <div className="offline-banner" role="alert" aria-live="assertive">
      <IconWifiOff size={16} />
      <span>Connection lost. Real-time updates paused. Attempting to reconnect...</span>
    </div>
  );
}
