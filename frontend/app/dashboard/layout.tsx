
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  adminType?: string | null;
};

function getRoleLabel(user: User): string {
  if (user.role === "OPERATOR") return "Operator";
  if (user.role === "ADMIN") {
    const map: Record<string, string> = {
      PIMPINAN: "Admin Pimpinan",
      KABUPATEN: "Admin Kabupaten",
      INSTANSI: "Admin Instansi",
    };
    return map[user.adminType ?? ""] ?? "Admin";
  }
  return user.role;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function NavLink({
  href,
  icon,
  label,
  pathname,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  pathname: string;
}) {
  const isActive = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link href={href} className={`nav-item ${isActive ? "active" : ""}`}>
      <span className="nav-icon">{icon}</span>
      {label}
    </Link>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Tutup sidebar saat pindah halaman (route change)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Hapus cookie juga
    document.cookie = "token=; path=/; max-age=0";
    window.location.href = "/";
  };

  return (
    <div className="app-shell">
      {/* SIDEBAR */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <Link href="/dashboard" className="sidebar-logo">
            <div className="sidebar-logo-icon">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <path d="M6 4h14l6 6v18H6V4z" fill="white" opacity="0.25" />
                <path d="M6 4h14l6 6v18H6V4z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M20 4v6h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="10" y1="13" x2="22" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="10" y1="17" x2="22" y2="17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="10" y1="21" x2="17" y2="21" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="sidebar-logo-text">
              <span className="sidebar-logo-title">Sistem Surat</span>
              <span className="sidebar-logo-sub">Sulawesi Selatan</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-label">Menu Utama</div>

          <NavLink
            href="/dashboard"
            pathname={pathname}
            label="Dashboard"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
            }
          />

          {user?.role !== "SUPERADMIN" && (
            <NavLink
              href="/dashboard/surat"
              pathname={pathname}
              label="Daftar Surat"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              }
            />
          )}

          {(user?.role === "OPERATOR" || user?.role === "USER_INSTANSI") && (
            <NavLink
              href="/dashboard/surat/buat"
              pathname={pathname}
              label="Buat Surat"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              }
            />
          )}

          {user?.role === "SUPERADMIN" && (
            <>
              <div className="sidebar-nav-label">Master Data</div>
              <NavLink
                href="/dashboard/master/tujuan"
                pathname={pathname}
                label="Tujuan Surat"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                }
              />
              <NavLink
                href="/dashboard/master/kabupaten"
                pathname={pathname}
                label="Kabupaten/Kota"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                }
              />
              <NavLink
                href="/dashboard/master/asal-surat"
                pathname={pathname}
                label="Asal Surat"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                }
              />
              <NavLink
                href="/dashboard/master/users"
                pathname={pathname}
                label="Daftar User"
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                }
              />
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          {user && (
            <div className="sidebar-user">
              <div className="sidebar-avatar">{getInitials(user.name)}</div>
              <div className="sidebar-user-info">
                <div className="sidebar-user-name">{user.name}</div>
                <div className="sidebar-user-role">{getRoleLabel(user)}</div>
              </div>
            </div>
          )}

          <button type="button" className="btn-logout" onClick={handleLogout}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`app-main ${isSidebarOpen ? "sidebar-open" : ""}`}>
        {/* TOPBAR */}
        <header className="topbar">
          <button 
            className="menu-toggle-btn" 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </header>

        {children}
      </main>
    </div>
  );
}
