import { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";

export const useInstanceSocket = (instanceId) => {
  const {
    socket,
    subscribeToInstance,
    unsubscribeFromInstance,
    isConnected,
    connectionError,
    retryConnection,
    sessionStatus,
  } = useSocket();

  const [instance, setInstance] = useState(null);
  const [qrCode, setQrCode] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("loading");
  const [error, setError] = useState(null);
  const isSubscribedRef = useRef(false);

  // Update instance data from external source
  const updateInstance = useCallback(
    (instanceData) => {
      console.log(`📝 Updating instance ${instanceId} data:`, instanceData);
      setInstance(instanceData);
      setConnectionStatus(instanceData.status || "UNKNOWN");
    },
    [instanceId]
  );

  // Set up socket listeners and subscription
  useEffect(() => {
    if (!instanceId) {
      console.warn("⚠️ No instanceId provided to useInstanceSocket");
      return;
    }

    if (sessionStatus === "loading") {
      console.log("⏳ Waiting for session to load...");
      return;
    }

    if (!socket || !isConnected) {
      console.log("⏳ Waiting for socket connection...");
      return;
    }

    if (isSubscribedRef.current) {
      console.log(`✅ Already subscribed to instance: ${instanceId}`);
      return;
    }

    console.log(
      `🔌 Setting up Socket.IO listeners for instance: ${instanceId}`
    );

    // Event handlers
    const handleStatusChanged = (data) => {
      console.log(`📡 Status changed for instance ${instanceId}:`, data);
      if (data.instanceId === instanceId) {
        setInstance((prev) =>
          prev ? { ...prev, status: data.newStatus } : null
        );
        setConnectionStatus(data.newStatus);

        // Clear QR code if not in QR_REQUIRED state
        if (data.newStatus !== "QR_REQUIRED") {
          setQrCode("");
        }
      }
    };

    const handleQrGenerated = (data) => {
      console.log(`📱 QR generated for instance ${instanceId}:`, data);
      if (data.instanceId === instanceId) {
        setQrCode(data.qrCode);
        setConnectionStatus("QR_REQUIRED");
      }
    };

    const handleConnected = (data) => {
      console.log(`✅ Instance ${instanceId} connected:`, data);
      if (data.instanceId === instanceId) {
        setInstance((prev) =>
          prev
            ? {
                ...prev,
                status: "CONNECTED",
                phone: data.phone,
                displayName: data.displayName,
                lastConnectedAt: new Date().toISOString(),
              }
            : null
        );
        setConnectionStatus("CONNECTED");
        setQrCode(""); // Clear QR code on successful connection
        setError(null);
      }
    };

    const handleDisconnected = (data) => {
      console.log(`❌ Instance ${instanceId} disconnected:`, data);
      if (data.instanceId === instanceId) {
        setInstance((prev) =>
          prev
            ? {
                ...prev,
                status: "DISCONNECTED",
                lastDisconnectedAt: new Date().toISOString(),
              }
            : null
        );
        setConnectionStatus("DISCONNECTED");
        setQrCode("");
      }
    };

    const handleError = (data) => {
      console.log(`🔴 Error for instance ${instanceId}:`, data);
      if (data.instanceId === instanceId) {
        setError({
          message: data.error,
          code: data.code,
          timestamp: new Date().toISOString(),
        });
        setInstance((prev) =>
          prev
            ? {
                ...prev,
                lastError: data.error,
                lastErrorAt: new Date().toISOString(),
              }
            : null
        );
      }
    };

    // Subscribe to instance updates
    subscribeToInstance(instanceId);
    isSubscribedRef.current = true;

    // Set up event listeners
    socket.on("instance:status:changed", handleStatusChanged);
    socket.on("instance:qr:generated", handleQrGenerated);
    socket.on("instance:connected", handleConnected);
    socket.on("instance:disconnected", handleDisconnected);
    socket.on("instance:error", handleError);

    return () => {
      console.log(
        `🧹 Cleaning up Socket.IO listeners for instance: ${instanceId}`
      );

      // Clean up event listeners
      if (socket) {
        socket.off("instance:status:changed", handleStatusChanged);
        socket.off("instance:qr:generated", handleQrGenerated);
        socket.off("instance:connected", handleConnected);
        socket.off("instance:disconnected", handleDisconnected);
        socket.off("instance:error", handleError);
      }

      // Unsubscribe from instance updates
      unsubscribeFromInstance(instanceId);
      isSubscribedRef.current = false;
    };
  }, [
    instanceId,
    socket,
    isConnected,
    sessionStatus,
    subscribeToInstance,
    unsubscribeFromInstance,
  ]);

  // Separate effect for handling connection errors
  useEffect(() => {
    if (!isConnected && connectionError && instanceId) {
      console.warn(
        `⚠️ Socket not connected for instance ${instanceId}. Error: ${connectionError}`
      );
      setError({
        message: `Socket connection failed: ${connectionError}`,
        code: "SOCKET_ERROR",
        timestamp: new Date().toISOString(),
      });
    }
  }, [isConnected, connectionError, instanceId]);

  return {
    instance,
    qrCode,
    connectionStatus,
    error,
    updateInstance,
    clearError: () => setError(null),
    clearQrCode: () => setQrCode(""),
    isSocketConnected: isConnected,
    connectionError,
    retryConnection,
    sessionStatus,
  };
};
