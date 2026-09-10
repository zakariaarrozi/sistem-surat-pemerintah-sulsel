# Panduan Deployment Sistem Surat Sulsel
## Mac → Server Linux (IP Instansi) — Dari Awal Hingga Online

---

## Persiapan di Laptop Mac (Sekali Saja)

Tidak ada yang perlu diinstall di Mac untuk deployment. Cukup buka aplikasi **Terminal** bawaan Mac.

---

## TAHAP 1: Masuk ke Server (SSH)

Buka Terminal di Mac, lalu ketik:

```bash
ssh root@IP_SERVER_ANDA
# Contoh: ssh root@10.5.125.121
# Ketik password saat diminta (huruf tidak terlihat saat diketik — normal)
```

> **Jika muncul pesan "Permission denied":** Tanyakan ke tim IT username yang benar.
> Mungkin bukan `root` tapi `ubuntu`, `admin`, atau nama lainnya.
> Coba: `ssh ubuntu@IP_SERVER_ANDA`

---

## TAHAP 2: Cek & Minta Akses Internet Server

Sebelum install apapun, pastikan server bisa akses internet:

```bash
ping -c 3 google.com
```

**Jika hasilnya "cannot resolve host" atau "Network unreachable":**
Hubungi tim IT dan minta tolong dibukakan akses internet ke server.

---

## TAHAP 3: Update Sistem & Install Tools Dasar

```bash
# Update sistem
sudo apt update && sudo apt upgrade -y

# Install Git, Nginx, Curl, dan MariaDB
sudo apt install -y git nginx curl mariadb-server
```

---

## TAHAP 4: Install Node.js (Versi 20) & PM2

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 (Agar aplikasi tetap menyala 24 jam)
sudo npm install -g pm2
```

---

## TAHAP 5: Konfigurasi Database MariaDB

Masuk ke console MariaDB (MySQL):
```bash
sudo mysql
```

Di dalam console MySQL, jalankan perintah ini satu per satu (tekan enter tiap baris):
```sql
CREATE DATABASE sistem_surat_sulsel;
CREATE USER 'admin_surat'@'localhost' IDENTIFIED BY 'PasswordKuat123!';
GRANT ALL PRIVILEGES ON sistem_surat_sulsel.* TO 'admin_surat'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## TAHAP 6: Download Kode dari GitHub

```bash
# Pindah ke folder web
cd /var/www

# Download kode Sistem Surat Sulsel
git clone https://github.com/zakariaarrozi/sistem-surat-pemerintah-sulsel.git

# Masuk ke folder project
cd sistem-surat-pemerintah-sulsel
```

---

## TAHAP 7: Install & Setup Backend

```bash
# Masuk ke folder backend
cd backend

# Install semua dependensi
npm install
```

Buat file konfigurasi `.env` (**HARUS DIBUAT SEBELUM PRISMA GENERATE**):
```bash
nano .env
```
Isi file `.env` dengan teks berikut:
```env
DATABASE_URL="mysql://admin_surat:PasswordKuat123!@localhost:3306/sistem_surat_sulsel"
JWT_SECRET="sulsel-secret-key-2026-aman"
PORT=5000
FRONTEND_URL=http://IP_SERVER_ANDA
```
Simpan file: Tekan `Ctrl+X` → `Y` → `Enter`.

Sekarang, lakukan Generate Prisma Client dan sinkronisasi database:
```bash
npx prisma generate
npx prisma db push
node prisma/seed.js
node prisma/seedAdmin.js
```

Jalankan Backend:
```bash
pm2 start src/app.js --name "surat-backend"
```

---

## TAHAP 8: Install & Build Frontend

```bash
# Kembali ke folder root lalu masuk ke frontend
cd /var/www/sistem-surat-pemerintah-sulsel/frontend

# Install dependensi
npm install

# Build Next.js
npm run build

# Jalankan Frontend
pm2 start npm --name "surat-frontend" -- start
```

---

## TAHAP 9: Konfigurasi Nginx (Proxy)

```bash
# Buat file konfigurasi Nginx
sudo nano /etc/nginx/sites-available/sistem-surat
```

Isi dengan konfigurasi berikut:
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    # FRONTEND (Next.js berjalan di port 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # BACKEND API (Express berjalan di port 5000)
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # FILE UPLOAD (Bukti dukung & Surat)
    location /uploads/ {
        alias /var/www/sistem-surat-pemerintah-sulsel/backend/uploads/;
    }

    client_max_body_size 50M;
}
```
Simpan: `Ctrl+X` → `Y` → `Enter`.

Aktifkan konfigurasi Nginx:
```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/sistem-surat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## TAHAP 10: Persiapan Folder & Simpan PM2

```bash
# Buat folder uploads jika belum ada
mkdir -p /var/www/sistem-surat-pemerintah-sulsel/backend/uploads
chmod 755 /var/www/sistem-surat-pemerintah-sulsel/backend/uploads

# Simpan PM2 agar auto-start saat server restart
pm2 save
pm2 startup
# Copy perintah berawalan sudo env PATH... yang muncul dan jalankan!
```

---

## TAHAP 11: Test Website

Buka browser di laptop/HP, ketik IP server:

```
http://IP_SERVER_ANDA
```

Website harus langsung muncul.
**Test login dengan akun yang dibuat otomatis oleh seeder:**
- **Superadmin:** `superadmin@sulsel.go.id` / `SuperAdmin123!`
- **Admin Pimpinan:** `admin.pimpinan@sulsel.go.id` / `AdminPimpinan123!`
