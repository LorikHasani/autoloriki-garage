# 🔄 Si të Rivendosni dhe Krijoni Databazë të Re
## Guide for Resetting Database - AUTO BASHKIMI-L

---

## 📋 METODAT (3 Rrugë)

### Metoda 1: Rivendosje e Plotë në Aplikacion (Më e Thjeshtë)
### Metoda 2: Rivendosje Lokale (LocalStorage/React State)  
### Metoda 3: Rivendosje e Supabase Database (Për Prodhim)

---

## 🔧 METODA 1: RIVENDOSJE NË APLIKACION

### Hapi 1: Shto Butonin e Rivendosjes

Hap fajllin `src/App.jsx` dhe shto këtë në funksionin `ServiceTypesSettings`:

```javascript
// Në ServiceTypesSettings component, shto këtë në fund para return
const resetAllData = () => {
  if (window.confirm('KUJDES! Kjo do të fshijë TË GJITHA të dhënat (klientë, automjete, porosite). Jeni i sigurt?')) {
    if (window.confirm('Konfirmim i fundit! Të dhënat nuk mund të rikthehen. Vazhdoni?')) {
      // Reset everything to initial state
      setCustomers(INITIAL_CUSTOMERS);
      setVehicles(INITIAL_VEHICLES);
      setOrders(INITIAL_ORDERS);
      setDailyLog(INITIAL_DAILY_LOG);
      setServiceTypes(INITIAL_SERVICE_TYPES);
      
      // Clear localStorage if you're using it
      localStorage.clear();
      
      alert('Të dhënat u rivendosën me sukses! Aplikacioni do të ringarkohet.');
      window.location.reload();
    }
  }
};
```

### Hapi 2: Shto Butonin në UI

Në return të `ServiceTypesSettings`, shto këtë para `<div className="table-wrap">`:

```javascript
{/* Reset Database Section */}
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
    marginBottom:12
  }}>
    Rivendos të gjitha të dhënat në gjendjen fillestare. Kjo veprim nuk mund të zhbëhet!
  </p>
  <button 
    className="btn"
    onClick={resetAllData}
    style={{
      background:'#ef4444',
      color:'#fff',
      padding:'8px 16px',
      borderRadius:7,
      border:'none',
      cursor:'pointer',
      fontWeight:600,
      fontSize:13
    }}
  >
    🔄 Rivendos Databazën
  </button>
</div>
```

### Hapi 3: Përdorimi

1. Shko te **Cilësimet** (Settings)
2. Scroll poshtë te "Zona e Rrezikshme"
3. Kliko "🔄 Rivendos Databazën"
4. Konfirmo dy herë
5. Aplikacioni do të ringarkohet me të dhëna të reja!

---

## 💾 METODA 2: RIVENDOSJE LOKALE (LOCALSTORAGE)

### Opsioni A: Përmes Browser DevTools

1. **Hap Chrome/Firefox DevTools**
   - Shtyp `F12` ose `Right Click → Inspect`

2. **Shko te Console Tab**

3. **Ekzekuto këtë kod:**
   ```javascript
   // Fshi të gjitha të dhënat e ruajtura
   localStorage.clear();
   
   // Ringarko faqen
   location.reload();
   ```

4. **Aplikacioni rinis me të dhëna fillestare!**

### Opsioni B: Shto Funksion Automatik

Në `src/App.jsx`, në fillim të `App` function, shto:

```javascript
export default function App() {
  // ... existing state declarations ...
  
  // Check for reset flag in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset') === 'true') {
      localStorage.clear();
      alert('Databaza u rivendos!');
      window.location.href = window.location.pathname;
    }
  }, []);
  
  // ... rest of component
}
```

**Përdorimi:**
- Shko te: `http://localhost:3000?reset=true`
- Databaza rivevendoset automatikisht!

---

## 🗄️ METODA 3: RIVENDOSJE E SUPABASE DATABASE

### Hapi 1: Fshij Të Dhënat Ekzistuese

Hyr në **Supabase Dashboard** → **SQL Editor** dhe ekzekuto:

```sql
-- KUJDES! Kjo fshin të gjitha të dhënat!

-- Fshi të gjitha porosite
DELETE FROM service_orders;

-- Fshi të gjitha automjetet
DELETE FROM vehicles;

-- Fshi të gjithë klientët
DELETE FROM customers;

-- Reset sequence counters (optional)
ALTER SEQUENCE IF EXISTS customers_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS vehicles_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS service_orders_id_seq RESTART WITH 1;
```

### Hapi 2: Shto Të Dhëna të Reja

#### Opsioni A: Ri-ekzekuto Schema-n e Plotë

```sql
-- Kopjo të gjithë përmbajtjen nga supabase-schema.sql
-- Paste në SQL Editor
-- Kliko Run
```

#### Opsioni B: Shto Vetëm Të Dhënat që Dëshiron

