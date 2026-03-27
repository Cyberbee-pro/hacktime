import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Define the shape of your timer data
interface TimerData {
  roomId: string;
  status: 'RUNNING' | 'PAUSED' | 'STOPPED';
  currentPhase: string;
  timeRemaining: string; 
  announcement: string | null;
}

// Connect to your local Node server 
const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export const useHackathon = (roomId: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [timerData, setTimerData] = useState<TimerData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. Initialize the socket connection
    const newSocket = io(SOCKET_SERVER_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      // Join the specific room for this event
      newSocket.emit('join-room', roomId);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // 2. Listen for the live timer updates from the Express server
    newSocket.on('sync-timer', (data: TimerData) => {
      setTimerData(data);
    });

    // 3. Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  // Function for the Organizer Dashboard to send commands
  const sendCommand = (action: string, payload?: any) => {
    if (socket) {
      socket.emit('organizer-command', { roomId, action, ...payload });
    }
  };

  return { isConnected, timerData, sendCommand };
};