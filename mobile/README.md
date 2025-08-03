# Expense Tracker Mobile App - Beta Release

A comprehensive mobile expense tracking application built with React Native and Firebase.

## 🚀 Features

### Core Features
- **Expense Management**: Add, edit, and delete expenses with categories
- **Dashboard Analytics**: Visual charts showing expense distribution and trends
- **Budget Tracking**: Set and monitor monthly budgets
- **History & Search**: View and filter expense history with search functionality
- **Real-time Sync**: Firebase integration for cloud data synchronization

### Technical Features
- **Cross-platform**: Works on both Android and iOS
- **Offline Support**: Basic offline functionality with local storage
- **Responsive Design**: Optimized for various screen sizes
- **Modern UI**: Clean, intuitive interface with smooth animations

## 📱 Screenshots

### Dashboard
- Expense distribution pie chart
- Monthly budget vs actual spending
- Quick statistics and summaries
- Time-based filtering (Daily, Weekly, Monthly, Year)

### Add/Edit Expenses
- Date picker with validation
- Category selection (Needs vs Wants)
- Amount input with currency formatting
- Optional comments/notes

### History & Search
- Comprehensive expense history
- Advanced filtering by category and time
- Search functionality
- Edit and delete capabilities

### Budget Management
- Monthly budget setting
- Budget vs actual spending tracking
- Visual progress indicators

## 🛠️ Technology Stack

- **Frontend**: React Native 0.72.17
- **Navigation**: React Navigation 6
- **Backend**: Firebase Firestore
- **Charts**: React Native Chart Kit
- **Icons**: React Native Vector Icons
- **Date Picking**: React Native Date Picker

## 📋 Requirements

- Node.js >= 16
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd expensetracker/mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Firebase**
   - Create a Firebase project
   - Enable Firestore Database
   - Add your Firebase configuration to `src/config/firebase.js`

4. **Run the app**
   ```bash
   # For Android
   npm run android
   
   # For iOS (macOS only)
   npm run ios
   ```

## 🔧 Configuration

### Firebase Setup
1. Create a new Firebase project
2. Enable Firestore Database
3. Set up security rules for the `expenses` and `monthly_budgets` collections
4. Update the Firebase configuration in `src/config/firebase.js`

### Environment Variables
The app uses Firebase configuration directly. Ensure your Firebase project is properly configured with the correct API keys.

## 📦 Build Instructions

### Android APK
```bash
cd android
./gradlew assembleRelease
```

### iOS Archive
```bash
cd ios
xcodebuild -workspace ExpenseTrackerMobile.xcworkspace -scheme ExpenseTrackerMobile archive
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint
```

## 📊 Performance

- **App Size**: ~25MB (Android APK)
- **Startup Time**: < 3 seconds
- **Memory Usage**: Optimized for low-end devices
- **Battery Usage**: Minimal background processing

## 🔒 Security

- Firebase Authentication ready (not implemented in beta)
- Secure Firestore rules
- Input validation on all forms
- Error handling for network issues

## 🐛 Known Issues (Beta)

- Limited offline functionality
- No user authentication (single-user app)
- No data export functionality
- No backup/restore features

## 📈 Roadmap

### v1.0 (Production)
- [ ] User authentication
- [ ] Multi-user support
- [ ] Data export (CSV/PDF)
- [ ] Backup/restore functionality
- [ ] Push notifications
- [ ] Advanced analytics

### v1.1
- [ ] Receipt scanning
- [ ] Recurring expenses
- [ ] Budget alerts
- [ ] Dark mode

## 🤝 Contributing

This is a beta release. For production use, please ensure:
1. All features are thoroughly tested
2. Firebase security rules are properly configured
3. Error handling is comprehensive
4. Performance is optimized for your use case

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For beta testing feedback or issues:
- Create an issue in the repository
- Include device information and steps to reproduce
- Provide screenshots for UI issues

---

**Version**: 1.0.0-beta.1  
**Release Date**: December 2024  
**Compatibility**: Android 6.0+, iOS 12.0+ 