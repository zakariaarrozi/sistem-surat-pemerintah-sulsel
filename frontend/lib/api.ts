const API_URL = "/api";

type ApiOptions = RequestInit & {
  auth?: boolean;
};

export async function apiFetch(
  endpoint: string,
  options: ApiOptions = {}
) {
  const { auth = true, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);

  const isFormData =
    typeof FormData !== "undefined" &&
    fetchOptions.body instanceof FormData;

  // Jangan set Content-Type secara manual untuk FormData.
  // Browser akan membuat multipart/form-data beserta boundary-nya.
  if (
    !isFormData &&
    !headers.has("Content-Type") &&
    fetchOptions.body
  ) {
    headers.set("Content-Type", "application/json");
  }

  // Ambil JWT dari localStorage
  if (
    auth &&
    typeof window !== "undefined"
  ) {
    const token = localStorage.getItem("token");

    if (token) {
      headers.set(
        "Authorization",
        `Bearer ${token}`
      );
    }
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...fetchOptions,
      headers,
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    data = {
      success: false,
      message:
        "Response server tidak valid",
    };
  }

  // Token tidak valid / expired
  if (response.status === 401) {
    if (
      typeof window !== "undefined"
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Hapus cookie juga agar middleware Next.js ikut logout
      document.cookie = "token=; path=/; max-age=0";

      window.location.href = "/";
    }

    throw new Error(
      data.message ||
        "Sesi login telah berakhir"
    );
  }

  // Tidak memiliki izin
  if (response.status === 403) {
    throw new Error(
      data.message ||
        "Anda tidak memiliki akses untuk melakukan tindakan ini"
    );
  }

  // Error lainnya
  if (!response.ok) {
    throw new Error(
      data.message ||
        "Terjadi kesalahan pada server"
    );
  }

  return data;
}

/* =====================================================
   SURAT
===================================================== */

export async function getSurat() {
  return apiFetch("/surat");
}

export async function getSuratById(
  id: number
) {
  return apiFetch(`/surat/${id}`);
}

export async function createSurat(
  formData: FormData
) {
  return apiFetch("/surat", {
    method: "POST",
    body: formData,
  });
}

export async function updateSurat(
  id: number,
  formData: FormData
) {
  return apiFetch(`/surat/${id}`, {
    method: "PUT",
    body: formData,
  });
}

export async function deleteSurat(
  id: number
) {
  return apiFetch(`/surat/${id}`, {
    method: "DELETE",
  });
}

export async function bulkDeleteSurat(
  ids: number[]
) {
  return apiFetch("/surat/bulk", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids }),
  });
}

/* =====================================================
   STATUS SURAT
===================================================== */

export async function updateSuratStatus(
  id: number,
  status: string,
  catatan?: string
) {
  return apiFetch(
    `/surat/${id}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        catatan,
      }),
    }
  );
}

/* =====================================================
   MASTER DATA — TUJUAN
===================================================== */

export async function getTujuan() {
  return apiFetch("/tujuan");
}

export async function createTujuan(nama: string) {
  return apiFetch("/tujuan", {
    method: "POST",
    body: JSON.stringify({ nama }),
  });
}

export async function updateTujuan(id: number, nama: string, aktif: boolean) {
  return apiFetch(`/tujuan/${id}`, {
    method: "PUT",
    body: JSON.stringify({ nama, aktif }),
  });
}

export async function deleteTujuan(id: number) {
  return apiFetch(`/tujuan/${id}`, { method: "DELETE" });
}

export async function toggleTujuan(id: number) {
  return apiFetch(`/tujuan/${id}/toggle`, { method: "PATCH" });
}

/* =====================================================
   MASTER DATA — KABUPATEN
===================================================== */

export async function getKabupaten() {
  return apiFetch("/kabupaten");
}

export async function createKabupaten(nama: string, tipe: string) {
  return apiFetch("/kabupaten", {
    method: "POST",
    body: JSON.stringify({ nama, tipe }),
  });
}

export async function updateKabupaten(id: number, nama: string, tipe: string, aktif: boolean) {
  return apiFetch(`/kabupaten/${id}`, {
    method: "PUT",
    body: JSON.stringify({ nama, tipe, aktif }),
  });
}

export async function deleteKabupaten(id: number) {
  return apiFetch(`/kabupaten/${id}`, { method: "DELETE" });
}

export async function toggleKabupaten(id: number) {
  return apiFetch(`/kabupaten/${id}/toggle`, { method: "PATCH" });
}

/* =====================================================
   MASTER DATA — ASAL SURAT
===================================================== */

export async function getAsalSurat() {
  return apiFetch("/asal-surat");
}

export async function createAsalSurat(nama: string) {
  return apiFetch("/asal-surat", {
    method: "POST",
    body: JSON.stringify({ nama }),
  });
}

export async function updateAsalSurat(id: number, nama: string, aktif: boolean) {
  return apiFetch(`/asal-surat/${id}`, {
    method: "PUT",
    body: JSON.stringify({ nama, aktif }),
  });
}

export async function deleteAsalSurat(id: number) {
  return apiFetch(`/asal-surat/${id}`, { method: "DELETE" });
}

export async function toggleAsalSurat(id: number) {
  return apiFetch(`/asal-surat/${id}/toggle`, { method: "PATCH" });
}