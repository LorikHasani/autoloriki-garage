# ⚙️ AutoFix - Garage Management System

A full-featured, modern garage management system built with React and Supabase. Manage customers, vehicles, service orders, track payments, generate invoices, and monitor daily operations — all in one beautiful interface.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.2-61dafb)
![Supabase](https://img.shields.io/badge/Supabase-2.39-3ecf8e)

---

## ✨ Features

### 📊 Dashboard
- Real-time KPI cards (Revenue, COGS, Profit, Active Orders)
- Recent completed orders
- Profit breakdown analysis
- Beautiful dark theme UI

### 👥 Customer Management
- Full CRUD operations
- Search by name, phone, or license plate
- Customer service history with profit tracking
- Vehicle fleet overview per customer

### 🚗 Vehicle Management
- Vehicle registration with owner linking
- License plate tracking
- Make, model, year, color details
- Quick search and filtering

### 🔧 Service Orders
- Multi-service orders (multiple services per order)
- Part quantity tracking with per-unit pricing
- Live profit calculation
- Payment status tracking (Paid/Unpaid)
- Automatic daily archiving (completed orders stay visible until next day)
- Print invoices with price toggle

### 📅 Daily Log
- Historical service records grouped by date
- Date range filtering (presets + custom range)
- Daily revenue and profit summaries
- Completed order archive

### 🧾 Invoices
- Unified invoice view (active + archived)
- Payment filter (All / Paid / Unpaid)
- Expandable order details with part-by-part breakdown
- Print-friendly invoice generation
- Financial summary cards with unpaid tracking

### 🖨️ Print System
- Invoice printing with customizable price visibility
- Clean, professional print layout
- Print from order modal, service orders, or invoices page

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- A Supabase account ([Sign up free](https://supabase.com))

### Option 1: Automated Setup (Linux/Mac)

```bash
# Make setup script executable
chmod +x setup.sh

# Run setup
./setup.sh

# Edit .env with your Supabase credentials
nano .env

# Start development
npm run dev
```

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env and add your Supabase URL and anon key
   ```

3. **Setup Database**
   - Go to your Supabase dashboard
   - Open SQL Editor
   - Copy content from `supabase-schema.sql`
   - Paste and run

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Browser**
   - Navigate to `http://localhost:3000`
   - You should see the AutoFix dashboard with sample data

---

## 📁 Project Structure

```
autofix-garage/
├── index.html                 # Entry point HTML
├── package.json               # Dependencies and scripts
├── vite.config.js             # Vite configuration
├── .env.example               # Environment variables template
├── supabaseClient.js          # Supabase API wrapper
├── supabase-schema.sql        # Database schema and seed data
├── DEPLOYMENT-GUIDE.md        # Detailed deployment instructions
└── src/
    ├── main.jsx               # React entry point
    ├── App.jsx                # Main application component
    └── App-supabase-template.jsx  # Supabase integration template
```

---

## 🗄️ Database Schema

### Tables

**customers**
- id (UUID, primary key)
- name, phone, email, address
- created_at, updated_at

**vehicles**
- id (UUID, primary key)
- customer_id (foreign key → customers)
- make, model, year, plate, color
- created_at, updated_at

**service_orders**
- id (UUID, primary key)
- vehicle_id (foreign key → vehicles)
- customer_id (foreign key → customers)
- status (Pending/In Progress/Completed/Cancelled)
- start_date, end_date
- paid (boolean)
- notes (text)
- services (JSONB array)
- created_at, updated_at

**Services JSONB Structure:**
```json
[
  {
    "serviceType": "Oil Change",
    "laborPrice": 40,
    "parts": [
      {
        "name": "Synthetic Oil 5W-30",
        "qty": 1,
        "costPrice": 18,
        "sellPrice": 35
      }
    ]
  }
]
```

---

## 🛠️ Development

### Available Scripts

```bash
npm run dev      # Start development server (port 3000)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Tech Stack

- **Frontend**: React 18.2
- **Build Tool**: Vite 5.0
- **Backend**: Supabase (PostgreSQL)
- **Styling**: Vanilla CSS (no frameworks - lightweight & fast)
- **State Management**: React hooks (useState, useMemo, useEffect)
- **Real-time**: Supabase Realtime subscriptions

---

## 🌐 Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy!

### Deploy to Netlify

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import repository
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variables
6. Deploy!

**📖 See [DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md) for detailed instructions**

---

## 🔐 Security Features

- Row Level Security (RLS) enabled on all tables
- Environment variables for sensitive credentials
- Anon key used (service role key not exposed)
- Input validation on all forms
- SQL injection prevention via Supabase prepared statements

---

## 📊 Key Calculations

### Profit Calculation
```javascript
Revenue = Parts Sold (sell price × qty) + Labor
COGS = Parts Cost (cost price × qty)
Netto Profit = Revenue - COGS
```

### Order Processing
- **Pending/In Progress**: Active orders, editable
- **Completed (same day)**: Visible in Service Orders until midnight
- **Completed (previous days)**: Automatically moved to Daily Log
- **Cancelled**: Marked but not counted in profits

---

## 🎨 Customization

### Branding
Edit colors in CSS (line ~156):
```css
.dash-card.amber::before{background:#f59e0b;}  /* Primary color */
.dash-card.green::before{background:#10b981;}  /* Success color */
```

### Service Types
Modify `SERVICE_TYPES` array in `App.jsx`:
```javascript
const SERVICE_TYPES = [
  "Oil Change",
  "Tire Replacement",
  // Add your service types...
];
```

---

## 📈 Future Enhancements

Planned features for future releases:

- [ ] User authentication & role-based access
- [ ] SMS/Email notifications for customers
- [ ] Parts inventory management
- [ ] Appointment scheduling calendar
- [ ] Customer portal for self-service
- [ ] Advanced analytics & reporting
- [ ] Export to PDF/Excel
- [ ] Multi-garage support
- [ ] Mobile app (React Native)
- [ ] Integration with payment processors

---

## 🐛 Troubleshooting

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Supabase Connection Issues
1. Verify `.env` credentials are correct
2. Check Supabase project is active
3. Ensure RLS policies allow access
4. Review Supabase Logs in dashboard

### Data Not Persisting
- Check browser console for errors
- Verify Supabase API calls in Network tab
- Confirm database schema matches expected structure

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 💬 Support

- 📖 [Deployment Guide](DEPLOYMENT-GUIDE.md)
- 🐛 [Report Issues](https://github.com/yourusername/autofix-garage/issues)
- 💡 [Request Features](https://github.com/yourusername/autofix-garage/issues)
- 📧 Email: support@example.com

---

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Amazing backend platform
- [React](https://react.dev) - Fantastic UI library
- [Vite](https://vitejs.dev) - Lightning-fast build tool
- [Google Fonts](https://fonts.google.com) - Beautiful typography

---

**Built with ❤️ for garage owners who deserve better tools**

*AutoFix - Simplifying garage management, one order at a time.*
