"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  MessageSquare,
  GitBranch,
  Menu,
  X,
  LogOut,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useSession } from "next-auth/react";

const navItems = [
  {
    path: "/",
    name: "Home",
    icon: Home,
  },
  {
    path: "/instance",
    name: "Instance",
    icon: MessageSquare,
  },
  {
    path: "/automation",
    name: "Automation",
    icon: GitBranch,
  },
];

const authItems = [
  {
    path: "/login",
    name: "Login",
    icon: User,
  },
  {
    action: "logout",
    name: "Logout",
    icon: LogOut,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCompact, setIsCompact] = useState(false);
  const { data: session } = useSession();

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <motion.aside
      animate={{ width: isCompact ? 80 : 288 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="min-h-screen bg-slate-50 border-r border-slate-200 p-5"
    >
      <div className="flex items-center justify-between mb-8">
        <motion.h1
          animate={{ opacity: isCompact ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className="text-xl font-bold pl-2"
        >
          {!isCompact &&
            (session ? `Hi, ${session.user.name}` : "WhatsApp Panel")}
        </motion.h1>
        <button
          onClick={() => setIsCompact(!isCompact)}
          className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
        >
          {isCompact ? <Menu className="h-5 w-5" /> : <X className="h-5 w-5" />}
        </button>
      </div>
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
                  ? "bg-slate-200 text-slate-900"
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

      {/* Auth Section */}
      <div className="mt-auto pt-5 border-t border-slate-200">
        <nav className="space-y-2">
          {authItems.map((item) => {
            if (item.action === "logout") {
              return (
                <button
                  key="logout"
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-base font-medium transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900 w-full text-left"
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
                </button>
              );
            }

            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-base font-medium transition-colors",
                  isActive
                    ? "bg-slate-200 text-slate-900"
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
      </div>
    </motion.aside>
  );
}
