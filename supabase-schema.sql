-- AutoFix Garage Management System - Supabase Schema
-- Run this in your Supabase SQL Editor to set up the database

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
  status TEXT NOT NULL DEFAULT 'Pending',
  start_date DATE NOT NULL,
  end_date DATE,
  paid BOOLEAN DEFAULT FALSE,
  notes TEXT,
  services JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_status CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Cancelled'))
);

-- Create indexes for better performance
CREATE INDEX idx_vehicles_customer ON vehicles(customer_id);
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_orders_customer ON service_orders(customer_id);
CREATE INDEX idx_orders_vehicle ON service_orders(vehicle_id);
CREATE INDEX idx_orders_status ON service_orders(status);
CREATE INDEX idx_orders_dates ON service_orders(start_date, end_date);
CREATE INDEX idx_orders_paid ON service_orders(paid);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_service_orders_updated_at BEFORE UPDATE ON service_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_orders ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (you can customize these based on your auth needs)
-- For now, allowing all authenticated users full access - adjust as needed

CREATE POLICY "Enable all for authenticated users" ON customers
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON vehicles
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON service_orders
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert sample data
INSERT INTO customers (id, name, phone, email, address) VALUES
  ('00000000-0000-0000-0000-000000000001', 'James Mitchell', '0612345678', 'james.m@mail.com', 'Baker St 12'),
  ('00000000-0000-0000-0000-000000000002', 'Sarah Chen', '0698765432', 'sarah.c@mail.com', 'Pine Ave 45'),
  ('00000000-0000-0000-0000-000000000003', 'David Kowalski', '0623456789', 'david.k@mail.com', 'Oak Lane 7');

INSERT INTO vehicles (id, customer_id, make, model, year, plate, vin, color) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001', 'Toyota', 'Camry', 2020, 'AB-12-CD', '1HGBH41JXMN109186', 'Silver'),
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000002', 'BMW', '320i', 2019, 'EF-34-GH', 'WBADT43452G123456', 'Black'),
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000003', 'Volkswagen', 'Golf', 2021, 'IJ-56-KL', 'WVWZZZ1KZBW123456', 'White'),
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000001', 'Honda', 'Civic', 2018, 'MN-78-OP', '2HGFC2F53JH123456', 'Blue');

INSERT INTO service_orders (id, vehicle_id, customer_id, status, start_date, end_date, paid, notes, services) VALUES
  (
    '00000000-0000-0000-0002-000000000001',
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Completed',
    '2026-01-15',
    '2026-01-15',
    true,
    'Routine',
    '[{"serviceType":"Oil Change","laborPrice":40,"parts":[{"name":"Synthetic Oil 5W-30","qty":1,"costPrice":18,"sellPrice":35},{"name":"Oil Filter","qty":1,"costPrice":8,"sellPrice":14}]}]'::jsonb
  ),
  (
    '00000000-0000-0000-0002-000000000004',
    '00000000-0000-0000-0001-000000000004',
    '00000000-0000-0000-0000-000000000001',
    'Completed',
    '2026-01-18',
    '2026-01-20',
    true,
    'Major service + inspection',
    '[{"serviceType":"Engine Overhaul","laborPrice":300,"parts":[{"name":"Timing Belt","qty":1,"costPrice":45,"sellPrice":90},{"name":"Water Pump","qty":1,"costPrice":60,"sellPrice":110},{"name":"Gasket Set","qty":1,"costPrice":35,"sellPrice":65}]},{"serviceType":"General Inspection","laborPrice":50,"parts":[{"name":"Air Filter","qty":1,"costPrice":10,"sellPrice":22}]}]'::jsonb
  ),
  (
    '00000000-0000-0000-0002-000000000005',
    '00000000-0000-0000-0001-000000000001',
    '00000000-0000-0000-0000-000000000001',
    'Completed',
    '2026-01-28',
    '2026-01-28',
    false,
    'Annual check',
    '[{"serviceType":"General Inspection","laborPrice":55,"parts":[{"name":"Air Filter","qty":1,"costPrice":10,"sellPrice":20}]}]'::jsonb
  ),
  (
    '00000000-0000-0000-0002-000000000006',
    '00000000-0000-0000-0001-000000000003',
    '00000000-0000-0000-0000-000000000003',
    'Completed',
    '2026-01-28',
    '2026-01-28',
    true,
    'Crack fixed',
    '[{"serviceType":"Windshield Repair","laborPrice":45,"parts":[{"name":"Repair Kit","qty":1,"costPrice":15,"sellPrice":30}]}]'::jsonb
  );

-- Create a view for easier querying of complete order information
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

COMMENT ON TABLE customers IS 'Stores customer contact information';
COMMENT ON TABLE vehicles IS 'Stores vehicle information linked to customers';
COMMENT ON TABLE service_orders IS 'Stores service orders with services stored as JSONB array';
COMMENT ON VIEW order_details IS 'Convenient view combining order, customer and vehicle information';
