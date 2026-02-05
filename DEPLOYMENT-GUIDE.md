# AutoFix Garage Management - Supabase Deployment Guide

Complete step-by-step guide to deploy your garage management system with Supabase backend.

---

## 📋 Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)
- Git installed
- Basic terminal/command line knowledge

---

## 🚀 Part 1: Supabase Setup

### Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in or create an account
3. Click "New Project"
4. Fill in:
   - **Name**: `autofix-garage`
   - **Database Password**: (create a strong password - save this!)
   - **Region**: Choose closest to your location
   - **Pricing Plan**: Free
5. Click "Create new project"
6. Wait 2-3 minutes for project to initialize

### Step 2: Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Copy the entire content of `supabase-schema.sql`
4. Paste it into the SQL editor
5. Click **Run** (or press Ctrl/Cmd + Enter)
6. You should see "Success. No rows returned" - this is correct!

### Step 3: Verify Database Setup

1. Go to **Table Editor** in the sidebar
2. You should see three tables:
   - `customers` (with 3 sample records)
   - `vehicles` (with 4 sample records)
   - `service_orders` (with 4 sample records)
3. Click each table to verify data was imported

### Step 4: Get Your API Credentials

1. Go to **Project Settings** (gear icon in sidebar)
2. Click **API** in the left menu
3. Copy these two values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the long string under "Project API keys")
4. Keep these safe - you'll need them next!

---

## 💻 Part 2: Local Development Setup

### Step 1: Project Structure

Create this folder structure:
```
autofix-garage/
├── index.html
├── package.json
├── vite.config.js
├── .env
├── .env.example
├── supabaseClient.js
├── supabase-schema.sql
└── src/
    ├── main.jsx
    └── App.jsx (your GarageApp.jsx renamed)
```

### Step 2: Initialize Project

```bash
# Create project folder
mkdir autofix-garage
cd autofix-garage

# Copy all the provided files into this folder
# (package.json, vite.config.js, index.html, etc.)

# Install dependencies
npm install
```

### Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Important**: Add `.env` to `.gitignore` if using Git:
   ```bash
   echo ".env" >> .gitignore
   ```

### Step 4: Test Local Development

```bash
npm run dev
```

Your app should open at `http://localhost:3000`

---

## 🔧 Part 3: Integrate Supabase with App

You have two options:

### Option A: Quick Start (Minimal Changes)

Keep using your current `GarageApp.jsx` as-is for local development. The app will work with in-memory state. Later, you can gradually add Supabase integration.

1. Rename `GarageApp.jsx` to `src/App.jsx`
2. Run `npm run dev`
3. Everything works locally, but data isn't persisted

### Option B: Full Supabase Integration

This requires modifying your components to use the Supabase API. Here's a quick example:

**Before (local state):**
```javascript
const save = () => {
  editing 
    ? setCustomers(p => p.map(c => c.id===editing ? {...c,...form} : c)) 
    : setCustomers(p => [...p, { id:Date.now(), ...form }]);
  setModal(false);
};
```

**After (Supabase):**
```javascript
const save = async () => {
  try {
    if (editing) {
      await customersAPI.update(editing, form);
    } else {
      await customersAPI.create(form);
    }
    await loadCustomers(); // Refresh from database
    setModal(false);
  } catch (error) {
    console.error('Save failed:', error);
    alert('Failed to save customer');
  }
};
```

**Key Changes Needed:**
1. Import `customersAPI`, `vehiclesAPI`, `ordersAPI` from `supabaseClient.js`
2. Make all CRUD functions `async`
3. Replace state updates with API calls
4. Add error handling
5. Reload data after mutations

I've provided `src/App-supabase-template.jsx` as a starting point showing the structure.

---

## 🌐 Part 4: Production Deployment

### Option 1: Vercel (Recommended)

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repo-url
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add Environment Variables:
   - `VITE_SUPABASE_URL`: your Supabase URL
   - `VITE_SUPABASE_ANON_KEY`: your Supabase anon key
7. Click "Deploy"
8. Your app will be live at `your-app.vercel.app`

### Option 2: Netlify

1. Push code to GitHub (same as above)
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Select GitHub → your repository
5. Configure:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
6. Click "Add environment variables":
   - Add `VITE_SUPABASE_URL`
   - Add `VITE_SUPABASE_ANON_KEY`
