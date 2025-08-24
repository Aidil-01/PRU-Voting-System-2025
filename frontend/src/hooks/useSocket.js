import { useEffect, useState, useCallback } from 'react';
import socketService from '../services/socket';

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    socketId: null,
    transport: null,
  });

  useEffect(() => {
    // Connect to socket
    socketService.connect();

    // Set up connection status listener
    const handleConnectionChange = (connected) => {
      setIsConnected(connected);
      setConnectionStatus(socketService.getConnectionStatus());
    };

    socketService.addListener('connected', handleConnectionChange);

    // Initial status
    setIsConnected(socketService.isSocketConnected());
    setConnectionStatus(socketService.getConnectionStatus());

    // Cleanup on unmount
    return () => {
      socketService.removeListener('connected', handleConnectionChange);
    };
  }, []);

  const emit = useCallback((event, data) => {
    socketService.emit(event, data);
  }, []);

  const addListener = useCallback((event, callback) => {
    socketService.addListener(event, callback);
  }, []);

  const removeListener = useCallback((event, callback) => {
    socketService.removeListener(event, callback);
  }, []);

  const joinVotingRoom = useCallback(() => {
    socketService.joinVotingRoom();
  }, []);

  const requestStats = useCallback(() => {
    socketService.requestStats();
  }, []);

  return {
    isConnected,
    connectionStatus,
    emit,
    addListener,
    removeListener,
    joinVotingRoom,
    requestStats,
  };
};

export const useSocketEvent = (event, callback, dependencies = []) => {
  const { addListener, removeListener } = useSocket();

  useEffect(() => {
    if (callback) {
      addListener(event, callback);
      return () => removeListener(event, callback);
    }
  }, [event, callback, addListener, removeListener, ...dependencies]);
};

export const useVotingUpdates = () => {
  const [stats, setStats] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const { joinVotingRoom, requestStats } = useSocket();

  useEffect(() => {
    // Join voting room for updates
    joinVotingRoom();
    
    // Request initial stats
    requestStats();
  }, [joinVotingRoom, requestStats]);

  useSocketEvent('voteUpdate', (data) => {
    setStats(data);
    setLastUpdate(new Date());
  });

  useSocketEvent('statsUpdate', (data) => {
    setStats(data);
    setLastUpdate(new Date());
  });

  return {
    stats,
    lastUpdate,
    refreshStats: requestStats,
  };
};