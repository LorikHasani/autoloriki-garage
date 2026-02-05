#!/bin/bash

# ═══════════════════════════════════════════════════════════════════════════
# AUTO BASHKIMI-L - PRODUCTION DEPLOYMENT SCRIPT
# ═══════════════════════════════════════════════════════════════════════════

set -e  # Exit on error

echo "🚗 AUTO BASHKIMI-L - Production Deployment"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ───────────────────────────────────────────────────────────────────────────
# STEP 1: Check Prerequisites
# ───────────────────────────────────────────────────────────────────────────

echo "📋 Step 1: Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $(node --version) found${NC}"

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm not found. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ npm $(npm --version) found${NC}"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# STEP 2: Install Dependencies
# ───────────────────────────────────────────────────────────────────────────

echo "📦 Step 2: Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    exit 1
fi
echo ""

# ───────────────────────────────────────────────────────────────────────────
# STEP 3: Setup Environment
# ───────────────────────────────────────────────────────────────────────────

echo "⚙️  Step 3: Setting up environment..."

if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from template...${NC}"
    cp .env.example .env
    echo -e "${BLUE}📝 Please edit .env file with your Supabase credentials:${NC}"
    echo ""
    echo "   1. Go to https://supabase.com"
    echo "   2. Create a new project (or select existing)"
    echo "   3. Go to Project Settings → API"
    echo "   4. Copy your URL and anon key"
    echo "   5. Edit .env file and add them"
    echo ""
    echo -e "${YELLOW}After editing .env, run this script again.${NC}"
    exit 0
else
    echo -e "${GREEN}✅ .env file found${NC}"
    
    # Check if .env has real credentials
    if grep -q "YOUR_SUPABASE_URL" .env || grep -q "your-project-url" .env; then
        echo -e "${RED}❌ .env file still has placeholder values!${NC}"
        echo ""
        echo "Please edit .env with your real Supabase credentials:"
        echo "   1. Go to https://supabase.com"
        echo "   2. Get your Project URL and anon key"
        echo "   3. Update .env file"
        echo ""
        exit 1
    fi
    
    echo -e "${GREEN}✅ Supabase credentials configured${NC}"
fi
echo ""

# ───────────────────────────────────────────────────────────────────────────
# STEP 4: Database Setup Reminder
# ───────────────────────────────────────────────────────────────────────────

echo "🗄️  Step 4: Database setup..."
echo ""
echo -e "${BLUE}IMPORTANT: Have you run the SQL setup in Supabase?${NC}"
echo ""
echo "If NOT, do this now:"
echo "   1. Go to your Supabase Dashboard"
echo "   2. Click 'SQL Editor' in sidebar"
echo "   3. Click 'New Query'"
echo "   4. Copy ALL content from DROP-AND-RECREATE.sql"
echo "   5. Paste and click 'Run'"
echo "   6. Wait for 'Database recreated successfully!'"
echo ""
read -p "Have you completed the database setup? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Please complete database setup first, then run this script again.${NC}"
    exit 0
fi

echo -e "${GREEN}✅ Database setup confirmed${NC}"
echo ""

# ───────────────────────────────────────────────────────────────────────────
# STEP 5: Build for Production
# ───────────────────────────────────────────────────────────────────────────

echo "🔨 Step 5: Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Production build completed${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# ───────────────────────────────────────────────────────────────────────────
# STEP 6: Deployment Options
# ───────────────────────────────────────────────────────────────────────────

echo "🚀 Step 6: Ready to deploy!"
echo ""
echo "Your production build is in the 'dist' folder."
echo ""
echo "Choose your deployment method:"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "Option 1: VERCEL (Recommended - Easiest)"
echo "   → Free hosting"
echo "   → Automatic deployments from Git"
echo "   → Custom domain support"
echo ""
echo "   Steps:"
echo "   1. Push code to GitHub"
echo "   2. Go to vercel.com"
echo "   3. Import your repository"
echo "   4. Add environment variables (copy from .env)"
echo "   5. Deploy!"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "Option 2: NETLIFY"
echo "   → Free hosting"
echo "   → Drag & drop deployment"
echo "   → Custom domain support"
echo ""
echo "   Steps:"
echo "   1. Go to netlify.com"
echo "   2. Drag 'dist' folder to deploy"
echo "   3. Add environment variables in site settings"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "Option 3: Local Server (For Testing)"
echo "   → Test production build locally first"
echo ""
echo "   Command:"
echo "   npm run preview"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ Production setup complete!${NC}"
echo ""
echo "Next steps:"
echo "   • Test locally: npm run preview"
echo "   • Deploy to Vercel/Netlify"
echo "   • Access from any device!"
echo ""
