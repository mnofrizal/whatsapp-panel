// Socket.IO Development Configuration
export const SOCKET_CONFIG = {
  // Development mode settings
  DEVELOPMENT: {
    // Enable detailed logging
    DEBUG: false, // Disabled to prevent console spam
    // Allow connection without authentication for development
    ALLOW_NO_AUTH: true,
    // Connection timeout in milliseconds
    TIMEOUT: 10000,
    // Maximum connection attempts before giving up
    MAX_ATTEMPTS: 2, // Reduced to prevent loops
    // Delay between retry attempts
    RETRY_DELAY: 2000, // Increased delay
  },

  // Production mode settings
  PRODUCTION: {
    DEBUG: false,
    ALLOW_NO_AUTH: false,
    TIMEOUT: 5000,
    MAX_ATTEMPTS: 5,
    RETRY_DELAY: 2000,
  },

  // Socket.IO events that the client listens for
  EVENTS: {
    // Instance-specific events
    INSTANCE_STATUS_CHANGED: "instance:status:changed",
    INSTANCE_QR_GENERATED: "instance:qr:generated",
    INSTANCE_CONNECTED: "instance:connected",
    INSTANCE_DISCONNECTED: "instance:disconnected",
    INSTANCE_ERROR: "instance:error",

    // Subscription events
    SUBSCRIBE_INSTANCE: "subscribe:instance",
    UNSUBSCRIBE_INSTANCE: "unsubscribe:instance",

    // Connection events
    CONNECT: "connect",
    DISCONNECT: "disconnect",
    CONNECT_ERROR: "connect_error",
    ERROR: "error",
  },

  // WhatsApp instance statuses
  INSTANCE_STATUS: {
    INIT: "INIT",
    QR_REQUIRED: "QR_REQUIRED",
    CONNECTED: "CONNECTED",
    DISCONNECTED: "DISCONNECTED",
    RECONNECTING: "RECONNECTING",
    ERROR: "ERROR",
    LOADING: "loading", // UI state
    UNKNOWN: "UNKNOWN", // Fallback state
  },

  // Error codes
  ERROR_CODES: {
    AUTH_REQUIRED: "AUTH_REQUIRED",
    AUTH_FAILED: "AUTH_FAILED",
    CONNECTION_FAILED: "CONNECTION_FAILED",
    TIMEOUT: "TIMEOUT",
    SOCKET_ERROR: "SOCKET_ERROR",
  },
};

// Get current environment configuration
export const getCurrentConfig = () => {
  const isDevelopment = process.env.NODE_ENV === "development";
  return isDevelopment ? SOCKET_CONFIG.DEVELOPMENT : SOCKET_CONFIG.PRODUCTION;
};

// Helper function to log debug messages
export const debugLog = (message, data = null) => {
  const config = getCurrentConfig();
  if (config.DEBUG) {
    if (data) {
      console.log(`🔧 [Socket Debug] ${message}`, data);
    } else {
      console.log(`🔧 [Socket Debug] ${message}`);
    }
  }
};

// Helper function to log errors
export const errorLog = (message, error = null) => {
  if (error) {
    console.error(`🔴 [Socket Error] ${message}`, error);
  } else {
    console.error(`🔴 [Socket Error] ${message}`);
  }
};

// Helper function to log warnings
export const warnLog = (message, data = null) => {
  if (data) {
    console.warn(`⚠️ [Socket Warning] ${message}`, data);
  } else {
    console.warn(`⚠️ [Socket Warning] ${message}`);
  }
};
