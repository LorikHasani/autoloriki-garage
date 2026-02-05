// ═══════════════════════════════════════════════════════════════════════════
// RESET DATABASE FUNCTIONALITY - READY TO PASTE
// ═══════════════════════════════════════════════════════════════════════════
// Copy and paste these sections into your GarageApp.jsx

// ───────────────────────────────────────────────────────────────────────────
// SECTION 1: Add to ServiceTypesSettings component
// Location: Inside ServiceTypesSettings function, before the return statement
// ───────────────────────────────────────────────────────────────────────────

function ServiceTypesSettings({ serviceTypes, setServiceTypes, resetAllData }) {
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

      {/* ═══ ADD THIS SECTION ═══ */}
      {/* Reset Database Section - PASTE THIS */}
      <div style={{
        background:'#ef444412',
        border:'1px solid #ef444433',
        borderRadius:9,
        padding:16,
        marginBottom:20
      }}>
        <h4 style={{
          color:'#ef4444',
          fontSize:14,
          marginBottom:8,
          fontWeight:600
        }}>
          ⚠️ Zona e Rrezikshme
        </h4>
        <p style={{
          fontSize:12,
          color:'#8b8fa3',
          marginBottom:12,
          lineHeight:1.5
        }}>
          Rivendos të gjitha të dhënat në gjendjen fillestare. Kjo do të fshijë:
          <br/>• Të gjithë klientët
          <br/>• Të gjitha automjetet
          <br/>• Të gjitha porosite (aktive dhe të arshivuara)
          <br/>• Të gjitha llojet e shërbimeve
          <br/><strong>Ky veprim nuk mund të zhbëhet!</strong>
        </p>
        <button 
          onClick={resetAllData}
          style={{
            background:'#ef4444',
            color:'#fff',
            padding:'8px 16px',
            borderRadius:7,
            border:'none',
            cursor:'pointer',
            fontWeight:600,
            fontSize:13,
            display:'flex',
            alignItems:'center',
            gap:6
          }}
          onMouseOver={e=>e.target.style.background='#dc2626'}
          onMouseOut={e=>e.target.style.background='#ef4444'}
        >
          🔄 Rivendos Databazën
        </button>
      </div>
      {/* ═══ END SECTION ═══ */}
      
      <div className="table-wrap">
        {/* ... rest of component ... */}
      </div>
    </div>
  );
}


// ───────────────────────────────────────────────────────────────────────────
// SECTION 2: Add resetAllData function to App component
// Location: Inside App function, after state declarations and before return
// ───────────────────────────────────────────────────────────────────────────

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [dailyLog, setDailyLog] = useState(INITIAL_DAILY_LOG);
  const [serviceTypes, setServiceTypes] = useState(INITIAL_SERVICE_TYPES);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });

  // ═══ ADD THIS FUNCTION ═══
  // Reset All Data Function - PASTE THIS
  const resetAllData = () => {
    const confirmMsg = '🚨 KUJDES! 🚨\n\n' +
      'Kjo do të FSHIJË të gjitha të dhënat:\n\n' +
      '❌ Të gjithë klientët\n' +
      '❌ Të gjitha automjetet\n' +
      '❌ Të gjitha porosite (aktive dhe arkiv)\n' +
      '❌ Regjistrin ditor\n' +
      '❌ Llojet e shërbimeve\n\n' +
      'Të dhënat do të kthehen në gjendjen fillestare.\n' +
      'KY VEPRIM NUK MUND TË ZHBËHET!\n\n' +
      'Jeni ABSOLUTISHT i sigurt?';
    
    if (window.confirm(confirmMsg)) {
      // Second confirmation
      const finalConfirm = '⚠️ KONFIRMIM I FUNDIT ⚠️\n\n' +
        'Duke klikuar OK, të gjitha të dhënat do të fshihen!\n\n' +
        'Vazhdoni?';
      
      if (window.confirm(finalConfirm)) {
        try {
          // Reset all state to initial values
          setCustomers(INITIAL_CUSTOMERS);
          setVehicles(INITIAL_VEHICLES);
          setOrders(INITIAL_ORDERS);
          setDailyLog(INITIAL_DAILY_LOG);
          setServiceTypes(INITIAL_SERVICE_TYPES);
          
          // Clear localStorage if you're using it
          try {
            localStorage.clear();
          } catch (e) {
            console.log('LocalStorage not available or already empty');
          }
          
          // Reset to dashboard page
          setPage('dashboard');
          
          // Success message
          alert('✅ SUKSES!\n\nDatabaza u rivendos me sukses!\nAplikacioni do të ringarkohet.');
          
          // Reload page to ensure clean state
          setTimeout(() => {
            window.location.reload();
          }, 500);
          
        } catch (error) {
          console.error('Error resetting database:', error);
          alert('❌ GABIM!\n\nNdodhi një gabim gjatë rivendosjes së databazës.\nJu lutem provoni përsëri ose kontaktoni mbështetjen.');
        }
      }
    }
  };
  // ═══ END FUNCTION ═══

  // ... rest of App component ...
}


