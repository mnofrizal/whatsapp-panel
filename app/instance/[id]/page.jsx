"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  MessageSquare,
  Phone,
  Calendar,
  Clock,
  X,
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Edit,
} from "lucide-react";
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
  const [apiKeys, setApiKeys] = useState([]);
  const [isApiKeysLoading, setIsApiKeysLoading] = useState(false);
  const [isCreateKeyDialogOpen, setIsCreateKeyDialogOpen] = useState(false);
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [deletingKeyId, setDeletingKeyId] = useState(null);
  const [isEditKeyDialogOpen, setIsEditKeyDialogOpen] = useState(false);
  const [isUpdatingKey, setIsUpdatingKey] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [keyForm, setKeyForm] = useState({
    name: "",
    permissions: {
      messages: { send: true, receive: true },
      contacts: { check: true },
      instance: { info: true, stats: true },
      webhook: {},
    },
    rateLimit: 1000,
  });

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

  console.log(session?.user?.role);

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

  // Fetch API keys for the instance
  const fetchApiKeys = useCallback(async () => {
    if (session && params.id) {
      setIsApiKeysLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/instances/${params.id}/keys`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        const data = await response.json();

        if (data.success) {
          setApiKeys(data.data.apiKeys || []);
        }
      } catch (error) {
        console.error("Error fetching API keys:", error);
      } finally {
        setIsApiKeysLoading(false);
      }
    }
  }, [session, params.id]);

  useEffect(() => {
    fetchInstance();
    fetchApiKeys();
  }, [session, params.id, fetchApiKeys]);

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

  // Handle API key creation
  const handleCreateApiKey = async () => {
    setIsCreatingKey(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/instances/${params.id}/keys`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify(keyForm),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("API key created successfully!");
        setIsCreateKeyDialogOpen(false);
        fetchApiKeys(); // Refresh the list
        // Reset form
        setKeyForm({
          name: "",
          permissions: {
            messages: { send: true, receive: true },
            contacts: { check: true },
            instance: { info: true, stats: true },
            webhook: {},
          },
          rateLimit: 1000,
        });
      } else {
        alert("Failed to create API key: " + data.message);
      }
    } catch (error) {
      console.error("Error creating API key:", error);
      alert("Failed to create API key");
    } finally {
      setIsCreatingKey(false);
    }
  };

  // Handle copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Copied to clipboard!");
    });
  };

  // Handle form input changes
  const handleFormChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child, subchild] = field.split(".");
      setKeyForm((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: subchild
            ? {
                ...prev[parent][child],
                [subchild]: value,
              }
            : value,
        },
      }));
    } else {
      setKeyForm((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Handle API key deletion
  const handleDeleteApiKey = async (keyId, keyName) => {
    if (
      !confirm(
        `Are you sure you want to delete the API key "${keyName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeletingKeyId(keyId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/instances/${params.id}/keys/${keyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("API key deleted successfully");
        fetchApiKeys(); // Refresh the list
      } else {
        alert("Failed to delete API key: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting API key:", error);
      alert("Failed to delete API key");
    } finally {
      setDeletingKeyId(null);
    }
  };

  // Handle API key editing
  const handleEditApiKey = (key) => {
    setEditingKey(key);
    setKeyForm({
      name: key.name,
      permissions: key.permissions,
      rateLimit: key.rateLimit,
      isActive: key.isActive,
    });
    setIsEditKeyDialogOpen(true);
  };

  // Handle API key update
  const handleUpdateApiKey = async () => {
    if (!editingKey) return;

    setIsUpdatingKey(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/instances/${params.id}/keys/${editingKey.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.accessToken}`,
          },
          body: JSON.stringify(keyForm),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("API key updated successfully!");
        setIsEditKeyDialogOpen(false);
        setEditingKey(null);
        fetchApiKeys(); // Refresh the list
      } else {
        alert("Failed to update API key: " + data.message);
      }
    } catch (error) {
      console.error("Error updating API key:", error);
      alert("Failed to update API key");
    } finally {
      setIsUpdatingKey(false);
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

        {/* API Keys Management */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center">
              <Key className="h-5 w-5 mr-2" />
              API Keys
            </h2>
            {/* Show Generate button only if user is ADMINISTRATOR or USER with no API keys */}
            {(session?.user?.role === "ADMINISTRATOR" ||
              (session?.user?.role === "USER" && apiKeys.length === 0)) && (
              <button
                onClick={() => setIsCreateKeyDialogOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Generate API Key
              </button>
            )}
          </div>

          {isApiKeysLoading ? (
            <div className="text-center py-4">
              <div className="text-slate-500">Loading API keys...</div>
            </div>
          ) : apiKeys.length === 0 ? (
            <div className="text-center py-8">
              <Key className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <div className="text-slate-500 mb-2">No API keys found</div>
              <div className="text-sm text-slate-400">
                Create your first API key to start using the API
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((key) => (
                <div
                  key={key.id}
                  className="border border-slate-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-slate-900">
                          {key.name}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            key.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {key.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Usage Count:</span>
                          <span className="ml-1 text-slate-900">
                            {key.usageCount}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Rate Limit:</span>
                          <span className="ml-1 text-slate-900">
                            {key.rateLimit}/hour
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">Created:</span>
                          <span className="ml-1 text-slate-900">
                            {new Date(key.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {key.lastUsedAt && (
                        <div className="text-sm mt-2">
                          <span className="text-slate-500">Last Used:</span>
                          <span className="ml-1 text-slate-900">
                            {new Date(key.lastUsedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="mt-3">
                        <div className="text-xs text-slate-500 mb-1">
                          Permissions:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(key.permissions).map(
                            ([category, perms]) =>
                              Object.entries(perms).map(
                                ([action, allowed]) =>
                                  allowed && (
                                    <span
                                      key={`${category}-${action}`}
                                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                    >
                                      {category}.{action}
                                    </span>
                                  )
                              )
                          )}
                        </div>
                      </div>

                      {/* API Key Display */}
                      <div className="mt-3">
                        <div className="text-xs text-slate-500 mb-1">
                          API Key:
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={key.apiKey || key.plainKey}
                            readOnly
                            className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono"
                          />
                          <button
                            onClick={() =>
                              copyToClipboard(key.apiKey || key.plainKey)
                            }
                            className="p-1 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded"
                            title="Copy API key"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex gap-2">
                      <button
                        onClick={() => handleEditApiKey(key)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                        title="Edit API key"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteApiKey(key.id, key.name)}
                        disabled={deletingKeyId === key.id}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete API key"
                      >
                        {deletingKeyId === key.id ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Create API Key Dialog */}
      <Dialog
        open={isCreateKeyDialogOpen}
        onOpenChange={setIsCreateKeyDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generate New API Key</DialogTitle>
            <DialogDescription>
              Create a new API key with specific permissions for this instance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Key Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Key Name
              </label>
              <input
                type="text"
                value={keyForm.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="e.g., Production API Key"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Rate Limit */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Rate Limit (requests per hour)
              </label>
              <input
                type="number"
                value={keyForm.rateLimit}
                onChange={(e) =>
                  handleFormChange("rateLimit", parseInt(e.target.value))
                }
                min="1"
                max="10000"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Permissions
              </label>

              {/* Messages Permissions */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-600 mb-2">
                  Messages
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={keyForm.permissions.messages.send}
                      onChange={(e) =>
                        handleFormChange(
                          "permissions.messages.send",
                          e.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      Send messages
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={keyForm.permissions.messages.receive}
                      onChange={(e) =>
                        handleFormChange(
                          "permissions.messages.receive",
                          e.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      Receive messages
                    </span>
                  </label>
                </div>
              </div>

              {/* Contacts Permissions */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-600 mb-2">
                  Contacts
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={keyForm.permissions.contacts.check}
                      onChange={(e) =>
                        handleFormChange(
                          "permissions.contacts.check",
                          e.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      Check contacts
                    </span>
                  </label>
                </div>
              </div>

              {/* Instance Permissions */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-600 mb-2">
                  Instance
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={keyForm.permissions.instance.info}
                      onChange={(e) =>
                        handleFormChange(
                          "permissions.instance.info",
                          e.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      Get instance info
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={keyForm.permissions.instance.stats}
                      onChange={(e) =>
                        handleFormChange(
                          "permissions.instance.stats",
                          e.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      Get instance stats
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => setIsCreateKeyDialogOpen(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateApiKey}
                disabled={isCreatingKey || !keyForm.name.trim()}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {isCreatingKey ? "Creating..." : "Generate API Key"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit API Key Dialog */}
      <Dialog open={isEditKeyDialogOpen} onOpenChange={setIsEditKeyDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit API Key</DialogTitle>
            <DialogDescription>
              Update the API key settings and permissions.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Key Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Key Name
              </label>
              <input
                type="text"
                value={keyForm.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                placeholder="e.g., Production API Key"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Rate Limit */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Rate Limit (requests per hour)
              </label>
              <input
                type="number"
                value={keyForm.rateLimit}
                onChange={(e) =>
                  handleFormChange("rateLimit", parseInt(e.target.value))
                }
                min="1"
                max="10000"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Active Status */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={keyForm.isActive}
                  onChange={(e) =>
                    handleFormChange("isActive", e.target.checked)
                  }
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-slate-700">
                  API Key is Active
                </span>
              </label>
            </div>

            {/* Permissions */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Permissions
              </label>

              {/* Messages Permissions */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-600 mb-2">
                  Messages
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={keyForm.permissions.messages.send}
                      onChange={(e) =>
                        handleFormChange(
                          "permissions.messages.send",
                          e.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      Send messages
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={keyForm.permissions.messages.receive}
                      onChange={(e) =>
                        handleFormChange(
                          "permissions.messages.receive",
                          e.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      Receive messages
                    </span>
                  </label>
                </div>
              </div>

              {/* Contacts Permissions */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-600 mb-2">
                  Contacts
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={keyForm.permissions.contacts.check}
                      onChange={(e) =>
                        handleFormChange(
                          "permissions.contacts.check",
                          e.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      Check contacts
                    </span>
                  </label>
                </div>
              </div>

              {/* Instance Permissions */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-600 mb-2">
                  Instance
                </h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={keyForm.permissions.instance.info}
                      onChange={(e) =>
                        handleFormChange(
                          "permissions.instance.info",
                          e.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      Get instance info
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={keyForm.permissions.instance.stats}
                      onChange={(e) =>
                        handleFormChange(
                          "permissions.instance.stats",
                          e.target.checked
                        )
                      }
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-slate-700">
                      Get instance stats
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={() => {
                  setIsEditKeyDialogOpen(false);
                  setEditingKey(null);
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateApiKey}
                disabled={isUpdatingKey || !keyForm.name.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                {isUpdatingKey ? "Updating..." : "Update API Key"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
