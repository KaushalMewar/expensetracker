#!/bin/bash

echo "🚀 Setting up Expense Tracker Mobile App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version 16 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if React Native CLI is installed
if ! command -v npx react-native &> /dev/null; then
    echo "📦 Installing React Native CLI..."
    npm install -g @react-native-community/cli
fi

# Create necessary directories if they don't exist
echo "📁 Creating necessary directories..."
mkdir -p android/app/src/main/res/values
mkdir -p android/app/src/main/res/drawable

# Check if Firebase config needs to be updated
if grep -q "YOUR_API_KEY" src/config/firebase.js; then
    echo "⚠️  IMPORTANT: Please update your Firebase configuration in src/config/firebase.js"
    echo "   You need to replace the placeholder values with your actual Firebase project details."
    echo "   Get your Firebase config from: https://console.firebase.google.com/"
    echo ""
    echo "   Example configuration:"
    echo "   const firebaseConfig = {"
    echo "     apiKey: \"your-api-key\","
    echo "     authDomain: \"your-project.firebaseapp.com\","
    echo "     projectId: \"your-project-id\","
    echo "     storageBucket: \"your-project.appspot.com\","
    echo "     messagingSenderId: \"your-sender-id\","
    echo "     appId: \"your-app-id\""
    echo "   };"
    echo ""
fi

# Check if Android SDK is available
if [ -z "$ANDROID_HOME" ]; then
    echo "⚠️  ANDROID_HOME environment variable is not set."
    echo "   Please install Android Studio and set ANDROID_HOME to your Android SDK path."
    echo "   Example: export ANDROID_HOME=/Users/username/Library/Android/sdk"
else
    echo "✅ Android SDK found at: $ANDROID_HOME"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "Next steps:"
echo "1. Update Firebase configuration in src/config/firebase.js"
echo "2. Make sure Android Studio is installed and configured"
echo "3. Start an Android emulator or connect a device"
echo "4. Run the app:"
echo "   npx react-native run-android"
echo ""
echo "For more information, see README.md" 