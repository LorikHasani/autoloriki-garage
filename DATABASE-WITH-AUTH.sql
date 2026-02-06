-- ═══════════════════════════════════════════════════════════════════════════
-- FRESH START WITH SUPABASE AUTH - AUTO BASHKIMI-L
-- ═══════════════════════════════════════════════════════════════════════════
-- Much simpler: Use authenticated users instead of anon access
-- Run this ONCE in Supabase SQL Editor

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 1: DROP EVERYTHING (Clean Slate)
-- ───────────────────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "anon_select_customers" ON customers;
DROP POLICY IF EXISTS "anon_insert_customers" ON customers;
DROP POLICY IF EXISTS "anon_update_customers" ON customers;
DROP POLICY IF EXISTS "anon_delete_customers" ON customers;
DROP POLICY IF EXISTS "Allow anon read customers" ON customers;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON customers;
DROP POLICY IF EXISTS "authenticated_all_customers" ON customers;

DROP POLICY IF EXISTS "anon_select_vehicles" ON vehicles;
DROP POLICY IF EXISTS "anon_insert_vehicles" ON vehicles;
DROP POLICY IF EXISTS "anon_update_vehicles" ON vehicles;
DROP POLICY IF EXISTS "anon_delete_vehicles" ON vehicles;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON vehicles;
DROP POLICY IF EXISTS "authenticated_all_vehicles" ON vehicles;

DROP POLICY IF EXISTS "anon_select_orders" ON service_orders;
DROP POLICY IF EXISTS "anon_insert_orders" ON service_orders;
DROP POLICY IF EXISTS "anon_update_orders" ON service_orders;
DROP POLICY IF EXISTS "anon_delete_orders" ON service_orders;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON service_orders;
DROP POLICY IF EXISTS "authenticated_all_orders" ON service_orders;

DROP VIEW IF EXISTS order_details CASCADE;
DROP TABLE IF EXISTS service_orders CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 2: CREATE TABLES
-- ───────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  plate TEXT NOT NULL,
  vin TEXT,
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE service_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Në Pritje',
  start_date DATE NOT NULL,
  end_date DATE,
  paid BOOLEAN DEFAULT FALSE,
  notes TEXT,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('Në Pritje', 'Në Progres', 'Përfunduar', 'Anuluar'))
);

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 3: CREATE INDEXES
-- ───────────────────────────────────────────────────────────────────────────

CREATE INDEX idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_orders_customer ON service_orders(customer_id);
CREATE INDEX idx_orders_vehicle ON service_orders(vehicle_id);
CREATE INDEX idx_orders_status ON service_orders(status);
CREATE INDEX idx_orders_dates ON service_orders(start_date, end_date);
CREATE INDEX idx_orders_paid ON service_orders(paid);

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 4: CREATE TRIGGERS
-- ───────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON service_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 5: ENABLE RLS & CREATE SIMPLE POLICIES (Only 3 policies total!)
-- ───────────────────────────────────────────────────────────────────────────

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;

-- ONE POLICY PER TABLE - Full access for authenticated users
CREATE POLICY "authenticated_all_customers" 
  ON customers 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "authenticated_all_vehicles" 
  ON vehicles 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "authenticated_all_orders" 
  ON service_orders 
  FOR ALL 
  TO authenticated 
  USING (true) 
  WITH CHECK (true);

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 6: INSERT SAMPLE DATA
-- ───────────────────────────────────────────────────────────────────────────

INSERT INTO customers (name, phone, email, address) VALUES
  ('Agron Kastrati', '044111222', 'agron@mail.com', 'Prishtinë, Kosovë'),
  ('Besarta Hoxha', '045333444', 'besarta@mail.com', 'Gjilan, Kosovë'),
  ('Driton Morina', '049555666', 'driton@mail.com', 'Pejë, Kosovë');

INSERT INTO vehicles (customer_id, make, model, year, plate, vin, color)
SELECT 
  c.id,
  CASE 
    WHEN c.name = 'Agron Kastrati' THEN 'Mercedes'
    WHEN c.name = 'Besarta Hoxha' THEN 'Audi'
    WHEN c.name = 'Driton Morina' THEN 'BMW'
  END,
  CASE 
    WHEN c.name = 'Agron Kastrati' THEN 'E-Class'
    WHEN c.name = 'Besarta Hoxha' THEN 'A4'
    WHEN c.name = 'Driton Morina' THEN 'X5'
  END,
  CASE 
    WHEN c.name = 'Agron Kastrati' THEN 2022
    WHEN c.name = 'Besarta Hoxha' THEN 2021
    WHEN c.name = 'Driton Morina' THEN 2023
  END,
  CASE 
    WHEN c.name = 'Agron Kastrati' THEN '01-AGR-321'
    WHEN c.name = 'Besarta Hoxha' THEN '02-BES-654'
    WHEN c.name = 'Driton Morina' THEN '03-DRT-987'
  END,
  CASE 
    WHEN c.name = 'Agron Kastrati' THEN 'WDD2120081A123456'
    WHEN c.name = 'Besarta Hoxha' THEN 'WAUZZZ8K7DA123456'
    WHEN c.name = 'Driton Morina' THEN 'WBAFR9C55DD123456'
  END,
  CASE 
    WHEN c.name = 'Agron Kastrati' THEN 'Zi'
    WHEN c.name = 'Besarta Hoxha' THEN 'Bardhë'
    WHEN c.name = 'Driton Morina' THEN 'Blu'
  END
FROM customers c;

INSERT INTO service_orders (vehicle_id, customer_id, status, start_date, end_date, paid, notes, services)
SELECT 
  v.id,
  v.customer_id,
  'Përfunduar',
  CURRENT_DATE - INTERVAL '7 days',
  CURRENT_DATE - INTERVAL '7 days',
  true,
  'Servisim rutinë',
  '[{"serviceType":"Ndërrimi i Vajit","laborPrice":40,"parts":[{"name":"Vaj Sintetik 5W-30","qty":1,"costPrice":18,"sellPrice":35},{"name":"Filtër Vaji","qty":1,"costPrice":8,"sellPrice":14}]}]'::jsonb
FROM vehicles v
WHERE v.plate = '01-AGR-321';

INSERT INTO service_orders (vehicle_id, customer_id, status, start_date, paid, notes, services)
SELECT 
  v.id,
  v.customer_id,
  'Në Pritje',
  CURRENT_DATE,
  false,
  'Kontroll vjetor',
  '[{"serviceType":"Inspektimi i Përgjithshëm","laborPrice":55,"parts":[{"name":"Filtër Ajri","qty":1,"costPrice":10,"sellPrice":20}]}]'::jsonb
FROM vehicles v
WHERE v.plate = '02-BES-654';

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 7: VERIFY
-- ───────────────────────────────────────────────────────────────────────────

SELECT '🎉 DATABASE CREATED!' as status;
SELECT '✅ RLS Policies: Only 3 policies (one per table)' as policies;
SELECT '✅ Sample Data: 3 customers, 3 vehicles, 2 orders' as data;
SELECT '✅ Next Step: Create user in Supabase Auth' as next_step;

-- ───────────────────────────────────────────────────────────────────────────
-- NEXT: CREATE AUTH USER IN SUPABASE DASHBOARD
-- ───────────────────────────────────────────────────────────────────────────
-- Go to: Authentication → Users → Add User
-- Email: admin@autobashkimi.com
-- Password: (create secure password)
-- Confirm email: YES (toggle on)
-- ───────────────────────────────────────────────────────────────────────────
