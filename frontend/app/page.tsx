"use client";

import { FormEvent, useState } from "react";

const API_URL = "/api";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Login gagal.");
        return;
      }

      if (result.data?.token) {
        // Simpan di localStorage untuk penggunaan client-side
        localStorage.setItem("token", result.data.token);

        // Simpan di cookie agar middleware Next.js bisa baca (server-side)
        document.cookie = `token=${result.data.token}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;
      }

      if (result.data?.user) {
        localStorage.setItem("user", JSON.stringify(result.data.user));
      }

      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      setError("Tidak dapat terhubung ke server. Pastikan backend sedang berjalan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-bg-orb login-bg-orb-1" />
      <div className="login-bg-orb login-bg-orb-2" />

      <div className="login-card-wrapper">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo-area">
            <div className="login-logo">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M6 4h14l6 6v18H6V4z" fill="#3b82f6" opacity="0.2"/>
                <path d="M6 4h14l6 6v18H6V4z" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M20 4v6h6" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="10" y1="13" x2="22" y2="13" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="10" y1="17" x2="22" y2="17" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
                <line x1="10" y1="21" x2="17" y2="21" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>

            <h1 className="login-title" style={{ fontSize: "1.25rem", lineHeight: "1.6" }}>
              Jaring Komunikasi Sandi Pemerintah Provinsi Sulawesi Selatan
            </h1>
          </div>

          {/* Error */}
          {error && (
            <div className="alert alert-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email"
                autoComplete="email"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  Memproses...
                </>
              ) : (
                "Masuk ke Sistem"
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>© 2026 Pemerintah Provinsi Sulawesi Selatan</p>
          </div>
        </div>
      </div>
    </main>
  );
}