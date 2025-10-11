# Laundry App – Quick Wins Upgrade (v2.11)

This package adds the **Step 1: Quick Wins** features to the existing GitHub Pages app:

- QR **Status Tracking** (status page + printable QR on receipt/label)
- **WhatsApp Auto Templates** (order received, ready for pickup, reminder, thanks)
- **Printable Receipt (58/80mm)** and **Label (40x30mm)** with QR/Code
- **Express Tiers** (+25% / +50%) and flexible item/weight surcharges
- **Export Rekap** → CSV/XLSX
- Non-invasive: can be added as an **addon** without rewriting your current code

> ⚠️ Because the original repository structure and element IDs are unknown, this addon ships with **sensible defaults** and a small config you can tweak (see `quickwins.config.js`). Out of the box it works **standalone** (demo mode). With a couple of selectors mapped, it will **attach to your current UI**.

## Install (Drop-in)

1. Copy the folder `addons/quickwins` into the root of your GitHub Pages repo.
2. In your `index.html`, right before closing `</head>` add:

```html
<link rel="stylesheet" href="addons/quickwins/quickwins.css">
<script src="addons/quickwins/libs/qrcode.min.js" defer></script>
<script src="addons/quickwins/libs/xlsx.mini.min.js" defer></script>
<script src="addons/quickwins/quickwins.config.js" defer></script>
<script src="addons/quickwins/quickwins.js" defer></script>
```

3. Publish to GitHub Pages. You’ll see a floating **Quick Wins** panel bottom-right.

## Files

- `quickwins.js` – main addon (status QR, WA templates, export, print)
- `quickwins.css` – styles for panel, receipt (58/80mm), label (40×30mm)
- `quickwins.config.js` – **map your DOM** (input selectors, order schema hooks)
- `status.html` – public page customers open after scanning the QR
- `receipt.html` – print-friendly 58/80mm receipt + label with QR
- `libs/qrcode.min.js` – QR generator
- `libs/xlsx.mini.min.js` – minimal XLSX exporter (SheetJS lite build)
- `demo-data.json` – sample payload used when the app doesn’t provide data yet

## How it works (high level)

- When you **save an order**, call `window.QW.pushOrder(orderObj)`.
  - The addon generates a **status link**: `status.html#<payload>` and prints a QR.
  - You can also click "Send WhatsApp" to open templated messages with placeholders filled.
- Update status via `window.QW.updateStatus(orderId, newStatus)`; reprint QR if needed.
- Export Rekap: open **Quick Wins → Export** then choose CSV/XLSX.
- Express tiers: in the panel, toggle **Express 48h (+25%)** or **Express 24h (+50%)**.

### Minimal order schema

```js
{
  id: "ORD-2025-0001",
  customer: { name: "Budi", phone: "62812xxxxxxx" },
  items: [{ name: "Cuci + Setrika", qtyKg: 3.2, unit: "kg", price: 8000 }],
  subtotal: 25600,
  discount: 0,
  expressTier: 0, // 0=none, 1=+25%, 2=+50%
  total: 25600,
  paid: false,
  createdAt: 1697040000000,
  status: "Diterima" // Diterima → Cuci → Setrika → Siap → Diambil
}
```

If your app uses a different format, map in `quickwins.config.js`.

## Integration hooks

In your existing code, after an order is confirmed:
```html
<script>
  // Suppose 'order' is your internal order object
  if (window.QW) window.QW.pushOrder(order);
</script>
```

To move status forward (e.g., when operator clicks a step in your UI):
```html
<script>
  if (window.QW) window.QW.updateStatus(order.id, "Setrika");
</script>
```

## Printing

- Open **Quick Wins → Print**:
  - **Receipt 58mm** or **80mm** (choose in the modal)
  - **Label 40×30mm** (with QR + Order ID + Customer name)
- Designed for standard printers using browser print. ESC/POS printers also work via system print dialog. (WebUSB bridges can be added later.)

## WhatsApp Templates

- **Order diterima**
- **Siap diambil**
- **Pengingat belum diambil (3 hari)**
- **Terima kasih**

Edit texts in `quickwins.config.js` (placeholders: `{{nama}}`, `{{order}}`, `{{total}}`).

## Export Rekap

Click **Quick Wins → Export** → **CSV** or **XLSX**.
By default it exports all orders known to the addon. You can also feed it your own array:
```js
window.QW.exportOrders(customArray, "rekap-september");
```

---

© 2025 Quick Wins Addon. MIT License.
