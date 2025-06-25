import { Sidebar } from "@/components/sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-6 lg:p-8 bg-slate-100">
        {children}
      </main>
    </div>
  );
}