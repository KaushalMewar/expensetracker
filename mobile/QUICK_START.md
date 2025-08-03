# Quick Start Guide - Expense Tracker Mobile App

## Prerequisites

- Node.js (v16 or higher)
- Android Studio with Android SDK
- Firebase project with Firestore enabled

## Quick Setup (5 minutes)

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Firestore database
4. Get your project configuration
5. Update `src/config/firebase.js` with your config:
```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### 3. Run the App
```bash
# Start Android emulator or connect device
npx react-native run-android
```

## Troubleshooting

### Common Issues

**Metro bundler not starting:**
```bash
npx react-native start --reset-cache
```

**Android build fails:**
```bash
cd android && ./gradlew clean
cd .. && npx react-native run-android
```

**Firebase connection issues:**
- Check your Firebase configuration
- Ensure Firestore is enabled
- Verify internet connection

### Environment Setup

**Set ANDROID_HOME (macOS):**
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Set ANDROID_HOME (Windows):**
```cmd
set ANDROID_HOME=C:\Users\YourUsername\AppData\Local\Android\Sdk
set PATH=%PATH%;%ANDROID_HOME%\emulator
set PATH=%PATH%;%ANDROID_HOME%\tools
set PATH=%PATH%;%ANDROID_HOME%\tools\bin
set PATH=%PATH%;%ANDROID_HOME%\platform-tools
```

## Features Overview

- **Add Expenses**: Tap the + button to add new expenses
- **Dashboard**: View charts and analytics
- **History**: Browse and manage all expenses

## Need Help?

- Check the full README.md for detailed instructions
- Review Firebase documentation
- Open an issue on GitHub 