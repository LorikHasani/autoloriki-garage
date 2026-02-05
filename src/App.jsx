import { useState, useMemo, useEffect } from "react";

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const TODAY = new Date().toISOString().split("T")[0];

/**
 * New order shape:
 *   services: [
 *     { serviceType, laborPrice, parts: [{ name, costPrice, sellPrice }] }
 *   ]
 * calcOrder sums everything across all services in the order.
 */
function calcOrder(order) {
  const services = order.services || [];
  let partsCost = 0, partsSell = 0, labor = 0;
  services.forEach(svc => {
    labor += Number(svc.laborPrice) || 0;
    (svc.parts || []).forEach(p => {
      const qty = Number(p.qty) || 1;
      partsCost += (Number(p.costPrice) || 0) * qty;
      partsSell += (Number(p.sellPrice) || 0) * qty;
    });
  });
  const revenue = partsSell + labor;
  return { partsCost, partsSell, labor, revenue, cogs: partsCost, profit: revenue - partsCost };
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("en-GB", { weekday:"short", day:"numeric", month:"short", year:"numeric" });
}

// ─── SEED DATA ───────────────────────────────────────────────────────────────
const INITIAL_CUSTOMERS = [
  { id: 1, name: "James Mitchell", phone: "0612345678", email: "james.m@mail.com", address: "Baker St 12" },
  { id: 2, name: "Sarah Chen",     phone: "0698765432", email: "sarah.c@mail.com", address: "Pine Ave 45" },
  { id: 3, name: "David Kowalski", phone: "0623456789", email: "david.k@mail.com", address: "Oak Lane 7" },
];
const INITIAL_VEHICLES = [
  { id: 1, customerId: 1, make: "Toyota",     model: "Camry",  year: 2020, plate: "AB-12-CD", color: "Silver", vin: "1HGBH41JXMN109186" },
  { id: 2, customerId: 2, make: "BMW",        model: "320i",   year: 2019, plate: "EF-34-GH", color: "Black",  vin: "WBADT43452G123456" },
  { id: 3, customerId: 3, make: "Volkswagen", model: "Golf",   year: 2021, plate: "IJ-56-KL", color: "White",  vin: "WVWZZZ1KZBW123456" },
  { id: 4, customerId: 1, make: "Honda",      model: "Civic",  year: 2018, plate: "MN-78-OP", color: "Blue",   vin: "2HGFC2F53JH123456" },
];

// Service types - now dynamically manageable
const INITIAL_SERVICE_TYPES = [
  "Ndërrimi i Vajit",
  "Ndërrimi i Gomave", 
  "Riparimi i Frenave",
  "Riparimi i Motorit",
  "Shërbimi i Transmetimit",
  "Riparimi i Karrocës",
  "Puna Elektrike",
  "Shërbimi i Kondicionerit",
  "Inspektimi i Përgjithshëm",
  "Riparimi i Xhamit"
];

// Active orders — multi-service examples
const INITIAL_ORDERS = [
  { id: 101, vehicleId: 2, customerId: 2, status: "Në Progres", startDate: TODAY, endDate: null, paid: false, notes: "Frenat përpara + mbushje lëngu",
    services: [
      { serviceType: "Riparimi i Frenave",      laborPrice: 60, parts: [{ name: "Pllaka Frenash (Përpara)", qty: 1, costPrice: 55, sellPrice: 100 }] },
      { serviceType: "Inspektimi i Përgjithshëm", laborPrice: 20, parts: [{ name: "Lëng Frenash",       qty: 1, costPrice: 12, sellPrice: 22  }] },
    ]
  },
  { id: 102, vehicleId: 3, customerId: 3, status: "Në Pritje", startDate: TODAY, endDate: null, paid: false, notes: "Të 4 gomat",
    services: [
      { serviceType: "Ndërrimi i Gomave", laborPrice: 60, parts: [{ name: "Goma 205/55 R16", qty: 4, costPrice: 70, sellPrice: 105 }] },
    ]
  },
];

const INITIAL_DAILY_LOG = [
  { id: 1, vehicleId: 1, customerId: 1, status: "Përfunduar", startDate: "2026-01-15", endDate: "2026-01-15", paid: true, notes: "Rutinë",
    services: [
      { serviceType: "Ndërrimi i Vajit", laborPrice: 40, parts: [{ name: "Vaj Sintetik 5W-30", qty: 1, costPrice: 18, sellPrice: 35 }, { name: "Filtër Vaji", qty: 1, costPrice: 8, sellPrice: 14 }] },
    ]
  },
  { id: 4, vehicleId: 4, customerId: 1, status: "Përfunduar", startDate: "2026-01-18", endDate: "2026-01-20", paid: true, notes: "Servisim i madh + inspektim",
    services: [
      { serviceType: "Riparimi i Motorit",     laborPrice: 300, parts: [{ name: "Rrip Kohe", qty: 1, costPrice: 45, sellPrice: 90 }, { name: "Pompë Uji", qty: 1, costPrice: 60, sellPrice: 110 }, { name: "Set Guarnicionesh", qty: 1, costPrice: 35, sellPrice: 65 }] },
      { serviceType: "Inspektimi i Përgjithshëm",  laborPrice: 50,  parts: [{ name: "Filtër Ajri", qty: 1, costPrice: 10, sellPrice: 22 }] },
    ]
  },
  { id: 5, vehicleId: 1, customerId: 1, status: "Përfunduar", startDate: "2026-01-28", endDate: "2026-01-28", paid: false, notes: "Kontroll vjetor",
    services: [
      { serviceType: "Inspektimi i Përgjithshëm", laborPrice: 55, parts: [{ name: "Filtër Ajri", qty: 1, costPrice: 10, sellPrice: 20 }] },
    ]
  },
  { id: 6, vehicleId: 3, customerId: 3, status: "Përfunduar", startDate: "2026-01-28", endDate: "2026-01-28", paid: true, notes: "Çarje e riparuar",
    services: [
      { serviceType: "Riparimi i Xhamit", laborPrice: 45, parts: [{ name: "Kit Riparimi", qty: 1, costPrice: 15, sellPrice: 30 }] },
    ]
  },
];

// ─── ICONS ───────────────────────────────────────────────────────────────────
const Icon = ({ type, size = 20 }) => {
  const s = size;
  const icons = {
    dashboard:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    users:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    car:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="3" width="15" height="13" rx="2"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    wrench:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    receipt:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    plus:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    trash:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    edit:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    x:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    trend:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    package:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    dollar:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
    calendar:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    archive:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
    check:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    chevron:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
    back:<svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  };
  return icons[type] || null;
};

