"use client";

import { useState } from "react";
import ConfirmModal from "./ConfirmModal";
import { toast } from "./Toast";

export type MasterItem = {
  id: number;
  nama: string;
  aktif: boolean;
  tipe?: string; // khusus kabupaten
};

type Column = {
  key: string;
  label: string;
  render?: (item: MasterItem) => React.ReactNode;
};

type Props = {
  title: string;
  items: MasterItem[];
  loading: boolean;
  columns?: Column[];
  // Form fields (render prop)
  renderFormFields: (
    value: MasterItem | null,
    onChange: (field: string, val: string) => void
  ) => React.ReactNode;
  onAdd: (data: Record<string, string>) => Promise<void>;
  onEdit: (id: number, data: Record<string, string>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onToggle: (id: number) => Promise<void>;
  defaultFormValues: Record<string, string>;
};

export default function MasterDataTable({
  title,
  items,
  loading,
  columns = [],
  renderFormFields,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  defaultFormValues,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<MasterItem | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>(defaultFormValues);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<MasterItem | null>(null);
  const [toggleTarget, setToggleTarget] = useState<MasterItem | null>(null);

  const openAdd = () => {
    setEditItem(null);
    setFormValues(defaultFormValues);
    setShowForm(true);
  };

  const openEdit = (item: MasterItem) => {
    setEditItem(item);
    // Isi form values dari item
    const vals: Record<string, string> = {};
    Object.keys(defaultFormValues).forEach((k) => {
      vals[k] = String((item as Record<string, unknown>)[k] ?? "");
    });
    setFormValues(vals);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditItem(null);
    setFormValues(defaultFormValues);
  };

  const handleFormChange = (field: string, val: string) => {
    setFormValues((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editItem) {
        await onEdit(editItem.id, formValues);
        toast("Data berhasil diperbarui!", "success");
      } else {
        await onAdd(formValues);
        toast("Data berhasil ditambahkan!", "success");
      }
      closeForm();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Terjadi kesalahan.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await onDelete(deleteTarget.id);
      toast("Data berhasil dihapus!", "success");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal menghapus data.", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    try {
      await onToggle(toggleTarget.id);
      toast(
        `Data berhasil ${toggleTarget.aktif ? "dinonaktifkan" : "diaktifkan"}!`,
        "success"
      );
    } catch (err) {
      toast(err instanceof Error ? err.message : "Gagal mengubah status.", "error");
    } finally {
      setToggleTarget(null);
    }
  };

  const defaultColumns: Column[] = [
    { key: "id", label: "No" },
    { key: "nama", label: "Nama" },
    {
      key: "aktif",
      label: "Status",
      render: (item) => (
        <span className={`badge ${item.aktif ? "badge-selesai" : "badge-ditolak"}`}>
          {item.aktif ? "Aktif" : "Nonaktif"}
        </span>
      ),
    },
  ];

  const allColumns = columns.length > 0 ? columns : defaultColumns;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div />
        <button type="button" className="btn btn-primary" onClick={openAdd}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Tambah {title}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>{allColumns.map((c) => <th key={c.key}>{c.label}</th>)}<th style={{ textAlign: "right" }}>Aksi</th></tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: allColumns.length + 1 }).map((__, j) => (
                    <td key={j}><div className="skeleton" style={{ height: 16, borderRadius: 4 }} /></td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : items.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="empty-title">Belum ada data {title.toLowerCase()}</div>
            <div className="empty-text">Klik tombol "Tambah" untuk menambahkan data baru.</div>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>No</th>
                {allColumns.filter((c) => c.key !== "id").map((c) => <th key={c.key}>{c.label}</th>)}
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} style={{ opacity: item.aktif ? 1 : 0.55 }}>
                  <td style={{ color: "var(--slate-400)", fontSize: 12 }}>{idx + 1}</td>
                  {allColumns.filter((c) => c.key !== "id").map((col) => (
                    <td key={col.key}>
                      {col.render
                        ? col.render(item)
                        : String((item as Record<string, unknown>)[col.key] ?? "—")}
                    </td>
                  ))}
                  <td style={{ textAlign: "right" }}>
                    <div className="action-group" style={{ justifyContent: "flex-end" }}>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(item)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${item.aktif ? "btn-warning" : "btn-success"}`}
                        onClick={() => setToggleTarget(item)}
                      >
                        {item.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => setDeleteTarget(item)}
                      >
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">
            Total: <strong>{items.length}</strong> data
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div
            className="modal-box"
            style={{ maxWidth: 480, textAlign: "left" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title" style={{ textAlign: "left", marginBottom: 20 }}>
              {editItem ? `Edit ${title}` : `Tambah ${title}`}
            </h3>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {renderFormFields(editItem, handleFormChange)}
              <div className="modal-actions" style={{ marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={closeForm} disabled={submitting}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ minWidth: 120 }}>
                  {submitting ? <><span className="spinner" /> Menyimpan...</> : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Hapus Data"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.nama}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Confirm Toggle */}
      <ConfirmModal
        isOpen={!!toggleTarget}
        title={toggleTarget?.aktif ? "Nonaktifkan Data" : "Aktifkan Data"}
        message={`Apakah Anda yakin ingin ${toggleTarget?.aktif ? "menonaktifkan" : "mengaktifkan"} "${toggleTarget?.nama}"?`}
        confirmLabel={toggleTarget?.aktif ? "Nonaktifkan" : "Aktifkan"}
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
      />
    </>
  );
}
