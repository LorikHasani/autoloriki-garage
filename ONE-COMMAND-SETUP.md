# 🚀 ONE-COMMAND SETUP - AUTO BASHKIMI-L

## ⚡ LITERALLY ONE COMMAND

```bash
chmod +x auto-setup.sh && ./auto-setup.sh
```

**That's it!** The script does EVERYTHING automatically.

---

## 📋 WHAT IT ASKS YOU

The script will ask for 5 things (takes 2 minutes):

### 1. Supabase URL
```
Find in: Supabase Dashboard → Settings → API
Example: https://xxxxx.supabase.co
```

### 2. Supabase Anon Key
```
Find in: Same place → Project API keys → anon public
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Supabase Service Key
```
Find in: Same place → service_role key (click "Reveal")
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
⚠️ Keep this secret!
```

### 4. Admin Email
```
Your login email
Example: admin@autobashkimi.com
```

### 5. Admin Password
```
Your login password (min 6 characters)
Choose something secure!
```

---

## 🎯 WHAT THE SCRIPT DOES AUTOMATICALLY

### ✅ Database Setup:
- Drops old tables (if any)
- Creates fresh tables (customers, vehicles, service_orders)
- Sets up only 3 RLS policies (not 12!)
- Adds sample Albanian data
- Creates indexes for performance

### ✅ User Creation:
- Creates your admin user in Supabase Auth
- Email verified automatically
- Ready to login immediately

### ✅ App Configuration:
- Creates .env file with your credentials
- Installs all dependencies (npm install)
- Builds production app (npm run build)

### ✅ Everything Ready:
- Database ✅
- Auth user ✅
- App configured ✅
- Built and ready ✅

---

## 🎉 AFTER THE SCRIPT RUNS

You'll see:
```
════════════════════════════════════════════════════════════
🎉 SETUP COMPLETE!
════════════════════════════════════════════════════════════

✅ Database created (customers, vehicles, service_orders)
✅ RLS policies set (only 3 policies)
✅ Sample data added (3 customers, 3 vehicles, 2 orders)
✅ Admin user created
✅ Environment configured
✅ Application built

📋 YOUR LOGIN CREDENTIALS
Email:    admin@autobashkimi.com
Password: **********

🚀 NEXT STEPS
1. Test locally: npm run dev
2. Deploy to Vercel: vercel --prod
````

---

## 🧪 TEST LOCALLY (30 seconds)

```bash
npm run dev
```

1. Opens at http://localhost:3000
2. Login with your email and password
3. See 3 sample customers
4. Add new customer → Works! ✅
5. Refresh → Still there! ✅

---

## 🚀 DEPLOY TO VERCEL (2 minutes)

### Option A: Using Vercel CLI
```bash
npm install -g vercel  # First time only
vercel --prod
```

Follow prompts, it will ask:
- Set up project? **Yes**
- Project name? **auto-bashkimi-l**
- Add environment variables? **Yes**
  - VITE_SUPABASE_URL = (your URL)
  - VITE_SUPABASE_ANON_KEY = (your anon key)

**Done!** Get your live URL.

### Option B: Using GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git push
```

Then in Vercel dashboard:
1. Import repository
2. Add environment variables
3. Deploy

---

## ✅ CHECKLIST

- [ ] Run `./auto-setup.sh`
- [ ] Entered Supabase credentials
- [ ] Created admin user credentials
- [ ] Saw "SETUP COMPLETE!" message
- [ ] Tested with `npm run dev`
- [ ] Can login with your email/password
- [ ] See 3 sample customers
- [ ] Deployed to Vercel
- [ ] Works on phone too
- [ ] **START USING IN YOUR GARAGE!** 🚗

---

## 🆘 IF SOMETHING FAILS

### "Permission denied: ./auto-setup.sh"
```bash
chmod +x auto-setup.sh
./auto-setup.sh
```

### "npm not found"
Install Node.js first:
- Go to nodejs.org
- Download and install
- Run script again

### "curl: command not found"
Install curl:
```bash
# Mac
brew install curl

# Ubuntu/Debian
sudo apt-get install curl

# Windows (use Git Bash or WSL)
```

### Database errors
The script will tell you if database setup needs manual verification.
Just run `DATABASE-WITH-AUTH.sql` in Supabase SQL Editor.

### User already exists
That's fine! Just use that email to login.

---

## 🎯 WHAT YOU GET

### Only 3 RLS Policies (Not 12!):
```sql
authenticated_all_customers   -- One policy = all operations
authenticated_all_vehicles    -- One policy = all operations  
authenticated_all_orders      -- One policy = all operations
```

### Real Authentication:
- Login with email/password
- Supabase handles security
- Add more users anytime

### Production Ready:
- All features working
- Data persists forever
- Multi-device sync
- Professional setup

---

## 💡 ADDING MORE USERS LATER

Anytime you want to add garage staff:

```bash
# Option 1: Via Supabase Dashboard
Go to: Authentication → Users → Add User
Email: mechanic@autobashkimi.com
Password: (their password)
Auto Confirm: ✅ ON

# Option 2: Via curl (if you saved service key)
curl -X POST "https://your-project.supabase.co/auth/v1/admin/users" \
  -H "apikey: YOUR_SERVICE_KEY" \
  -H "Authorization: Bearer YOUR_SERVICE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"mechanic@autobashkimi.com","password":"password123","email_confirm":true}'
```

---

## 🎊 THAT'S IT!

**ONE command. Everything automated. Ready to use.**

No more:
- ❌ Manual SQL editing
- ❌ Creating users in dashboard
- ❌ Configuring 12 policies
- ❌ Multiple deployment steps

Just:
- ✅ Run script
- ✅ Enter credentials
- ✅ Deploy
- ✅ **USE IT!**

---

**Run the script and you're done!** 🚀
