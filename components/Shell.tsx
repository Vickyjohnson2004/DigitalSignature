"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FiBarChart2,
  FiFileText,
  FiPenTool,
  FiShield,
  FiActivity,
  FiLogOut,
  FiUserCheck,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { logout } from "../lib/api";

const links = [
  ["/dashboard", "Dashboard", FiBarChart2],
  ["/documents", "Documents", FiFileText],
  ["/sign", "Sign document", FiPenTool],
  ["/verify", "Verify signature", FiShield],
  ["/benchmark", "Benchmarks", FiActivity],
] as const;

type User = {
  fullName?: string;
  role?: string;
};

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User>({});

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("dss_user");

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      setUser({});
    }
  }, []);

  // Close mobile sidebar whenever the route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [path]);

  // Prevent body scrolling while mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navigation = (
    <nav className="space-y-1">
      {links.map(([href, label, Icon]) => {
        const active = path === href;

        return (
          <Link
            key={href}
            href={href}
            className={`sidebar-link group transition-all duration-200 ${
              active ? "active" : ""
            }`}
            onClick={() => setMobileOpen(false)}
          >
            <Icon className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
            <span>{label}</span>
          </Link>
        );
      })}

      {user.role === "admin" && (
        <Link
          href="/admin"
          className={`sidebar-link group transition-all duration-200 ${
            path === "/admin" ? "active" : ""
          }`}
          onClick={() => setMobileOpen(false)}
        >
          <FiUserCheck className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <span>Admin</span>
        </Link>
      )}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}{" "}
      <aside className="hidden md:flex w-64 lg:w-72 bg-white border-r border-slate-200 p-5 lg:p-6 flex-col shrink-0">
        {" "}
        <Link
          href="/dashboard"
          className="font-black text-xl lg:text-2xl mb-8 text-indigo-600 tracking-tight"
        >
          DigitalSignature{" "}
        </Link>
        ```
        {navigation}
        <button
          onClick={logout}
          className="sidebar-link mt-auto text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
        >
          <FiLogOut className="shrink-0 transition-transform duration-200 group-hover:-translate-x-1" />
          <span>Logout</span>
        </button>
      </aside>
      {/* Mobile Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm md:hidden transition-all duration-300 ${
          mobileOpen
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      {/* Mobile Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-[82%] max-w-sm bg-white shadow-2xl md:hidden flex flex-col p-5 transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Mobile Sidebar Header */}
        <div className="flex items-center justify-between mb-8">
          <Link
            href="/dashboard"
            className="font-black text-xl text-indigo-600 tracking-tight"
            onClick={() => setMobileOpen(false)}
          >
            DigitalSignature
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all duration-200 active:scale-95"
            aria-label="Close navigation menu"
          >
            <FiX size={22} />
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="flex-1 overflow-y-auto">{navigation}</div>

        {/* Mobile User Section */}
        <div className="mt-5 pt-5 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-4 px-3">
            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">
              {user.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="font-semibold text-sm text-slate-900 truncate">
                {user.fullName || "User"}
              </p>

              {user.role && (
                <p className="text-xs text-slate-500 capitalize truncate">
                  {user.role}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={logout}
            className="sidebar-link w-full text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 group"
          >
            <FiLogOut className="shrink-0 transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Responsive Header */}
        <header className="sticky top-0 z-30 h-16 md:h-[68px] bg-white/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-4 sm:px-5 md:px-8">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-200 active:scale-95"
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
            >
              <FiMenu size={22} />
            </button>

            {/* Mobile Logo */}
            <Link
              href="/dashboard"
              className="md:hidden font-black text-lg sm:text-xl text-indigo-600 truncate"
            >
              DigitalSignature
            </Link>

            {/* Desktop Page Title */}
            <div className="hidden md:block font-bold text-slate-900 truncate">
              {links.find((x) => x[0] === path)?.[1] || "Administration"}
            </div>
          </div>

          {/* Desktop User */}
          <div className="hidden sm:flex items-center gap-3 ml-4">
            <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
              {user.fullName?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="hidden lg:block text-right max-w-[180px]">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user.fullName || "User"}
              </p>

              {user.role && (
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              )}
            </div>
          </div>

          {/* Small Mobile User Avatar */}
          <div className="sm:hidden w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0">
            {user.fullName?.charAt(0)?.toUpperCase() || "U"}
          </div>
        </header>

        {/* Page Content */}
        <div className="w-full max-w-7xl mx-auto p-4 sm:p-5 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
