"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { MessageSquare, Phone, Calendar, Clock, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";

export default function InstanceDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const [instance, setInstance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [qrLoading, setQrLoading] = useState(false);

  const fetchInstance = () => {
    if (session && params.id) {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/instances/${params.id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setInstance(data.data.instance);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching instance:", error);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchInstance();
    if (session && params.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/instances/${params.id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setInstance(data.data.instance);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching instance:", error);
          setLoading(false);
        });
    }
  }, [session, params.id]);

  const handleConnect = async () => {
    setIsConnecting(true);

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
        // Open QR dialog and start polling for QR code
        setIsQrDialogOpen(true);
        fetchQrCode();
      } else {
        alert("Failed to initiate connection: " + data.message);
      }
    } catch (error) {
      console.error("Error connecting instance:", error);
      alert("Failed to connect instance");
    }

    setIsConnecting(false);
  };

  const fetchQrCode = async () => {
    setQrLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/instances/${params.id}/qr`,
        {
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.success && data.data.qrCode) {
        setQrCode(data.data.qrCode);
      }
    } catch (error) {
      console.error("Error fetching QR code:", error);
    }

    setQrLoading(false);
  };

  // QR code polling effect
  useEffect(() => {
    let intervalId;

    if (isQrDialogOpen) {
      // Fetch QR code immediately when dialog opens
      fetchQrCode();

      // Set up polling every 10 seconds
      intervalId = setInterval(() => {
        fetchQrCode();
      }, 10000);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isQrDialogOpen]);

  const handleCloseQrDialog = () => {
    setIsQrDialogOpen(false);
    setQrCode("");
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
        fetchInstance();
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
        fetchInstance();
      } else {
        alert("Failed to restart instance: " + data.message);
      }
    } catch (error) {
      console.error("Error restarting instance:", error);
      alert("Failed to restart instance");
    }
    setIsRestarting(false);
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
                  instance.status === "CONNECTED"
                    ? "bg-green-100 text-green-800"
                    : instance.status === "CONNECTING"
                    ? "bg-yellow-100 text-yellow-800"
                    : instance.status === "DISCONNECTED"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {instance.status}
              </span>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleConnect}
              disabled={instance?.status === "CONNECTED" || isConnecting}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {isConnecting ? "Connecting..." : "Connect Instance"}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={instance?.status !== "CONNECTED" || isDisconnecting}
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
                <div className="text-slate-900">{instance.status}</div>
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
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
            <DialogDescription>
              Scan this QR code with your WhatsApp application to connect the
              instance.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {qrLoading ? (
              <div className="text-center">
                <p>Loading QR Code...</p>
              </div>
            ) : qrCode ? (
              <QRCodeCanvas value={qrCode} size={256} level="H" />
            ) : (
              <div className="text-center">
                <p>Could not load QR code. Please try again.</p>
                <button
                  onClick={fetchQrCode}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                >
                  Retry
                </button>
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
