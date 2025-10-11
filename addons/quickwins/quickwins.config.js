// quickwins.config.js
window.QW_CONFIG = {
  selectors: {
    nameInput: 'input[name="nama"]',
    phoneInput: 'input[name="whatsapp"], input[name="phone"]',
    orderTable: '#order-table'
  },
  whatsappTemplates: {
    orderReceived: "Halo {{nama}}, pesanan {{order}} sudah kami terima. Total sementara: Rp{{total}}. Terima kasih 🙏",
    readyForPickup: "Halo {{nama}}, pesanan {{order}} sudah SIAP DIAMBIL. Total: Rp{{total}}. Jam buka: 08:00–20:00.",
    reminder: "Halo {{nama}}, pesanan {{order}} belum diambil 3 hari. Mohon konfirmasi ya. Jika butuh antar, balas chat ini.",
    thanks: "Terima kasih {{nama}} sudah menggunakan layanan kami. Sampai jumpa kembali! 😊"
  },
  print: {
    receiptWidth: "58mm",
    labelSize: { w: 40, h: 30 },
    brand: {
      name: "Laundry Anda",
      address: "Jl. Contoh 123, Kota",
      phone: "62812xxxxxxx"
    }
  }
};
