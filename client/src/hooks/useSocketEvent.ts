// ================================================================
// useSocket hook — subscribe to real-time events
// ================================================================
import { useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';

/**
 * Subscribe to a socket event and run a callback when it fires.
 * Automatically cleans up on unmount.
 */
export function useSocketEvent<T = unknown>(event: string, callback: (data: T) => void) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on(event, callback);
    return () => { socket.off(event, callback); };
  }, [socket, event, callback]);
}