// ─── CSS ─────────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
  *{margin:0;padding:0;box-sizing:border-box;}
  .app-root{font-family:'DM Sans',sans-serif;background:#0f1117;color:#e2e4e9;display:flex;height:100vh;overflow:hidden;}

  /* ── sidebar ── */
  .sidebar{width:230px;min-width:230px;background:#141620;border-right:1px solid #1e2130;display:flex;flex-direction:column;height:100vh;}
  .sidebar-logo{padding:26px 22px 22px;border-bottom:1px solid #1e2130;}
  .sidebar-logo h1{font-family:'Bebas Neue',sans-serif;font-size:24px;letter-spacing:3px;color:#fff;}
  .sidebar-logo h1 span{color:#f59e0b;}
  .sidebar-logo p{font-size:10px;color:#6b7280;margin-top:3px;letter-spacing:1px;text-transform:uppercase;}
  .nav-items{padding:14px 10px;flex:1;}
  .nav-sep{font-size:10px;color:#3a3d4a;text-transform:uppercase;letter-spacing:1px;padding:14px 13px 6px;font-weight:600;}
  .nav-item{display:flex;align-items:center;gap:11px;padding:10px 13px;border-radius:8px;cursor:pointer;color:#8b8fa3;font-size:13.5px;font-weight:500;transition:all .18s;margin-bottom:1px;}
  .nav-item:hover{background:#1e2130;color:#fff;}
  .nav-item.active{background:#f59e0b12;color:#f59e0b;}
  .nav-item.active svg{stroke:#f59e0b;}
  .nav-badge{margin-left:auto;background:#f59e0b22;color:#f59e0b;font-size:11px;font-weight:600;padding:2px 7px;border-radius:10px;}

  /* ── main ── */
  .main{flex:1;overflow-y:auto;display:flex;flex-direction:column;}
  .topbar{padding:16px 26px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1e2130;background:#141620;position:sticky;top:0;z-index:10;}
  .topbar h2{font-size:19px;font-weight:600;color:#fff;}
  .content{padding:22px 26px;flex:1;}

  /* ── buttons ── */
  .btn{display:inline-flex;align-items:center;gap:6px;padding:8px 15px;border-radius:7px;border:none;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;transition:all .18s;}
  .btn-primary{background:#f59e0b;color:#0f1117;}
  .btn-primary:hover{background:#fbbf24;}
  .btn-ghost{background:transparent;color:#8b8fa3;border:1px solid #1e2130;}
  .btn-ghost:hover{border-color:#f59e0b;color:#f59e0b;}
  .btn-sm{padding:5px 10px;font-size:11.5px;border-radius:5px;}

  /* ── search ── */
  .search-bar{display:flex;align-items:center;gap:8px;background:#0f1117;border:1px solid #1e2130;border-radius:7px;padding:8px 13px;}
  .search-bar input{background:none;border:none;outline:none;color:#e2e4e9;font-size:13px;font-family:inherit;width:100%;}
  .search-bar input::placeholder{color:#5a5f72;}
  .search-bar svg{color:#5a5f72;flex-shrink:0;}

  /* ── dash cards ── */
  .dash-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px;}
  .dash-card{background:#141620;border:1px solid #1e2130;border-radius:11px;padding:18px;position:relative;overflow:hidden;}
  .dash-card::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;}
  .dash-card.amber::before{background:#f59e0b;}.dash-card.green::before{background:#10b981;}.dash-card.blue::before{background:#3b82f6;}.dash-card.red::before{background:#ef4444;}
  .dash-card-top{display:flex;align-items:center;margin-bottom:10px;}
  .dash-icon{width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;}
  .dash-card.amber .dash-icon{background:#f59e0b14;color:#f59e0b;}.dash-card.green .dash-icon{background:#10b98114;color:#10b981;}.dash-card.blue .dash-icon{background:#3b82f614;color:#3b82f6;}.dash-card.red .dash-icon{background:#ef444414;color:#ef4444;}
  .dash-card h3{font-size:24px;font-weight:600;color:#fff;}
  .dash-card p{font-size:12px;color:#6b7280;margin-top:3px;}
  .dash-sub{font-size:11px;color:#5a5f72;margin-top:5px;}

  /* ── tables ── */
  .table-wrap{background:#141620;border:1px solid #1e2130;border-radius:11px;overflow:hidden;margin-bottom:16px;}
  .table-header{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #1e2130;}
  .table-header h3{font-size:14px;color:#fff;font-weight:600;}
  table{width:100%;border-collapse:collapse;}
  th{text-align:left;padding:11px 18px;font-size:10.5px;text-transform:uppercase;letter-spacing:1px;color:#5a5f72;font-weight:600;border-bottom:1px solid #1e2130;}
  td{padding:12px 18px;font-size:13px;border-bottom:1px solid #1a1c26;color:#c0c4d0;}
  tr:last-child td{border-bottom:none;}
  tr:hover td{background:#161828;}

  /* ── badges ── */
  .badge{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:18px;font-size:11.5px;font-weight:500;}
  .badge-dot{width:6px;height:6px;border-radius:50%;}
  .badge.completed{background:#10b98114;color:#10b981;}.badge.completed .badge-dot{background:#10b981;}
  .badge.in-progress{background:#f59e0b14;color:#f59e0b;}.badge.in-progress .badge-dot{background:#f59e0b;}
  .badge.pending{background:#3b82f614;color:#3b82f6;}.badge.pending .badge-dot{background:#3b82f6;}
  .badge.cancelled{background:#ef444414;color:#ef4444;}.badge.cancelled .badge-dot{background:#ef4444;}

  /* ── action btns ── */
  .action-btns{display:flex;gap:5px;}
  .icon-btn{width:30px;height:30px;border-radius:6px;border:1px solid #1e2130;background:transparent;color:#6b7280;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;}
  .icon-btn:hover{border-color:#f59e0b;color:#f59e0b;background:#f59e0b08;}
  .icon-btn.danger:hover{border-color:#ef4444;color:#ef4444;background:#ef444408;}
  .icon-btn.green-hover:hover{border-color:#10b981;color:#10b981;background:#10b98108;}

  /* ── modal ── */
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(4px);}
  .modal{background:#141620;border:1px solid #1e2130;border-radius:14px;width:580px;max-width:95vw;max-height:90vh;overflow-y:auto;box-shadow:0 24px 60px rgba(0,0,0,.45);}
  .modal-head{display:flex;align-items:center;justify-content:space-between;padding:20px 22px 14px;}
  .modal-head h3{font-size:17px;color:#fff;font-weight:600;}
  .modal-body{padding:0 22px 20px;}
  .form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
  .form-group{display:flex;flex-direction:column;gap:5px;margin-bottom:13px;}
  .form-group label{font-size:11px;color:#6b7280;font-weight:500;text-transform:uppercase;letter-spacing:.6px;}
  .inp{background:#0f1117;border:1px solid #1e2130;border-radius:7px;padding:9px 12px;color:#e2e4e9;font-size:13px;font-family:inherit;outline:none;transition:border-color .18s;width:100%;}
  .inp:focus{border-color:#f59e0b;}
  select.inp{appearance:none;cursor:pointer;}
  select.inp option{background:#141620;color:#e2e4e9;}
  textarea.inp{resize:vertical;min-height:60px;}
  .modal-footer{display:flex;justify-content:flex-end;gap:8px;padding:0 22px 18px;}

  /* ── service blocks in order modal ── */
  .svc-block{background:#0f1117;border:1px solid #1e2130;border-radius:9px;padding:14px;margin-bottom:10px;}
  .svc-block-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;}
  .svc-block-head-left{display:flex;align-items:center;gap:9px;}
  .svc-num{width:22px;height:22px;border-radius:6px;background:#f59e0b18;color:#f59e0b;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;}
  .svc-block-head select{flex:1;}
  .svc-labor-row{display:flex;align-items:center;gap:8px;margin-bottom:8px;}
  .svc-labor-row label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap;font-weight:500;}
  .svc-labor-row input{width:110px;}

  /* ── parts in service block ── */
  .parts-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;}
  .parts-head span{font-size:10px;color:#5a5f72;font-weight:500;text-transform:uppercase;letter-spacing:.5px;}
  .parts-col-labels{display:grid;grid-template-columns:1.6fr .5fr .65fr .65fr 22px;gap:6px;margin-bottom:4px;}
  .parts-col-labels span{font-size:9.5px;color:#4a4f5e;text-transform:uppercase;letter-spacing:.5px;font-weight:500;}
  .part-row{display:grid;grid-template-columns:1.6fr .5fr .65fr .65fr 22px;gap:6px;align-items:center;margin-bottom:5px;}
  .part-row .inp{padding:6px 9px;font-size:12px;}
  .part-del{background:none;border:none;color:#ef4444;cursor:pointer;font-size:17px;line-height:1;padding:0;opacity:.6;}
  .part-del:hover{opacity:1;}

  /* ── payment toggle (modal) ── */
  .toggle-wrap{display:flex;align-items:center;gap:10px;margin:6px 0 10px;}
  .toggle{position:relative;width:44px;height:24px;cursor:pointer;}
  .toggle input{opacity:0;width:0;height:0;}
  .toggle-slider{position:absolute;inset:0;background:#ef4444;border-radius:24px;transition:.25s;display:flex;align-items:center;padding:0 5px;}
  .toggle-slider::before{content:'';width:16px;height:16px;background:#fff;border-radius:50%;transition:.25s;position:absolute;left:3px;}
  .toggle input:checked + .toggle-slider{background:#10b981;}
  .toggle input:checked + .toggle-slider::before{left:23px;}
  .toggle-label{font-size:13px;font-weight:600;}
  .toggle-label.paid{color:#10b981;}.toggle-label.unpaid{color:#ef4444;}

  /* ── pay badge (clickable in tables) ── */
  .pay-btn{display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:18px;font-size:11.5px;font-weight:600;border:none;cursor:pointer;transition:opacity .15s;font-family:inherit;}
  .pay-btn:hover{opacity:.75;}
  .pay-btn.paid{background:#10b98114;color:#10b981;}
  .pay-btn.unpaid{background:#ef444414;color:#ef4444;}
  .pay-btn .pay-dot{width:6px;height:6px;border-radius:50%;}
  .pay-btn.paid .pay-dot{background:#10b981;}
  .pay-btn.unpaid .pay-dot{background:#ef4444;}

  /* ── pay filter pills (invoices) ── */
  .pay-filter{display:flex;gap:6px;margin-bottom:14px;}
  .pay-pill{padding:4px 12px;border-radius:16px;border:1px solid #1e2130;background:transparent;color:#8b8fa3;font-size:11.5px;font-family:inherit;cursor:pointer;transition:all .15s;}
  .pay-pill:hover{border-color:#f59e0b;color:#f59e0b;}
  .pay-pill.active-all{background:#f59e0b18;border-color:#f59e0b;color:#f59e0b;font-weight:600;}
  .pay-pill.active-paid{background:#10b98118;border-color:#10b981;color:#10b981;font-weight:600;}
  .pay-pill.active-unpaid{background:#ef444418;border-color:#ef4444;color:#ef4444;font-weight:600;}

  /* ── plate chips in customers table ── */
  .plate-chip{background:#f59e0b16;color:#f59e0b;padding:2px 7px;border-radius:4px;font-size:11px;font-weight:600;margin-right:3px;white-space:nowrap;}

  /* ── orange finance card ── */
  .fc-orange h4{color:#fb923c;}

  /* ── print invoice overlay ── */
  .print-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:200;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
  .print-card{background:#fff;color:#111;border-radius:12px;width:560px;max-width:95vw;max-height:90vh;overflow-y:auto;padding:32px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.5);}
  .print-card h2{font-size:22px;margin-bottom:2px;color:#0f1117;}
  .print-card .print-sub{font-size:12px;color:#6b7280;margin-bottom:18px;}
  .print-card .print-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;border-bottom:1px solid #eee;}
  .print-card .print-row:last-child{border-bottom:none;}
  .print-card .print-row .pr-lbl{color:#555;}
  .print-card .print-row .pr-val{font-weight:600;color:#0f1117;}
  .print-card .print-svc-head{font-size:12px;font-weight:700;color:#f59e0b;text-transform:uppercase;letter-spacing:.5px;margin:14px 0 4px;}
  .print-card .print-totals{margin-top:14px;padding-top:10px;border-top:2px solid #0f1117;}
  .print-card .print-totals .print-row .pr-val{font-size:15px;}
  .print-card .print-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px;}
  .print-card .print-actions button{padding:7px 16px;border-radius:7px;border:none;font-family:inherit;font-size:13px;font-weight:500;cursor:pointer;}
  .print-card .print-actions .btn-print{background:#0f1117;color:#fff;}
  .print-card .print-actions .btn-print:hover{background:#222;}
  .print-card .print-actions .btn-cancel-print{background:#eee;color:#333;}
  .print-card .print-actions .btn-cancel-print:hover{background:#ddd;}
  .print-card .price-toggle-row{display:flex;align-items:center;gap:10px;margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #eee;}
  .print-card .price-toggle-row label{font-size:12px;color:#555;font-weight:500;}
  .print-card .price-toggle-row .pt-switch{position:relative;width:36px;height:20px;}
  .print-card .price-toggle-row .pt-switch input{opacity:0;width:0;height:0;}
  .print-card .price-toggle-row .pt-slider{position:absolute;inset:0;background:#ccc;border-radius:20px;transition:.2s;cursor:pointer;}
  .print-card .price-toggle-row .pt-slider::before{content:'';position:absolute;width:14px;height:14px;background:#fff;border-radius:50%;left:3px;bottom:3px;transition:.2s;}
  .print-card .price-toggle-row .pt-switch input:checked + .pt-slider{background:#0f1117;}
  .print-card .price-toggle-row .pt-switch input:checked + .pt-slider::before{left:19px;}

  /* ── print button in service-orders row ── */
  .icon-btn.print-hover:hover{border-color:#3b82f6;color:#3b82f6;background:#3b82f608;}

  /* ── summary box ── */
  .summary-box{background:#0f1117;border:1px solid #1e2130;border-radius:9px;padding:13px 16px;margin:10px 0 6px;}
  .sum-row{display:flex;justify-content:space-between;padding:3.5px 0;font-size:13px;}
  .sum-row .lbl{color:#6b7280;}.sum-row .val{color:#e2e4e9;font-weight:500;}
  .sum-row.divider{border-top:1px solid #1e2130;margin-top:7px;padding-top:7px;}
  .sum-row.revenue .lbl{color:#f59e0b;font-weight:600;}.sum-row.revenue .val{color:#f59e0b;font-weight:700;font-size:15px;}
  .sum-row.profit .lbl{color:#10b981;font-weight:600;}.sum-row.profit .val{font-weight:700;font-size:15px;}

  /* ── two col ── */
  .two-col{display:grid;grid-template-columns:1.6fr 1fr;gap:14px;}
  .order-mini{display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid #1a1c26;}
  .order-mini:last-child{border-bottom:none;}
  .order-mini-icon{width:36px;height:36px;border-radius:8px;background:#f59e0b10;color:#f59e0b;display:flex;align-items:center;justify-content:center;flex-shrink:0;}

  /* ── finance cards ── */
  .finance-row{display:flex;gap:14px;margin-bottom:18px;flex-wrap:wrap;}
  .finance-card{background:#141620;border:1px solid #1e2130;border-radius:10px;padding:14px 18px;flex:1;min-width:130px;}
  .finance-card p{font-size:10px;color:#5a5f72;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;}
  .finance-card h4{font-size:20px;font-weight:700;}
  .finance-card .sub{font-size:11px;color:#5a5f72;margin-top:2px;}
  .fc-amber h4{color:#f59e0b;}.fc-green h4{color:#10b981;}.fc-blue h4{color:#3b82f6;}.fc-red h4{color:#ef4444;}

  /* ── invoice expand ── */
  .inv-toggle{font-size:11px;color:#3b82f6;cursor:pointer;background:none;border:none;font-family:inherit;padding:2px 0;}
  .inv-toggle:hover{color:#60a5fa;}
  .inv-detail{background:#0f1117;padding:10px 18px 10px 28px;border-bottom:1px solid #1a1c26;font-size:12px;}
  .inv-detail .row{display:flex;justify-content:space-between;padding:2.5px 0;}
  .inv-detail .lbl{color:#6b7280;}.inv-detail .val{color:#c0c4d0;}
  .inv-detail .green{color:#10b981;font-weight:600;}
  .inv-svc-label{color:#f59e0b;font-size:11.5px;font-weight:600;margin:6px 0 3px;text-transform:uppercase;letter-spacing:.5px;}

  /* ── date filter bar ── */
  .filter-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:18px;}
  .filter-bar .date-input-wrap{display:flex;align-items:center;gap:6px;}
  .filter-bar .date-input-wrap label{font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.5px;font-weight:500;white-space:nowrap;}
  .filter-bar .date-input-wrap input{width:148px;}
  .filter-bar .sep{color:#3a3d4a;font-size:13px;}
  .preset-btn{background:transparent;border:1px solid #1e2130;color:#8b8fa3;padding:5px 11px;border-radius:5px;font-size:11.5px;font-family:inherit;cursor:pointer;transition:all .15s;}
  .preset-btn:hover{border-color:#f59e0b;color:#f59e0b;}
  .preset-btn.active{background:#f59e0b;border-color:#f59e0b;color:#0f1117;font-weight:600;}

  /* ── daily log ── */
  .day-block{margin-bottom:20px;}
  .day-header{display:flex;align-items:center;justify-content:space-between;padding:12px 18px;background:#141620;border:1px solid #1e2130;border-radius:11px 11px 0 0;}
  .day-header-left{display:flex;align-items:center;gap:12px;}
  .day-badge{background:#f59e0b18;color:#f59e0b;padding:4px 10px;border-radius:6px;font-size:11px;font-weight:600;letter-spacing:.5px;}
  .day-badge.today{background:#10b98118;color:#10b981;}
  .day-header h4{font-size:15px;color:#fff;font-weight:600;}
  .day-stats{display:flex;gap:18px;}
  .day-stat{text-align:right;}
  .day-stat span{font-size:10px;color:#5a5f72;text-transform:uppercase;letter-spacing:.5px;display:block;}
  .day-stat b{font-size:14px;font-weight:700;}
  .day-stat.revenue b{color:#f59e0b;}
  .day-stat.profit b{color:#10b981;}
  .day-stat.count b{color:#fff;}
  .day-table-wrap{background:#141620;border:1px solid #1e2130;border-top:none;border-radius:0 0 11px 11px;overflow:hidden;}

  /* ── today banner ── */
  .today-banner{display:flex;align-items:center;gap:10px;background:#10b98112;border:1px solid #10b98125;border-radius:9px;padding:10px 16px;margin-bottom:16px;}
  .today-banner svg{color:#10b981;flex-shrink:0;}
  .today-banner p{font-size:13px;color:#10b981;font-weight:500;}
  .today-banner span{color:#a0a8b8;font-weight:400;}

  /* ── customer history panel ── */
  .hist-panel{display:flex;flex-direction:column;gap:0;}
  .hist-back{display:flex;align-items:center;gap:8px;color:#f59e0b;cursor:pointer;font-size:13px;font-weight:500;margin-bottom:16px;background:none;border:none;font-family:inherit;}
  .hist-back:hover{color:#fbbf24;}
  .hist-header{display:flex;align-items:center;gap:16px;margin-bottom:18px;}
  .hist-avatar{width:50px;height:50px;border-radius:12px;background:#f59e0b18;border:2px solid #f59e0b30;display:flex;align-items:center;justify-content:center;color:#f59e0b;font-size:20px;font-weight:700;}
  .hist-info h3{font-size:18px;color:#fff;font-weight:600;}
  .hist-info p{font-size:13px;color:#6b7280;margin-top:2px;}
  .hist-stats-row{display:flex;gap:12px;margin-bottom:20px;}
  .hist-stat-card{background:#141620;border:1px solid #1e2130;border-radius:9px;padding:12px 16px;flex:1;text-align:center;}
  .hist-stat-card b{display:block;font-size:18px;font-weight:700;color:#fff;margin-bottom:3px;}
  .hist-stat-card span{font-size:10px;color:#5a5f72;text-transform:uppercase;letter-spacing:.5px;}
  .hist-stat-card.revenue b{color:#f59e0b;}
  .hist-stat-card.profit b{color:#10b981;}

  /* ── order expand rows in history / tables ── */
  .svc-chips{display:flex;flex-wrap:wrap;gap:4px;}
  .svc-chip{background:#f59e0b12;color:#f59e0b;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:500;}

  /* ── clickable customer name ── */
  .cust-link{color:#6b8cce;cursor:pointer;font-weight:500;}
  .cust-link:hover{color:#93b4e8;text-decoration:underline;}

  ::-webkit-scrollbar{width:5px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:#1e2130;border-radius:3px;}
  @media(max-width:900px){.dash-grid{grid-template-columns:repeat(2,1fr);}.two-col{grid-template-columns:1fr;}}
`;

// ─── BADGE ───────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const statusMap = {
    "Përfunduar": "completed",
    "Në Progres": "in-progress", 
    "Në Pritje": "pending",
    "Anuluar": "cancelled",
    // English fallbacks
    "Completed": "completed",
    "In Progress": "in-progress",
    "Pending": "pending",
    "Cancelled": "cancelled"
  };
  const cssClass = statusMap[status] || "pending";
  return <span className={`badge ${cssClass}`}><span className="badge-dot"/>{status}</span>;
}

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
function Dashboard({ customers, vehicles, orders, dailyLog }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    return dailyLog.filter(o => {
      const d = o.endDate || o.startDate;
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });
  }, [dailyLog, dateFrom, dateTo]);

  const completedCalcs = filtered.map(o => ({ ...o, ...calcOrder(o) }));
  const totalRevenue   = completedCalcs.reduce((s,o) => s + o.revenue, 0);
  const totalCOGS      = completedCalcs.reduce((s,o) => s + o.cogs, 0);
  const totalProfit    = completedCalcs.reduce((s,o) => s + o.profit, 0);

  const recentLog = [...filtered].sort((a,b) => new Date(b.endDate) - new Date(a.endDate)).slice(0,4).map(o=>({...o,...calcOrder(o)}));
  const laborIncome = completedCalcs.reduce((s,o) => s + o.labor, 0);
  const partsMarkup = completedCalcs.reduce((s,o) => s + (o.partsSell - o.partsCost), 0);

  return (
    <div>
      {/* Date filter */}
      <div className="filter-bar" style={{marginBottom:20}}>
        <div className="date-input-wrap">
          <label>Nga</label>
          <input className="inp" type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}/>
        </div>
        <span className="sep">→</span>
        <div className="date-input-wrap">
          <label>Deri</label>
          <input className="inp" type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}/>
        </div>
        {(dateFrom || dateTo) && (
          <button className="btn btn-ghost btn-sm" onClick={()=>{setDateFrom("");setDateTo("");}}>
            Pastro Filtrin
          </button>
        )}
      </div>

      <div className="dash-grid">
        <div className="dash-card amber"><div className="dash-card-top"><div className="dash-icon"><Icon type="dollar"/></div></div><h3>${totalRevenue.toLocaleString()}</h3><p>Të Ardhurat Totale</p><div className="dash-sub">nga {filtered.length} porosi të përfunduara</div></div>
        <div className="dash-card red"><div className="dash-card-top"><div className="dash-icon"><Icon type="package"/></div></div><h3>${totalCOGS.toLocaleString()}</h3><p>Kostoja e Pjesëve (COGS)</p><div className="dash-sub">shpenzuar për pjesë</div></div>
        <div className="dash-card green"><div className="dash-card-top"><div className="dash-icon"><Icon type="trend"/></div></div><h3>${totalProfit.toLocaleString()}</h3><p>Fitimi Netto</p><div className="dash-sub">{totalRevenue?((totalProfit/totalRevenue)*100).toFixed(1):0}% marzhë</div></div>
        <div className="dash-card blue"><div className="dash-card-top"><div className="dash-icon"><Icon type="wrench"/></div></div><h3>{orders.length}</h3><p>Aktive Sot</p><div className="dash-sub">{customers.length} klientë · {vehicles.length} automjete</div></div>
      </div>
      <div className="two-col">
        <div className="table-wrap">
          <div className="table-header"><h3>Recent Completed</h3></div>
          {recentLog.map(o => {
            const v=vehicles.find(v=>v.id===o.vehicleId);
            const svcNames = (o.services||[]).map(s=>s.serviceType).join(", ");
            return (
              <div className="order-mini" key={o.id}>
                <div className="order-mini-icon"><Icon type="wrench" size={17}/></div>
                <div style={{flex:1}}>
                  <p style={{fontSize:13,color:"#e2e4e9",fontWeight:500}}>{svcNames} — {v?`${v.make} ${v.model}`:"—"}</p>
                  <span style={{fontSize:11.5,color:"#5a5f72"}}>{formatDate(o.endDate)}</span>
                </div>
                <div style={{textAlign:"right"}}>
                  <span style={{fontSize:13,fontWeight:600,color:"#f59e0b"}}>${o.revenue}</span>
                  <span style={{fontSize:11,color:o.profit>=0?"#10b981":"#ef4444",marginLeft:6}}>profit ${o.profit}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="table-wrap">
          <div className="table-header"><h3>Profit Breakdown</h3></div>
          <div style={{padding:"10px 18px"}}>
            {[
              { label:"Labor Income",  val: laborIncome,  color:"#f59e0b" },
              { label:"Parts Markup",  val: partsMarkup,  color:"#3b82f6" },
              { label:"Parts Cost",    val: totalCOGS,    color:"#ef4444" },
              { label:"Netto Profit",  val: totalProfit,  color:"#10b981", bold:true },
            ].map(item => (
              <div key={item.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid #1a1c26"}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:8,height:8,borderRadius:"50%",background:item.color}}/><span style={{fontSize:13,color:"#c0c4d0"}}>{item.label}</span></div>
                <span style={{fontSize:item.bold?15:13,fontWeight:item.bold?700:600,color:item.color}}>${item.val.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOMER HISTORY ────────────────────────────────────────────────────────
function CustomerHistory({ customer, vehicles, orders, dailyLog, onBack }) {
  const allOrders = useMemo(() => {
    return [...dailyLog, ...orders]
      .filter(o => o.customerId === customer.id)
      .sort((a,b) => (b.endDate||b.startDate).localeCompare(a.endDate||a.startDate));
  }, [customer, orders, dailyLog]);

  const [expanded, setExpanded] = useState({});

  const totalOrders  = allOrders.length;
  const totalRevenue = allOrders.map(o=>calcOrder(o)).reduce((s,c)=>s+c.revenue,0);
  const totalProfit  = allOrders.map(o=>calcOrder(o)).reduce((s,c)=>s+c.profit,0);
  const custVehicles = vehicles.filter(v => v.customerId === customer.id);

  return (
    <div className="hist-panel">
      <button className="hist-back" onClick={onBack}><Icon type="back" size={16}/> Back to Customers</button>
      <div className="hist-header">
        <div className="hist-avatar">{customer.name.split(" ").map(w=>w[0]).join("")}</div>
        <div className="hist-info">
          <h3>{customer.name}</h3>
          <p>{customer.phone} · {customer.email}</p>
        </div>
      </div>
      <div className="hist-stats-row">
        <div className="hist-stat-card"><b>{totalOrders}</b><span>Total Orders</span></div>
        <div className="hist-stat-card"><b>{custVehicles.length}</b><span>Vehicles</span></div>
        <div className="hist-stat-card revenue"><b>${totalRevenue.toLocaleString()}</b><span>Total Spent</span></div>
        <div className="hist-stat-card profit"><b>${totalProfit.toLocaleString()}</b><span>Our Profit</span></div>
      </div>

      {/* vehicles mini */}
      {custVehicles.length > 0 && (
        <div className="table-wrap" style={{marginBottom:18}}>
          <div className="table-header"><h3>Vehicles</h3></div>
          <table><thead><tr><th>Vehicle</th><th>Plate</th><th>Year</th><th>Color</th></tr></thead>
            <tbody>{custVehicles.map(v => (
              <tr key={v.id}><td style={{color:"#fff",fontWeight:500}}>{v.make} {v.model}</td>
                <td><span style={{background:"#f59e0b16",color:"#f59e0b",padding:"2px 8px",borderRadius:5,fontSize:12,fontWeight:600}}>{v.plate}</span></td>
                <td>{v.year}</td><td>{v.color}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* order history table */}
      <div className="table-wrap">
        <div className="table-header"><h3>Service History</h3></div>
        <table><thead><tr><th>Date</th><th>Vehicle</th><th>Services</th><th>Status</th><th>Revenue</th><th>Profit</th><th style={{width:70}}>Details</th></tr></thead>
          <tbody>{allOrders.map(o => {
            const v=vehicles.find(v=>v.id===o.vehicleId), calc=calcOrder(o), isOpen=expanded[o.id];
            const dateShow=o.endDate||o.startDate;
            return [
              <tr key={o.id}>
                <td>{formatDate(dateShow)}</td>
                <td style={{color:"#fff",fontWeight:500}}>{v?`${v.make} ${v.model}`:"—"}</td>
                <td><div className="svc-chips">{(o.services||[]).map((s,i)=><span className="svc-chip" key={i}>{s.serviceType}</span>)}</div></td>
                <td><StatusBadge status={o.status}/></td>
                <td style={{color:"#f59e0b",fontWeight:600}}>${calc.revenue}</td>
                <td style={{color:calc.profit>=0?"#10b981":"#ef4444",fontWeight:700}}>${calc.profit}</td>
                <td><button className="inv-toggle" onClick={()=>setExpanded(p=>({...p,[o.id]:!p[o.id]}))}>
                  {isOpen?"Hide ▲":"Show ▼"}
                </button></td>
              </tr>,
              isOpen && <tr key={`det-${o.id}`}><td colSpan={7} style={{padding:0}}>
                <div className="inv-detail">
                  {(o.services||[]).map((svc,si) => (
                    <div key={si}>
                      <div className="inv-svc-label">{svc.serviceType}</div>
                      <div className="row"><span className="lbl">&nbsp;&nbsp;Labor</span><span className="val">${svc.laborPrice}</span></div>
                      {(svc.parts||[]).map((p,pi) => (
                        <div className="row" key={pi}><span className="lbl">&nbsp;&nbsp;&nbsp;&nbsp;{p.name}</span><span className="val">Sell ${p.sellPrice} · Cost ${p.costPrice} · <span className="green">+${p.sellPrice-p.costPrice}</span></span></div>
                      ))}
                    </div>
                  ))}
                  <div className="row" style={{marginTop:6,paddingTop:6,borderTop:"1px solid #1e2130"}}><span className="lbl">Revenue</span><span className="val" style={{color:"#f59e0b",fontWeight:600}}>${calc.revenue}</span></div>
                  <div className="row"><span className="lbl">COGS</span><span className="val" style={{color:"#ef4444"}}>${calc.cogs}</span></div>
                  <div className="row"><span className="lbl green" style={{fontWeight:600}}>Netto Profit</span><span className="val green" style={{fontSize:14}}>${calc.profit}</span></div>
                </div>
              </td></tr>
            ];
          })}</tbody>
        </table>
        {allOrders.length===0&&<p style={{padding:"28px",textAlign:"center",color:"#5a5f72"}}>No service history yet.</p>}
      </div>
    </div>
  );
}

// ─── CUSTOMERS ───────────────────────────────────────────────────────────────
function Customers({ customers, setCustomers, vehicles, orders, dailyLog }) {
  const [search, setSearch]       = useState("");
  const [modal, setModal]         = useState(false);
  const [editing, setEditing]     = useState(null);
  const [form, setForm]           = useState({ name:"", phone:"", email:"", address:"" });
  const [historyFor, setHistoryFor] = useState(null); // customer object or null

  const filtered = useMemo(() => {
    const q = search.toLowerCase().replace(/[\s\-]/g, "");
    if (!q) return customers;
    return customers.filter(c => {
      if (c.name.toLowerCase().includes(q) || c.phone.includes(q)) return true;
      return vehicles.some(v => v.customerId === c.id && v.plate.toLowerCase().replace(/[\s\-]/g, "").includes(q));
    });
  }, [search, customers, vehicles]);

  const openAdd  = () => { setEditing(null); setForm({ name:"", phone:"", email:"", address:"" }); setModal(true); };
  const openEdit = c => { setEditing(c.id); setForm({ name:c.name, phone:c.phone, email:c.email, address:c.address }); setModal(true); };
  const save = () => {
    if (!form.name || !form.phone) return;
    editing ? setCustomers(p => p.map(c => c.id===editing ? {...c,...form} : c)) : setCustomers(p => [...p, { id:Date.now(), ...form }]);
    setModal(false);
  };

  // If viewing a customer's history → show that panel instead
  if (historyFor) {
    return <CustomerHistory customer={historyFor} vehicles={vehicles} orders={orders} dailyLog={dailyLog} onBack={()=>setHistoryFor(null)}/>;
  }

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div className="search-bar" style={{width:320}}><Icon type="search" size={15}/><input placeholder="Search by name or plate (e.g. 06-554-GR)…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <button className="btn btn-primary" onClick={openAdd}><Icon type="plus" size={15}/> Add Customer</button>
      </div>
      <div className="table-wrap"><table><thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Email</th><th>Vehicles</th><th>Address</th><th style={{width:90}}>Actions</th></tr></thead>
        <tbody>{filtered.map((c,i)=>{
          const cVehicles = vehicles.filter(v => v.customerId === c.id);
          return (
          <tr key={c.id}><td style={{color:"#5a5f72",fontSize:12}}>{i+1}</td>
            <td><span className="cust-link" onClick={()=>setHistoryFor(c)}>{c.name}</span></td>
            <td>{c.phone}</td><td style={{color:"#6b8cce"}}>{c.email}</td>
            <td>{cVehicles.map(v=><span className="plate-chip" key={v.id}>{v.plate}</span>)}</td>
            <td>{c.address}</td>
            <td><div className="action-btns"><button className="icon-btn" onClick={()=>openEdit(c)}><Icon type="edit" size={14}/></button><button className="icon-btn danger" onClick={()=>{if(window.confirm(`Jeni i sigurt që dëshironi të fshini klientin ${c.name}?`)){setCustomers(p=>p.filter(x=>x.id!==c.id));}}}><Icon type="trash" size={14}/></button></div></td>
        </tr>);})}</tbody></table>
        {filtered.length===0&&<p style={{padding:"28px",textAlign:"center",color:"#5a5f72"}}>No customers found.</p>}
      </div>
      {modal && <div className="modal-overlay" onClick={()=>setModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><h3>{editing?"Edit":"New"} Customer</h3><button className="icon-btn" onClick={()=>setModal(false)}><Icon type="x" size={15}/></button></div>
        <div className="modal-body">
          <div className="form-group"><label>Full Name *</label><input className="inp" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="John Doe"/></div>
          <div className="form-row"><div className="form-group"><label>Phone *</label><input className="inp" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></div><div className="form-group"><label>Email</label><input className="inp" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div></div>
          <div className="form-group"><label>Address</label><input className="inp" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></div>
        </div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button><button className="btn btn-primary" onClick={save}>{editing?"Save Changes":"Add Customer"}</button></div>
      </div></div>}
    </div>
  );
}

// ─── VEHICLES ────────────────────────────────────────────────────────────────
function Vehicles({ vehicles, setVehicles, customers }) {
  const [search, setSearch] = useState("");
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ customerId:"", make:"", model:"", year:"", plate:"", color:"", vin:"" });
  const filtered = vehicles.filter(v => { const c=customers.find(c=>c.id===v.customerId); return `${v.make} ${v.model} ${v.plate} ${v.vin||""} ${c?.name||""}`.toLowerCase().includes(search.toLowerCase()); });

  const openAdd  = () => { setEditing(null); setForm({ customerId:"", make:"", model:"", year:"", plate:"", color:"", vin:"" }); setModal(true); };
  const openEdit = v => { setEditing(v.id); setForm({ customerId:v.customerId, make:v.make, model:v.model, year:v.year, plate:v.plate, color:v.color, vin:v.vin||"" }); setModal(true); };
  const save = () => {
    if (!form.make || !form.model || !form.plate) return;
    const p = { ...form, customerId:Number(form.customerId), year:Number(form.year) };
    editing ? setVehicles(prev=>prev.map(v=>v.id===editing?{...v,...p}:v)) : setVehicles(prev=>[...prev,{id:Date.now(),...p}]);
    setModal(false);
  };
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div className="search-bar" style={{width:280}}><Icon type="search" size={15}/><input placeholder="Kërko automjete (emër, targë, VIN)…" value={search} onChange={e=>setSearch(e.target.value)}/></div>
        <button className="btn btn-primary" onClick={openAdd}><Icon type="plus" size={15}/> Shto Automjet</button>
      </div>
      <div className="table-wrap"><table><thead><tr><th>#</th><th>Automjeti</th><th>Targa</th><th>VIN</th><th>Viti</th><th>Ngjyra</th><th>Pronari</th><th style={{width:90}}>Veprimet</th></tr></thead>
        <tbody>{filtered.map((v,i)=>{
          const owner=customers.find(c=>c.id===v.customerId);
          return <tr key={v.id}><td style={{color:"#5a5f72",fontSize:12}}>{i+1}</td><td style={{color:"#fff",fontWeight:500}}>{v.make} {v.model}</td>
            <td><span style={{background:"#f59e0b16",color:"#f59e0b",padding:"2px 8px",borderRadius:5,fontSize:12,fontWeight:600}}>{v.plate}</span></td>
            <td style={{fontSize:11,color:"#8b8fa3",fontFamily:"monospace"}}>{v.vin||"—"}</td>
            <td>{v.year}</td><td>{v.color}</td><td style={{color:"#6b8cce"}}>{owner?.name||"—"}</td>
            <td><div className="action-btns"><button className="icon-btn" onClick={()=>openEdit(v)}><Icon type="edit" size={14}/></button><button className="icon-btn danger" onClick={()=>{if(window.confirm(`Jeni i sigurt që dëshironi të fshini automjetin ${v.plate}?`)){setVehicles(p=>p.filter(x=>x.id!==v.id));}}}><Icon type="trash" size={14}/></button></div></td>
          </tr>;
        })}</tbody></table>
        {filtered.length===0&&<p style={{padding:"28px",textAlign:"center",color:"#5a5f72"}}>Nuk u gjet asnjë automjet.</p>}
      </div>
      {modal && <div className="modal-overlay" onClick={()=>setModal(false)}><div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head"><h3>{editing?"Ndrysho":"Regjistro"} Automjetin</h3><button className="icon-btn" onClick={()=>setModal(false)}><Icon type="x" size={15}/></button></div>
        <div className="modal-body">
          <div className="form-group"><label>Pronari</label><select className="inp" value={form.customerId} onChange={e=>setForm({...form,customerId:e.target.value})}><option value="">Zgjidh…</option>{customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="form-row"><div className="form-group"><label>Marka *</label><input className="inp" value={form.make} onChange={e=>setForm({...form,make:e.target.value})} placeholder="Toyota"/></div><div className="form-group"><label>Modeli *</label><input className="inp" value={form.model} onChange={e=>setForm({...form,model:e.target.value})} placeholder="Camry"/></div></div>
          <div className="form-row"><div className="form-group"><label>Viti</label><input className="inp" type="number" value={form.year} onChange={e=>setForm({...form,year:e.target.value})} placeholder="2020"/></div><div className="form-group"><label>Ngjyra</label><input className="inp" value={form.color} onChange={e=>setForm({...form,color:e.target.value})} placeholder="Zi"/></div></div>
          <div className="form-group"><label>Targa *</label><input className="inp" value={form.plate} onChange={e=>setForm({...form,plate:e.target.value})} placeholder="01-ABC-123"/></div>
          <div className="form-group"><label>VIN (Numri i Shasisë)</label><input className="inp" value={form.vin} onChange={e=>setForm({...form,vin:e.target.value})} placeholder="1HGBH41JXMN109186" maxLength="17"/></div>
        </div>
        <div className="modal-footer"><button className="btn btn-ghost" onClick={()=>setModal(false)}>Anulo</button><button className="btn btn-primary" onClick={save}>{editing?"Ruaj Ndryshimet":"Regjistro"}</button></div>
      </div></div>}
    </div>
  );
}

// ─── SERVICE ORDER MODAL (shared) ────────────────────────────────────────────
function OrderModal({ form, setForm, customers, vehicles, serviceTypes, onSave, onClose, onPrint, isEditing }) {
  // filtered vehicles = only those belonging to selected customer
  const custVehicles = useMemo(() => {
    if (!form.customerId) return [];
    return vehicles.filter(v => v.customerId === Number(form.customerId));
  }, [form.customerId, vehicles]);

  // when customer changes reset vehicle if it no longer belongs
  const handleCustomerChange = (val) => {
    const newCustVehicles = vehicles.filter(v => v.customerId === Number(val));
    const vehicleStillValid = newCustVehicles.some(v => v.id === Number(form.vehicleId));
    setForm(f => ({ ...f, customerId: val, vehicleId: vehicleStillValid ? f.vehicleId : "" }));
  };

  // service helpers
  const addService = () => setForm(f => ({
    ...f,
    services: [...f.services, { serviceType: serviceTypes[0] || "", laborPrice: "", parts: [{ name:"", qty:"1", costPrice:"", sellPrice:"" }] }]
  }));
  const removeService = (si) => setForm(f => ({ ...f, services: f.services.filter((_,i) => i !== si) }));
  const updateService = (si, field, val) => setForm(f => ({
    ...f,
    services: f.services.map((s,i) => i===si ? { ...s, [field]: val } : s)
  }));
  // part helpers inside a service
  const addPart = (si) => setForm(f => ({
    ...f,
    services: f.services.map((s,i) => i===si ? { ...s, parts: [...s.parts, { name:"", qty:"1", costPrice:"", sellPrice:"" }] } : s)
  }));
  const removePart = (si, pi) => setForm(f => ({
    ...f,
    services: f.services.map((s,i) => i===si ? { ...s, parts: s.parts.filter((_,j) => j!==pi) } : s)
  }));
  const updatePart = (si, pi, field, val) => setForm(f => ({
    ...f,
    services: f.services.map((s,i) => i===si ? { ...s, parts: s.parts.map((p,j) => j===pi ? { ...p, [field]: val } : p) } : s)
  }));

  // live totals
  const live = useMemo(() => {
    let partsCost=0, partsSell=0, labor=0;
    form.services.forEach(svc => {
      labor += Number(svc.laborPrice)||0;
      svc.parts.forEach(p => { const qty=Number(p.qty)||1; partsCost += (Number(p.costPrice)||0)*qty; partsSell += (Number(p.sellPrice)||0)*qty; });
    });
    return { partsCost, partsSell, labor, revenue: partsSell+labor, profit: partsSell+labor-partsCost };
  }, [form.services]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-head">
          <h3>{isEditing?"Edit":"New"} Service Order</h3>
          <button className="icon-btn" onClick={onClose}><Icon type="x" size={15}/></button>
        </div>
        <div className="modal-body">
          {/* Customer first */}
          <div className="form-row">
            <div className="form-group"><label>Customer *</label>
              <select className="inp" value={form.customerId} onChange={e=>handleCustomerChange(e.target.value)}>
                <option value="">Select customer</option>
                {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            {/* Vehicle — filtered by customer */}
            <div className="form-group"><label>Vehicle *</label>
              <select className="inp" value={form.vehicleId} onChange={e=>setForm({...form,vehicleId:e.target.value})} disabled={!form.customerId}>
                <option value="">{form.customerId ? "Select vehicle" : "Pick a customer first"}</option>
                {custVehicles.map(v=><option key={v.id} value={v.id}>{v.make} {v.model} — {v.plate}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group"><label>Status</label>
            <select className="inp" value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>
              {["Në Pritje","Në Progres","Përfunduar","Anuluar"].map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* ── Services list ── */}
          <div style={{marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <label style={{fontSize:11,color:"#6b7280",fontWeight:500,textTransform:"uppercase",letterSpacing:".6px"}}>Services</label>
              <button className="btn btn-ghost btn-sm" onClick={addService}><Icon type="plus" size={13}/> Add Service</button>
            </div>

            {form.services.map((svc, si) => (
              <div className="svc-block" key={si}>
                {/* header: number + service type + remove */}
                <div className="svc-block-head">
                  <div className="svc-block-head-left">
                    <span className="svc-num">{si+1}</span>
                    <select className="inp" style={{width:220}} value={svc.serviceType} onChange={e=>updateService(si,"serviceType",e.target.value)}>
                      {serviceTypes.map(s=><option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  {form.services.length > 1 && <button className="part-del" style={{fontSize:20}} onClick={()=>removeService(si)}>&times;</button>}
                </div>
                {/* labor price for this service */}
                <div className="svc-labor-row">
                  <label>Labor Price ($)</label>
                  <input className="inp" type="number" min="0" placeholder="0" value={svc.laborPrice} onChange={e=>updateService(si,"laborPrice",e.target.value)}/>
                </div>
                {/* parts for this service */}
                <div className="parts-head"><span>Parts</span><button className="btn btn-ghost btn-sm" style={{padding:"3px 8px",fontSize:"10.5px"}} onClick={()=>addPart(si)}><Icon type="plus" size={11}/> Part</button></div>
                <div className="parts-col-labels"><span>Part Name</span><span>Qty</span><span>Cost ($)</span><span>Sell ($)</span><span style={{width:22}}/></div>
                {svc.parts.map((p, pi) => (
                  <div className="part-row" key={pi}>
                    <input className="inp" placeholder="e.g. Oil Filter" value={p.name} onChange={e=>updatePart(si,pi,"name",e.target.value)}/>
                    <input className="inp" type="number" min="1" placeholder="1" value={p.qty} onChange={e=>updatePart(si,pi,"qty",e.target.value)}/>
                    <input className="inp" type="number" min="0" placeholder="0" value={p.costPrice} onChange={e=>updatePart(si,pi,"costPrice",e.target.value)}/>
                    <input className="inp" type="number" min="0" placeholder="0" value={p.sellPrice} onChange={e=>updatePart(si,pi,"sellPrice",e.target.value)}/>
                    <button className="part-del" onClick={()=>removePart(si,pi)}>&times;</button>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* live summary */}
          <div className="summary-box">
            <div className="sum-row"><span className="lbl">Total Labor</span><span className="val">${live.labor}</span></div>
            <div className="sum-row"><span className="lbl">Parts Sold</span><span className="val">${live.partsSell}</span></div>
            <div className="sum-row"><span className="lbl" style={{color:"#ef4444"}}>Parts Cost</span><span className="val" style={{color:"#ef4444"}}>${live.partsCost}</span></div>
            <div className="sum-row divider revenue"><span className="lbl">Revenue</span><span className="val">${live.revenue}</span></div>
            <div className="sum-row profit"><span className="lbl">Netto Profit</span><span className="val" style={{color:live.profit>=0?"#10b981":"#ef4444"}}>${live.profit}</span></div>
          </div>

          {/* paid toggle */}
          <div className="toggle-wrap">
            <label className="toggle">
              <input type="checkbox" checked={!!form.paid} onChange={e=>setForm({...form,paid:e.target.checked})}/>
              <span className="toggle-slider"/>
            </label>
            <span className={`toggle-label ${form.paid?"paid":"unpaid"}`}>{form.paid?"✓ Paid":"⚠ Unpaid"}</span>
          </div>

          <div className="form-group"><label>Notes</label><textarea className="inp" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Describe the work…"/></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-ghost" onClick={()=>onPrint && onPrint(form)}><Icon type="receipt" size={14}/> Print</button>
          <button className="btn btn-primary" onClick={onSave}>{isEditing?"Save Changes":"Create Order"}</button>
        </div>
      </div>
    </div>
  );
}

// ─── SERVICE ORDERS (today only) ─────────────────────────────────────────────
function ServiceOrders({ orders, setOrders, dailyLog, setDailyLog, vehicles, customers, serviceTypes }) {
  const [modal, setModal]     = useState(false);
  const [editing, setEditing] = useState(null);

  const emptyForm = () => ({
    customerId:"", vehicleId:"", status:"Në Pritje",
    startDate:TODAY, endDate:"", notes:"", paid: false,
    services: [{ serviceType: serviceTypes[0] || "", laborPrice: "", parts: [{ name:"", qty:"1", costPrice:"", sellPrice:"" }] }]
  });
  const [form, setForm] = useState(emptyForm());

  const openAdd  = () => { setEditing(null); setForm(emptyForm()); setModal(true); };
  const openEdit = o => {
    setEditing(o.id);
    setForm({
      customerId: o.customerId,
      vehicleId:  o.vehicleId,
      status:     o.status,
      startDate:  o.startDate,
      endDate:    o.endDate || "",
      notes:      o.notes || "",
      paid:       !!o.paid,
      services:   o.services.map(s => ({
        ...s,
        laborPrice: s.laborPrice,
        parts: s.parts.length ? s.parts.map(p=>({...p, qty: p.qty != null ? p.qty : 1})) : [{ name:"", qty:"1", costPrice:"", sellPrice:"" }]
      }))
    });
    setModal(true);
  };

  const save = () => {
    if (!form.vehicleId || !form.customerId || form.services.length===0) return;
    const cleanServices = form.services.map(svc => ({
      serviceType: svc.serviceType,
      laborPrice:  Number(svc.laborPrice) || 0,
      parts: svc.parts.filter(p=>p.name).map(p=>({ name:p.name, qty: Number(p.qty)||1, costPrice:Number(p.costPrice)||0, sellPrice:Number(p.sellPrice)||0 }))
    }));
    const payload = {
      vehicleId:  Number(form.vehicleId),
      customerId: Number(form.customerId),
      status:     form.status,
      startDate:  TODAY,
      endDate:    form.status==="Përfunduar" ? TODAY : null,
      notes:      form.notes,
      paid:       !!form.paid,
      services:   cleanServices
    };
    // Completed orders whose endDate is TODAY stay in `orders` — they flush to dailyLog tomorrow via auto-flush in App root
    if (editing) {
      setOrders(p => p.map(o => o.id === editing ? { ...o, ...payload } : o));
    } else {
      setOrders(p => [...p, { id: Date.now(), ...payload }]);
    }
    setModal(false);
  };

  const markComplete = (o) => {
    setOrders(p => p.map(x => x.id === o.id ? { ...x, status:"Përfunduar", endDate:TODAY } : x));
  };

  const [printFor, setPrintFor] = useState(null); // order object to print, or null

  const togglePaid = (id) => setOrders(p => p.map(o => o.id===id ? {...o, paid:!o.paid} : o));

  return (
    <div>
      <div className="today-banner">
        <Icon type="calendar" size={18}/>
        <p>Showing today's active orders — <span>{formatDate(TODAY)}</span>. Completed orders stay here until tomorrow, then move to Daily Log automatically.</p>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <span style={{fontSize:13,color:"#6b7280"}}>{orders.length} active order{orders.length!==1?"s":""} today</span>
        <button className="btn btn-primary" onClick={openAdd}><Icon type="plus" size={15}/> New Order</button>
      </div>

      <div className="table-wrap">
        <table><thead><tr><th>#</th><th>Customer</th><th>Vehicle</th><th>Services</th><th>Status</th><th>Payment</th><th>Revenue</th><th>Profit</th><th style={{width:180}}>Actions</th></tr></thead>
          <tbody>{orders.map((o,i)=>{
            const v=vehicles.find(v=>v.id===o.vehicleId), c=customers.find(c=>c.id===o.customerId), calc=calcOrder(o);
            return <tr key={o.id}>
              <td style={{color:"#5a5f72",fontSize:12}}>{i+1}</td>
              <td style={{color:"#fff",fontWeight:500}}>{c?.name||"—"}</td>
              <td>{v?`${v.make} ${v.model}`:"—"}</td>
              <td><div className="svc-chips">{(o.services||[]).map((s,j)=><span className="svc-chip" key={j}>{s.serviceType}</span>)}</div></td>
              <td><StatusBadge status={o.status}/></td>
              <td><button className={`pay-btn ${o.paid?"paid":"unpaid"}`} onClick={()=>togglePaid(o.id)}><span className="pay-dot"/>{o.paid?"Paid":"Unpaid"}</button></td>
              <td style={{color:"#f59e0b",fontWeight:600}}>${calc.revenue}</td>
              <td style={{color:calc.profit>=0?"#10b981":"#ef4444",fontWeight:700}}>${calc.profit}</td>
              <td><div className="action-btns">
                {o.status!=="Completed"&&<button className="icon-btn green-hover" onClick={()=>markComplete(o)} title="Mark Completed"><Icon type="check" size={14}/></button>}
                <button className="icon-btn print-hover" onClick={()=>setPrintFor(o)} title="Print Invoice"><Icon type="receipt" size={14}/></button>
                <button className="icon-btn" onClick={()=>openEdit(o)}><Icon type="edit" size={14}/></button>
                <button className="icon-btn danger" onClick={()=>{if(window.confirm('Jeni i sigurt që dëshironi të fshini këtë porosi?')){setOrders(p=>p.filter(x=>x.id!==o.id));}}}><Icon type="trash" size={14}/></button>
              </div></td>
            </tr>;
          })}</tbody>
        </table>
        {orders.length===0 && <p style={{padding:"32px",textAlign:"center",color:"#5a5f72"}}>No active orders for today. Add a new one!</p>}
      </div>

      {modal && <OrderModal form={form} setForm={setForm} customers={customers} vehicles={vehicles} serviceTypes={serviceTypes} onSave={save} onClose={()=>setModal(false)} onPrint={(f)=>{
        // build a temporary order-like object from the current form so we can print before saving
        const tmp = { id: editing||Date.now(), vehicleId:Number(f.vehicleId), customerId:Number(f.customerId), status:f.status, startDate:TODAY, endDate:f.status==="Përfunduar"?TODAY:null, paid:!!f.paid, notes:f.notes,
          services: f.services.map(svc=>({ serviceType:svc.serviceType, laborPrice:Number(svc.laborPrice)||0, parts:svc.parts.filter(p=>p.name).map(p=>({name:p.name,qty:Number(p.qty)||1,costPrice:Number(p.costPrice)||0,sellPrice:Number(p.sellPrice)||0})) }))
        };
        setPrintFor(tmp);
      }} isEditing={!!editing}/>}

      {printFor && <PrintInvoice order={printFor} customers={customers} vehicles={vehicles} onClose={()=>setPrintFor(null)}/>}
    </div>
  );
}

// ─── PRINT INVOICE OVERLAY ───────────────────────────────────────────────────
function PrintInvoice({ order, customers, vehicles, onClose }) {
  const [showPrices, setShowPrices] = useState(true);
  const c = customers.find(x => x.id === order.customerId);
  const v = vehicles.find(x => x.id === order.vehicleId);
  const calc = calcOrder(order);

  const doPrint = () => {
    // Create print content based on current showPrices state
    const createPrintContent = () => {
      let servicesHTML = '';
      (order.services||[]).forEach((svc) => {
        servicesHTML += `<div class="svc-head">${svc.serviceType}</div>`;
        servicesHTML += `<div class="row"><span class="lbl">&nbsp;&nbsp;Puna</span><span class="val">${showPrices ? '$'+svc.laborPrice : '—'}</span></div>`;
        (svc.parts||[]).forEach((p) => {
          const qty = Number(p.qty)||1;
          const partName = p.name + (qty>1 ? ` ×${qty}` : '');
          const partPrice = showPrices ? '$'+((Number(p.sellPrice)||0)*qty) : '—';
          servicesHTML += `<div class="row"><span class="lbl">&nbsp;&nbsp;${partName}</span><span class="val">${partPrice}</span></div>`;
        });
      });

      let totalsHTML = '';
      if (showPrices) {
        totalsHTML = `
          <div class="totals">
            <div class="row"><span class="lbl">Totali i Punës</span><span class="val">$${calc.labor}</span></div>
            <div class="row"><span class="lbl">Totali i Pjesëve</span><span class="val">$${calc.partsSell}</span></div>
            <div class="row" style="border-top:1px solid #ccc;margin-top:6px;padding-top:6px">
              <span class="lbl" style="font-weight:700;font-size:15px">Totali</span>
              <span class="val" style="font-size:18px">$${calc.revenue}</span>
            </div>
          </div>
        `;
      } else {
        totalsHTML = `
          <div class="totals">
            <div class="row" style="margin-top:12px;padding-top:10px;border-top:2px solid #111">
              <span class="lbl" style="font-weight:700">Shërbimet u Përfunduan</span>
              <span class="val" style="font-size:24px;color:#10b981">✓</span>
            </div>
          </div>
        `;
      }

      return `
        <div style="text-align:center;margin-bottom:20px;border-bottom:2px solid #111;padding-bottom:16px;">
          <h2 style="margin:0 0 4px 0;">🚗 AUTO BASHKIMI-L</h2>
          <div style="font-size:11px;color:#666;margin-bottom:2px;">Tel: 044 955 389 - 044 577 311</div>
          <div style="font-size:11px;color:#666;">Adresa: Livoq i Poshtëm, Gjilan</div>
        </div>
        <div class="sub">Faturë · ${formatDate(order.startDate)}</div>
        <div class="row"><span class="lbl">Klienti</span><span class="val">${c?.name||"—"}</span></div>
        <div class="row"><span class="lbl">Telefoni</span><span class="val">${c?.phone||"—"}</span></div>
        <div class="row"><span class="lbl">Automjeti</span><span class="val">${v?`${v.make} ${v.model} (${v.plate})`:"—"}</span></div>
        ${v?.vin ? `<div class="row"><span class="lbl">VIN</span><span class="val" style="font-family:monospace;font-size:11px">${v.vin}</span></div>` : ''}
        ${order.notes ? `<div class="row"><span class="lbl">Shënime</span><span class="val">${order.notes}</span></div>` : ''}
        ${servicesHTML}
        ${totalsHTML}
      `;
    };

    const w = window.open("", "_blank");
    w.document.write(`<!DOCTYPE html><html><head><style>
      body{font-family:'Segoe UI',sans-serif;margin:0;padding:40px;color:#111;}
      h2{font-size:22px;margin-bottom:2px;color:#0f1117;}
      .sub{font-size:12px;color:#6b7280;margin-bottom:18px;}
      .row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;border-bottom:1px solid #eee;}
      .row:last-child{border-bottom:none;}
      .lbl{color:#555;} .val{font-weight:600;}
      .svc-head{font-size:12px;font-weight:700;color:#e67e22;text-transform:uppercase;letter-spacing:.5px;margin:14px 0 4px;}
      .totals{margin-top:14px;padding-top:10px;border-top:2px solid #111;}
      .totals .val{font-size:15px;}
    </style></head><body>${createPrintContent()}</body></html>`);
    w.document.close();
    w.print();
  };

  return (
    <div className="print-overlay" onClick={onClose}>
      <div className="print-card" onClick={e=>e.stopPropagation()}>
        {/* Toggle controls OUTSIDE of print area */}
        <div style={{padding:'20px 22px 16px',borderBottom:'1px solid #eee',background:'#f9fafb'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <h3 style={{fontSize:17,fontWeight:600,color:'#111',margin:0}}>Print Preview</h3>
            <button onClick={onClose} style={{background:'none',border:'none',fontSize:24,cursor:'pointer',color:'#999',lineHeight:1}}>&times;</button>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <label style={{fontSize:13,color:'#555',fontWeight:500}}>Show prices on print</label>
            <div className="pt-switch">
              <input type="checkbox" checked={showPrices} onChange={e=>setShowPrices(e.target.checked)}/>
              <span className="pt-slider"/>
            </div>
            <span style={{fontSize:12,color:showPrices?'#10b981':'#ef4444',fontWeight:600}}>
              {showPrices ? '✓ Prices visible' : '⚠ Prices hidden'}
            </span>
          </div>
        </div>

        {/* Live preview that updates as you toggle */}
        <div style={{padding:'32px',maxHeight:'60vh',overflowY:'auto'}}>
          <div style={{textAlign:'center',marginBottom:20,borderBottom:'2px solid #111',paddingBottom:16}}>
            <h2 style={{fontSize:22,marginBottom:4,color:'#0f1117'}}>🚗 AUTO BASHKIMI-L</h2>
            <div style={{fontSize:11,color:'#666',marginBottom:2}}>Tel: 044 955 389 - 044 577 311</div>
            <div style={{fontSize:11,color:'#666'}}>Adresa: Livoq i Poshtëm, Gjilan</div>
          </div>
          <div style={{fontSize:12,color:'#6b7280',marginBottom:18}}>Faturë · {formatDate(order.startDate)}</div>

          <div className="print-row"><span className="pr-lbl">Klienti</span><span className="pr-val">{c?.name||"—"}</span></div>
          <div className="print-row"><span className="pr-lbl">Telefoni</span><span className="pr-val">{c?.phone||"—"}</span></div>
          <div className="print-row"><span className="pr-lbl">Automjeti</span><span className="pr-val">{v?`${v.make} ${v.model} (${v.plate})`:"—"}</span></div>
          {v?.vin && <div className="print-row"><span className="pr-lbl">VIN</span><span className="pr-val" style={{fontFamily:'monospace',fontSize:11}}>{v.vin}</span></div>}
          {order.notes && <div className="print-row"><span className="pr-lbl">Shënime</span><span className="pr-val">{order.notes}</span></div>}

          {(order.services||[]).map((svc, si) => (
            <div key={si}>
              <div className="print-svc-head">{svc.serviceType}</div>
              <div className="print-row">
                <span className="pr-lbl">&nbsp;&nbsp;Puna</span>
                <span className="pr-val">{showPrices ? `$${svc.laborPrice}` : '—'}</span>
              </div>
              {(svc.parts||[]).map((p, pi) => {
                const qty = Number(p.qty)||1;
                return (
                  <div className="print-row" key={pi}>
                    <span className="pr-lbl">&nbsp;&nbsp;{p.name}{qty>1?` ×${qty}`:""}</span>
                    <span className="pr-val">{showPrices ? `$${(Number(p.sellPrice)||0)*qty}` : '—'}</span>
                  </div>
                );
              })}
            </div>
          ))}

          {showPrices ? (
            <div className="print-totals">
              <div className="print-row"><span className="pr-lbl">Totali i Punës</span><span className="pr-val">${calc.labor}</span></div>
              <div className="print-row"><span className="pr-lbl">Totali i Pjesëve</span><span className="pr-val">${calc.partsSell}</span></div>
              <div className="print-row" style={{borderTop:"1px solid #ccc",marginTop:6,paddingTop:6}}>
                <span className="pr-lbl" style={{fontWeight:700,fontSize:15}}>Totali</span>
                <span className="pr-val" style={{fontSize:18}}>${calc.revenue}</span>
              </div>
            </div>
          ) : (
            <div className="print-totals">
              <div className="print-row" style={{marginTop:12,paddingTop:10,borderTop:"2px solid #111"}}>
                <span className="pr-lbl" style={{fontWeight:700}}>Shërbimet u Përfunduan</span>
                <span className="pr-val" style={{fontSize:24,color:"#10b981"}}>✓</span>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div style={{padding:'16px 22px',borderTop:'1px solid #eee',display:'flex',justifyContent:'flex-end',gap:8,background:'#f9fafb'}}>
          <button onClick={onClose} style={{padding:'8px 18px',background:'#e5e7eb',color:'#374151',border:'none',borderRadius:7,cursor:'pointer',fontWeight:500,fontSize:13}}>
            Cancel
          </button>
          <button onClick={doPrint} style={{padding:'8px 18px',background:'#0f1117',color:'#fff',border:'none',borderRadius:7,cursor:'pointer',fontWeight:500,fontSize:13,display:'flex',alignItems:'center',gap:6}}>
            🖨️ Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── SERVICE TYPES SETTINGS ──────────────────────────────────────────────────
function ServiceTypesSettings({ serviceTypes, setServiceTypes }) {
  const [newType, setNewType] = useState("");
  
  const addType = () => {
    if (newType.trim()) {
      setServiceTypes([...serviceTypes, newType.trim()]);
      setNewType("");
    }
  };
  
  const removeType = (type) => {
    if (window.confirm(`Fshi llojin e shërbimit: ${type}?`)) {
      setServiceTypes(serviceTypes.filter(t => t !== type));
    }
  };
  
  return (
    <div>
      <div style={{marginBottom:20}}>
        <h3 style={{fontSize:16,color:'#fff',marginBottom:16}}>Menaxhimi i Llojeve të Shërbimit</h3>
        <div style={{display:'flex',gap:8,marginBottom:20}}>
          <input 
            className="inp" 
            placeholder="Lloj i ri shërbimi..." 
            value={newType}
            onChange={e=>setNewType(e.target.value)}
            onKeyPress={e=>e.key==='Enter'&&addType()}
            style={{flex:1}}
          />
          <button className="btn btn-primary" onClick={addType}>
            <Icon type="plus" size={15}/> Shto
          </button>
        </div>
      </div>
      
      <div className="table-wrap">
        <div className="table-header"><h3>Llojet e Shërbimeve ({serviceTypes.length})</h3></div>
        <table>
          <thead>
            <tr>
              <th style={{width:50}}>#</th>
              <th>Lloji i Shërbimit</th>
              <th style={{width:90}}>Veprimet</th>
            </tr>
          </thead>
          <tbody>
            {serviceTypes.map((type, i) => (
              <tr key={i}>
                <td style={{color:'#5a5f72',fontSize:12}}>{i+1}</td>
                <td style={{color:'#fff',fontWeight:500}}>{type}</td>
                <td>
                  <button 
                    className="icon-btn danger" 
                    onClick={()=>removeType(type)}
                    title="Fshi"
                  >
                    <Icon type="trash" size={14}/>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {serviceTypes.length === 0 && (
          <p style={{padding:"28px",textAlign:"center",color:"#5a5f72"}}>
            Nuk ka lloje shërbimesh. Shto një lloj të ri më sipër.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── DAILY LOG ───────────────────────────────────────────────────────────────
function DailyLog({ dailyLog, vehicles, customers }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [preset,   setPreset]   = useState("all");

  const applyPreset = (key) => {
    setPreset(key);
    const now=new Date(), pad=n=>String(n).padStart(2,"0"), fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    if (key==="all")       { setDateFrom(""); setDateTo(""); return; }
    if (key==="today")     { setDateFrom(TODAY); setDateTo(TODAY); return; }
    if (key==="thisWeek")  { const day=now.getDay(); const mon=new Date(now); mon.setDate(now.getDate()-(day===0?6:day-1)); const sun=new Date(mon); sun.setDate(mon.getDate()+6); setDateFrom(fmt(mon)); setDateTo(fmt(sun)); return; }
    if (key==="lastWeek")  { const day=now.getDay(); const mon=new Date(now); mon.setDate(now.getDate()-(day===0?6:day-1)-7); const sun=new Date(mon); sun.setDate(mon.getDate()+6); setDateFrom(fmt(mon)); setDateTo(fmt(sun)); return; }
    if (key==="thisMonth") { setDateFrom(`${now.getFullYear()}-${pad(now.getMonth()+1)}-01`); const last=new Date(now.getFullYear(),now.getMonth()+1,0); setDateTo(fmt(last)); return; }
  };
  const onManualChange = (field, val) => { setPreset("manual"); field==="from"?setDateFrom(val):setDateTo(val); };

  const filtered = useMemo(() => dailyLog.filter(o => {
    const d=o.endDate||o.startDate;
    if (dateFrom && d<dateFrom) return false;
    if (dateTo   && d>dateTo)   return false;
    return true;
  }), [dailyLog, dateFrom, dateTo]);

  const grouped = useMemo(() => {
    const map={};
    filtered.forEach(o=>{ const key=o.endDate||o.startDate; if(!map[key])map[key]=[]; map[key].push(o); });
    return Object.keys(map).sort((a,b)=>b.localeCompare(a)).map(date=>({ date, orders:map[date] }));
  }, [filtered]);

  return (
    <div>
      <div className="filter-bar">
        {["all","today","thisWeek","lastWeek","thisMonth"].map(k=>(
          <button key={k} className={`preset-btn ${preset===k?"active":""}`} onClick={()=>applyPreset(k)}>
            {k==="all"?"All Time":k==="today"?"Today":k==="thisWeek"?"This Week":k==="lastWeek"?"Last Week":"This Month"}
          </button>
        ))}
        <span className="sep">|</span>
        <div className="date-input-wrap"><label>From</label><input className="inp" type="date" value={dateFrom} onChange={e=>onManualChange("from",e.target.value)}/></div>
        <span className="sep">→</span>
        <div className="date-input-wrap"><label>To</label><input className="inp" type="date" value={dateTo} onChange={e=>onManualChange("to",e.target.value)}/></div>
      </div>
      <div className="finance-row" style={{marginBottom:20}}>
        <div className="finance-card fc-blue"><p>Days Logged</p><h4>{grouped.length}</h4><div className="sub">unique days</div></div>
        <div className="finance-card fc-amber"><p>Total Orders</p><h4>{filtered.length}</h4><div className="sub">completed services</div></div>
        <div className="finance-card fc-amber"><p>Revenue</p><h4>${filtered.map(o=>calcOrder(o)).reduce((s,c)=>s+c.revenue,0).toLocaleString()}</h4><div className="sub">total earned</div></div>
        <div className="finance-card fc-green"><p>Netto Profit</p><h4>${filtered.map(o=>calcOrder(o)).reduce((s,c)=>s+c.profit,0).toLocaleString()}</h4><div className="sub">after parts cost</div></div>
      </div>

      {grouped.map(({ date, orders: dayOrders }) => {
        const isToday=date===TODAY;
        const dayCalcs=dayOrders.map(o=>calcOrder(o));
        return (
          <div className="day-block" key={date}>
            <div className="day-header">
              <div className="day-header-left">
                <span className={`day-badge ${isToday?"today":""}`}>{isToday?"TODAY":new Date(date+"T12:00:00").toLocaleDateString("en-GB",{weekday:"short"}).toUpperCase()}</span>
                <h4>{formatDate(date)}</h4>
              </div>
              <div className="day-stats">
                <div className="day-stat count"><span>Orders</span><b>{dayOrders.length}</b></div>
                <div className="day-stat revenue"><span>Revenue</span><b>${dayCalcs.reduce((s,c)=>s+c.revenue,0)}</b></div>
                <div className="day-stat profit"><span>Profit</span><b>${dayCalcs.reduce((s,c)=>s+c.profit,0)}</b></div>
              </div>
            </div>
            <div className="day-table-wrap">
              <table><thead><tr><th>#</th><th>Customer</th><th>Vehicle</th><th>Services</th><th>Revenue</th><th>Profit</th></tr></thead>
                <tbody>{dayOrders.map((o,i)=>{
                  const v=vehicles.find(v=>v.id===o.vehicleId), c=customers.find(c=>c.id===o.customerId), calc=calcOrder(o);
                  return <tr key={o.id}>
                    <td style={{color:"#5a5f72",fontSize:12}}>{i+1}</td>
                    <td style={{color:"#fff",fontWeight:500}}>{c?.name||"—"}</td>
                    <td>{v?`${v.make} ${v.model}`:"—"}</td>
                    <td><div className="svc-chips">{(o.services||[]).map((s,j)=><span className="svc-chip" key={j}>{s.serviceType}</span>)}</div></td>
                    <td style={{color:"#f59e0b",fontWeight:600}}>${calc.revenue}</td>
                    <td style={{color:calc.profit>=0?"#10b981":"#ef4444",fontWeight:700}}>${calc.profit}</td>
                  </tr>;
                })}</tbody>
              </table>
            </div>
          </div>
        );
      })}
      {grouped.length===0 && <div style={{textAlign:"center",padding:"60px 20px",color:"#5a5f72"}}><Icon type="archive" size={40}/><p style={{marginTop:12,fontSize:14}}>No completed services in this date range.</p></div>}
    </div>
  );
}

// ─── INVOICES ────────────────────────────────────────────────────────────────
function Invoices({ orders, setOrders, dailyLog, setDailyLog, vehicles, customers }) {
  const [expanded, setExpanded] = useState({});
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [preset,   setPreset]   = useState("all");
  const [payFilter, setPayFilter] = useState("all"); // "all" | "paid" | "unpaid"
  const [printFor, setPrintFor]   = useState(null);
  const [search, setSearch] = useState(""); // Search filter

  const togglePaidInv = (id) => {
    if (orders.some(o=>o.id===id))       setOrders(p=>p.map(o=>o.id===id?{...o,paid:!o.paid}:o));
    else if (dailyLog.some(o=>o.id===id)) setDailyLog(p=>p.map(o=>o.id===id?{...o,paid:!o.paid}:o));
  };

  const applyPreset = (key) => {
    setPreset(key);
    const now=new Date(), pad=n=>String(n).padStart(2,"0"), fmt=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    if (key==="all")       { setDateFrom(""); setDateTo(""); return; }
    if (key==="today")     { setDateFrom(TODAY); setDateTo(TODAY); return; }
    if (key==="thisWeek")  { const day=now.getDay(); const mon=new Date(now); mon.setDate(now.getDate()-(day===0?6:day-1)); const sun=new Date(mon); sun.setDate(mon.getDate()+6); setDateFrom(fmt(mon)); setDateTo(fmt(sun)); return; }
    if (key==="lastWeek")  { const day=now.getDay(); const mon=new Date(now); mon.setDate(now.getDate()-(day===0?6:day-1)-7); const sun=new Date(mon); sun.setDate(mon.getDate()+6); setDateFrom(fmt(mon)); setDateTo(fmt(sun)); return; }
    if (key==="thisMonth") { setDateFrom(`${now.getFullYear()}-${pad(now.getMonth()+1)}-01`); const last=new Date(now.getFullYear(),now.getMonth()+1,0); setDateTo(fmt(last)); return; }
  };
  const onManualChange = (field, val) => { setPreset("manual"); field==="from"?setDateFrom(val):setDateTo(val); };

  const allOrders = useMemo(() => {
    const q = search.toLowerCase().replace(/[\s\-]/g, "");
    return [...dailyLog, ...orders].filter(o => {
      const d=o.endDate||o.startDate;
      if (dateFrom && d<dateFrom) return false;
      if (dateTo   && d>dateTo)   return false;
      if (payFilter==="paid"   && !o.paid)  return false;
      if (payFilter==="unpaid" &&  o.paid)  return false;
      
      // Search filter by customer name, vehicle plate, or VIN
      if (q) {
        const c = customers.find(x => x.id === o.customerId);
        const v = vehicles.find(x => x.id === o.vehicleId);
        const matchesName = c?.name.toLowerCase().includes(q);
        const matchesPlate = v?.plate.toLowerCase().replace(/[\s\-]/g, "").includes(q);
        const matchesVIN = v?.vin?.toLowerCase().replace(/[\s\-]/g, "").includes(q);
        if (!matchesName && !matchesPlate && !matchesVIN) return false;
      }
      
      return true;
    }).sort((a,b)=>(b.endDate||b.startDate).localeCompare(a.endDate||a.startDate));
  }, [dailyLog, orders, dateFrom, dateTo, payFilter, search, customers, vehicles]);

  const completedFiltered = allOrders.filter(o=>o.status==="Completed");
  const totalRevenue = completedFiltered.map(o=>calcOrder(o)).reduce((s,c)=>s+c.revenue,0);
  const totalCOGS    = completedFiltered.map(o=>calcOrder(o)).reduce((s,c)=>s+c.cogs,0);
  const totalProfit  = completedFiltered.map(o=>calcOrder(o)).reduce((s,c)=>s+c.profit,0);
  const pending      = allOrders.filter(o=>o.status!=="Completed"&&o.status!=="Cancelled").map(o=>calcOrder(o)).reduce((s,c)=>s+c.revenue,0);

  const unpaidRevenue = [...dailyLog, ...orders].filter(o=>!o.paid && o.status!=="Cancelled").map(o=>calcOrder(o)).reduce((s,c)=>s+c.revenue,0);

  return (
    <div>
      <div className="filter-bar">
        {["all","today","thisWeek","lastWeek","thisMonth"].map(k=>(
          <button key={k} className={`preset-btn ${preset===k?"active":""}`} onClick={()=>applyPreset(k)}>
            {k==="all"?"Të Gjitha":k==="today"?"Sot":k==="thisWeek"?"Këtë Javë":k==="lastWeek"?"Javën e Kaluar":"Këtë Muaj"}
          </button>
        ))}
        <span className="sep">|</span>
        <div className="date-input-wrap"><label>Nga</label><input className="inp" type="date" value={dateFrom} onChange={e=>onManualChange("from",e.target.value)}/></div>
        <span className="sep">→</span>
        <div className="date-input-wrap"><label>Deri</label><input className="inp" type="date" value={dateTo} onChange={e=>onManualChange("to",e.target.value)}/></div>
      </div>
      
      {/* Search bar */}
      <div style={{marginBottom:18}}>
        <div className="search-bar" style={{width:350}}>
          <Icon type="search" size={15}/>
          <input placeholder="Kërko sipas emrit, targës, ose VIN (p.sh. 1HGBH41JXMN)…" value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>
      
      <div className="finance-row">
        <div className="finance-card fc-amber"><p>Total Revenue</p><h4>${totalRevenue.toLocaleString()}</h4><div className="sub">completed orders</div></div>
        <div className="finance-card fc-red"><p>Total COGS</p><h4>${totalCOGS.toLocaleString()}</h4><div className="sub">parts purchased</div></div>
        <div className="finance-card fc-green"><p>Netto Profit</p><h4>${totalProfit.toLocaleString()}</h4><div className="sub">{totalRevenue?((totalProfit/totalRevenue)*100).toFixed(1):0}% margin</div></div>
        <div className="finance-card fc-blue"><p>Pending Revenue</p><h4>${pending.toLocaleString()}</h4><div className="sub">open orders</div></div>
        <div className="finance-card fc-orange"><p>Unpaid</p><h4>${unpaidRevenue.toLocaleString()}</h4><div className="sub">awaiting payment</div></div>
      </div>

      {/* payment filter pills */}
      <div className="pay-filter">
        <button className={`pay-pill ${payFilter==="all"?"active-all":""}`} onClick={()=>setPayFilter("all")}>All Invoices</button>
        <button className={`pay-pill ${payFilter==="paid"?"active-paid":""}`} onClick={()=>setPayFilter("paid")}>✓ Paid</button>
        <button className={`pay-pill ${payFilter==="unpaid"?"active-unpaid":""}`} onClick={()=>setPayFilter("unpaid")}>⚠ Unpaid</button>
      </div>

      <div className="table-wrap">
        <table><thead><tr><th>Invoice</th><th>Customer</th><th>Vehicle</th><th>Services</th><th>Date</th><th>Status</th><th>Payment</th><th>Revenue</th><th>Profit</th><th style={{width:110}}>Actions</th></tr></thead>
          <tbody>{allOrders.map(o => {
            const v=vehicles.find(v=>v.id===o.vehicleId), c=customers.find(c=>c.id===o.customerId), calc=calcOrder(o), isOpen=expanded[o.id];
            const dateShow=o.endDate||o.startDate;
            return [
              <tr key={o.id}>
                <td style={{color:"#f59e0b",fontWeight:600}}>INV-{String(o.id).padStart(4,"0")}</td>
                <td style={{color:"#fff",fontWeight:500}}>{c?.name||"—"}</td>
                <td>{v?`${v.make} ${v.model}`:"—"}</td>
                <td><div className="svc-chips">{(o.services||[]).map((s,j)=><span className="svc-chip" key={j}>{s.serviceType}</span>)}</div></td>
                <td>{formatDate(dateShow)}</td>
                <td><StatusBadge status={o.status}/></td>
                <td><button className={`pay-btn ${o.paid?"paid":"unpaid"}`} onClick={()=>togglePaidInv(o.id)}><span className="pay-dot"/>{o.paid?"Paid":"Unpaid"}</button></td>
                <td style={{color:"#f59e0b",fontWeight:600}}>${calc.revenue}</td>
                <td style={{color:calc.profit>=0?"#10b981":"#ef4444",fontWeight:700}}>${calc.profit}</td>
                <td><div className="action-btns">
                  <button className="icon-btn print-hover" onClick={()=>setPrintFor(o)} title="Print Invoice"><Icon type="receipt" size={14}/></button>
                  <button className="inv-toggle" onClick={()=>setExpanded(p=>({...p,[o.id]:!p[o.id]}))}>
                    {isOpen?"Hide ▲":"Show ▼"}
                  </button>
                </div></td>
              </tr>,
              isOpen && <tr key={`det-${o.id}`}><td colSpan={10} style={{padding:0}}>
                <div className="inv-detail">
                  {(o.services||[]).map((svc,si) => (
                    <div key={si}>
                      <div className="inv-svc-label">{svc.serviceType}</div>
                      <div className="row"><span className="lbl">&nbsp;&nbsp;Labor</span><span className="val">${svc.laborPrice}</span></div>
                      {(svc.parts||[]).map((p,pi) => {
                        const qty = Number(p.qty)||1;
                        return <div className="row" key={pi}><span className="lbl">&nbsp;&nbsp;&nbsp;&nbsp;{p.name}{qty>1?` ×${qty}`:""}</span><span className="val">Sold ${(Number(p.sellPrice)||0)*qty} · Cost ${(Number(p.costPrice)||0)*qty} · <span className="green">+${((Number(p.sellPrice)||0)-(Number(p.costPrice)||0))*qty}</span></span></div>;
                      })}
                    </div>
                  ))}
                  <div className="row" style={{marginTop:6,paddingTop:6,borderTop:"1px solid #1e2130"}}><span className="lbl">Revenue</span><span className="val" style={{color:"#f59e0b",fontWeight:600}}>${calc.revenue}</span></div>
                  <div className="row"><span className="lbl">COGS</span><span className="val" style={{color:"#ef4444"}}>${calc.cogs}</span></div>
                  <div className="row"><span className="lbl green" style={{fontWeight:600}}>Netto Profit</span><span className="val green" style={{fontSize:14}}>${calc.profit}</span></div>
                </div>
              </td></tr>
            ];
          })}</tbody>
        </table>
        {allOrders.length===0&&<p style={{padding:"28px",textAlign:"center",color:"#5a5f72"}}>No invoices in this date range.</p>}
      </div>

      {printFor && <PrintInvoice order={printFor} customers={customers} vehicles={vehicles} onClose={()=>setPrintFor(null)}/>}
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  // Initialize with empty arrays - will load from database
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles]   = useState([]);
  const [orders, setOrders]       = useState([]);
  const [dailyLog, setDailyLog]   = useState([]);
  const [serviceTypes, setServiceTypes] = useState(INITIAL_SERVICE_TYPES);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const saved = localStorage.getItem('garazh_isLoggedIn');
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Save login state to localStorage
  useEffect(() => {
    localStorage.setItem('garazh_isLoggedIn', isLoggedIn.toString());
  }, [isLoggedIn]);

  // Load all data from database when logged in
  useEffect(() => {
    if (!isLoggedIn) return;
    
    const loadAllData = async () => {
      setLoading(true);
      try {
        // Import database helper
        const db = await import('./database.js');
        
        console.log('📥 Starting to load data from database...');
        
        // Load all data in parallel
        const [customersData, vehiclesData, ordersData] = await Promise.all([
          db.customersDB.getAll().catch(err => {
            console.error('❌ Error loading customers:', err);
            throw new Error(`Customers: ${err.message}`);
          }),
          db.vehiclesDB.getAll().catch(err => {
            console.error('❌ Error loading vehicles:', err);
            throw new Error(`Vehicles: ${err.message}`);
          }),
          db.ordersDB.getAll().catch(err => {
            console.error('❌ Error loading orders:', err);
            throw new Error(`Orders: ${err.message}`);
          })
        ]);
        
        console.log('📊 Raw data loaded:', {
          customers: customersData.length,
          vehicles: vehiclesData.length,
          orders: ordersData.length
        });
        
        // Set state
        setCustomers(customersData);
        setVehicles(vehiclesData);
        
        // Separate active orders and daily log
        const today = new Date().toISOString().split('T')[0];
        const active = ordersData.filter(o => 
          o.status !== "Përfunduar" || !o.endDate || o.endDate >= today
        );
        const archived = ordersData.filter(o => 
          o.status === "Përfunduar" && o.endDate && o.endDate < today
        );
        
        setOrders(active);
        setDailyLog(archived);
        
        console.log('✅ Data loaded from database:', {
          customers: customersData.length,
          vehicles: vehiclesData.length,
          orders: active.length,
          dailyLog: archived.length
        });
      } catch (error) {
        console.error('❌ Full error details:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Show user-friendly error
        alert(`Gabim gjatë ngarkimit të të dhënave!\n\nDetajet: ${error.message}\n\nShiko console (F12) për më shumë informacion.`);
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
  }, [isLoggedIn]);

  // Auto-flush: completed orders with endDate < TODAY move to dailyLog
  // IMPORTANT: This must be BEFORE any conditional returns
  useMemo(() => {
    if (!isLoggedIn) return; // Skip if not logged in
    const stale = orders.filter(o => o.status === "Përfunduar" && o.endDate && o.endDate < TODAY);
    if (stale.length > 0) {
      setDailyLog(prev => [...prev, ...stale]);
      setOrders(prev => prev.filter(o => !(o.status === "Përfunduar" && o.endDate && o.endDate < TODAY)));
    }
  }, [orders, isLoggedIn]);

  // Login handler
  const handleLogin = () => {
    if (loginForm.username === "admin" && loginForm.password === "admin123") {
      setIsLoggedIn(true);
    } else {
      alert("Përdoruesi ose fjalëkalimi gabim!");
    }
  };

  // Navigation and titles - defined before conditional return
  const nav = [
    { id:"dashboard", label:"Paneli",     icon:"dashboard" },
    { id:"customers", label:"Klientët",     icon:"users" },
    { id:"vehicles",  label:"Automjetet",      icon:"car" },
    { id:"orders",    label:"Porositë", icon:"wrench", badge: orders.length },
    { id:"dailylog",  label:"Regjistri Ditor",     icon:"archive" },
    { id:"invoices",  label:"Faturat",      icon:"receipt" },
    { id:"settings",  label:"Cilësimet",    icon:"wrench" },
  ];
  const titles = { dashboard:"Paneli", customers:"Klientët", vehicles:"Automjetet", orders:"Porositë e Servisit", dailylog:"Regjistri Ditor", invoices:"Faturat", settings:"Cilësimet" };

  const renderPage = () => ({
    dashboard: <Dashboard customers={customers} vehicles={vehicles} orders={orders} dailyLog={dailyLog}/>,
    customers: <Customers customers={customers} setCustomers={setCustomers} vehicles={vehicles} orders={orders} dailyLog={dailyLog}/>,
    vehicles:  <Vehicles  vehicles={vehicles}   setVehicles={setVehicles}   customers={customers}/>,
    orders:    <ServiceOrders orders={orders} setOrders={setOrders} dailyLog={dailyLog} setDailyLog={setDailyLog} vehicles={vehicles} customers={customers} serviceTypes={serviceTypes}/>,
    dailylog:  <DailyLog dailyLog={dailyLog} vehicles={vehicles} customers={customers}/>,
    invoices:  <Invoices orders={orders} setOrders={setOrders} dailyLog={dailyLog} setDailyLog={setDailyLog} vehicles={vehicles} customers={customers}/>,
    settings:  <ServiceTypesSettings serviceTypes={serviceTypes} setServiceTypes={setServiceTypes}/>,
  })[page];

  // Show login screen if not logged in
  // NOW it's safe to return early - all hooks have been called
  if (!isLoggedIn) {
    return (
      <>
        <style>{css}</style>
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0f1117'}}>
          <div style={{background:'#141620',border:'1px solid #1e2130',borderRadius:14,padding:32,width:400,maxWidth:'90vw'}}>
            <div style={{textAlign:'center',marginBottom:24}}>
              <h2 style={{color:'#fff',marginBottom:4,fontSize:24}}>🚗 AUTO BASHKIMI-L</h2>
              <p style={{color:'#6b7280',fontSize:13}}>Menaxhimi i Garazhit</p>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,color:'#6b7280',fontWeight:500,textTransform:'uppercase',letterSpacing:'.6px',display:'block',marginBottom:5}}>Përdoruesi</label>
              <input 
                className="inp" 
                placeholder="admin" 
                value={loginForm.username}
                onChange={e=>setLoginForm({...loginForm,username:e.target.value})}
                onKeyPress={e=>e.key==='Enter'&&handleLogin()}
              />
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:11,color:'#6b7280',fontWeight:500,textTransform:'uppercase',letterSpacing:'.6px',display:'block',marginBottom:5}}>Fjalëkalimi</label>
              <input 
                className="inp" 
                type="password" 
                placeholder="••••••••"
                value={loginForm.password}
                onChange={e=>setLoginForm({...loginForm,password:e.target.value})}
                onKeyPress={e=>e.key==='Enter'&&handleLogin()}
              />
            </div>
            <button 
              className="btn btn-primary" 
              style={{width:'100%'}}
              onClick={handleLogin}
            >
              Hyr
            </button>
            <div style={{marginTop:16,padding:12,background:'#0f1117',borderRadius:7,border:'1px solid #1e2130'}}>
              <p style={{fontSize:11,color:'#6b7280',margin:0}}>Kredencialet e paracaktuara:</p>
              <p style={{fontSize:12,color:'#8b8fa3',margin:'4px 0 0 0',fontFamily:'monospace'}}>admin / admin123</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      {loading ? (
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0f1117',flexDirection:'column',gap:16}}>
          <div style={{width:40,height:40,border:'4px solid #1e2130',borderTop:'4px solid #3b82f6',borderRadius:'50%',animation:'spin 1s linear infinite'}}></div>
          <p style={{color:'#8b8fa3',fontSize:14}}>Duke ngarkuar të dhënat...</p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
      <div className="app-root">
        <nav className="sidebar">
          <div className="sidebar-logo"><h1>🚗 AUTO<span>BASHKIMI-L</span></h1><p>Menaxhimi i Garazhit</p></div>
          <div className="nav-items">
            {nav.slice(0,4).map(n=>(
              <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
                <Icon type={n.icon} size={17}/>{n.label}{n.badge>0&&<span className="nav-badge">{n.badge}</span>}
              </div>
            ))}
            <div className="nav-sep">Raporte</div>
            {nav.slice(4).map(n=>(
              <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
                <Icon type={n.icon} size={17}/>{n.label}
              </div>
            ))}
            <div style={{marginTop:'auto',paddingTop:16,borderTop:'1px solid #1e2130'}}>
              <button 
                className="nav-item" 
                onClick={()=>{if(window.confirm('Jeni i sigurt që dëshironi të dilni?')){setIsLoggedIn(false);setPage('dashboard');}}}
                style={{width:'100%',border:'none',background:'transparent',fontFamily:'inherit',cursor:'pointer',color:'#ef4444'}}
              >
                <Icon type="x" size={17}/> Dil
              </button>
            </div>
          </div>
        </nav>
        <div className="main">
          <div className="topbar">
            <h2>{titles[page]}</h2>
            <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:8,height:8,borderRadius:"50%",background:"#10b981"}}/><span style={{fontSize:13,color:"#8b8fa3"}}>Garazhi Online</span></div>
          </div>
          <div className="content">{renderPage()}</div>
        </div>
      </div>
      )}
    </>
  );
}