```sql
-- Shembull: Shto klientë të rinj
INSERT INTO customers (name, phone, email, address) VALUES
  ('Kujtim Berisha', '044111222', 'kujtim@example.com', 'Prishtinë, Kosovë'),
  ('Luana Krasniqi', '045333444', 'luana@example.com', 'Gjilan, Kosovë'),
  ('Arben Morina', '049555666', 'arben@example.com', 'Ferizaj, Kosovë');

-- Shto automjete
INSERT INTO vehicles (customer_id, make, model, year, plate, color) VALUES
  (1, 'Mercedes', 'E-Class', 2022, '01-ABC-123', 'Zi'),
  (1, 'Audi', 'A4', 2021, '02-DEF-456', 'Bardhë'),
  (2, 'BMW', 'X5', 2023, '03-GHI-789', 'Gri');

-- Shto porosi (me shërbimet në JSONB)
INSERT INTO service_orders (
  vehicle_id, 
  customer_id, 
  status, 
  start_date, 
  end_date, 
  paid, 
  notes, 
  services
) VALUES (
  1,
  1,
  'Përfunduar',
  CURRENT_DATE,
  CURRENT_DATE,
  true,
  'Shërbim i plotë',
  '[
    {
      "serviceType": "Ndërrimi i Vajit",
      "laborPrice": 40,
      "parts": [
        {"name": "Vaj Sintetik", "qty": 1, "costPrice": 18, "sellPrice": 35}
      ]
    }
  ]'::jsonb
);
```

---

## 📝 KRIJIMI I TË DHËNAVE TË REJA NGA ZERO

### Template për Klientë të Rinj

```sql
INSERT INTO customers (name, phone, email, address) VALUES
  ('Emri Mbiemri', 'Telefoni', 'email@example.com', 'Adresa'),
  ('Klient 2', '044123456', 'klient2@mail.com', 'Prishtinë'),
  ('Klient 3', '045987654', 'klient3@mail.com', 'Gjilan');
```

### Template për Automjete

```sql
INSERT INTO vehicles (customer_id, make, model, year, plate, color) VALUES
  (1, 'Toyota', 'Corolla', 2020, 'XX-YYY-ZZZ', 'E kuqe'),
  (1, 'Honda', 'Civic', 2021, 'AA-BBB-CCC', 'Blu'),
  (2, 'VW', 'Golf', 2022, 'DD-EEE-FFF', 'Bardhë');
```

### Template për Porosi me Shërbime

```sql
INSERT INTO service_orders (
  vehicle_id, 
  customer_id, 
  status, 
  start_date, 
  paid, 
  notes, 
  services
) VALUES (
  1,  -- ID e automjetit
  1,  -- ID e klientit
  'Në Progres',
  CURRENT_DATE,
  false,
  'Shënime opsionale',
  '[
    {
      "serviceType": "Riparimi i Frenave",
      "laborPrice": 60,
      "parts": [
        {
          "name": "Pllaka Frenash",
          "qty": 2,
          "costPrice": 55,
          "sellPrice": 100
        },
        {
          "name": "Lëng Frenash",
          "qty": 1,
          "costPrice": 12,
          "sellPrice": 22
        }
      ]
    },
    {
      "serviceType": "Ndërrimi i Vajit",
      "laborPrice": 40,
      "parts": [
        {
          "name": "Vaj Motorri",
          "qty": 1,
          "costPrice": 18,
          "sellPrice": 35
        }
      ]
    }
  ]'::jsonb
);
```

---

## 🔐 BACKUP PARA RIVENDOSJES

### Metoda 1: Eksporto nga Supabase

1. **Supabase Dashboard** → **Database** → **Backups**
2. Kliko "**Download Backup**"
3. Ruaj fajllin për siguri

### Metoda 2: Eksporto me SQL

```sql
-- Eksporto klientët
COPY customers TO '/tmp/customers_backup.csv' CSV HEADER;

-- Eksporto automjetet
COPY vehicles TO '/tmp/vehicles_backup.csv' CSV HEADER;

-- Eksporto porosite
COPY service_orders TO '/tmp/orders_backup.csv' CSV HEADER;
```

### Metoda 3: Kopjo Databazën Lokale

Në aplikacion, shto këtë buton:

```javascript
const exportData = () => {
  const data = {
    customers,
    vehicles,
    orders,
    dailyLog,
    serviceTypes,
    exportDate: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json'
  });
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `garazh-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
};

// Shto këtë buton në Cilësimet:
<button className="btn btn-primary" onClick={exportData}>
  💾 Eksporto të Dhënat
</button>
```

---

## 📊 SHEMBUJ TË PLOTË

### Scenario 1: Fillimi nga Zero me 5 Klientë

```sql
-- Fshi gjithçka
DELETE FROM service_orders;
DELETE FROM vehicles;
DELETE FROM customers;

