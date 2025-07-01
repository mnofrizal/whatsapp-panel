"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Home() {
  const { data: session } = useSession();
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (session) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/instances`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setInstances(data.data.instances);
          }
          setLoading(false);
        });
    }
  }, [session]);

  const handleDeleteInstance = async (instanceId) => {
    if (
      !confirm(
        "Are you sure you want to delete this instance? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/instances/${instanceId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setInstances((prevInstances) =>
          prevInstances.filter((instance) => instance.id !== instanceId)
        );
        alert("Instance deleted successfully!");
      } else {
        alert("Failed to delete instance: " + data.message);
      }
    } catch (error) {
      console.error("Error deleting instance:", error);
      alert("Failed to delete instance.");
    }
  };

  const handleCreateInstance = async (e) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/instances`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Refresh the instances list
        const instancesResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/instances`,
          {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
          }
        );
        const instancesData = await instancesResponse.json();

        if (instancesData.success) {
          setInstances(instancesData.data.instances);
        }

        // Reset form and close dialog
        setFormData({ name: "", displayName: "", description: "" });
        setIsDialogOpen(false);
      } else {
        alert("Failed to create instance: " + data.message);
      }
    } catch (error) {
      console.error("Error creating instance:", error);
      alert("Failed to create instance");
    }

    setIsCreating(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900">WhatsApp Panel</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-base font-medium">
                Create New Instance
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Instance</DialogTitle>
                <DialogDescription>
                  Create a new WhatsApp instance to manage your conversations.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateInstance} className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Instance Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., my-whatsapp-instance"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="displayName"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Display Name *
                  </label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="e.g., My WhatsApp Instance"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-slate-700 mb-2"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Brief description of this instance"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-md transition-colors"
                  >
                    {isCreating ? "Creating..." : "Create Instance"}
                  </button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Dashboard Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-2 text-slate-700">
              Total Instances
            </h2>
            <p className="text-3xl font-bold text-slate-900">
              {instances.length}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-2 text-slate-700">
              Active Instances
            </h2>
            <p className="text-3xl font-bold text-green-600">
              {
                instances.filter((instance) => instance.status === "CONNECTED")
                  .length
              }
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-2 text-slate-700">
              Disconnected
            </h2>
            <p className="text-3xl font-bold text-red-600">
              {
                instances.filter(
                  (instance) => instance.status === "DISCONNECTED"
                ).length
              }
            </p>
          </div>
        </div>

        {/* Instance Management */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">
              Your Instances
            </h2>
          </div>
          <div className="overflow-hidden">
            {loading ? (
              <div className="text-base text-slate-500 flex items-center justify-center h-32">
                Loading...
              </div>
            ) : instances.length === 0 ? (
              <div className="text-base text-slate-500 flex items-center justify-center h-32">
                No instances found. Create a new instance to get started.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Created At
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {instances.map((instance) => (
                    <tr key={instance.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                        {instance.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(instance.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/instance/${instance.id}`}
                          className="text-green-600 hover:text-green-900 font-medium mr-4"
                        >
                          Manage
                        </Link>
                        <button
                          onClick={() => handleDeleteInstance(instance.id)}
                          className="text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
