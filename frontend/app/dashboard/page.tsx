"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSurat } from "../../lib/api";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  adminType?: string | null;
};

type SuratItem = { status: string };

type Stats = {
  total: number;
  draft: number;
  terkirim: number;
  diproses: number;
  selesai: number;
  ditolak: number;
};

function getRoleLabel(user: User): string {
  if (user.role === "OPERATOR") return "Operator";
  if (user.role === "ADMIN") {
    const map: Record<string, string> = {
      PIMPINAN: "Admin Pimpinan",
      KABUPATEN: "Admin Kabupaten/Kota",
      INSTANSI: "Admin Instansi",
    };
    return map[user.adminType ?? ""] ?? "Admin";
  }
  return user.role;
}

const STAT_CONFIG = [
  { key: "total", label: "Total Surat", cardClass: "stat-card-total", icon: "📄" },
  { key: "draft", label: "Draft", cardClass: "stat-card-draft", icon: "✏️" },
  { key: "terkirim", label: "Terkirim", cardClass: "stat-card-terkirim", icon: "📤" },
  { key: "diproses", label: "Diproses", cardClass: "stat-card-diproses", icon: "⚙️" },
  { key: "selesai", label: "Selesai", cardClass: "stat-card-selesai", icon: "✅" },
  { key: "ditolak", label: "Ditolak", cardClass: "stat-card-ditolak", icon: "❌" },
] as const;

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { localStorage.removeItem("user"); }
    }

    const fetchStats = async () => {
      try {
        const result = await getSurat();
        if (result?.success && Array.isArray(result.data)) {
          const data: SuratItem[] = result.data;
          setStats({
            total: data.length,
            draft: data.filter((s) => s.status === "DRAFT").length,
            terkirim: data.filter((s) => s.status === "TERKIRIM").length,
            diproses: data.filter((s) => s.status === "DIPROSES").length,
            selesai: data.filter((s) => s.status === "SELESAI").length,
            ditolak: data.filter((s) => s.status === "DITOLAK").length,
          });
        }
      } catch {
        // statistik tidak kritikal, abaikan error
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="page-content">
      {/* Greeting */}
      <div className="page-header">
        <h1 className="page-title">
          Selamat datang,{" "}
          <span style={{ color: "var(--blue-600)" }}>
            {user?.name ?? "Pengguna"}
          </span>{" "}
          👋
        </h1>
        <p className="page-subtitle">
          {user ? getRoleLabel(user) : ""} — Sistem Pengelolaan Surat Pemprov Sulawesi Selatan
        </p>
      </div>

      {/* Stat Cards (Sembunyikan untuk SUPERADMIN karena mereka tidak mengurus surat) */}
      {user?.role !== "SUPERADMIN" && (
        <div className="stat-grid">
          {STAT_CONFIG.map(({ key, label, cardClass, icon }) => (
            <div key={key} className={`stat-card ${cardClass}`}>
              <div className="stat-icon" style={{ fontSize: 40 }}>{icon}</div>
              <div className="stat-label">{label}</div>
              <div className="stat-value">
                {loadingStats ? (
                  <span className="skeleton" style={{ display: "inline-block", width: 48, height: 36, borderRadius: 6 }} />
                ) : (
                  stats ? stats[key] : "—"
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <span className="card-title">Aksi Cepat</span>
        </div>
        <div className="card-body">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {user?.role !== "SUPERADMIN" && (
              <Link
                href="/dashboard/surat"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 20px",
                  border: "1.5px solid var(--slate-200)",
                  borderRadius: "var(--radius-lg)",
                  textDecoration: "none",
                  transition: "all var(--transition)",
                  background: "var(--slate-50)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--blue-500)";
                  e.currentTarget.style.background = "var(--blue-50)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--slate-200)";
                  e.currentTarget.style.background = "var(--slate-50)";
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--radius-md)",
                  background: "var(--blue-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--slate-800)" }}>Daftar Surat</div>
                  <div style={{ fontSize: 12, color: "var(--slate-400)", marginTop: 2 }}>Lihat semua surat</div>
                </div>
              </Link>
            )}

            {(user?.role === "OPERATOR" || user?.role === "USER_INSTANSI") && (
              <Link
                href="/dashboard/surat/buat"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "16px 20px",
                  border: "1.5px solid var(--slate-200)",
                  borderRadius: "var(--radius-lg)",
                  textDecoration: "none",
                  transition: "all var(--transition)",
                  background: "var(--slate-50)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--green-500)";
                  e.currentTarget.style.background = "var(--green-100)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--slate-200)";
                  e.currentTarget.style.background = "var(--slate-50)";
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: "var(--radius-md)",
                  background: "var(--green-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "var(--slate-800)" }}>Buat Surat</div>
                  <div style={{ fontSize: 12, color: "var(--slate-400)", marginTop: 2 }}>Buat surat baru</div>
                </div>
              </Link>
            )}

            {/* Aksi Cepat khusus SUPERADMIN */}
            {user?.role === "SUPERADMIN" && (
              <>
                <Link
                  href="/dashboard/master/tujuan"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 20px",
                    border: "1.5px solid var(--slate-200)",
                    borderRadius: "var(--radius-lg)",
                    textDecoration: "none",
                    transition: "all var(--transition)",
                    background: "var(--slate-50)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--blue-500)";
                    e.currentTarget.style.background = "var(--blue-50)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--slate-200)";
                    e.currentTarget.style.background = "var(--slate-50)";
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: "var(--radius-md)",
                    background: "var(--blue-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--slate-800)" }}>Tujuan Surat</div>
                    <div style={{ fontSize: 12, color: "var(--slate-400)", marginTop: 2 }}>Kelola tujuan surat</div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/master/kabupaten"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 20px",
                    border: "1.5px solid var(--slate-200)",
                    borderRadius: "var(--radius-lg)",
                    textDecoration: "none",
                    transition: "all var(--transition)",
                    background: "var(--slate-50)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--orange-500)";
                    e.currentTarget.style.background = "var(--orange-50)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--slate-200)";
                    e.currentTarget.style.background = "var(--slate-50)";
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: "var(--radius-md)",
                    background: "var(--orange-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--orange-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--slate-800)" }}>Kabupaten/Kota</div>
                    <div style={{ fontSize: 12, color: "var(--slate-400)", marginTop: 2 }}>Kelola kabupaten</div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/master/asal-surat"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 20px",
                    border: "1.5px solid var(--slate-200)",
                    borderRadius: "var(--radius-lg)",
                    textDecoration: "none",
                    transition: "all var(--transition)",
                    background: "var(--slate-50)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--teal-500)";
                    e.currentTarget.style.background = "var(--teal-50)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--slate-200)";
                    e.currentTarget.style.background = "var(--slate-50)";
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: "var(--radius-md)",
                    background: "var(--teal-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--teal-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--slate-800)" }}>Asal Surat</div>
                    <div style={{ fontSize: 12, color: "var(--slate-400)", marginTop: 2 }}>Kelola asal surat</div>
                  </div>
                </Link>

                <Link
                  href="/dashboard/master/users"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "16px 20px",
                    border: "1.5px solid var(--slate-200)",
                    borderRadius: "var(--radius-lg)",
                    textDecoration: "none",
                    transition: "all var(--transition)",
                    background: "var(--slate-50)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--purple-500)";
                    e.currentTarget.style.background = "var(--purple-50)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--slate-200)";
                    e.currentTarget.style.background = "var(--slate-50)";
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: "var(--radius-md)",
                    background: "var(--purple-100)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--purple-600)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "var(--slate-800)" }}>Daftar User</div>
                    <div style={{ fontSize: 12, color: "var(--slate-400)", marginTop: 2 }}>Kelola pengguna sistem</div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Informasi Akun</span>
        </div>
        <div className="card-body">
          <div className="detail-grid">
            <div>
              <div className="detail-label">Nama</div>
              <div className="detail-value">{user?.name ?? "—"}</div>
            </div>
            <div>
              <div className="detail-label">Email</div>
              <div className="detail-value">{user?.email ?? "—"}</div>
            </div>
            <div>
              <div className="detail-label">Peran</div>
              <div className="detail-value">{user ? getRoleLabel(user) : "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}