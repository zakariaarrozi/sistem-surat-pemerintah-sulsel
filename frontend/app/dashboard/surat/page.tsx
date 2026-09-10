"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSurat, bulkDeleteSurat } from "../../../lib/api";
import { toast } from "../../components/Toast";
import StatusBadge from "../../components/StatusBadge";
import ConfirmModal from "../../components/ConfirmModal";

type Surat = {
  id: number;
  nomorSurat: string;
  tanggalSurat: string;
  status: string;
  keterangan: string | null;
  lampiran?: any[];
  asalSurat?: { id: number; nama: string } | null;
  tujuanSurat?: { id: number; tujuanId: number; tujuan?: { id: number; nama: string } }[];
  kabupatenSurat?: { id: number; kabupatenId: number; kabupaten?: { id: number; nama: string } }[];
};

const STATUS_OPTIONS = [
  { value: "", label: "Semua Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "TERKIRIM", label: "Terkirim" },
  { value: "DIPROSES", label: "Diproses" },
  { value: "SELESAI", label: "Selesai" },
  { value: "DITOLAK", label: "Ditolak" },
];

const ITEMS_PER_PAGE = 15;

function formatTanggal(tanggal: string) {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function getTujuanDisplay(item: Surat): string {
  if (item.tujuanSurat?.length) {
    return item.tujuanSurat.map((t) => t.tujuan?.nama ?? `#${t.tujuanId}`).join(", ");
  }
  if (item.kabupatenSurat?.length) {
    return item.kabupatenSurat.map((k) => k.kabupaten?.nama ?? `#${k.kabupatenId}`).join(", ");
  }
  return "—";
}

export default function DaftarSuratPage() {
  const [surat, setSurat] = useState<Surat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [role, setRole] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try { setRole(JSON.parse(saved)?.role ?? ""); } catch { /* */ }
    }

    const load = async () => {
      try {
        setLoading(true);
        const result = await getSurat();
        if (result?.success) {
          setSurat(result.data ?? []);
        } else {
          setError(result?.message ?? "Gagal mengambil data surat.");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengambil data surat.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter + Search
  const filtered = useMemo(() => {
    let data = surat;
    if (filterStatus) data = data.filter((s) => s.status === filterStatus);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      data = data.filter(
        (s) =>
          s.nomorSurat.toLowerCase().includes(q) ||
          (s.asalSurat?.nama ?? "").toLowerCase().includes(q)
      );
    }
    return data;
  }, [surat, search, filterStatus]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Reset page ketika filter berubah
  useEffect(() => { setPage(1); setSelectedIds([]); }, [search, filterStatus]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginated.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const doDeleteSelected = async () => {
    setShowConfirm(false);
    setIsDeleting(true);
    try {
      const res = await bulkDeleteSurat(selectedIds);
      if (res?.success) {
        toast(res.message || "Berhasil dihapus", "success");
        setSelectedIds([]);
        const result = await getSurat();
        if (result?.success) setSurat(result.data ?? []);
      } else {
        toast(res?.message || "Gagal menghapus", "error");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menghapus", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="page-content">
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        title="Hapus Surat"
        message={`Yakin ingin menghapus ${selectedIds.length} surat yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel={isDeleting ? "Menghapus..." : "Ya, Hapus"}
        danger
        onConfirm={doDeleteSelected}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Daftar Surat</h1>
            <p className="page-subtitle">
              Surat yang dapat diakses berdasarkan kewenangan akun.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            {(role === "OPERATOR" || role === "USER_INSTANSI") && selectedIds.length > 0 && (
              <button
                className="btn btn-danger"
                onClick={() => setShowConfirm(true)}
                disabled={isDeleting}
              >
                {isDeleting ? "Menghapus..." : `Hapus Terpilih (${selectedIds.length})`}
              </button>
            )}
            {(role === "OPERATOR" || role === "USER_INSTANSI") && (
              <Link href="/dashboard/surat/buat" className="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Buat Surat
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor surat atau asal surat..."
            className="search-input"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="filter-select"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {(search || filterStatus) && (
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => { setSearch(""); setFilterStatus(""); }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Error */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {(role === "OPERATOR" || role === "USER_INSTANSI") && <th style={{ width: 40 }}></th>}
                {["No", "Nomor Surat", "Tanggal", "Asal Surat", "Tujuan", "Status", "Aksi"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {(role === "OPERATOR" || role === "USER_INSTANSI") && (
                    <td>
                      <div className="skeleton" style={{ height: 16, width: 16, borderRadius: 4 }} />
                    </td>
                  )}
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j}>
                      <div className="skeleton" style={{ height: 16, width: j === 6 ? 64 : "80%", borderRadius: 4 }} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
            <div className="empty-title">
              {search || filterStatus ? "Tidak ada surat yang cocok" : "Belum ada surat"}
            </div>
            <div className="empty-text">
              {search || filterStatus
                ? "Coba ubah kata kunci atau filter."
                : "Belum ada surat yang dapat ditampilkan untuk akun ini."}
            </div>
            {(role === "OPERATOR" || role === "USER_INSTANSI") && !search && !filterStatus && (
              <Link href="/dashboard/surat/buat" className="btn btn-primary">
                Buat Surat Pertama
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {(role === "OPERATOR" || role === "USER_INSTANSI") && (
                    <th style={{ width: 40, paddingLeft: 16 }}>
                      <input
                        type="checkbox"
                        checked={paginated.length > 0 && paginated.every(s => selectedIds.includes(s.id))}
                        onChange={handleSelectAll}
                      />
                    </th>
                  )}
                  <th>No</th>
                  <th>Nomor Surat</th>
                  <th>Tanggal</th>
                  <th>Asal Surat</th>
                  <th>Tujuan</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((item, idx) => (
                  <tr key={item.id} className={selectedIds.includes(item.id) ? "selected-row" : ""}>
                    {(role === "OPERATOR" || role === "USER_INSTANSI") && (
                      <td style={{ paddingLeft: 16 }}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => handleSelect(item.id)}
                        />
                      </td>
                    )}
                    <td style={{ color: "var(--slate-400)", fontSize: 12 }}>
                      {(page - 1) * ITEMS_PER_PAGE + idx + 1}
                    </td>
                    <td>
                      <div className="td-main">{item.nomorSurat}</div>
                      {item.lampiran && item.lampiran.length > 0 && (
                        <div className="td-sub">📎 {item.lampiran.length} Lampiran</div>
                      )}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {formatTanggal(item.tanggalSurat)}
                    </td>
                    <td>{item.asalSurat?.nama ?? "—"}</td>
                    <td>
                      <div style={{ maxWidth: 240, fontSize: 13, color: "var(--slate-600)" }}>
                        {getTujuanDisplay(item)}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={item.status} />
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Link
                        href={`/dashboard/surat/${item.id}`}
                        className="btn btn-ghost btn-sm"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Table Footer */}
            <div className="table-footer" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>
                Menampilkan{" "}
                <strong>{(page - 1) * ITEMS_PER_PAGE + 1}–{Math.min(page * ITEMS_PER_PAGE, filtered.length)}</strong>{" "}
                dari <strong>{filtered.length}</strong> surat
              </span>

              {totalPages > 1 && (
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    ← Sebelumnya
                  </button>
                  <span style={{ fontSize: 12, color: "var(--slate-500)", padding: "0 4px" }}>
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Berikutnya →
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}