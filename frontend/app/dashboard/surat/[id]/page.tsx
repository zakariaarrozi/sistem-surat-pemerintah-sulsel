"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getSuratById, updateSuratStatus, deleteSurat } from "../../../../lib/api";
import StatusBadge from "../../../components/StatusBadge";
import ConfirmModal from "../../../components/ConfirmModal";
import { toast } from "../../../components/Toast";

const BACKEND_URL = "http://localhost:5000";

type TujuanItem = {
  id: number;
  tujuanId: number;
  status?: string;
  catatan?: string | null;
  processedUser?: { id: number; name: string } | null;
  tujuan?: { id: number; nama: string };
};

type KabupatenItem = {
  id: number;
  kabupatenId: number;
  status?: string;
  catatan?: string | null;
  processedUser?: { id: number; name: string } | null;
  kabupaten?: { id: number; nama: string };
};

type Surat = {
  id: number;
  nomorSurat: string;
  tanggalSurat: string;
  status: string;
  keterangan: string | null;
  lampiran?: any[];
  asalSurat?: { id: number; nama: string } | null;
  tujuanSurat?: TujuanItem[];
  tembusanSurat?: TujuanItem[];
  kabupatenSurat?: KabupatenItem[];
  user?: { id: number; name: string; email: string; role: string };
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  adminType?: string | null;
};

function formatTanggal(tanggal: string) {
  return new Date(tanggal).toLocaleDateString("id-ID", {
    day: "2-digit", month: "long", year: "numeric",
  });
}

// Modal untuk input catatan penolakan
function CatatanModal({
  isOpen,
  targetName,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  targetName: string;
  onConfirm: (catatan: string) => void;
  onCancel: () => void;
}) {
  const [catatan, setCatatan] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCatatan("");
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div style={{
        background: "var(--white)", borderRadius: "var(--radius-xl)",
        boxShadow: "var(--shadow-xl)", padding: 28, width: "100%", maxWidth: 480,
        animation: "modal-in 0.2s ease",
      }}>
        <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 6, color: "var(--slate-800)" }}>
          Tolak Surat
        </h3>
        <p style={{ fontSize: 13, color: "var(--slate-500)", marginBottom: 20 }}>
          {targetName
            ? `Masukkan alasan penolakan untuk "${targetName}".`
            : "Masukkan alasan penolakan surat ini."}
          {" "}Keterangan akan terlihat oleh operator.
        </p>
        <div className="form-group" style={{ marginBottom: 20 }}>
          <label className="form-label">Catatan / Alasan Penolakan</label>
          <textarea
            ref={textareaRef}
            className="form-textarea"
            rows={4}
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Contoh: Dokumen belum lengkap, nomor surat tidak sesuai format..."
          />
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => onConfirm(catatan)}
          >
            Konfirmasi Tolak
          </button>
        </div>
      </div>
    </div>
  );
}

// Progress bar komponen
function ProgressRing({
  selesai, total, ditolak,
}: { selesai: number; total: number; ditolak: number }) {
  const pending = total - selesai - ditolak;
  const pctSelesai = total > 0 ? (selesai / total) * 100 : 0;
  const pctDitolak = total > 0 ? (ditolak / total) * 100 : 0;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 13, color: "var(--slate-600)", fontWeight: 500 }}>
          Progres Persetujuan
        </span>
        <span style={{ fontSize: 13, fontWeight: 700, color: "var(--slate-700)" }}>
          {selesai}/{total} tujuan selesai
        </span>
      </div>
      <div style={{
        height: 10, borderRadius: 99, background: "var(--slate-100)",
        overflow: "hidden", display: "flex",
      }}>
        <div style={{
          width: `${pctSelesai}%`, background: "var(--green-500)",
          transition: "width 0.4s ease",
        }} />
        <div style={{
          width: `${pctDitolak}%`, background: "var(--red-400)",
          transition: "width 0.4s ease",
        }} />
      </div>
      <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 12 }}>
        <span style={{ color: "var(--green-600)", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green-500)", display: "inline-block" }} />
          Selesai: {selesai}
        </span>
        {ditolak > 0 && (
          <span style={{ color: "var(--red-600)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--red-400)", display: "inline-block" }} />
            Ditolak: {ditolak}
          </span>
        )}
        {pending > 0 && (
          <span style={{ color: "var(--slate-500)", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--slate-300)", display: "inline-block" }} />
            Menunggu: {pending}
          </span>
        )}
      </div>
    </div>
  );
}