// ───────────────────────────────────────────────────────────────────────────
// SECTION 3: Update renderPage to pass resetAllData to Settings
// Location: In the renderPage function, update the settings line
// ───────────────────────────────────────────────────────────────────────────

const renderPage = () => ({
  dashboard: <Dashboard customers={customers} vehicles={vehicles} orders={orders} dailyLog={dailyLog}/>,
  customers: <Customers customers={customers} setCustomers={setCustomers} vehicles={vehicles} orders={orders} dailyLog={dailyLog}/>,
  vehicles:  <Vehicles  vehicles={vehicles}   setVehicles={setVehicles}   customers={customers}/>,
  orders:    <ServiceOrders orders={orders} setOrders={setOrders} dailyLog={dailyLog} setDailyLog={setDailyLog} vehicles={vehicles} customers={customers} serviceTypes={serviceTypes}/>,
  dailylog:  <DailyLog dailyLog={dailyLog} vehicles={vehicles} customers={customers}/>,
  invoices:  <Invoices orders={orders} setOrders={setOrders} dailyLog={dailyLog} setDailyLog={setDailyLog} vehicles={vehicles} customers={customers}/>,
  
  // ═══ UPDATE THIS LINE ═══
  settings:  <ServiceTypesSettings serviceTypes={serviceTypes} setServiceTypes={setServiceTypes} resetAllData={resetAllData}/>,
  // ═══ END UPDATE ═══
})[page];


// ───────────────────────────────────────────────────────────────────────────
// SECTION 4: ALTERNATIVE - Add Reset via URL Parameter
// Location: Add this useEffect in App component
// ───────────────────────────────────────────────────────────────────────────

// Optional: Add URL-based reset (http://localhost:3000?reset=true)
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('reset') === 'true') {
    const doReset = window.confirm(
      'Rivendos databazën?\n\n' +
      'Kjo do të fshijë të gjitha të dhënat dhe do të kthehet në gjendjen fillestare.'
    );
    
    if (doReset) {
      resetAllData();
      // Remove reset parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      // Just remove the parameter
      window.history.replaceState({}, '', window.location.pathname);
    }
  }
}, []);


// ───────────────────────────────────────────────────────────────────────────
// SECTION 5: BONUS - Export/Import Data Functions
// Location: Add to App component for backup/restore functionality
// ───────────────────────────────────────────────────────────────────────────

