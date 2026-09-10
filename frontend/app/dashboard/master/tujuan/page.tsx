"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTujuan, createTujuan, updateTujuan, deleteTujuan, toggleTujuan } from "../../../../lib/api";
import MasterDataTable, { MasterItem } from "../../../components/MasterDataTable";

export default function MasterTujuanPage() {
  const [items, setItems] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const result = await getTujuan();
      if (result?.success) setItems(result.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (data: Record<string, string>) => {
    await createTujuan(data.nama);
    await load();
  };

  const handleEdit = async (id: number, data: Record<string, string>) => {
    const item = items.find((i) => i.id === id);
    await updateTujuan(id, data.nama, item?.aktif ?? true);
    await load();
  };

  const handleDelete = async (id: number) => {
    await deleteTujuan(id);
    await load();
  };

  const handleToggle = async (id: number) => {
    await toggleTujuan(id);
    await load();
  };

  return (
    <div className="page-content">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link href="/dashboard">Dashboard</Link>
        <span className="breadcrumb-sep">›</span>
        Master Data
        <span className="breadcrumb-sep">›</span>
        Tujuan
      </div>

      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Master Tujuan Surat</h1>
            <p className="page-subtitle">
              Kelola daftar tujuan penerima surat yang tersedia dalam sistem.
            </p>
          </div>
        </div>
      </div>

      <MasterDataTable
        title="Tujuan"
        items={items}
        loading={loading}
        defaultFormValues={{ nama: "" }}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
        renderFormFields={(_item, onChange) => (
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Nama Tujuan <span style={{ color: "var(--red-500)" }}>*</span>
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Dinas Pendidikan"
              defaultValue={_item?.nama ?? ""}
              onChange={(e) => onChange("nama", e.target.value)}
              required
              autoFocus
            />
          </div>
        )}
      />
    </div>
  );
}
