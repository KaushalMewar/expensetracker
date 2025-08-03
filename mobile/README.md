# Expense Tracker Mobile App

A React Native mobile application for tracking personal expenses with Firebase integration. This app provides the same functionality as the desktop version but optimized for mobile devices.

## Features

- **Add Expenses**: Add new expenses with date, category, amount, and optional comments
- **Dashboard**: View expense analytics with interactive charts (pie chart, bar chart, line chart)
- **History**: Browse, search, filter, edit, and delete expense records
- **Categories**: Organized into "Needs" and "Wants" categories for better financial planning
- **Real-time Sync**: All data is stored in Firebase Firestore for cloud synchronization
- **Offline Support**: Basic offline functionality with local caching

## Screenshots

The app includes three main screens:
1. **Add Expense**: Form to add new expenses
2. **Dashboard**: Analytics and charts
3. **History**: List of all expenses with management options

## Prerequisites

Before running this app, make sure you have:

- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Firebase project with Firestore enabled

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Firestore database
   - Get your Firebase configuration
   - Update `src/config/firebase.js` with your Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.appspot.com",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

4. **Android Setup**
   ```bash
   # For Android
   npx react-native run-android
   ```

## Project Structure

```
mobile/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase configuration
│   ├── constants/
│   │   └── categories.js        # Expense categories
│   ├── screens/
│   │   ├── AddExpenseScreen.js  # Add new expenses
│   │   ├── DashboardScreen.js   # Analytics dashboard
│   │   ├── HistoryScreen.js     # Expense history
│   │   └── EditExpenseScreen.js # Edit expenses
│   └── utils/
│       └── expenseService.js    # Firebase operations
├── App.js                       # Main app component
├── index.js                     # Entry point
└── package.json                 # Dependencies
```

## Key Dependencies

- **React Navigation**: For screen navigation
- **React Native Chart Kit**: For displaying charts and analytics
- **Firebase**: For backend database and real-time sync
- **React Native Vector Icons**: For UI icons
- **React Native Date Picker**: For date selection
- **React Native Picker Select**: For dropdown selections

## Features in Detail

### Add Expense Screen
- Date picker with calendar interface
- Category selection (organized into Needs/Wants)
- Amount input with validation
- Optional comment field
- Form validation and error handling

### Dashboard Screen
- Interactive pie chart showing expenses by category
- Bar chart displaying top spending categories
- Line chart showing spending over time
- Filterable by category and time period
- Pull-to-refresh functionality

### History Screen
- List of all expenses with pagination
- Search functionality
- Filter by category and time period
- Edit and delete options for each expense
- Real-time updates

## Firebase Integration

The app uses Firebase Firestore for data storage with the following collections:
- `expenses`: Stores all expense records with fields:
  - `date`: Date of the expense
  - `category`: Expense category
  - `amount`: Expense amount
  - `comment`: Optional comment
  - `createdAt`: Timestamp when record was created
  - `updatedAt`: Timestamp when record was last updated

## Development

### Running the App
```bash
# Start Metro bundler
npx react-native start

# Run on Android
npx react-native run-android

# Run on iOS (macOS only)
npx react-native run-ios
```

### Building for Production
```bash
# Android APK
cd android && ./gradlew assembleRelease

# iOS (requires Xcode)
cd ios && xcodebuild -workspace ExpenseTrackerMobile.xcworkspace -scheme ExpenseTrackerMobile -configuration Release
```

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Android build issues**
   ```bash
   cd android && ./gradlew clean
   ```

3. **Firebase connection issues**
   - Verify Firebase configuration in `src/config/firebase.js`
   - Check Firestore rules and permissions
   - Ensure internet connectivity

### Debug Mode
- Enable developer menu on device/emulator
- Use React Native Debugger for better debugging experience
- Check Metro bundler console for errors

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Check the troubleshooting section
- Review Firebase documentation
- Open an issue on GitHub

## Future Enhancements

- User authentication
- Budget tracking and alerts
- Export functionality
- Dark mode support
- Multi-currency support
- Receipt image upload
- Recurring expenses
- Expense sharing between users 