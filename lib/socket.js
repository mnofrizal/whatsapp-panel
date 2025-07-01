import { io } from "socket.io-client";
import {
  getCurrentConfig,
  debugLog,
  errorLog,
  warnLog,
  SOCKET_CONFIG,
} from "./socket-config";

let socket = null;
let connectionAttempts = 0;

export const initializeSocket = (token, options = {}) => {
  const config = getCurrentConfig();
  const { forceNoAuth = false } = options;

  // Always disconnect existing socket before creating new one
  if (socket) {
    debugLog("Disconnecting existing socket before creating new one");
    socket.disconnect();
    socket = null;
  }

  debugLog("Initializing Socket.IO", {
    hasToken: !!token,
    forceNoAuth,
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    attempts: connectionAttempts,
  });

  const socketConfig = {
    autoConnect: false,
    transports: ["websocket", "polling"],
    timeout: config.TIMEOUT,
    reconnection: true,
    reconnectionAttempts: config.MAX_ATTEMPTS,
    reconnectionDelay: config.RETRY_DELAY,
  };

  // Add authentication if token is provided and not forced to skip auth
  if (token && !forceNoAuth) {
    debugLog("Adding authentication to socket configuration");

    // Try multiple authentication methods that backends commonly use
    socketConfig.auth = {
      token: token,
      authorization: `Bearer ${token}`,
    };

    // Also add as query parameter (some backends expect this)
    socketConfig.query = {
      token: token,
    };

    // Add as extra headers (another common method)
    socketConfig.extraHeaders = {
      Authorization: `Bearer ${token}`,
    };
  } else {
    warnLog("Initializing Socket.IO without authentication (development mode)");
  }

  socket = io(process.env.NEXT_PUBLIC_API_URL, socketConfig);

  socket.on(SOCKET_CONFIG.EVENTS.CONNECT, () => {
    debugLog("✅ Connected to Socket.IO server successfully");
    connectionAttempts = 0; // Reset attempts on successful connection
  });

  socket.on(SOCKET_CONFIG.EVENTS.DISCONNECT, (reason) => {
    warnLog("❌ Disconnected from Socket.IO server", { reason });
  });

  socket.on(SOCKET_CONFIG.EVENTS.CONNECT_ERROR, (error) => {
    errorLog("🔴 Socket.IO connection error", error);
    connectionAttempts++;

    const isAuthError =
      error.message?.includes("Authentication") ||
      error.message?.includes("Unauthorized") ||
      error.message?.includes("authentication required");

    // If authentication failed and we haven't exceeded max attempts
    if (
      isAuthError &&
      connectionAttempts < config.MAX_ATTEMPTS &&
      token &&
      !forceNoAuth
    ) {
      warnLog(
        `🔄 Authentication failed (attempt ${connectionAttempts}/${config.MAX_ATTEMPTS}), retrying without authentication...`
      );

      // Retry without authentication after a short delay
      setTimeout(() => {
        initializeSocket(null, { forceNoAuth: true });
        connectSocket();
      }, config.RETRY_DELAY);
    } else if (connectionAttempts >= config.MAX_ATTEMPTS) {
      errorLog(`❌ Max connection attempts (${config.MAX_ATTEMPTS}) exceeded`);
    }
  });

  socket.on(SOCKET_CONFIG.EVENTS.ERROR, (error) => {
    errorLog("🔴 Socket.IO runtime error", error);
  });

  return socket;
};

export const getSocket = () => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    debugLog("🔌 Disconnecting Socket.IO");
    socket.disconnect();
    socket = null;
    connectionAttempts = 0;
  }
};

export const connectSocket = () => {
  if (socket && !socket.connected) {
    debugLog("🔄 Attempting to connect Socket.IO...");
    socket.connect();
  } else if (!socket) {
    warnLog("Cannot connect: Socket not initialized");
  } else {
    debugLog("Socket already connected");
  }
};

// Reset connection attempts (useful for manual retries)
export const resetConnectionAttempts = () => {
  debugLog("Resetting connection attempts counter");
  connectionAttempts = 0;
};

// Check if socket is connected
export const isSocketConnected = () => {
  const connected = socket && socket.connected;
  debugLog("Socket connection status", { connected, hasSocket: !!socket });
  return connected;
};

// Get connection info for debugging
export const getConnectionInfo = () => {
  return {
    hasSocket: !!socket,
    isConnected: socket?.connected || false,
    connectionAttempts,
    socketId: socket?.id || null,
    transport: socket?.io?.engine?.transport?.name || null,
  };
};
