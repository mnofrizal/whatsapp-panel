"use client";

import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Home, Settings, GitBranch, Puzzle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function InstanceLayout({ children }) {
  const params = useParams();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isCompact, setIsCompact] = useState(false);
  const [instanceName, setInstanceName] = useState("");

  const navItems = [
    {
      path: `/instance/${params.id}`,
      name: "Dashboard",
      icon: Home,
    },
    {
      path: `/instance/${params.id}/settings`,
      name: "Settings",
      icon: Settings,
    },
    {
      path: `/instance/${params.id}/automation`,
      name: "Automation",
      icon: GitBranch,
    },
    {
      path: `/instance/${params.id}/integrations`,
      name: "Integrations",
      icon: Puzzle,
    },
  ];

  useEffect(() => {
    if (session && params.id) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/instances/${params.id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setInstanceName(data.data.instance.name);
          }
        })
        .catch((error) => {
          console.error("Error fetching instance:", error);
        });
    }
  }, [session, params.id]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Instance Sidebar */}
      <motion.aside
        animate={{ width: isCompact ? 80 : 288 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="min-h-screen bg-white border-r border-slate-200 p-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <motion.div
            animate={{ opacity: isCompact ? 0 : 1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center"
          >
            {!isCompact && (
              <div>
                <h1 className="text-lg font-bold text-slate-900">Instance</h1>
                <p className="text-sm text-slate-500 truncate">
                  {instanceName || `ID: ${params.id}`}
                </p>
              </div>
            )}
          </motion.div>
          <button
            onClick={() => setIsCompact(!isCompact)}
            className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            {isCompact ? (
              <Home className="h-5 w-5" />
            ) : (
              <ArrowLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Back to Main Dashboard */}
        <div className="mb-6 pb-4 border-b border-slate-200">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            title={isCompact ? "Back to Dashboard" : undefined}
          >
            <ArrowLeft className="h-4 w-4 flex-shrink-0" />
            <motion.span
              animate={{
                opacity: isCompact ? 0 : 1,
                width: isCompact ? 0 : "auto",
              }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              {!isCompact && "Back to Dashboard"}
            </motion.span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                  isActive
                    ? "bg-green-100 text-green-900"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
                title={isCompact ? item.name : undefined}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <motion.span
                  animate={{
                    opacity: isCompact ? 0 : 1,
                    width: isCompact ? 0 : "auto",
                  }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {!isCompact && item.name}
                </motion.span>
              </Link>
            );
          })}
        </nav>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-8">{children}</main>
    </div>
  );
}
