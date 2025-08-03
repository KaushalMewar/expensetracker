# Building Expense Tracker APK

This guide explains how to build the Expense Tracker app APK for distribution.

## Prerequisites

- Node.js (v16 or higher)
- Java 17 (OpenJDK recommended)
- Android SDK
- React Native CLI

## Quick Build

### Option 1: Using the build script (Recommended)

```bash
# From the mobile directory
./build-apk.sh
```

This script will:
- Set the correct Java version
- Clean previous builds
- Build the release APK
- Copy the APK to the project root as `ExpenseTracker.apk`

### Option 2: Manual build

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Set Java 17
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.16/libexec/openjdk.jdk/Contents/Home

# Navigate to android directory
cd android

# Clean previous builds
./gradlew clean

# Build release APK
./gradlew assembleRelease
```

## APK Location

After a successful build, the APK will be located at:
- **Primary location**: `mobile/android/app/build/outputs/apk/release/app-release.apk`
- **Copied location**: `ExpenseTracker.apk` (in project root)

## APK Details

- **Package Name**: `com.expensetrackermobile`
- **Version**: 1.0
- **Size**: ~26MB
- **Architecture**: Universal (supports multiple CPU architectures)

## Installation

### On Android Device

1. Enable "Unknown Sources" in your Android settings
2. Transfer the APK to your device
3. Open the APK file and install

### Distribution

The APK can be:
- Shared directly with users
- Uploaded to Google Play Store
- Distributed through other app stores
- Used for internal testing

## Troubleshooting

### Java Version Issues
If you encounter Java compatibility issues:
```bash
# Check available Java versions
/usr/libexec/java_home -V

# Set Java 17 explicitly
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.16/libexec/openjdk.jdk/Contents/Home
```

### Build Failures
1. Clean the project: `./gradlew clean`
2. Clear npm cache: `npm cache clean --force`
3. Reinstall dependencies: `rm -rf node_modules && npm install`
4. Try building again

### Memory Issues
If the build fails due to memory:
- Increase Gradle memory in `android/gradle.properties`
- Close other applications to free up memory
- Use the build script which includes optimized memory settings

## Features Included

The APK includes all the expense tracking features:
- Add, edit, and delete expenses
- Categorize expenses
- View expense history
- Dashboard with charts
- Firebase integration for data sync
- Offline support

## Security Notes

- The APK is signed with a debug keystore
- For production distribution, generate a proper release keystore
- Firebase configuration is included for data persistence 