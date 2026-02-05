-- ═══════════════════════════════════════════════════════════════════════════
-- DROP AND RECREATE DATABASE - SUPABASE
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this in Supabase Dashboard → SQL Editor
-- This will completely delete and recreate all tables with fresh data

-- ───────────────────────────────────────────────────────────────────────────
-- STEP 1: DROP EVERYTHING (Delete all tables and dependencies)
-- ───────────────────────────────────────────────────────────────────────────

-- Drop tables in reverse order (respect foreign key constraints)
DROP TABLE IF EXISTS service_orders CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Drop the view if it exists
DROP VIEW IF EXISTS order_details CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Success message
SELECT 'All tables dropped successfully!' as status;


-- ───────────────────────────────────────────────────────────────────────────
-- STEP 2: RECREATE TABLES (Fresh schema)
-- ───────────────────────────────────────────────────────────────────────────

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table
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

-- Create service_orders table
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

-- Create indexes
CREATE INDEX idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_orders_customer ON service_orders(customer_id);
CREATE INDEX idx_orders_vehicle ON service_orders(vehicle_id);
CREATE INDEX idx_orders_status ON service_orders(status);
CREATE INDEX idx_orders_dates ON service_orders(start_date, end_date);
CREATE INDEX idx_orders_paid ON service_orders(paid);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON service_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable all for authenticated users" ON customers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON vehicles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON service_orders
  FOR ALL USING (auth.role() = 'authenticated');


-- ───────────────────────────────────────────────────────────────────────────
-- STEP 3: INSERT FRESH DATA (Albanian sample data)
-- ───────────────────────────────────────────────────────────────────────────

-- Insert customers
INSERT INTO customers (id, name, phone, email, address) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Agron Kastrati', '044111222', 'agron@mail.com', 'Prishtinë, Kosovë'),
  ('00000000-0000-0000-0000-000000000002', 'Besarta Hoxha', '045333444', 'besarta@mail.com', 'Gjilan, Kosovë'),
  ('00000000-0000-0000-0000-000000000003', 'Driton Morina', '049555666', 'driton@mail.com', 'Pejë, Kosovë');

-- Insert vehicles
INSERT INTO vehicles (id, customer_id, make, model, year, plate, vin, color) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Mercedes', 'E-Class', 2022, '01-AGR-321', 'WDD2120081A123456', 'Zi'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000002', 'Audi', 'A4', 2021, '02-BES-654', 'WAUZZZ8K7DA123456', 'Bardhë'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000003', 'BMW', 'X5', 2023, '03-DRT-987', 'WBAFR9C55DD123456', 'Blu'),
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'Toyota', 'RAV4', 2020, '01-AGR-456', '2T3P1RFV8LC123456', 'Gri');

-- Insert service orders
INSERT INTO service_orders (id, vehicle_id, customer_id, status, start_date, end_date, paid, notes, services) VALUES
  (
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Përfunduar',
    '2026-01-15',
    '2026-01-15',
    true,
    'Servisim rutinë',
    '[{"serviceType":"Ndërrimi i Vajit","laborPrice":40,"parts":[{"name":"Vaj Sintetik 5W-30","qty":1,"costPrice":18,"sellPrice":35},{"name":"Filtër Vaji","qty":1,"costPrice":8,"sellPrice":14}]}]'::jsonb
  ),
  (
    '00000000-0000-0000-0002-000000000002',
    '00000000-0000-0000-0001-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Përfunduar',
    '2026-01-18',
    '2026-01-20',
    true,
    'Servisim i madh + inspektim',
    '[{"serviceType":"Riparimi i Motorit","laborPrice":300,"parts":[{"name":"Rrip Kohe","qty":1,"costPrice":45,"sellPrice":90},{"name":"Pompë Uji","qty":1,"costPrice":60,"sellPrice":110},{"name":"Set Guarnicionesh","qty":1,"costPrice":35,"sellPrice":65}]},{"serviceType":"Inspektimi i Përgjithshëm","laborPrice":50,"parts":[{"name":"Filtër Ajri","qty":1,"costPrice":10,"sellPrice":22}]}]'::jsonb
  ),
  (
    '00000000-0000-0000-0002-000000000003',
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Përfunduar',
    '2026-01-28',
    '2026-01-28',
    false,
    'Kontroll vjetor',
    '[{"serviceType":"Inspektimi i Përgjithshëm","laborPrice":55,"parts":[{"name":"Filtër Ajri","qty":1,"costPrice":10,"sellPrice":20}]}]'::jsonb
  ),
  (
    '00000000-0000-0000-0002-000000000004',
    '00000000-0000-0000-0001-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Përfunduar',
    '2026-01-28',
    '2026-01-28',
    true,
    'Çarje e riparuar',
    '[{"serviceType":"Riparimi i Xhamit","laborPrice":45,"parts":[{"name":"Kit Riparimi","qty":1,"costPrice":15,"sellPrice":30}]}]'::jsonb
  );

-- Create helpful view
CREATE OR REPLACE VIEW order_details AS
SELECT 
  so.id,
  so.status,
  so.start_date,
  so.end_date,
  so.paid,
  so.notes,
  so.services,
  c.id as customer_id,
  c.name as customer_name,
  c.phone as customer_phone,
  c.email as customer_email,
  v.id as vehicle_id,
  v.make as vehicle_make,
  v.model as vehicle_model,
  v.plate as vehicle_plate,
  v.year as vehicle_year,
  v.color as vehicle_color,
  so.created_at,
  so.updated_at
FROM service_orders so
JOIN customers c ON so.customer_id = c.id
JOIN vehicles v ON so.vehicle_id = v.id;

-- Final success message
SELECT 
  'Database recreated successfully!' as status,
  (SELECT COUNT(*) FROM customers) as customers_count,
  (SELECT COUNT(*) FROM vehicles) as vehicles_count,
  (SELECT COUNT(*) FROM service_orders) as orders_count;
