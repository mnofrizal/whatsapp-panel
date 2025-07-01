"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Phone, Calendar, Clock, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";
import { useInstanceSocket } from "@/hooks/useInstanceSocket";

export default function InstanceDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);

  // Use Socket.IO hook for real-time updates
  const {
    instance,
    qrCode,
    connectionStatus,
    error: socketError,
    updateInstance,
    clearError,
    clearQrCode,
  } = useInstanceSocket(params.id);

  // Initial fetch of instance data
  const fetchInstance = async () => {
    if (session && params.id) {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/instances/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        const data = await response.json();

        if (data.success) {
          updateInstance(data.data.instance);
        }
      } catch (error) {
        console.error("Error fetching instance:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchInstance();
  }, [session, params.id]);

  // Handle QR dialog opening/closing based on connection status
  useEffect(() => {
    if (connectionStatus === "QR_REQUIRED" && qrCode) {
      setIsQrDialogOpen(true);
    } else if (connectionStatus === "CONNECTED") {
      setIsQrDialogOpen(false);
      clearQrCode();
    }
  }, [connectionStatus, qrCode, clearQrCode]);

  const handleConnect = async () => {
    setIsConnecting(true);
    clearError();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/instances/${params.id}/connect`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        // Socket.IO will handle the real-time updates
        console.log("Connection initiated successfully");
      } else {
        alert("Failed to initiate connection: " + data.message);
      }
    } catch (error) {
      console.error("Error connecting instance:", error);
      alert("Failed to connect instance");
    }

    setIsConnecting(false);
  };

  const handleCloseQrDialog = () => {
    setIsQrDialogOpen(false);
    clearQrCode();
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/instances/${params.id}/disconnect`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        alert("Instance disconnected successfully");
        // Socket.IO will handle the real-time status update
      } else {
        alert("Failed to disconnect instance: " + data.message);
      }
    } catch (error) {
      console.error("Error disconnecting instance:", error);
      alert("Failed to disconnect instance");
    }
    setIsDisconnecting(false);
  };

  const handleRestart = async () => {
    setIsRestarting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/instances/${params.id}/restart`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        alert("Instance restarted successfully");
        // Socket.IO will handle the real-time status update
      } else {
        alert("Failed to restart instance: " + data.message);
      }
    } catch (error) {
      console.error("Error restarting instance:", error);
      alert("Failed to restart instance");
    }
    setIsRestarting(false);
  };

  const handleLogout = async () => {
    if (!confirm("Are you sure you want to log out this instance?")) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/instances/${params.id}/logout`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        alert("Instance logged out successfully!");
        // Socket.IO will handle the real-time status update
      } else {
        alert("Failed to log out instance: " + data.message);
      }
    } catch (error) {
      console.error("Error logging out instance:", error);
      alert("Failed to log out instance");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-lg text-slate-500">
              Loading instance details...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="min-h-screen bg-slate-100 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-lg text-slate-500 mb-4">
              Instance not found
            </div>
            <Link
              href="/"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Socket.IO Error Display */}
        {socketError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-red-800 font-medium">Real-time Error</h3>
                <p className="text-red-700 text-sm mt-1">
                  {socketError.message}
                </p>
                {socketError.code && (
                  <p className="text-red-600 text-xs mt-1">
                    Code: {socketError.code}
                  </p>
                )}
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Instance Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">
                {instance.name}
              </h1>
              <div className="flex items-center gap-4">
                {instance.phone && (
                  <div className="flex items-center text-slate-600">
                    <Phone className="h-4 w-4 mr-1" />
                    {instance.phone}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right text-slate-500">
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  connectionStatus === "CONNECTED"
                    ? "bg-green-100 text-green-800"
                    : connectionStatus === "CONNECTING" ||
                      connectionStatus === "QR_REQUIRED"
                    ? "bg-yellow-100 text-yellow-800"
                    : connectionStatus === "DISCONNECTED"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {connectionStatus}
              </span>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleConnect}
              disabled={connectionStatus === "CONNECTED" || isConnecting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {isConnecting ? "Connecting..." : "Connect Instance"}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={connectionStatus !== "CONNECTED" || isDisconnecting}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {isDisconnecting ? "Disconnecting..." : "Disconnect Instance"}
            </button>
            <button
              onClick={handleRestart}
              disabled={isRestarting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {isRestarting ? "Restarting..." : "Restart Instance"}
            </button>
            <button
              onClick={handleLogout}
              disabled={isRestarting}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout Instance
            </button>
          </div>
        </div>

        {/* Instance Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Basic Information
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Name
                </label>
                <div className="text-slate-900">{instance.name}</div>
              </div>
              {instance.displayName && (
                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Display Name
                  </label>
                  <div className="text-slate-900">{instance.displayName}</div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Status
                </label>
                <div className="text-slate-900">{connectionStatus}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Active
                </label>
                <div className="text-slate-900">
                  {instance.isActive ? "Yes" : "No"}
                </div>
              </div>
            </div>
          </div>

          {/* Connection Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Connection Information
            </h2>
            <div className="space-y-3">
              {instance.phone && (
                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Phone Number
                  </label>
                  <div className="text-slate-900">{instance.phone}</div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Connection Attempts
                </label>
                <div className="text-slate-900">
                  {instance.connectionAttempts}
                </div>
              </div>
              {instance.lastConnectedAt && (
                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Last Connected
                  </label>
                  <div className="text-slate-900">
                    {new Date(instance.lastConnectedAt).toLocaleString()}
                  </div>
                </div>
              )}
              {instance.lastDisconnectedAt && (
                <div>
                  <label className="text-sm font-medium text-slate-500">
                    Last Disconnected
                  </label>
                  <div className="text-slate-900">
                    {new Date(instance.lastDisconnectedAt).toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              <Calendar className="h-5 w-5 inline mr-2" />
              Timestamps
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Created
                </label>
                <div className="text-slate-900">
                  {new Date(instance.createdAt).toLocaleString()}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Last Updated
                </label>
                <div className="text-slate-900">
                  {new Date(instance.updatedAt).toLocaleString()}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Created By
                </label>
                <div className="text-slate-900">
                  {instance.createdBy ? instance.createdBy.name : "Unknown"}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              <MessageSquare className="h-5 w-5 inline mr-2" />
              Statistics
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-500">
                  API Keys
                </label>
                <div className="text-slate-900">
                  {instance._count?.apiKeys || 0}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Message Stats
                </label>
                <div className="text-slate-900">
                  {instance._count?.messageStats || 0}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Contacts
                </label>
                <div className="text-slate-900">
                  {instance._count?.contacts || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Real-time Status */}
        {instance.realTimeStatus && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              <Clock className="h-5 w-5 inline mr-2" />
              Real-time Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Connection State
                </label>
                <div className="text-slate-900">
                  {instance.realTimeStatus.connectionState}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Reconnect Attempts
                </label>
                <div className="text-slate-900">
                  {instance.realTimeStatus.reconnectAttempts}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-500">
                  QR Attempts
                </label>
                <div className="text-slate-900">
                  {instance.realTimeStatus.qrAttempts} /{" "}
                  {instance.realTimeStatus.maxQRAttempts}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Information */}
        {instance.lastError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-4">
              Last Error
            </h2>
            <div className="space-y-2">
              <div className="text-red-800">{instance.lastError}</div>
              {instance.lastErrorAt && (
                <div className="text-sm text-red-600">
                  Occurred at: {new Date(instance.lastErrorAt).toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* QR Code Dialog - Now managed by Socket.IO */}
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code with your WhatsApp application to connect the
              instance. The QR code updates automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {qrCode ? (
              <QRCodeCanvas value={qrCode} size={256} level="H" />
            ) : (
              <div className="text-center">
                <p>Waiting for QR code...</p>
                <div className="mt-2 text-sm text-slate-500">
                  QR code will appear automatically when ready
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleCloseQrDialog}
            className="absolute top-2 right-2"
          >
            <X className="h-6 w-6" />
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
