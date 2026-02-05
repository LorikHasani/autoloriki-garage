# 🚀 INSTALL DATABASE - 3 SIMPLE STEPS

## Step 1: Add database.js File

Copy `database.js` to your project:

```bash
# Create src folder if it doesn't exist
mkdir -p src

# Copy the database.js file
cp database.js src/database.js
```

## Step 2: Setup Supabase (PRODUCTION ONLY)

### For Local Testing (Skip this step)
- Database.js automatically uses localStorage
- No setup needed!
- Just run: `npm run dev`

### For Production (Do this when ready to deploy)

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project: `auto-bashkimi-l`
   - Wait 2 minutes

2. **Run SQL Setup**
   - Supabase Dashboard → SQL Editor
   - Copy `DROP-AND-RECREATE.sql` content
   - Paste and Run

3. **Add Credentials**
   - Get URL and Key from Project Settings → API
   - Create `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Restart App**
   ```bash
   npm run dev
   ```

**That's it!** Database.js automatically detects Supabase and switches to cloud storage!

---

## Step 3: Verify It Works

### Test Local Storage (No Setup)

```bash
npm run dev
```

1. Login with admin/admin123
2. Add a customer
3. Refresh page
4. Customer is still there! ✅

### Test Supabase (After Setup)

Open browser console, you'll see:
```
🗄️  Database Mode: Supabase (Cloud)
```

---

## 🎯 HOW IT WORKS

### Automatic Detection

```javascript
// database.js checks if Supabase is configured:
const USE_SUPABASE = env.VITE_SUPABASE_URL exists && is valid

// If YES → Use Supabase (cloud database)
// If NO  → Use localStorage (browser storage)
```

### Zero Code Changes

Your app code stays the same. Database.js handles everything:

- ✅ Development: Uses localStorage
- ✅ Production: Uses Supabase
- ✅ No code changes needed
- ✅ Automatic switching

---

## 📊 CURRENT STATUS

**Right now your app uses:** localStorage (browser storage)

**Data is stored in:** Browser's localStorage
- Key: `garazh_customers`
- Key: `garazh_vehicles`  
- Key: `garazh_orders`

**Data persists when:**
- ✅ Page refresh
- ✅ Browser restart
- ❌ Browser data clear
- ❌ Different browser
- ❌ Different device

**To get cloud storage:**
1. Setup Supabase (Step 2 above)
2. Add .env credentials
3. Restart app
4. Done!

---

## 🔧 TROUBLESHOOTING

### "Data still disappears on refresh"

Check browser console:
```
🗄️  Database Mode: localStorage (Local)
```

This means localStorage is working. If data still disappears:
1. Check browser isn't in incognito mode
2. Check browser storage isn't disabled
3. Try different browser

### "Can't connect to Supabase"

Check `.env` file:
```bash
cat .env
```

Should show:
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co  (real URL)
VITE_SUPABASE_ANON_KEY=eyJxxxxx (real key)
```

Then restart:
```bash
# Stop server (Ctrl+C)
npm run dev
```

### "How do I switch from localStorage to Supabase?"

Just add `.env` file with credentials and restart. Database.js automatically switches!

---

## 💾 BACKUP YOUR DATA

### Before Switching to Supabase

1. Open browser DevTools (F12)
2. Go to Console tab
3. Run:
```javascript
// Export current localStorage data
const backup = {
  customers: JSON.parse(localStorage.getItem('garazh_customers') || '[]'),
  vehicles: JSON.parse(localStorage.getItem('garazh_vehicles') || '[]'),
  orders: JSON.parse(localStorage.getItem('garazh_orders') || '[]')
};

// Download as JSON
const blob = new Blob([JSON.stringify(backup, null, 2)], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'garazh-backup.json';
a.click();
```

4. Save the downloaded file!

---

## ✅ CHECKLIST

- [ ] database.js file added to src/
- [ ] App runs locally with `npm run dev`
- [ ] Data persists on page refresh
- [ ] (Optional) Supabase project created
- [ ] (Optional) SQL schema executed
- [ ] (Optional) .env file configured
- [ ] (Optional) App switched to Supabase

**You're production ready!** 🎉
