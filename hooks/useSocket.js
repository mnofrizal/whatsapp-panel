import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  initializeSocket,
  getSocket,
  disconnectSocket,
  connectSocket,
  resetConnectionAttempts,
  isSocketConnected,
} from "@/lib/socket";

export const useSocket = () => {
  const { data: session, status: sessionStatus } = useSession();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const initializationRef = useRef(false);

  useEffect(() => {
    // Don't initialize socket until session status is determined
    if (sessionStatus === "loading") {
      return;
    }

    // Prevent multiple initializations
    if (initializationRef.current) {
      return;
    }

    initializationRef.current = true;

    const initSocket = () => {
      try {
        console.log("🚀 Initializing Socket.IO connection...");
        console.log("Session status:", sessionStatus);
        console.log("Has access token:", !!session?.accessToken);

        // Initialize socket with or without token
        const token = session?.accessToken;
        socketRef.current = initializeSocket(token);

        const socket = socketRef.current;
        if (!socket) {
          console.error("Failed to create socket instance");
          return;
        }

        const handleConnect = () => {
          console.log("✅ Socket connected successfully");
          setIsConnected(true);
          setConnectionError(null);
        };

        const handleDisconnect = (reason) => {
          console.log("❌ Socket disconnected:", reason);
          setIsConnected(false);
        };

        const handleConnectError = (error) => {
          console.error("🔴 Socket connection error:", error);
          setIsConnected(false);
          setConnectionError(error.message || "Connection failed");
        };

        // Set up event listeners
        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("connect_error", handleConnectError);

        // Attempt to connect
        connectSocket();

        return () => {
          console.log("🧹 Cleaning up socket listeners");
          if (socket) {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("connect_error", handleConnectError);
          }
        };
      } catch (error) {
        console.error("🔴 Error initializing socket:", error);
        setConnectionError(error.message || "Initialization failed");
      }
    };

    const cleanup = initSocket();

    return () => {
      initializationRef.current = false;
      if (cleanup) cleanup();
    };
  }, [session?.accessToken, sessionStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 Component unmounting, disconnecting socket");
      disconnectSocket();
    };
  }, []);

  const subscribeToInstance = useCallback((instanceId) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      console.log(`📡 Subscribing to instance: ${instanceId}`);
      socket.emit("subscribe:instance", instanceId);
    } else {
      console.warn(
        `⚠️ Cannot subscribe to instance ${instanceId}: socket not connected`
      );
    }
  }, []);

  const unsubscribeFromInstance = useCallback((instanceId) => {
    const socket = getSocket();
    if (socket && socket.connected) {
      console.log(`📡 Unsubscribing from instance: ${instanceId}`);
      socket.emit("unsubscribe:instance", instanceId);
    }
  }, []);

  const retryConnection = useCallback(() => {
    console.log("🔄 Retrying socket connection...");
    resetConnectionAttempts();
    setConnectionError(null);

    // Reinitialize socket
    initializationRef.current = false;
    const token = session?.accessToken;
    socketRef.current = initializeSocket(token);
    connectSocket();
  }, [session?.accessToken]);

  return {
    socket: socketRef.current,
    subscribeToInstance,
    unsubscribeFromInstance,
    isConnected,
    connectionError,
    retryConnection,
    sessionStatus,
  };
};