7. Click "Deploy"

### Option 3: Static Hosting (Cloudflare Pages, GitHub Pages)

```bash
# Build for production
npm run build

# The dist/ folder can be deployed to any static host
```

---

## 🔐 Part 5: Security & Production Considerations

### 1. Row Level Security (RLS)

The provided schema includes basic RLS policies. For production:

1. Go to Supabase Dashboard → Authentication
2. Enable Email authentication or configure your preferred auth method
3. Update RLS policies in SQL Editor:

```sql
-- Example: Restrict customers to authenticated users
DROP POLICY IF EXISTS "Enable all for authenticated users" ON customers;

CREATE POLICY "Authenticated users can view customers"
  ON customers FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert customers"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Repeat for vehicles and service_orders
```

### 2. Add Authentication

Modify your app to require login:

```javascript
import { supabase } from './supabaseClient';

// Check if user is logged in
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  // Redirect to login page
  window.location.href = '/login';
}
```

### 3. Environment Best Practices

- Never commit `.env` to Git
- Use different Supabase projects for dev/staging/prod
- Rotate API keys if exposed
- Use service role key only in backend code (never in frontend)

---

## 🧪 Testing Your Deployment

1. **Test Database Connection**:
   ```javascript
   import { supabase } from './supabaseClient';
   
   const { data, error } = await supabase
     .from('customers')
     .select('*')
     .limit(1);
   
   console.log('Connection test:', data ? 'Success ✓' : 'Failed ✗');
   ```

2. **Test CRUD Operations**:
   - Create a new customer
   - Edit an existing vehicle
   - Create a service order
   - Verify data persists after page refresh

3. **Test Real-time Updates**:
   - Open app in two browser windows
   - Make a change in one window
   - Verify it appears in the other (may take 1-2 seconds)

---

## 📊 Monitoring & Maintenance

### Supabase Dashboard

Monitor your app health:
1. **Table Editor**: View/edit data manually
2. **SQL Editor**: Run queries and reports
3. **Database**: Check performance metrics
4. **Logs**: View API requests and errors
5. **API**: Monitor rate limits and usage

### Backup Strategy

1. Go to Database → Backups
2. Enable daily backups (included in free tier)
3. For critical data, export periodically:
   ```sql
   -- Export customers to CSV
   SELECT * FROM customers;
   ```

---

## 🐛 Troubleshooting

### "Failed to fetch" Error
- Check `.env` file has correct Supabase URL
- Verify anon key is correct (no extra spaces)
- Restart dev server after changing `.env`

### "Row Level Security" Error
- Check RLS policies in Supabase dashboard
- Verify user is authenticated if required
- Review Table Editor → RLS policies

### Data Not Persisting
- Check browser console for errors
- Verify API calls are completing (Network tab)
- Check Supabase Logs for errors

### Real-time Not Working
- Ensure subscriptions are set up correctly
- Check Realtime is enabled in Supabase settings
- Verify table names match exactly

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)
- [Supabase Discord](https://discord.supabase.com) - Great for questions

---

## 🎉 What's Next?

After successful deployment, consider adding:

1. **User Authentication**: Allow mechanics to log in
2. **SMS Notifications**: Alert customers when work is done
3. **Invoice Email**: Send invoices via email
4. **Parts Inventory**: Track parts stock levels
5. **Calendar View**: Schedule appointments
6. **Customer Portal**: Let customers check order status
7. **Analytics Dashboard**: Advanced reporting with charts
8. **Mobile App**: React Native version for on-the-go access

---

## 💡 Quick Reference

### Useful Commands
```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Supabase
npm install @supabase/supabase-js  # Install Supabase client
```

### File Structure Reference
```
autofix-garage/
├── index.html              # Entry HTML
├── package.json            # Dependencies
├── vite.config.js          # Vite config
├── .env                    # Environment variables (gitignored)
├── .env.example            # Template for .env
├── supabaseClient.js       # Supabase API wrapper
├── supabase-schema.sql     # Database schema
└── src/
    ├── main.jsx            # React entry point
    └── App.jsx             # Main app component
```

---

**Need Help?** 
- Check Supabase docs: https://supabase.com/docs
- Join Supabase Discord: https://discord.supabase.com
- Review error logs in browser console and Supabase dashboard

**Good luck with your deployment! 🚀**
