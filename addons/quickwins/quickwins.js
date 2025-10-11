// quickwins.js
(function(){
  const CFG = window.QW_CONFIG || {};
  const storeKey = 'qw_orders_v2';
  const qs = (s, p=document)=>p.querySelector(s);
  const qsa = (s, p=document)=>Array.from(p.querySelectorAll(s));
  const money = n => (n||0).toLocaleString('id-ID');
  const now = ()=> Date.now();
  const steps = ["Diterima", "Cuci", "Setrika", "Siap", "Diambil"];
  const encode = (obj)=> btoa(unescape(encodeURIComponent(JSON.stringify(obj))));
  const decode = (str)=> JSON.parse(decodeURIComponent(escape(atob(str))));

  const db = {
    all(){ return JSON.parse(localStorage.getItem(storeKey)||'[]'); },
    save(list){ localStorage.setItem(storeKey, JSON.stringify(list)); },
    add(order){
      const list = db.all();
      list.push(order); db.save(list);
    },
    update(id, patch){
      const list = db.all();
      const i = list.findIndex(o=>o.id===id);
      if(i>=0){ list[i] = {...list[i], ...patch}; db.save(list); }
    },
    one(id){ return db.all().find(o=>o.id===id); }
  };

  function generateStatusUrl(order){
    const payload = {
      id: order.id, name: order.customer?.name||"", phone: order.customer?.phone||"",
      status: order.status||steps[0], updatedAt: now(), history: order.history||[{s: order.status||steps[0], t: now()}],
      total: order.total||0
    };
    return 'addons/quickwins/status.html#' + encode(payload);
  }

  function openWhatsApp(tpl, order){
    const text = tpl
      .replace(/{{\s*nama\s*}}/gi, order.customer?.name||'Pelanggan')
      .replace(/{{\s*order\s*}}/gi, order.id)
      .replace(/{{\s*total\s*}}/gi, money(order.total||0));
    const url = `https://wa.me/${(order.customer?.phone||'')}` + `?text=` + encodeURIComponent(text);
    window.open(url, '_blank');
  }

  function ensurePanel(){
    if (qs('#qw-panel')) return;
    const root = document.createElement('div');
    root.id = 'qw-panel';
    root.innerHTML = `
      <h3>Quick Wins</h3>
      <div class="row">
        <div>
          <label>Order ID</label>
          <input id="qw-order-id" placeholder="ORD-2025-0001">
        </div>
        <div>
          <label>Total (Rp)</label>
          <input id="qw-order-total" type="number" placeholder="25000">
        </div>
      </div>
      <label>Nama Pelanggan</label>
      <input id="qw-order-name" placeholder="Nama">
      <label>No. WhatsApp (62...)</label>
      <input id="qw-order-phone" placeholder="62812xxxxx">
      <label>Express</label>
      <select id="qw-express">
        <option value="0">Normal</option>
        <option value="1">Express 48h (+25%)</option>
        <option value="2">Express 24h (+50%)</option>
      </select>
      <button id="qw-save">Simpan & Buat QR</button>
      <div class="row">
        <button id="qw-wa-received">WA: Diterima</button>
        <button id="qw-wa-ready">WA: Siap Diambil</button>
      </div>
      <div class="row">
        <button id="qw-export-csv">Export CSV</button>
        <button id="qw-export-xlsx">Export XLSX</button>
      </div>
      <div class="row">
        <button id="qw-print-receipt">Print Nota</button>
        <button id="qw-print-label">Print Label</button>
      </div>
      <div class="muted">
        <span class="link" id="qw-advance">Naikkan Status</span> ·
        <span class="link" id="qw-open-status">Buka Status</span>
      </div>
    `;
    document.body.appendChild(root);

    qs('#qw-save').onclick = ()=>{
      const order = gatherFromPanel();
      const url = generateStatusUrl(order);
      order.statusUrl = url;
      order.history = [{s: order.status, t: now()}];
      db.add(order);
      alert('Order tersimpan. QR siap di nota/label.');
    };
    qs('#qw-wa-received').onclick = ()=>{
      const order = gatherFromPanel();
      openWhatsApp((CFG.whatsappTemplates?.orderReceived)||"Halo {{nama}}, pesanan {{order}} sudah kami terima. Total: Rp{{total}}", order);
    };
    qs('#qw-wa-ready').onclick = ()=>{
      const order = gatherFromPanel();
      openWhatsApp((CFG.whatsappTemplates?.readyForPickup)||"Halo {{nama}}, pesanan {{order}} sudah SIAP DIAMBIL. Total: Rp{{total}}", order);
    };
    qs('#qw-export-csv').onclick = ()=> exportOrdersCSV();
    qs('#qw-export-xlsx').onclick = ()=> exportOrdersXLSX();
    qs('#qw-print-receipt').onclick = ()=> openReceipt('receipt');
    qs('#qw-print-label').onclick = ()=> openReceipt('label');
    qs('#qw-advance').onclick = ()=> advanceStatusFromPanel();
    qs('#qw-open-status').onclick = ()=>{
      const order = gatherFromPanel();
      const url = order.statusUrl || generateStatusUrl(order);
      window.open(url, '_blank');
    };
  }

  function gatherFromPanel(){
    const id = qs('#qw-order-id').value.trim() || ('ORD-' + new Date().toISOString().slice(0,10));
    const total = parseInt(qs('#qw-order-total').value||'0',10);
    const name = qs('#qw-order-name').value.trim();
    const phone = qs('#qw-order-phone').value.trim();
    const expressTier = parseInt(qs('#qw-express').value||'0',10);
    const extra = expressTier===1 ? Math.round(total*0.25) : expressTier===2 ? Math.round(total*0.50) : 0;
    const order = {
      id,
      customer: { name, phone },
      subtotal: total,
      expressTier,
      total: total + extra,
      paid: false,
      createdAt: now(),
      status: steps[0]
    };
    return order;
  }

  function advanceStatusFromPanel(){
    const id = qs('#qw-order-id').value.trim();
    if (!id) return alert('Isi Order ID dulu');
    const o = db.one(id) || gatherFromPanel();
    const idx = steps.indexOf(o.status||steps[0]);
    const next = steps[Math.min(idx+1, steps.length-1)];
    updateStatus(o.id, next);
  }

  function openReceipt(type='receipt'){
    const order = gatherFromPanel();
    const url = `addons/quickwins/receipt.html#${encode(order)}&type=${type}`;
    window.open(url, '_blank');
  }

  function exportOrdersCSV(data){
    const arr = data || db.all();
    const header = ["id","name","phone","status","total","createdAt"];
    const lines = [header.join(",")];
    arr.forEach(o=>{
      lines.push([o.id, JSON.stringify(o.customer?.name||""), o.customer?.phone||"", o.status||"", o.total||0, new Date(o.createdAt||now()).toISOString()].join(","));
    });
    const blob = new Blob([lines.join("\n")], {type: "text/csv"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rekap-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  }

  function exportOrdersXLSX(data){
    if (!window.XLSX){ alert('XLSX lib belum siap'); return; }
    const arr = data || db.all();
    const rows = arr.map(o=>({
      ID: o.id,
      Nama: o.customer?.name||"",
      WhatsApp: o.customer?.phone||"",
      Status: o.status||"",
      Total: o.total||0,
      Tanggal: new Date(o.createdAt||now()).toISOString().slice(0,19).replace('T',' ')
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = {SheetNames:[], Sheets:{}};
    XLSX.utils.book_append_sheet(wb, ws, "Rekap");
    XLSX.writeFile(wb, `rekap-${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  function pushOrder(order){
    if (!order || !order.id) return;
    if (!order.status) order.status = steps[0];
    order.statusUrl = generateStatusUrl(order);
    order.history = order.history||[{s: order.status, t: now()}];
    db.add(order);
    return order.statusUrl;
  }

  function updateStatus(id, newStatus){
    const o = db.one(id);
    const status = steps.includes(newStatus) ? newStatus : steps[0];
    if (!o) return;
    const history = (o.history||[]).concat({s: status, t: now()});
    db.update(id, {status, history});
    return generateStatusUrl({...o, status, history});
  }

  document.addEventListener('DOMContentLoaded', ensurePanel);

  window.QW = { pushOrder, updateStatus, exportOrders: exportOrdersCSV, exportOrdersCSV, exportOrdersXLSX };
})();