// Export data to JSON file
const exportData = () => {
  const data = {
    version: '2.0',
    exportDate: new Date().toISOString(),
    appName: 'AUTO BASHKIMI-L',
    data: {
      customers,
      vehicles,
      orders,
      dailyLog,
      serviceTypes
    }
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `garazh-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  alert('✅ Të dhënat u eksportuan me sukses!');
};

// Import data from JSON file
const importData = (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      
      if (imported.data) {
        const confirmImport = window.confirm(
          'Importo të dhënat?\n\n' +
          `Eksportuar më: ${new Date(imported.exportDate).toLocaleString('sq-AL')}\n` +
          `Klientë: ${imported.data.customers?.length || 0}\n` +
          `Automjete: ${imported.data.vehicles?.length || 0}\n` +
          `Porosi: ${imported.data.orders?.length || 0}\n\n` +
          'Kjo do të zëvendësojë të gjitha të dhënat aktuale!'
        );
        
        if (confirmImport) {
          setCustomers(imported.data.customers || []);
          setVehicles(imported.data.vehicles || []);
          setOrders(imported.data.orders || []);
          setDailyLog(imported.data.dailyLog || []);
          setServiceTypes(imported.data.serviceTypes || INITIAL_SERVICE_TYPES);
          
          alert('✅ Të dhënat u importuan me sukses!');
          window.location.reload();
        }
      } else {
        alert('❌ Format i pavlefshëm i fajllit!');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert('❌ Gabim gjatë importimit të fajllit!');
    }
  };
  reader.readAsText(file);
};

// Add these buttons to ServiceTypesSettings component:
{/* Export/Import Section */}
<div style={{
  background:'#3b82f612',
  border:'1px solid #3b82f633',
  borderRadius:9,
  padding:16,
  marginBottom:20
}}>
  <h4 style={{
    color:'#3b82f6',
    fontSize:14,
    marginBottom:8,
    fontWeight:600
  }}>
    💾 Backup & Restore
  </h4>
  <p style={{
    fontSize:12,
    color:'#8b8fa3',
    marginBottom:12
  }}>
    Eksporto të dhënat për backup ose importo nga fajll i ruajtur më parë.
  </p>
  <div style={{display:'flex',gap:8}}>
    <button 
      onClick={exportData}
      className="btn btn-primary"
      style={{flex:1}}
    >
      📥 Eksporto të Dhënat
    </button>
    <label style={{flex:1}}>
      <input 
        type="file" 
        accept=".json"
        onChange={importData}
        style={{display:'none'}}
      />
      <button 
        onClick={e=>e.preventDefault() || e.target.previousSibling.click()}
        className="btn btn-ghost"
        style={{width:'100%'}}
      >
        📤 Importo të Dhënat
      </button>
    </label>
  </div>
</div>


// ═══════════════════════════════════════════════════════════════════════════
// USAGE INSTRUCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/*

INSTALLATION STEPS:

1. Open src/App.jsx

2. Add Section 2 (resetAllData function) in App component after state declarations

3. Add Section 1 (UI) to ServiceTypesSettings component

4. Update Section 3 (renderPage settings line)

5. Optional: Add Section 4 for URL-based reset

6. Optional: Add Section 5 for Export/Import functionality


TESTING:

1. Run: npm run dev
2. Login as admin
3. Go to Cilësimet (Settings)
4. Scroll down to "Zona e Rrezikshme"
5. Click "🔄 Rivendos Databazën"
6. Confirm twice
7. Data resets successfully!


ALTERNATIVE RESET METHODS:

Method 1: Via Settings Page (Recommended)
- Most user-friendly
- Built into UI
- Two confirmations for safety

Method 2: Via URL
- Go to: http://localhost:3000?reset=true
- Quick for development
- Good for testing

Method 3: Via Browser Console
- Press F12
- Type: localStorage.clear(); location.reload();
- Instant reset

Method 4: Manual Code
- In App.jsx, temporarily add onClick to any button:
  onClick={() => resetAllData()}


NOTES:

- Reset is PERMANENT - no undo!
- Use Export/Import for backups
- Good for testing with fresh data
- Safe to use in development
- Consider adding auth check in production

*/
