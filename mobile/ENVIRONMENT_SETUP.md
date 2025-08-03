# Environment Variables Setup

This document explains how to set up environment variables for the Expense Tracker mobile app to avoid committing sensitive data to git.

## Setup Instructions

### 1. Environment Files

The app uses environment variables to store Firebase configuration and other sensitive data. Two files are provided:

- `.env` - Contains actual environment variables (not committed to git)
- `.env.example` - Template file showing required variables (committed to git)

### 2. Required Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase configuration:

```bash
cp .env.example .env
```

Then edit `.env` with your actual Firebase configuration:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_actual_api_key_here
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# App Configuration
APP_ENV=development
```

### 3. Getting Firebase Configuration

1. Go to your Firebase Console
2. Select your project
3. Go to Project Settings
4. Scroll down to "Your apps" section
5. Copy the configuration values to your `.env` file

### 4. Security Notes

- **Never commit `.env` file to git** - It's already in `.gitignore`
- **Always use `.env.example` as a template** - Update it when adding new variables
- **Share `.env.example` with your team** - So they know what variables are needed

### 5. Validation

The app includes validation to ensure all required Firebase configuration is present. If any required fields are missing, the app will show a warning and may not function properly.

### 6. Development vs Production

You can use different environment files for different environments:

- `.env` - Development (default)
- `.env.production` - Production
- `.env.staging` - Staging

To use a different environment file, modify the `path` in `babel.config.js`.

## Troubleshooting

### Common Issues

1. **"Module not found: @env"** - Make sure `react-native-dotenv` is installed
2. **"Invalid Firebase configuration"** - Check that all required variables are set in `.env`
3. **Build errors** - Try cleaning and rebuilding: `npm run clean && npm run android`

### Verification

To verify your environment setup is working:

1. Check that `.env` file exists and contains your Firebase configuration
2. Run the app and check console for any configuration warnings
3. Verify Firebase connection works (try adding an expense)

## Dependencies

The environment variable setup uses:
- `react-native-dotenv` - For loading environment variables
- Babel configuration - For processing environment variables at build time 