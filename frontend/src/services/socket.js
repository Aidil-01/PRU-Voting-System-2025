import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket?.connected) {
      return this.socket;
    }

    // Prevent multiple connections
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
      timeout: 20000,
      forceNew: false,
    });

    this.setupEventHandlers();
    return this.socket;
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to socket server');
      console.log('Socket ID:', this.socket.id);
      this.isConnected = true;
      this.emitToListeners('connected', true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from socket server:', reason);
      this.isConnected = false;
      this.emitToListeners('connected', false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
      this.emitToListeners('error', error);
    });

    this.socket.on('welcome', (data) => {
      console.log('Welcome message:', data);
      this.emitToListeners('welcome', data);
    });

    this.socket.on('voteUpdate', (data) => {
      console.log('Vote update received:', data);
      this.emitToListeners('voteUpdate', data);
    });

    this.socket.on('statsUpdate', (data) => {
      console.log('Stats update received:', data);
      this.emitToListeners('statsUpdate', data);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      this.emitToListeners('error', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Event emission
  emit(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
      // Retry after delay
      setTimeout(() => {
        if (this.socket && this.socket.connected) {
          this.socket.emit(event, data);
        }
      }, 1000);
    }
  }

  // Join voting room for real-time updates
  joinVotingRoom() {
    this.emit('joinVotingRoom');
  }

  // Request current statistics
  requestStats() {
    this.emit('requestStats');
  }

  // Event listener management
  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  removeAllListeners(event) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  emitToListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in socket listener:', error);
        }
      });
    }
  }

  // Utility methods
  isSocketConnected() {
    return this.socket?.connected || false;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id || null,
      transport: this.socket?.io?.engine?.transport?.name || null,
    };
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;