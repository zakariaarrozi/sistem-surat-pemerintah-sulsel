"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BACKEND_URL = "http://localhost:5000";

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: string;
  adminType: string | null;
  instansi: { nama: string } | null;
  createdAt: string;
}

export default function DaftarUserPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [resettingId, setResettingId] = useState<number | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const res = await fetch(`${BACKEND_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal mengambil data user");

      setUsers(result.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus akun "${name}"?`)) return;

    try {
      setDeletingId(id);
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal menghapus user");

      setUsers(users.filter(u => u.id !== id));
      alert("Akun berhasil dihapus.");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan saat menghapus");
    } finally {
      setDeletingId(null);
    }
  };

  const handleResetPassword = async (id: number, name: string) => {
    const customPassword = window.prompt(
      `Masukkan sandi baru untuk akun "${name}":`,
      "Default@123"
    );

    if (customPassword === null) return; // User membatalkan
    if (customPassword.trim().length < 6) {
      alert("Sandi baru harus minimal 6 karakter!");
      return;
    }

    try {
      setResettingId(id);
      const token = localStorage.getItem("token");
      const res = await fetch(`${BACKEND_URL}/api/users/${id}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword: customPassword.trim() }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Gagal mereset sandi");

      alert(`Sukses! Sandi untuk akun "${name}" telah direset.\n\nSandi Baru: ${result.newPassword}\n\nSilakan berikan sandi ini kepada pemilik akun.`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan saat mereset sandi");
    } finally {
      setResettingId(null);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try { setCurrentUser(JSON.parse(savedUser)); } catch {}
    }
    fetchUsers();
  }, [router]);

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  });

  return (
    <div className="page-content">
      <div className="breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        Master Data
        <span className="breadcrumb-sep">›</span>
        Daftar User
      </div>

      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 className="page-title">Daftar User Aktif</h1>
          <p className="page-subtitle">Kelola dan lihat semua pengguna sistem</p>
        </div>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Cari nama, email, atau role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              padding: "10px 16px",
              paddingLeft: "36px",
              border: "1px solid var(--slate-200)",
              borderRadius: "8px",
              width: "280px",
              fontSize: "14px",
              outline: "none",
              transition: "all 0.2s"
            }}
            onFocus={(e) => e.target.style.borderColor = "var(--blue-500)"}
            onBlur={(e) => e.target.style.borderColor = "var(--slate-200)"}
          />
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--slate-400)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--slate-500)" }}>Memuat data...</div>
          ) : users.length === 0 ? (
            <div className="empty-state">Belum ada user yang terdaftar.</div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">Pencarian "{searchQuery}" tidak ditemukan.</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Tipe / Asal Surat</th>
                    <th>Tgl Daftar</th>
                    <th style={{ textAlign: "center" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td style={{ fontWeight: 500, color: "var(--slate-900)" }}>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span style={{
                          display: "inline-block",
                          padding: "4px 8px",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          backgroundColor: user.role === "SUPERADMIN" ? "var(--red-100)" : "var(--slate-100)",
                          color: user.role === "SUPERADMIN" ? "var(--red-700)" : "var(--slate-700)"
                        }}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        {user.role === "ADMIN" ? (
                          <span style={{ color: "var(--primary-600)", fontWeight: 500 }}>
                            Admin {user.adminType}
                          </span>
                        ) : user.role === "USER_INSTANSI" ? (
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ fontSize: 13, color: "var(--slate-600)" }}>Instansi:</span>
                            <span style={{ fontWeight: 500 }}>{user.instansi?.nama || "—"}</span>
                          </div>
                        ) : (
                          <span style={{ color: "var(--slate-400)" }}>—</span>
                        )}
                      </td>
                      <td style={{ color: "var(--slate-500)", fontSize: 13 }}>
                        {new Date(user.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {currentUser?.id !== user.id ? (
                          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                            <button
                              onClick={() => handleResetPassword(user.id, user.name)}
                              disabled={resettingId === user.id}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: resettingId === user.id ? "var(--orange-300)" : "var(--orange-500)",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: resettingId === user.id ? "not-allowed" : "pointer",
                                transition: "background 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                if (resettingId !== user.id) e.currentTarget.style.backgroundColor = "var(--orange-600)";
                              }}
                              onMouseLeave={(e) => {
                                if (resettingId !== user.id) e.currentTarget.style.backgroundColor = "var(--orange-500)";
                              }}
                            >
                              {resettingId === user.id ? "Mereset..." : "Reset Sandi"}
                            </button>
                            <button
                              onClick={() => handleDelete(user.id, user.name)}
                              disabled={deletingId === user.id}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: deletingId === user.id ? "var(--red-300)" : "var(--red-600)",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: deletingId === user.id ? "not-allowed" : "pointer",
                                transition: "background 0.2s"
                              }}
                              onMouseEnter={(e) => {
                                if (deletingId !== user.id) e.currentTarget.style.backgroundColor = "var(--red-700)";
                              }}
                              onMouseLeave={(e) => {
                                if (deletingId !== user.id) e.currentTarget.style.backgroundColor = "var(--red-600)";
                              }}
                            >
                              {deletingId === user.id ? "Menghapus..." : "Hapus"}
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: "var(--slate-400)", fontStyle: "italic" }}>
                            Akun Anda
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