export default function DetailSuratPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [surat, setSurat] = useState<Surat | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Modal catatan penolakan
  const [catatanModal, setCatatanModal] = useState<{
    open: boolean;
    targetName: string;
    onConfirm: (catatan: string) => void;
  }>({ open: false, targetName: "", onConfirm: () => {} });

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try { setCurrentUser(JSON.parse(saved)); } catch { localStorage.removeItem("user"); }
    }
    loadSurat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadSurat = async () => {
    try {
      setLoading(true);
      setError("");
      if (!id || id <= 0) { setError("ID surat tidak valid."); return; }
      const result = await getSuratById(id);
      if (result?.success) {
        setSurat(result.data);
      } else {
        setError(result?.message ?? "Gagal mengambil detail surat.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengambil detail surat.");
    } finally {
      setLoading(false);
    }
  };

  // Kirim surat (Operator: DRAFT → TERKIRIM)
  const kirimSurat = async () => {
    if (!surat) return;
    try {
      setProcessing(true);
      const result = await updateSuratStatus(surat.id, "TERKIRIM");
      if (result?.success) {
        toast("Surat berhasil dikirim.", "success");
        setTimeout(() => {
          router.push("/dashboard/surat");
        }, 700);
      } else {
        toast(result?.message ?? "Gagal mengirim surat.", "error");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal mengirim surat.", "error");
    } finally {
      setProcessing(false);
    }
  };

  // ACC surat (Admin: ubah status semua tujuan mereka → SELESAI)
  const accSurat = async () => {
    if (!surat) return;
    try {
      setProcessing(true);
      const result = await updateSuratStatus(surat.id, "SELESAI");
      if (result?.success) {
        setSurat(result.data);
        toast("Surat berhasil disetujui / diselesaikan.", "success");
      } else {
        toast(result?.message ?? "Gagal mengubah status.", "error");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal mengubah status.", "error");
    } finally {
      setProcessing(false);
    }
  };

  // Tolak surat (Admin: ubah status semua tujuan mereka → DITOLAK)
  const tolakSurat = () => {
    if (!surat) return;
    setCatatanModal({
      open: true,
      targetName: "",
      onConfirm: async (catatan) => {
        setCatatanModal((m) => ({ ...m, open: false }));
        try {
          setProcessing(true);
          const result = await updateSuratStatus(surat.id, "DITOLAK", catatan || undefined);
          if (result?.success) {
            setSurat(result.data);
            toast("Surat berhasil ditolak.", "success");
          } else {
            toast(result?.message ?? "Gagal menolak surat.", "error");
          }
        } catch (err) {
          toast(err instanceof Error ? err.message : "Gagal menolak surat.", "error");
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  const hapusSurat = async () => {
    if (!surat) return;
    setConfirmDelete(false);
    try {
      setProcessing(true);
      const result = await deleteSurat(surat.id);
      if (result?.success) {
        toast("Surat berhasil dihapus.", "success");
        setTimeout(() => { window.location.href = "/dashboard/surat"; }, 800);
      } else {
        toast(result?.message ?? "Gagal menghapus surat.", "error");
      }
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menghapus surat.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const getFileDownloadUrl = (filePath: string | null): string | null => {
    if (!filePath) return null;
    const filename = filePath.split("/").pop() ?? filePath.split("\\").pop();
    if (!filename) return null;
    return `${BACKEND_URL}/uploads/${filename}`;
  };

  const handleDownloadFile = async (filePath: string | null, fileName: string | null) => {
    const url = getFileDownloadUrl(filePath);
    if (!url) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast(data?.message || "Gagal mengunduh file", "error");
        return;
      }
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || "file-surat";
      a.click();
      URL.revokeObjectURL(blobUrl);
    } catch {
      toast("Gagal mengunduh file", "error");
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="page-content">
        <div className="breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/dashboard/surat">Daftar Surat</Link>
          <span className="breadcrumb-sep">›</span>
          Detail
        </div>
        <div className="card">
          <div className="card-body">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                <div className="skeleton" style={{ height: 11, width: "30%", borderRadius: 4, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 18, width: "60%", borderRadius: 4 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error && !surat) {
    return (
      <div className="page-content">
        <div className="breadcrumb">
          <Link href="/dashboard">Dashboard</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/dashboard/surat">Daftar Surat</Link>
          <span className="breadcrumb-sep">›</span>
          Detail
        </div>
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!surat) return null;
  const isCreator = currentUser?.role === "OPERATOR" || currentUser?.role === "USER_INSTANSI";
  const isAdmin = currentUser?.role === "ADMIN";

  // Hitung progress
  const allTargets = [
    ...(surat.tujuanSurat ?? []),
    ...(surat.kabupatenSurat ?? []),
    ...(surat.tembusanSurat ?? []),
  ];
  const totalTargets = allTargets.length;
  const selesaiCount = allTargets.filter((t) => t.status === "SELESAI").length;
  const ditolakCount = allTargets.filter((t) => t.status === "DITOLAK").length;

  // Cek apakah admin masih punya tujuan/kabupaten yang belum diproses
  const adminHasPendingItems = isAdmin && allTargets.some(
    (t) => t.status === "TERKIRIM" || t.status === "DRAFT"
  );

  // Status surat sudah final (tidak bisa diubah lagi)
  const isFinalStatus = surat.status === "SELESAI" || surat.status === "DITOLAK";

  return (
    <div className="page-content">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <Link href="/dashboard/surat">Daftar Surat</Link>
        <span className="breadcrumb-sep">›</span>
        {surat.nomorSurat}
      </div>

      {/* Header */}
      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Detail Surat</h1>
            <p className="page-subtitle">Informasi lengkap surat dan status prosesnya.</p>
          </div>
          <StatusBadge status={surat.status} size="md" />
        </div>
      </div>

      {/* Error inline */}
      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Info Surat */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Informasi Surat</span>
          </div>
          <div className="card-body">
            <div className="detail-grid">
              <div>
                <div className="detail-label">Nomor Surat</div>
                <div className="detail-value" style={{ fontWeight: 700, fontSize: 16 }}>{surat.nomorSurat}</div>
              </div>
              <div>
                <div className="detail-label">Tanggal Surat</div>
                <div className="detail-value">{formatTanggal(surat.tanggalSurat)}</div>
              </div>
              <div>
                <div className="detail-label">Asal Surat</div>
                <div className="detail-value">{surat.asalSurat?.nama ?? "—"}</div>
              </div>
              <div>
                <div className="detail-label">Dibuat oleh</div>
                <div className="detail-value">{surat.user?.name ?? "—"}</div>
              </div>

              {/* File — Admin tidak bisa download */}
              <div className="detail-item-full">
                <div className="detail-label">File Lampiran Surat</div>
                {surat.lampiran && surat.lampiran.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
                    {surat.lampiran.map((lamp, i) => (
                      <button
                        key={i}
                        type="button"
                        className="file-download-btn"
                        style={{ display: "inline-flex", cursor: "pointer", width: "fit-content" }}
                        onClick={() => handleDownloadFile(lamp.filePath, lamp.fileName)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        {lamp.fileName ?? "Unduh File"}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="detail-value" style={{ color: "var(--slate-400)" }}>Tidak ada lampiran file</div>
                )}
              </div>

              {surat.keterangan && (
                <div className="detail-item-full">
                  <div className="detail-label">Keterangan</div>
                  <div className="detail-value" style={{ whiteSpace: "pre-wrap" }}>{surat.keterangan}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Progress Persetujuan (tampilkan jika surat sudah terkirim dan ada tujuan) */}
        {totalTargets > 0 && surat.status !== "DRAFT" && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Progres Persetujuan</span>
              <StatusBadge status={surat.status} size="sm" />
            </div>
            <div className="card-body">
              <ProgressRing
                selesai={selesaiCount}
                total={totalTargets}
                ditolak={ditolakCount}
              />
            </div>
          </div>
        )}

        {/* Tujuan */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Tujuan Surat</span>
            {(surat.tujuanSurat?.length ?? 0) > 0 && (
              <span style={{ fontSize: 12, color: "var(--slate-500)" }}>
                {surat.tujuanSurat!.length} instansi
              </span>
            )}
          </div>
          <div className="card-body">
            {(surat.tujuanSurat?.length ?? 0) > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {surat.tujuanSurat!.map((t) => (
                  <div key={t.id} style={{
                    padding: "14px 16px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "10px",
                    borderLeft: t.status === "SELESAI"
                      ? "4px solid var(--green-500)"
                      : t.status === "DITOLAK"
                      ? "4px solid var(--red-400)"
                      : "4px solid var(--slate-200)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: t.processedUser || t.catatan ? 8 : 0 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{t.tujuan?.nama ?? `Tujuan #${t.tujuanId}`}</span>
                      {t.status && <StatusBadge status={t.status} size="sm" />}
                    </div>
                    {t.processedUser && (
                      <div style={{ fontSize: 12, color: "var(--slate-500)", marginBottom: t.catatan ? 4 : 0 }}>
                        Diproses oleh: <strong>{t.processedUser.name}</strong>
                      </div>
                    )}
                    {t.catatan && (
                      <div style={{ fontSize: 13, color: "var(--slate-600)", background: "var(--slate-50)", padding: "8px 12px", borderRadius: "6px", marginTop: 4 }}>
                        <strong>Catatan:</strong> {t.catatan}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="detail-value" style={{ color: "var(--slate-400)" }}>Tidak ada tujuan instansi</div>
            )}
          </div>
        </div>

        {/* Kabupaten */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Kabupaten / Kota Tujuan</span>
            {(surat.kabupatenSurat?.length ?? 0) > 0 && (
              <span style={{ fontSize: 12, color: "var(--slate-500)" }}>
                {surat.kabupatenSurat!.length} kabupaten
              </span>
            )}
          </div>
          <div className="card-body">
            {(surat.kabupatenSurat?.length ?? 0) > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {surat.kabupatenSurat!.map((k) => (
                  <div key={k.id} style={{
                    padding: "14px 16px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "10px",
                    borderLeft: k.status === "SELESAI"
                      ? "4px solid var(--green-500)"
                      : k.status === "DITOLAK"
                      ? "4px solid var(--red-400)"
                      : "4px solid var(--slate-200)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: k.processedUser || k.catatan ? 8 : 0 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{k.kabupaten?.nama ?? `Kabupaten #${k.kabupatenId}`}</span>
                      {k.status && <StatusBadge status={k.status} size="sm" />}
                    </div>
                    {k.processedUser && (
                      <div style={{ fontSize: 12, color: "var(--slate-500)", marginBottom: k.catatan ? 4 : 0 }}>
                        Diproses oleh: <strong>{k.processedUser.name}</strong>
                      </div>
                    )}
                    {k.catatan && (
                      <div style={{ fontSize: 13, color: "var(--slate-600)", background: "var(--slate-50)", padding: "8px 12px", borderRadius: "6px", marginTop: 4 }}>
                        <strong>Catatan:</strong> {k.catatan}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="detail-value" style={{ color: "var(--slate-400)" }}>Tidak ada tujuan kabupaten/kota</div>
            )}
          </div>
        </div>

        {/* Tembusan */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Tembusan</span>
            {(surat.tembusanSurat?.length ?? 0) > 0 && (
              <span style={{ fontSize: 12, color: "var(--slate-500)" }}>
                {surat.tembusanSurat!.length} instansi
              </span>
            )}
          </div>
          <div className="card-body">
            {(surat.tembusanSurat?.length ?? 0) > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {surat.tembusanSurat!.map((t) => (
                  <div key={t.id} style={{
                    padding: "14px 16px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "10px",
                    borderLeft: t.status === "SELESAI"
                      ? "4px solid var(--green-500)"
                      : t.status === "DITOLAK"
                      ? "4px solid var(--red-400)"
                      : "4px solid var(--slate-200)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: t.processedUser || t.catatan ? 8 : 0 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{t.tujuan?.nama ?? `Tembusan #${t.tujuanId}`}</span>
                      {t.status && <StatusBadge status={t.status} size="sm" />}
                    </div>
                    {t.processedUser && (
                      <div style={{ fontSize: 12, color: "var(--slate-500)", marginBottom: t.catatan ? 4 : 0 }}>
                        Diproses oleh: <strong>{t.processedUser.name}</strong>
                      </div>
                    )}
                    {t.catatan && (
                      <div style={{ fontSize: 13, color: "var(--slate-600)", background: "var(--slate-50)", padding: "8px 12px", borderRadius: "6px", marginTop: 4 }}>
                        <strong>Catatan:</strong> {t.catatan}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="detail-value" style={{ color: "var(--slate-400)" }}>Tidak ada tembusan instansi</div>
            )}
          </div>
        </div>

        {/* Aksi Operator - DRAFT: Kirim Surat */}
        {isCreator && surat.status === "DRAFT" && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Kirim Surat</span>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 13, color: "var(--slate-500)", marginBottom: 16 }}>
                Surat masih dalam status <strong>draft</strong>. Kirim surat agar dapat diproses oleh admin tujuan.
              </p>
              <button
                type="button"
                className="btn btn-primary"
                disabled={processing}
                onClick={kirimSurat}
              >
                {processing ? <><span className="spinner" /> Memproses...</> : "📤 Kirim Surat"}
              </button>
            </div>
          </div>
        )}

        {/* Aksi Admin - Tujuan mereka yang masih pending */}
        {isAdmin && !isFinalStatus && adminHasPendingItems && (
          <div className="card" style={{ border: "1px solid var(--blue-200)" }}>
            <div className="card-header" style={{ background: "var(--blue-50)" }}>
              <span className="card-title" style={{ color: "var(--blue-700)" }}>⚡ Tindakan Anda</span>
            </div>
            <div className="card-body">
              <p style={{ fontSize: 13, color: "var(--slate-600)", marginBottom: 20 }}>
                Surat ini menunggu persetujuan Anda. Pilih untuk <strong>menyetujui</strong> atau <strong>menolak</strong> surat ini.
                Status keseluruhan surat akan otomatis diperbarui setelah semua instansi merespon.
              </p>
              <div className="action-group">
                <button
                  type="button"
                  className="btn btn-success"
                  disabled={processing}
                  onClick={accSurat}
                >
                  {processing ? <><span className="spinner" /> Memproses...</> : "✅ Setuju / Selesaikan"}
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={processing}
                  onClick={tolakSurat}
                >
                  ❌ Tolak Surat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Info Admin - Sudah diproses */}
        {isAdmin && (isFinalStatus || !adminHasPendingItems) && surat.status !== "DRAFT" && (
          <div className="card" style={{ border: "1px solid var(--slate-200)" }}>
            <div className="card-header">
              <span className="card-title" style={{ color: "var(--slate-600)" }}>Status Tindakan</span>
            </div>
            <div className="card-body">
              {isFinalStatus ? (
                <p style={{ fontSize: 13, color: "var(--slate-500)" }}>
                  Surat ini telah berstatus <strong>{surat.status === "SELESAI" ? "Selesai" : "Ditolak"}</strong>. Tidak ada tindakan lebih lanjut yang diperlukan.
                </p>
              ) : (
                <p style={{ fontSize: 13, color: "var(--slate-500)" }}>
                  Anda sudah memproses surat ini. Menunggu respons dari instansi lain ({totalTargets - selesaiCount - ditolakCount} instansi belum merespon).
                </p>
              )}
            </div>
          </div>
        )}

        {/* Kelola Surat - Creator (Edit & Hapus) */}
        {isCreator && surat.status === "DRAFT" && (
          <div className="card">
            <div className="card-header">
              <span className="card-title">Kelola Surat</span>
            </div>
            <div className="card-body">
              <div className="action-group">
                <Link href={`/dashboard/surat/${surat.id}/edit`} className="btn btn-warning">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit Surat
                </Link>
                <button
                  type="button"
                  className="btn btn-danger"
                  disabled={processing}
                  onClick={() => setConfirmDelete(true)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                  {processing ? "Menghapus..." : "Hapus Surat"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal konfirmasi hapus */}
      <ConfirmModal
        isOpen={confirmDelete}
        title="Hapus Surat"
        message={`Apakah Anda yakin ingin menghapus surat "${surat.nomorSurat}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        danger
        onConfirm={hapusSurat}
        onCancel={() => setConfirmDelete(false)}
      />

      {/* Modal catatan penolakan */}
      <CatatanModal
        isOpen={catatanModal.open}
        targetName={catatanModal.targetName}
        onConfirm={catatanModal.onConfirm}
        onCancel={() => setCatatanModal((m) => ({ ...m, open: false }))}
      />
    </div>
  );
}