-- ═══════════════════════════════════════════════════════════════════════════
-- SUPABASE DATABASE RESET - QUICK REFERENCE SQL
-- ═══════════════════════════════════════════════════════════════════════════
-- Copy and paste these in Supabase Dashboard → SQL Editor
-- Use with CAUTION - these commands DELETE data!

-- ───────────────────────────────────────────────────────────────────────────
-- OPTION 1: COMPLETE RESET (Delete Everything)
-- ───────────────────────────────────────────────────────────────────────────

-- ⚠️ WARNING: This deletes ALL data!
-- Make sure you have a backup!

-- Delete in correct order (respect foreign keys)
DELETE FROM service_orders;  -- First: orders reference vehicles/customers
DELETE FROM vehicles;        -- Second: vehicles reference customers  
DELETE FROM customers;       -- Last: customers have no dependencies

-- Success message
SELECT 'Database cleared successfully!' as status;


-- ───────────────────────────────────────────────────────────────────────────
-- OPTION 2: RESET WITH FRESH DATA (Delete + Insert)
-- ───────────────────────────────────────────────────────────────────────────

-- Delete all data
DELETE FROM service_orders;
DELETE FROM vehicles;
DELETE FROM customers;

-- Insert new Albanian customers
INSERT INTO customers (name, phone, email, address) VALUES
  ('Agron Kastrati', '044111222', 'agron@example.com', 'Prishtinë, Kosovë'),
  ('Besarta Hoxha', '045333444', 'besarta@example.com', 'Gjilan, Kosovë'),
  ('Driton Morina', '049555666', 'driton@example.com', 'Pejë, Kosovë'),
  ('Eljesa Krasniqi', '044777888', 'eljesa@example.com', 'Prizren, Kosovë'),
  ('Fitore Berisha', '045999000', 'fitore@example.com', 'Ferizaj, Kosovë');

-- Insert vehicles for each customer
INSERT INTO vehicles (customer_id, make, model, year, plate, color)
SELECT 
  c.id,
  CASE 
    WHEN c.name = 'Agron Kastrati' THEN 'Mercedes'
    WHEN c.name = 'Besarta Hoxha' THEN 'Audi'
    WHEN c.name = 'Driton Morina' THEN 'BMW'
    WHEN c.name = 'Eljesa Krasniqi' THEN 'VW'
    WHEN c.name = 'Fitore Berisha' THEN 'Toyota'
  END,
  CASE 
    WHEN c.name = 'Agron Kastrati' THEN 'E-Class'
    WHEN c.name = 'Besarta Hoxha' THEN 'A4'
    WHEN c.name = 'Driton Morina' THEN 'X5'
    WHEN c.name = 'Eljesa Krasniqi' THEN 'Passat'
    WHEN c.name = 'Fitore Berisha' THEN 'RAV4'
  END,
  2022,
  CASE 
    WHEN c.name = 'Agron Kastrati' THEN '01-AGR-123'
    WHEN c.name = 'Besarta Hoxha' THEN '02-BES-456'
    WHEN c.name = 'Driton Morina' THEN '03-DRT-789'
    WHEN c.name = 'Eljesa Krasniqi' THEN '04-ELJ-012'
    WHEN c.name = 'Fitore Berisha' THEN '05-FIT-345'
  END,
  CASE 
    WHEN c.name = 'Agron Kastrati' THEN 'Zi'
    WHEN c.name = 'Besarta Hoxha' THEN 'Bardhë'
    WHEN c.name = 'Driton Morina' THEN 'Blu'
    WHEN c.name = 'Eljesa Krasniqi' THEN 'Gri'
    WHEN c.name = 'Fitore Berisha' THEN 'E kuqe'
  END
FROM customers c;

