# Aplikasi Laundry Modern — PWA
Siap deploy ke GitHub Pages & install di Android sebagai aplikasi (PWA).

## Cara pakai
1. Upload semua file di repo GitHub kamu (branch `main`).
2. Aktifkan **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Pilih branch **main** dan folder **/** (root), lalu Save.
4. Buka URL GitHub Pages kamu, misal: `https://username.github.io/nama-repo/`.
5. Di Android/Chrome, klik **Add to Home screen** untuk install.

> Catatan:
- Service Worker (`sw.js`) sudah aktif cache untuk offline.
- `manifest.json` berisi ikon & warna tema (#4f46e5).
- Jika kamu ingin mengganti ikon, replace file di `icons/` dengan PNG 192x192 & 512x512.
- Fitur premium: ganti `PUBLIC_KEY` di `index.html` dengan kunci publik milikmu untuk validasi lisensi.

## Struktur
```
/
├─ index.html
├─ manifest.json
├─ sw.js
└─ icons/
   ├─ icon-192.png
   └─ icon-512.png
```

Dibuat otomatis pada 2025-10-10 03:38:20 UTC.
