import { useState, useMemo, useEffect } from "react";
import { customersAPI, vehiclesAPI, ordersAPI, subscribeToTable } from '../supabaseClient.js';

// Copy the entire GarageApp.jsx content here, but replace the state management
// I'll show the key modifications:

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const TODAY = new Date().toISOString().split("T")[0];

// [Keep all the existing helper functions: calcOrder, formatDate, Icon, StatusBadge, etc.]
// [Keep all the CSS]
// [Keep all the component code]

// ─── ROOT ────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [customers, setCustomers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [dailyLog, setDailyLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial data load
  useEffect(() => {
    loadAllData();
  }, []);

  // Real-time subscriptions
  useEffect(() => {
    const unsubCustomers = subscribeToTable('customers', () => loadCustomers());
    const unsubVehicles = subscribeToTable('vehicles', () => loadVehicles());
    const unsubOrders = subscribeToTable('service_orders', () => loadOrders());

    return () => {
      unsubCustomers();
      unsubVehicles();
      unsubOrders();
    };
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCustomers(),
        loadVehicles(),
        loadOrders()
      ]);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    const data = await customersAPI.getAll();
    setCustomers(data);
  };

  const loadVehicles = async () => {
    const data = await vehiclesAPI.getAll();
    setVehicles(data);
  };

  const loadOrders = async () => {
    const [activeOrders, completedOrders] = await Promise.all([
      ordersAPI.getActive(),
      ordersAPI.getDailyLog()
    ]);
    setOrders(activeOrders);
    setDailyLog(completedOrders);
  };

  // Auto-flush: completed orders with endDate < TODAY move to dailyLog
  useMemo(() => {
    const stale = orders.filter(o => o.status === "Completed" && o.endDate && o.endDate < TODAY);
    if (stale.length > 0) {
      setDailyLog(prev => [...prev, ...stale]);
      setOrders(prev => prev.filter(o => !(o.status === "Completed" && o.endDate && o.endDate < TODAY)));
    }
  }, [orders]);

  // Wrap state setters with Supabase API calls
  const handleSetCustomers = async (updateFn) => {
    if (typeof updateFn === 'function') {
      const newState = updateFn(customers);
      // Optimistic update
      setCustomers(newState);
      // This would need more sophisticated handling for create/update/delete
      // For now, just reload
      await loadCustomers();
    }
  };

  // Similar wrappers for vehicles and orders...
  // For a production app, you'd want to handle optimistic updates properly

  const nav = [
    { id:"dashboard", label:"Dashboard",     icon:"dashboard" },
    { id:"customers", label:"Customers",     icon:"users" },
    { id:"vehicles",  label:"Vehicles",      icon:"car" },
    { id:"orders",    label:"Service Orders", icon:"wrench", badge: orders.length },
    { id:"dailylog",  label:"Daily Log",     icon:"archive" },
    { id:"invoices",  label:"Invoices",      icon:"receipt" },
  ];
  const titles = { dashboard:"Dashboard", customers:"Customers", vehicles:"Vehicles", orders:"Service Orders", dailylog:"Daily Log", invoices:"Invoices" };

  if (loading) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0f1117',color:'#e2e4e9'}}>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:16}}>⚙️</div>
          <div style={{fontSize:18,fontWeight:600}}>Loading AutoFix...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#0f1117',color:'#ef4444'}}>
        <div style={{textAlign:'center',maxWidth:400,padding:20}}>
          <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
          <div style={{fontSize:18,fontWeight:600,marginBottom:8}}>Connection Error</div>
          <div style={{fontSize:14,color:'#8b8fa3',marginBottom:16}}>{error}</div>
          <button 
            onClick={loadAllData}
            style={{padding:'8px 16px',background:'#f59e0b',color:'#0f1117',border:'none',borderRadius:7,cursor:'pointer',fontWeight:600}}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const renderPage = () => ({
    dashboard: <Dashboard customers={customers} vehicles={vehicles} orders={orders} dailyLog={dailyLog}/>,
    customers: <Customers customers={customers} setCustomers={setCustomers} vehicles={vehicles} orders={orders} dailyLog={dailyLog} api={customersAPI}/>,
    vehicles:  <Vehicles  vehicles={vehicles}   setVehicles={setVehicles}   customers={customers} api={vehiclesAPI}/>,
    orders:    <ServiceOrders orders={orders} setOrders={setOrders} dailyLog={dailyLog} setDailyLog={setDailyLog} vehicles={vehicles} customers={customers} api={ordersAPI}/>,
    dailylog:  <DailyLog dailyLog={dailyLog} vehicles={vehicles} customers={customers}/>,
    invoices:  <Invoices orders={orders} setOrders={setOrders} dailyLog={dailyLog} setDailyLog={setDailyLog} vehicles={vehicles} customers={customers} api={ordersAPI}/>,
  })[page];

  return (
    <>
      <style>{css}</style>
      <div className="app-root">
        <nav className="sidebar">
          <div className="sidebar-logo"><h1>⚙️ AUTO<span>FIX</span></h1><p>Garage Management</p></div>
          <div className="nav-items">
            {nav.slice(0,4).map(n=>(
              <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
                <Icon type={n.icon} size={17}/>{n.label}{n.badge>0&&<span className="nav-badge">{n.badge}</span>}
              </div>
            ))}
            <div className="nav-sep">Reports</div>
            {nav.slice(4).map(n=>(
              <div key={n.id} className={`nav-item ${page===n.id?"active":""}`} onClick={()=>setPage(n.id)}>
                <Icon type={n.icon} size={17}/>{n.label}
              </div>
            ))}
          </div>
        </nav>
        <div className="main">
          <div className="topbar">
            <h2>{titles[page]}</h2>
            <div style={{display:"flex",alignItems:"center",gap:10}}><div style={{width:8,height:8,borderRadius:"50%",background:"#10b981"}}/><span style={{fontSize:13,color:"#8b8fa3"}}>Garage Online</span></div>
          </div>
          <div className="content">{renderPage()}</div>
        </div>
      </div>
    </>
  );
}

// NOTE: You would need to modify each component (Customers, Vehicles, ServiceOrders, Invoices)
// to use the API prop and call the appropriate API methods instead of direct state updates.
// This is a template showing the structure - the full implementation would require
// updating all CRUD operations in each component.
