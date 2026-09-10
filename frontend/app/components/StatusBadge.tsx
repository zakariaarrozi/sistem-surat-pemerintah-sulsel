type StatusBadgeProps = {
  status: string;
  size?: "sm" | "md";
};

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Draft", className: "badge-draft" },
  TERKIRIM: { label: "Terkirim", className: "badge-terkirim" },
  DIPROSES: { label: "Diproses", className: "badge-diproses" },
  SELESAI: { label: "Selesai", className: "badge-selesai" },
  DITOLAK: { label: "Ditolak", className: "badge-ditolak" },
};

export default function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_MAP[status] ?? { label: status, className: "badge-draft" };
  return (
    <span className={`badge ${config.className} ${size === "md" ? "badge-md" : ""}`}>
      {config.label}
    </span>
  );
}