-- Insert sample orders with Albanian service types
INSERT INTO service_orders (
  vehicle_id,
  customer_id,
  status,
  start_date,
  end_date,
  paid,
  notes,
  services
)
SELECT 
  v.id,
  v.customer_id,
  'Përfunduar',
  CURRENT_DATE - INTERVAL '7 days',
  CURRENT_DATE - INTERVAL '7 days',
  true,
  'Servisim i rregullt',
  '[
    {
      "serviceType": "Ndërrimi i Vajit",
      "laborPrice": 40,
      "parts": [
        {"name": "Vaj Sintetik 5W-30", "qty": 1, "costPrice": 18, "sellPrice": 35},
        {"name": "Filtër Vaji", "qty": 1, "costPrice": 8, "sellPrice": 14}
      ]
    }
  ]'::jsonb
FROM vehicles v
LIMIT 3;

-- Success message with counts
SELECT 
  (SELECT COUNT(*) FROM customers) as customers_added,
  (SELECT COUNT(*) FROM vehicles) as vehicles_added,
  (SELECT COUNT(*) FROM service_orders) as orders_added;


-- ───────────────────────────────────────────────────────────────────────────
-- OPTION 3: BACKUP BEFORE RESET
-- ───────────────────────────────────────────────────────────────────────────

-- Create temporary backup tables
CREATE TABLE customers_backup AS SELECT * FROM customers;
CREATE TABLE vehicles_backup AS SELECT * FROM vehicles;
CREATE TABLE service_orders_backup AS SELECT * FROM service_orders;

-- Now you can safely delete and reset
DELETE FROM service_orders;
DELETE FROM vehicles;
DELETE FROM customers;

-- To restore from backup if needed:
-- INSERT INTO customers SELECT * FROM customers_backup;
-- INSERT INTO vehicles SELECT * FROM vehicles_backup;
-- INSERT INTO service_orders SELECT * FROM service_orders_backup;

-- Drop backup tables when done:
-- DROP TABLE customers_backup;
-- DROP TABLE vehicles_backup;
-- DROP TABLE service_orders_backup;


-- ───────────────────────────────────────────────────────────────────────────
-- OPTION 4: VERIFY DATA BEFORE DELETING
-- ───────────────────────────────────────────────────────────────────────────

-- Check current record counts
SELECT 
  'customers' as table_name,
  COUNT(*) as record_count
FROM customers
UNION ALL
SELECT 'vehicles', COUNT(*) FROM vehicles
UNION ALL
SELECT 'service_orders', COUNT(*) FROM service_orders;

-- View sample data before deleting
SELECT 'CUSTOMERS:' as section;
SELECT id, name, phone FROM customers LIMIT 5;

SELECT 'VEHICLES:' as section;
SELECT id, make, model, plate FROM vehicles LIMIT 5;

SELECT 'ORDERS:' as section;
SELECT id, status, start_date FROM service_orders LIMIT 5;


-- ───────────────────────────────────────────────────────────────────────────
-- OPTION 5: DELETE SELECTIVELY (Keep Some Data)
-- ───────────────────────────────────────────────────────────────────────────

-- Example: Delete only old completed orders (keep last 30 days)
DELETE FROM service_orders 
WHERE status = 'Përfunduar' 
  AND end_date < CURRENT_DATE - INTERVAL '30 days';

-- Example: Delete test customers only
DELETE FROM service_orders WHERE customer_id IN (
  SELECT id FROM customers WHERE email LIKE '%test%'
);
DELETE FROM vehicles WHERE customer_id IN (
  SELECT id FROM customers WHERE email LIKE '%test%'
);
DELETE FROM customers WHERE email LIKE '%test%';


-- ───────────────────────────────────────────────────────────────────────────
-- OPTION 6: RESET ID SEQUENCES (Optional)
-- ───────────────────────────────────────────────────────────────────────────

-- Reset auto-increment IDs to start from 1 again
-- Only use if you deleted ALL data

-- For UUID-based IDs (current setup), this is not needed
-- For integer IDs, use:
-- ALTER SEQUENCE customers_id_seq RESTART WITH 1;
-- ALTER SEQUENCE vehicles_id_seq RESTART WITH 1;
-- ALTER SEQUENCE service_orders_id_seq RESTART WITH 1;


