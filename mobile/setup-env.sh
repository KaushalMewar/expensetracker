#!/bin/bash

# Environment Setup Script for Expense Tracker Mobile App

echo "🚀 Setting up environment variables for Expense Tracker Mobile App"
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Do you want to overwrite it? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo "📝 Overwriting .env file..."
    else
        echo "✅ Keeping existing .env file"
        exit 0
    fi
fi

# Copy .env.example to .env
if [ -f ".env.example" ]; then
    cp .env.example .env
    echo "✅ Created .env file from .env.example"
    echo ""
    echo "📋 Next steps:"
    echo "1. Edit .env file with your Firebase configuration"
    echo "2. Get your Firebase config from Firebase Console > Project Settings"
    echo "3. Replace placeholder values with your actual Firebase credentials"
    echo ""
    echo "🔒 Remember: .env file is gitignored and will not be committed"
else
    echo "❌ .env.example file not found!"
    exit 1
fi

echo "🎉 Environment setup complete!" 