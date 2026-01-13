#!/bin/bash

# Build script for Expense Tracker APK
echo "Building Expense Tracker APK..."

# Set Java 17 for compatibility
export JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.16/libexec/openjdk.jdk/Contents/Home

# Navigate to android directory
cd android

# Clean previous builds
echo "Cleaning previous builds..."
./gradlew clean

# Build release APK
echo "Building release APK..."
./gradlew assembleRelease

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Navigate back to project root
    cd ..
    
    # Create builds directory if it doesn't exist
    if [ ! -d "builds" ]; then
        echo "📁 Creating builds directory..."
        mkdir builds
    else
        echo "📁 Builds directory already exists"
        # Remove old builds
        echo "🗑️  Removing old builds..."
        rm -rf builds/*
    fi
    
    # Generate timestamp for unique filename
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    APK_NAME="ExpenseTracker_${TIMESTAMP}.apk"
    
    # Copy APK to builds directory with timestamp
    cp android/app/build/outputs/apk/release/app-release.apk "builds/${APK_NAME}"
    
    echo "✅ APK created: ${APK_NAME}"
    echo "📏 Size: $(ls -lh "builds/${APK_NAME}" | awk '{print $5}')"
    echo "📍 Location: builds/${APK_NAME}"
    
    echo ""
    echo "🎉 Your APK is ready for distribution!"
    echo "You can now:"
    echo "  - Install it on your Android device"
    echo "  - Share it with others"
    echo "  - Upload it to app stores"
    echo ""
    echo "📂 Builds are stored in: builds/"
    echo "📋 Available builds:"
    ls -la builds/
else
    echo "❌ Build failed!"
    exit 1
fi 