-- ───────────────────────────────────────────────────────────────────────────
-- OPTION 7: IMPORT FROM CSV
-- ───────────────────────────────────────────────────────────────────────────

-- If you have CSV files to import:
-- 1. Go to Supabase Dashboard → Table Editor
-- 2. Click on table (customers, vehicles, etc.)
-- 3. Click "Insert" → "Import data from CSV"
-- 4. Upload your CSV file
-- 5. Map columns
-- 6. Click "Import"


-- ───────────────────────────────────────────────────────────────────────────
-- OPTION 8: EXPORT DATA (Before Reset)
-- ───────────────────────────────────────────────────────────────────────────

-- Export to JSON (copy results and save)
SELECT json_agg(row_to_json(customers)) FROM customers;
SELECT json_agg(row_to_json(vehicles)) FROM vehicles;
SELECT json_agg(row_to_json(service_orders)) FROM service_orders;


-- ───────────────────────────────────────────────────────────────────────────
-- QUICK TEMPLATES FOR COMMON DATA
-- ───────────────────────────────────────────────────────────────────────────

-- Template: Add a complete customer with vehicle and order
WITH new_customer AS (
  INSERT INTO customers (name, phone, email, address)
  VALUES ('Klienti i Ri', '044123456', 'klient@mail.com', 'Prishtinë')
  RETURNING id
),
new_vehicle AS (
  INSERT INTO vehicles (customer_id, make, model, year, plate, color)
  SELECT id, 'Toyota', 'Corolla', 2023, 'XX-YYY-ZZZ', 'Bardhë'
  FROM new_customer
  RETURNING id, customer_id
)
INSERT INTO service_orders (vehicle_id, customer_id, status, start_date, paid, services)
SELECT 
  nv.id,
  nv.customer_id,
  'Në Pritje',
  CURRENT_DATE,
  false,
  '[{"serviceType":"Ndërrimi i Vajit","laborPrice":40,"parts":[]}]'::jsonb
FROM new_vehicle nv;


-- Template: Bulk insert test data
INSERT INTO customers (name, phone, email, address)
SELECT 
  'Test Klient ' || i,
  '044' || LPAD(i::text, 6, '0'),
  'test' || i || '@example.com',
  'Prishtinë'
FROM generate_series(1, 10) i;


-- ═══════════════════════════════════════════════════════════════════════════
-- SAFETY CHECKLIST BEFORE RUNNING
-- ═══════════════════════════════════════════════════════════════════════════

-- [ ] I have a backup of my data
-- [ ] I am in the correct database (not production if testing)
-- [ ] I understand this will DELETE data
-- [ ] I have tested the query on a small dataset first
-- [ ] I know how to restore data if needed


-- ═══════════════════════════════════════════════════════════════════════════
-- TROUBLESHOOTING
-- ═══════════════════════════════════════════════════════════════════════════

-- Error: "Foreign key constraint violation"
-- Solution: Delete in correct order (orders → vehicles → customers)

-- Error: "Permission denied"  
-- Solution: Check RLS policies or use service role key

-- Error: "Column does not exist"
-- Solution: Verify table structure matches schema

-- Error: "Invalid JSON"
-- Solution: Use single quotes for JSONB, escape special characters


-- ═══════════════════════════════════════════════════════════════════════════
-- QUICK REFERENCE COMMANDS
-- ═══════════════════════════════════════════════════════════════════════════

-- Delete all data:
-- DELETE FROM service_orders; DELETE FROM vehicles; DELETE FROM customers;

-- Count records:
-- SELECT COUNT(*) FROM customers;

-- View last 5 records:
-- SELECT * FROM customers ORDER BY created_at DESC LIMIT 5;

-- Backup to temp table:
-- CREATE TABLE customers_backup AS SELECT * FROM customers;

-- Restore from backup:
-- INSERT INTO customers SELECT * FROM customers_backup;

-- ═══════════════════════════════════════════════════════════════════════════
