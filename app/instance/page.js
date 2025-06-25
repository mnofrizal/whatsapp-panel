import DashboardLayout from "../dashboard-layout";

export default function InstancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold mb-4">Instance Management</h1>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-lg font-medium">Your Instances</h2>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-base font-medium">
              Create New Instance
            </button>
          </div>
          <div className="border rounded-md overflow-hidden">
            <div className="text-base text-slate-500 flex items-center justify-center h-32">
              No instances found. Create a new instance to get started.
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}