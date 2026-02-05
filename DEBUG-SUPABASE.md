# 🔍 DEBUG SUPABASE CONNECTION

## Quick Test in Browser Console

Open your site, press **F12** to open console, then paste this:

```javascript
// Test Supabase connection
(async () => {
  console.log('🔍 Testing Supabase connection...');
  
  // Check environment variables
  console.log('Environment check:');
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL || '❌ NOT SET');
  console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET');
  
  try {
    // Try to import supabase
    const { supabase } = await import('../supabaseClient.js');
    console.log('✅ Supabase client imported');
    
    // Test connection by counting customers
    const { data, error, count } = await supabase
      .from('customers')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('❌ Supabase error:', error);
      alert(`Database error: ${error.message}\n\nCode: ${error.code}`);
    } else {
      console.log('✅ Connection successful!');
      console.log(`Found ${data.length} customers in database`);
      console.log('Sample data:', data[0]);
      alert(`✅ SUCCESS!\n\nConnected to Supabase\nCustomers: ${data.length}\nVehicles table exists: checking...`);
    }
  } catch (err) {
    console.error('❌ Connection failed:', err);
    alert(`Failed to connect:\n${err.message}`);
  }
})();
```

---

## Common Errors and Fixes

### Error: "Failed to fetch"
**Cause:** Network blocked or wrong URL  
**Fix:** 
1. Check VITE_SUPABASE_URL in Vercel environment variables
2. Make sure it's exactly: `https://xxxxx.supabase.co`
3. No trailing slash `/`

### Error: "Invalid API key"
**Cause:** Wrong or missing anon key  
**Fix:**
1. Go to Supabase → Settings → API
2. Copy the **anon public** key (the long one)
3. Add to Vercel: `VITE_SUPABASE_ANON_KEY`

### Error: "relation does not exist"
**Cause:** Tables not created in Supabase  
**Fix:**
1. Go to Supabase → SQL Editor
2. Run `DROP-AND-RECREATE.sql` file
3. Wait for "Database recreated successfully!"

### Error: "CORS policy"
**Cause:** Supabase needs to allow your domain  
**Fix:**
1. Go to Supabase → Settings → API
2. Add your Vercel URL to allowed origins
3. Usually auto-configured, but check

### Error: "No schema defined"
**Cause:** RLS policies blocking access  
**Fix:**
1. Check Supabase → Authentication → Policies
2. Tables should have: "Enable read access for anon"
3. Our SQL file should set this automatically

---

## Manual Database Check

1. **Go to Supabase Dashboard**
2. **Click "Table Editor"**
3. **Check tables exist:**
   - ✅ customers
   - ✅ vehicles
   - ✅ service_orders
4. **Click on "customers" table**
5. **Should see 3 sample rows:**
   - Agron Kastrati
   - Besarta Hoxha
   - Driton Morina

If you DON'T see these:
- You need to run `DROP-AND-RECREATE.sql` in SQL Editor

---

## Test Environment Variables in Vercel

1. **Go to Vercel Dashboard**
2. **Click your project**
3. **Settings → Environment Variables**
4. **Should see:**
   - `VITE_SUPABASE_URL` = https://xxxxx.supabase.co
   - `VITE_SUPABASE_ANON_KEY` = eyJhbG... (long string)

5. **Check boxes are ticked:**
   - ✅ Production
   - ✅ Preview
   - ✅ Development

If not all ticked → Edit and tick all → Save → Redeploy

---

## Full Diagnostic Script

Copy this entire script into browser console:

```javascript
(async () => {
  console.clear();
  console.log('═══════════════════════════════════════');
  console.log('🔍 FULL DIAGNOSTIC TEST');
  console.log('═══════════════════════════════════════\n');
  
  // 1. Check environment
  console.log('1️⃣ Environment Variables:');
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  console.log('URL:', url || '❌ NOT SET');
  console.log('Key:', key ? `✅ SET (${key.substring(0, 20)}...)` : '❌ NOT SET');
  
  if (!url || !key) {
    console.error('\n❌ PROBLEM: Environment variables not set!');
    console.log('\nFIX: Add these to Vercel:');
    console.log('- VITE_SUPABASE_URL');
    console.log('- VITE_SUPABASE_ANON_KEY');
    return;
  }
  
  // 2. Test Supabase import
  console.log('\n2️⃣ Testing Supabase Import:');
  try {
    const { supabase } = await import('../supabaseClient.js');
    console.log('✅ Supabase client loaded');
    
    // 3. Test database connection
    console.log('\n3️⃣ Testing Database Connection:');
    
    // Test customers
    console.log('Testing customers table...');
    const { data: customers, error: custError } = await supabase
      .from('customers')
      .select('*');
    
    if (custError) {
      console.error('❌ Customers error:', custError);
    } else {
      console.log(`✅ Customers: ${customers.length} rows`);
    }
    
    // Test vehicles
    console.log('Testing vehicles table...');
    const { data: vehicles, error: vehError } = await supabase
      .from('vehicles')
      .select('*');
    
    if (vehError) {
      console.error('❌ Vehicles error:', vehError);
    } else {
      console.log(`✅ Vehicles: ${vehicles.length} rows`);
    }
    
    // Test orders
    console.log('Testing service_orders table...');
    const { data: orders, error: ordError } = await supabase
      .from('service_orders')
      .select('*');
    
    if (ordError) {
      console.error('❌ Orders error:', ordError);
    } else {
      console.log(`✅ Orders: ${orders.length} rows`);
    }
    
    // Summary
    console.log('\n═══════════════════════════════════════');
    console.log('📊 SUMMARY:');
    console.log('═══════════════════════════════════════');
    if (!custError && !vehError && !ordError) {
      console.log('✅ ALL TESTS PASSED!');
      console.log(`Database has ${customers.length} customers, ${vehicles.length} vehicles, ${orders.length} orders`);
      alert(`✅ SUCCESS!\n\nDatabase is working!\nCustomers: ${customers.length}\nVehicles: ${vehicles.length}\nOrders: ${orders.length}`);
    } else {
      console.log('❌ SOME TESTS FAILED - See errors above');
      alert('❌ Database connection has errors - check console (F12)');
    }
    
  } catch (err) {
    console.error('\n❌ FAILED:', err);
    alert(`Error: ${err.message}`);
  }
})();
```

---

## What to Send Me

If it's still not working, send me:

1. **Screenshot of browser console** (F12)
2. **What does it say in console?**
   - "Database Mode: Supabase (Cloud)" or "localStorage"?
3. **Any red error messages?**
4. **In Vercel:**
   - Environment variables screenshot
5. **In Supabase:**
   - Table Editor screenshot showing tables

This will help me diagnose the exact issue!