-- Shto 5 klientë të rinj
INSERT INTO customers (name, phone, email, address) VALUES
  ('Flamur Hoxha', '044111222', 'flamur@mail.com', 'Prishtinë'),
  ('Arjeta Mustafa', '045333444', 'arjeta@mail.com', 'Gjilan'),
  ('Driton Kelmendi', '049555666', 'driton@mail.com', 'Pejë'),
  ('Valdete Syla', '044777888', 'valdete@mail.com', 'Prizren'),
  ('Blerim Gashi', '045999000', 'blerim@mail.com', 'Ferizaj');

-- Shto automjete për secilin
INSERT INTO vehicles (customer_id, make, model, year, plate, color) VALUES
  (1, 'Mercedes', 'C-Class', 2021, '01-FLM-321', 'Zi'),
  (2, 'Audi', 'A3', 2020, '02-ARJ-654', 'Bardhë'),
  (3, 'BMW', '320d', 2022, '03-DRT-987', 'Blu'),
  (4, 'VW', 'Passat', 2019, '04-VLD-123', 'Gri'),
  (5, 'Toyota', 'RAV4', 2023, '05-BLR-456', 'E kuqe');
```

### Scenario 2: Import nga Excel/CSV

1. **Përgatit CSV File:**
```csv
name,phone,email,address
Kujtim Berisha,044111222,kujtim@mail.com,Prishtinë
Luana Krasniqi,045333444,luana@mail.com,Gjilan
```

2. **Import në Supabase:**
   - Supabase → Table Editor
   - Kliko "Insert" → "Import data from CSV"
   - Zgjidh fajllin
   - Map kolonat
   - Kliko "Import"

---

## 🚨 KONTROLLE PARA RIVENDOSJES

### Checklist:
- [ ] A kam backup të të dhënave?
- [ ] A jam i sigurt që dua të fshij gjithçka?
- [ ] A kam testuar në mjedis lokal më parë?
- [ ] A e di se si të rikthej të dhënat nëse gaboj?

### Komanda Sigurie:

```sql
-- Verifiko sa rekorde ke para se të fshish
SELECT 
  (SELECT COUNT(*) FROM customers) as customers_count,
  (SELECT COUNT(*) FROM vehicles) as vehicles_count,
  (SELECT COUNT(*) FROM service_orders) as orders_count;
```

---

## 💡 TIPS & TRICKS

### 1. Ruaj Template të Të Dhënave

Krijo fajll `my-data-template.sql`:
```sql
-- Të dhënat e mia standarde
INSERT INTO customers (name, phone, email, address) VALUES
  ('Klienti 1', '044111222', 'k1@mail.com', 'Adresa 1'),
  ('Klienti 2', '045333444', 'k2@mail.com', 'Adresa 2');
-- etj...
```

### 2. Automatizo Seed Data

Në `src/App.jsx`, shto:

```javascript
const loadCustomData = async () => {
  // Ngarko të dhëna nga API ose fajll
  const response = await fetch('/my-custom-data.json');
  const data = await response.json();
  setCustomers(data.customers);
  setVehicles(data.vehicles);
  // etj...
};
```

### 3. Krijo Funksion "Reset to Custom"

```javascript
const MY_CUSTOM_DATA = {
  customers: [
    { id: 1, name: "Klienti Im", phone: "044123456", ... }
  ],
  vehicles: [
    { id: 1, customerId: 1, make: "Toyota", ... }
  ],
  // etj...
};

const resetToCustom = () => {
  setCustomers(MY_CUSTOM_DATA.customers);
  setVehicles(MY_CUSTOM_DATA.vehicles);
  // etj...
};
```

---

## 🆘 TROUBLESHOOTING

### Problem: "Foreign key constraint violation"
**Zgjidhja:** Fshi sipas radhës:
1. service_orders (së pari)
2. vehicles (së dyti)
3. customers (së fundmi)

### Problem: "Cannot delete or update parent row"
**Zgjidhja:** Disa automjete kanë porosi. Fshi porosite më parë.

### Problem: "ID sequence out of sync"
**Zgjidhja:**
```sql
SELECT setval('customers_id_seq', (SELECT MAX(id) FROM customers));
SELECT setval('vehicles_id_seq', (SELECT MAX(id) FROM vehicles));
SELECT setval('service_orders_id_seq', (SELECT MAX(id) FROM service_orders));
```

---

## 📞 MBËSHTETJE

Nëse ke probleme:
1. Shiko këtë dokumentacion
2. Kontrollo Supabase Logs
3. Hap browser console (F12)
4. Verifiko connection në Supabase

---

## ✅ QUICK REFERENCE

### Rivendosje e Shpejtë (React State)
```javascript
localStorage.clear();
location.reload();
```

### Rivendosje e Shpejtë (Supabase)
```sql
DELETE FROM service_orders;
DELETE FROM vehicles;
DELETE FROM customers;
```

### Import Template i Ri
```sql
-- Kopjo schema nga supabase-schema.sql
-- Ndrysho të dhënat sipas nevojës
-- Run në SQL Editor
```

---

**Përgatitur:** 4 Shkurt 2026  
**Për:** AUTO BASHKIMI-L  
**Versioni:** 1.0
