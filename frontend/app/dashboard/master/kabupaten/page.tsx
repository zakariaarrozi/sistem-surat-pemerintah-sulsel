"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getKabupaten, createKabupaten, updateKabupaten, deleteKabupaten, toggleKabupaten,
} from "../../../../lib/api";
import MasterDataTable, { MasterItem } from "../../../components/MasterDataTable";

export default function MasterKabupatenPage() {
  const [items, setItems] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const result = await getKabupaten();
      if (result?.success) setItems(result.data ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (data: Record<string, string>) => {
    await createKabupaten(data.nama, data.tipe);
    await load();
  };

  const handleEdit = async (id: number, data: Record<string, string>) => {
    const item = items.find((i) => i.id === id);
    await updateKabupaten(id, data.nama, data.tipe, item?.aktif ?? true);
    await load();
  };

  const handleDelete = async (id: number) => {
    await deleteKabupaten(id);
    await load();
  };

  const handleToggle = async (id: number) => {
    await toggleKabupaten(id);
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
        Kabupaten/Kota
      </div>

      <div className="page-header">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Master Kabupaten / Kota</h1>
            <p className="page-subtitle">
              Kelola daftar kabupaten dan kota di Provinsi Sulawesi Selatan.
            </p>
          </div>
        </div>
      </div>

      <MasterDataTable
        title="Kabupaten/Kota"
        items={items}
        loading={loading}
        defaultFormValues={{ nama: "", tipe: "Kabupaten" }}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggle={handleToggle}
        columns={[
          { key: "id", label: "No" },
          { key: "nama", label: "Nama" },
          {
            key: "tipe",
            label: "Tipe",
            render: (item) => (
              <span className={`badge ${item.tipe === "Kota" ? "badge-terkirim" : "badge-diproses"}`}>
                {item.tipe ?? "—"}
              </span>
            ),
          },
          {
            key: "aktif",
            label: "Status",
            render: (item) => (
              <span className={`badge ${item.aktif ? "badge-selesai" : "badge-ditolak"}`}>
                {item.aktif ? "Aktif" : "Nonaktif"}
              </span>
            ),
          },
        ]}
        renderFormFields={(_item, onChange) => (
          <>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Nama <span style={{ color: "var(--red-500)" }}>*</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Makassar"
                defaultValue={_item?.nama ?? ""}
                onChange={(e) => onChange("nama", e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">
                Tipe <span style={{ color: "var(--red-500)" }}>*</span>
              </label>
              <select
                className="form-select"
                defaultValue={_item?.tipe ?? "Kabupaten"}
                onChange={(e) => onChange("tipe", e.target.value)}
                required
              >
                <option value="Kabupaten">Kabupaten</option>
                <option value="Kota">Kota</option>
              </select>
            </div>
          </>
        )}
      />
    </div>
  );
}
