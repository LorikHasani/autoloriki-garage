-- ═══════════════════════════════════════════════════════════════════════════
-- FIX RLS POLICIES - Allow Full Access for anon Users
-- ═══════════════════════════════════════════════════════════════════════════
-- Run this in Supabase SQL Editor to fix the "Unauthorized" and "row-level security" errors

-- ───────────────────────────────────────────────────────────────────────────
-- CUSTOMERS TABLE POLICIES
-- ───────────────────────────────────────────────────────────────────────────

-- Drop existing policies first (if any)
DROP POLICY IF EXISTS "Allow anon read customers" ON customers;
DROP POLICY IF EXISTS "Enable all for authenticated users" ON customers;

-- Create new policies for anon users (full access)
CREATE POLICY "anon_select_customers"
ON customers
FOR SELECT
TO anon
USING (true);

CREATE POLICY "anon_insert_customers"
ON customers
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "anon_update_customers"
ON customers
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "anon_delete_customers"
ON customers
FOR DELETE
TO anon
USING (true);

-- ───────────────────────────────────────────────────────────────────────────
-- VEHICLES TABLE POLICIES
-- ───────────────────────────────────────────────────────────────────────────

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all for authenticated users" ON vehicles;

-- Create new policies for anon users
CREATE POLICY "anon_select_vehicles"
ON vehicles
FOR SELECT
TO anon
USING (true);

CREATE POLICY "anon_insert_vehicles"
ON vehicles
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "anon_update_vehicles"
ON vehicles
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "anon_delete_vehicles"
ON vehicles
FOR DELETE
TO anon
USING (true);

-- ───────────────────────────────────────────────────────────────────────────
-- SERVICE_ORDERS TABLE POLICIES
-- ───────────────────────────────────────────────────────────────────────────

-- Drop existing policies
DROP POLICY IF EXISTS "Enable all for authenticated users" ON service_orders;

-- Create new policies for anon users
CREATE POLICY "anon_select_orders"
ON service_orders
FOR SELECT
TO anon
USING (true);

CREATE POLICY "anon_insert_orders"
ON service_orders
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "anon_update_orders"
ON service_orders
FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

CREATE POLICY "anon_delete_orders"
ON service_orders
FOR DELETE
TO anon
USING (true);

-- ───────────────────────────────────────────────────────────────────────────
-- VERIFY POLICIES
-- ───────────────────────────────────────────────────────────────────────────

-- Check that all policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('customers', 'vehicles', 'service_orders')
ORDER BY tablename, cmd;

-- Success message
SELECT '✅ RLS Policies created successfully!' as status;
SELECT '✅ Your app can now INSERT, UPDATE, and DELETE data!' as message;
