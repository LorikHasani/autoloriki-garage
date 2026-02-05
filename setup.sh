#!/bin/bash

# AutoFix Garage Management - Quick Setup Script
# This script automates the initial project setup

set -e  # Exit on any error

echo "🚗 AutoFix Garage Management - Quick Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✓ Node.js $(node --version) detected"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✓ npm $(npm --version) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✓ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: You need to edit .env and add your Supabase credentials:"
    echo "   1. Go to https://supabase.com"
    echo "   2. Create a new project or select existing"
    echo "   3. Go to Settings → API"
    echo "   4. Copy your Project URL and anon key"
    echo "   5. Edit .env file and replace the placeholder values"
    echo ""
else
    echo "✓ .env file already exists"
fi
echo ""

# Create necessary directories if they don't exist
echo "📁 Creating project structure..."
mkdir -p src
echo "✓ Project structure ready"
echo ""

echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Edit .env file with your Supabase credentials"
echo "   2. Run the database schema in Supabase SQL Editor:"
echo "      - Copy content from supabase-schema.sql"
echo "      - Paste in SQL Editor at https://app.supabase.com"
echo "      - Click Run"
echo "   3. Start development server:"
echo "      npm run dev"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT-GUIDE.md"
echo ""
echo "Happy coding! 🎉"
