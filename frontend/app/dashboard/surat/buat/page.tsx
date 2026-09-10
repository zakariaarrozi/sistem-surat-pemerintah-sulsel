"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSurat, getAsalSurat, getKabupaten, getTujuan } from "../../../../lib/api";
import { toast } from "../../../components/Toast";

type MasterData = { id: number; nama: string };
type ApiResult = {
  success: boolean;
  message?: string;
  data?: MasterData[] | { data?: MasterData[] };
};

function getMasterData(result: ApiResult): MasterData[] {
  if (Array.isArray(result.data)) return result.data;
  if (result.data && !Array.isArray(result.data) && Array.isArray((result.data as { data?: MasterData[] }).data)) {
    return (result.data as { data?: MasterData[] }).data!;
  }
  return [];
}

function CheckboxGrid({
  label,
  hint,
  items,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}: {
  label: string;
  hint: string;
  items: MasterData[];
  selectedIds: number[];
  onToggle: (id: number) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
}) {
  const [search, setSearch] = useState("");
  const filteredItems = items.filter((item) => item.nama.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="card" style={{ marginBottom: 0 }}>
      <div className="card-header" style={{ display: "block" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div className="card-title">{label}</div>
            <div style={{ fontSize: 12, color: "var(--slate-400)", marginTop: 2 }}>{hint}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <span style={{ fontSize: 12, color: "var(--blue-600)", fontWeight: 600 }}>
              {selectedIds.length} dipilih
            </span>
            {(onSelectAll || onDeselectAll) && items.length > 0 && (
              <div style={{ display: "flex", gap: 10 }}>
                {onSelectAll && (
                  <button type="button" onClick={onSelectAll} style={{ fontSize: 11, color: "var(--blue-600)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
                    Pilih Semua
                  </button>
                )}
                {onDeselectAll && (
                  <button type="button" onClick={onDeselectAll} style={{ fontSize: 11, color: "var(--red-500)", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}>
                    Batalkan
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <input
            type="text"
            placeholder={`Cari ${label.toLowerCase()}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ fontSize: 13, padding: "8px 12px" }}
          />
        </div>
      </div>
      <div className="card-body">
        {filteredItems.length === 0 ? (
          <p style={{ color: "var(--slate-400)", fontSize: 13 }}>Tidak ada data yang cocok dengan pencarian.</p>
        ) : (
          <div className="check-grid">
            {filteredItems.map((item) => {
              const checked = selectedIds.includes(item.id);
              return (
                <label key={item.id} className={`check-item ${checked ? "checked" : ""}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(item.id)}
                  />
                  <span className="check-item-label">{item.nama}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BuatSuratPage() {
  const router = useRouter();

  const [nomorSurat, setNomorSurat] = useState("");
  const [tanggalSurat, setTanggalSurat] = useState("");
  const [asalSuratId, setAsalSuratId] = useState("");
  const [asalSuratLainnya, setAsalSuratLainnya] = useState("");
  const [tujuanIds, setTujuanIds] = useState<number[]>([]);
  const [tembusanIds, setTembusanIds] = useState<number[]>([]);
  const [kabupatenIds, setKabupatenIds] = useState<number[]>([]);
  const [keterangan, setKeterangan] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  const [tujuan, setTujuan] = useState<MasterData[]>([]);
  const [kabupaten, setKabupaten] = useState<MasterData[]>([]);
  const [asalSurat, setAsalSurat] = useState<MasterData[]>([]);

  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [role, setRole] = useState("");
  const [instansiNama, setInstansiNama] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setRole(u?.role ?? "");
        setInstansiNama(u?.instansiNama ?? "");
      } catch { /* */ }
    }

    const load = async () => {
      try {
        setLoadingData(true);
        const [tujuanRes, kabupatenRes, asalRes] = await Promise.all([
          getTujuan(), getKabupaten(), getAsalSurat(),
        ]);
        setTujuan(getMasterData(tujuanRes));
        setKabupaten(getMasterData(kabupatenRes));
        setAsalSurat(getMasterData(asalRes));
      } catch (err) {
        toast(err instanceof Error ? err.message : "Gagal mengambil data master.", "error");
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, []);

  const toggleId = (id: number, selected: number[], setSelected: (v: number[]) => void) => {
    setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selected].slice(0, 10));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!nomorSurat.trim()) { toast("Nomor surat wajib diisi.", "error"); return; }
    if (!tanggalSurat) { toast("Tanggal surat wajib diisi.", "error"); return; }
    if (role !== "USER_INSTANSI") {
      if (!asalSuratId) { toast("Asal surat wajib dipilih.", "error"); return; }
      if (asalSuratId === "LAINNYA" && !asalSuratLainnya.trim()) { toast("Asal surat lainnya wajib diisi.", "error"); return; }
    }
    if (files.length === 0) { toast("Minimal satu file surat wajib diunggah.", "error"); return; }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("nomorSurat", nomorSurat.trim());
      formData.append("tanggalSurat", tanggalSurat);
      formData.append("asalSuratId", asalSuratId);
      if (asalSuratId === "LAINNYA") formData.append("asalSuratLainnya", asalSuratLainnya.trim());
      formData.append("tujuanIds", JSON.stringify(tujuanIds));
      formData.append("tembusanIds", JSON.stringify(tembusanIds));
      formData.append("kabupatenIds", JSON.stringify(kabupatenIds));
      if (keterangan.trim()) formData.append("keterangan", keterangan.trim());
      files.forEach((f) => formData.append("files", f));

      const result = await createSurat(formData);

      if (!result?.success) {
        toast(result?.message ?? "Gagal menyimpan surat.", "error");
        return;
      }

      toast("Surat berhasil disimpan!", "success");
      // Redirect ke daftar surat
      setTimeout(() => {
        router.push("/dashboard/surat");
      }, 700);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menyimpan surat.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        <Link href="/dashboard/surat">Daftar Surat</Link>
        <span className="breadcrumb-sep">›</span>
        Buat Surat
      </div>

      <div className="page-header">
        <h1 className="page-title">Buat Surat Baru</h1>
        <p className="page-subtitle">Lengkapi semua data surat sebelum menyimpan.</p>
      </div>

      {loadingData ? (
        <div className="card">
          <div className="card-body">
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="skeleton" style={{ height: 12, width: "25%", borderRadius: 4, marginBottom: 8 }} />
                  <div className="skeleton" style={{ height: 42, borderRadius: 8 }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Data Surat */}
          <div className="card">
            <div className="card-header"><span className="card-title">Data Surat</span></div>
            <div className="card-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nomor Surat <span style={{ color: "var(--red-500)" }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={nomorSurat}
                    onChange={(e) => setNomorSurat(e.target.value)}
                    placeholder="Contoh: 001/ABC/IX/2026"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Tanggal Surat <span style={{ color: "var(--red-500)" }}>*</span></label>
                  <input
                    type="date"
                    className="form-input"
                    value={tanggalSurat}
                    onChange={(e) => setTanggalSurat(e.target.value)}
                  />
                </div>

                {/* Asal Surat — sembunyikan untuk USER_INSTANSI */}
                {role === "USER_INSTANSI" ? (
                  <div className="form-group" style={{ marginBottom: 0, gridColumn: "1 / -1" }}>
                    <label className="form-label">Asal Surat</label>
                    <div style={{ padding: "10px 14px", background: "var(--slate-50)", borderRadius: 8, border: "1px solid var(--slate-200)", color: "var(--slate-700)", fontWeight: 600 }}>
                      🏢 {instansiNama || "Instansi Anda"}
                    </div>
                    <p style={{ fontSize: 12, color: "var(--slate-400)", marginTop: 6 }}>Asal surat otomatis terisi dari instansi Anda.</p>
                  </div>
                ) : (
                  <div className="form-group" style={{ marginBottom: 0, gridColumn: "1 / -1" }}>
                    <label className="form-label">Asal Surat <span style={{ color: "var(--red-500)" }}>*</span></label>
                    <select
                      className="form-select"
                      value={asalSuratId}
                      onChange={(e) => setAsalSuratId(e.target.value)}
                    >
                      <option value="">— Pilih asal surat —</option>
                      {asalSurat.map((a) => (
                        <option key={a.id} value={a.id}>{a.nama}</option>
                      ))}
                      <option value="LAINNYA">Yang lain</option>
                    </select>
                    {asalSuratId === "LAINNYA" && (
                      <input
                        type="text"
                        className="form-input"
                        style={{ marginTop: 12 }}
                        placeholder="Masukkan Asal Surat Baru"
                        value={asalSuratLainnya}
                        onChange={(e) => setAsalSuratLainnya(e.target.value)}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tujuan & Tembusan — sembunyikan untuk USER_INSTANSI */}
          {role !== "USER_INSTANSI" && (
            <>
              {/* Tujuan */}
              <CheckboxGrid
                label="Tujuan Surat"
                hint="Pilih tujuan surat (opsional)"
                items={tujuan}
                selectedIds={tujuanIds}
                onToggle={(id) => toggleId(id, tujuanIds, setTujuanIds)}
                onSelectAll={() => setTujuanIds(tujuan.map(t => t.id))}
                onDeselectAll={() => setTujuanIds([])}
              />

              {/* Tembusan */}
              <CheckboxGrid
                label="Tembusan"
                hint="Pilih penerima tembusan (opsional)"
                items={tujuan}
                selectedIds={tembusanIds}
                onToggle={(id) => toggleId(id, tembusanIds, setTembusanIds)}
                onSelectAll={() => setTembusanIds(tujuan.map(t => t.id))}
                onDeselectAll={() => setTembusanIds([])}
              />
            </>
          )}

          {/* Kabupaten */}
          <CheckboxGrid
            label="Kabupaten / Kota Tujuan"
            hint={role === "USER_INSTANSI" ? "Pilih kabupaten/kota tujuan surat (opsional)" : "Pilih kabupaten/kota yang berkaitan (opsional)"}
            items={kabupaten}
            selectedIds={kabupatenIds}
            onToggle={(id) => toggleId(id, kabupatenIds, setKabupatenIds)}
            onSelectAll={() => setKabupatenIds(kabupaten.map(k => k.id))}
            onDeselectAll={() => setKabupatenIds([])}
          />

          {/* File & Keterangan */}
          <div className="card">
            <div className="card-header"><span className="card-title">Lampiran & Keterangan</span></div>
            <div className="card-body">
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">File Surat</label>
                  <input
                    id="file"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="form-file"
                  />
                  <p className="form-hint">Format: PDF, DOC, DOCX. Maks. 100 MB total, hingga 10 file.</p>
                  {files.length > 0 && (
                    <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                      {files.map((f, i) => (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "8px 12px", background: "var(--blue-50)", border: "1px solid var(--blue-100)",
                          borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--blue-600)", fontWeight: 500
                        }}>
                          <span>📎 {f.name}</span>
                          <button type="button" onClick={() => removeFile(i)} style={{ color: "var(--red-500)", background: "none", border: "none", cursor: "pointer", fontSize: 12 }}>
                            Hapus
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Keterangan</label>
                  <textarea
                    className="form-textarea"
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    rows={4}
                    placeholder="Tambahkan keterangan jika diperlukan..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Link href="/dashboard/surat" className="btn btn-ghost">
              Batal
            </Link>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: 140 }}>
              {submitting ? <><span className="spinner" /> Menyimpan...</> : "Simpan Surat"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}