import DashboardLayout from "./dashboard-layout";

export default function Home() {
  return (
    <DashboardLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-2">Total Instances</h2>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-2">Active Automations</h2>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h2 className="text-lg font-medium mb-2">Messages Today</h2>
            <p className="text-3xl font-bold">0</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm mt-5">
          <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
          <div className="text-base text-slate-500 flex items-center justify-center h-32">
            No recent activity to display
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
