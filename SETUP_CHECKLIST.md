# LocalPulse Setup Checklist

## ✅ Phase 1: Environment Setup

- [ ] **Node.js & npm installed** (v18 or higher)
  ```bash
  node --version
  npm --version
  ```

- [ ] **Clone this repository**
  ```bash
  git clone <repository-url>
  cd localpulse
  ```

- [ ] **Install Expo CLI globally**
  ```bash
  npm install -g expo-cli
  ```

- [ ] **Install project dependencies**
  ```bash
  npm install
  cd functions
  npm install
  cd ..
  ```

- [ ] **Create environment files**
  ```bash
  cp .env.example .env
  cp functions/.env.example functions/.env
  ```

## ✅ Phase 2: Firebase Setup

- [ ] **Create Firebase Project**
  - Go to https://console.firebase.google.com
  - Click "Create Project"
  - Choose a name (e.g., "LocalPulse")
  - Accept defaults and create

- [ ] **Enable Authentication**
  - In Firebase Console → Authentication
  - Click "Get Started"
  - Enable "Anonymous" provider
  - Save and continue

- [ ] **Create Firestore Database**
  - In Firebase Console → Firestore Database
  - Click "Create Database"
  - Start in Production Mode
  - Choose region (default is fine)
  - Create

- [ ] **Set Firestore Security Rules**
  - Go to Firestore → Rules
  - Replace with rules from README.md
  - Click Publish

- [ ] **Create Cloud Storage Bucket**
  - In Firebase Console → Storage
  - Click "Get Started"
  - Use default location
  - Create

- [ ] **Copy Firebase Config**
  - In Firebase Console → Settings ⚙️ → General
  - Scroll to "Your apps" section
  - Click the web app (might need to add if not existing)
  - Copy the config object
  - Fill in `.env` with these values:
    ```
    EXPO_PUBLIC_FIREBASE_API_KEY
    EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
    EXPO_PUBLIC_FIREBASE_PROJECT_ID
    EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
    EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
    EXPO_PUBLIC_FIREBASE_APP_ID
    ```

## ✅ Phase 3: AI Provider Setup

Choose ONE of the following:

### **Option A: OpenAI (Recommended)**

- [ ] **Create OpenAI account**
  - Go to https://platform.openai.com
  - Sign up or log in

- [ ] **Generate API Key**
  - Go to https://platform.openai.com/api-keys
  - Click "Create new secret key"
  - Copy the key (you won't see it again!)

- [ ] **Add to environment files**
  ```env
  # In .env
  EXPO_PUBLIC_AI_PROVIDER=openai
  EXPO_PUBLIC_OPENAI_API_KEY=sk-...

  # In functions/.env
  AI_PROVIDER=openai
  OPENAI_API_KEY=sk-...
  ```

### **Option B: Grok**

- [ ] **Get Grok API Key**
  - Go to https://console.x.ai
  - Create API key

- [ ] **Add to environment files**
  ```env
  # In .env
  EXPO_PUBLIC_AI_PROVIDER=grok
  EXPO_PUBLIC_GROK_API_KEY=...

  # In functions/.env
  AI_PROVIDER=grok
  GROK_API_KEY=...
  ```

### **Option C: Claude**

- [ ] **Get Claude API Key**
  - Go to https://console.anthropic.com
  - Create API key

- [ ] **Add to environment files**
  ```env
  # In .env
  EXPO_PUBLIC_AI_PROVIDER=claude
  EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-...

  # In functions/.env
  AI_PROVIDER=claude
  CLAUDE_API_KEY=sk-ant-...
  ```

## ✅ Phase 4: Cloud Functions Deployment

- [ ] **Install Firebase CLI**
  ```bash
  npm install -g firebase-tools
  ```

- [ ] **Login to Firebase**
  ```bash
  firebase login
  ```

- [ ] **Set project ID**
  ```bash
  firebase use <your-firebase-project-id>
  ```

- [ ] **Deploy Cloud Functions**
  ```bash
  firebase deploy --only functions
  ```

- [ ] **Copy Cloud Function URL**
  - After deployment completes, you'll see output like:
    ```
    ✔  Deploy complete!
    Function URL (generateSummaryFn):
    https://us-central1-your-project-id.cloudfunctions.net
    ```
  - Copy this URL (without the function name at the end)
  - Add to `.env`:
    ```
    EXPO_PUBLIC_CLOUD_FUNCTIONS_URL=https://us-central1-your-project-id.cloudfunctions.net
    ```

## ✅ Phase 5: Mobile App Setup

- [ ] **Update Expo Configuration (Optional)**
  - Edit `app.json`
  - Update bundle ID and package name if you plan to publish

- [ ] **Test Environment Variables**
  ```bash
  # Verify all .env values are correct
  cat .env | grep EXPO_PUBLIC
  ```

- [ ] **Start Expo Development Server**
  ```bash
  npm start
  ```

- [ ] **Run on Device/Emulator**
  - **iOS**: Press `i` or scan QR code with Camera app
  - **Android**: Press `a` or scan QR code with Expo Go app

- [ ] **Test Location Permission**
  - When app starts, allow location permission
  - App should show your current location on map

- [ ] **Test Report Submission**
  - Tap "+" (Submit tab)
  - Write a test report
  - Choose a category
  - Submit
  - Check Firestore Console to verify report was created

- [ ] **Test Summary Generation**
  - Go back to Map tab
  - You should see your report counted
  - Summary should be generating (check Cloud Function logs)
  - View summary on map

## ✅ Phase 6: Publishing (Optional)

### **Build for Production**

```bash
# Setup EAS (Expo Application Services)
npm install -g eas-cli
eas login

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### **Deploy Updates**

```bash
eas update
```

## 🐛 Debugging

### **Cloud Function Logs**
```bash
firebase functions:log
```

### **Firestore Document Inspector**
- Go to Firebase Console → Firestore
- Click on "reports" collection
- View submitted documents

### **Firebase Authentication Status**
- Go to Firebase Console → Authentication
- See all authenticated users (anonymous sessions)

### **Check Environment Variables**
```bash
# Mobile app
cat .env | head -20

# Cloud Functions
cat functions/.env
```

## 📋 File Structure Reference

| File | Purpose |
|------|---------|
| `app.json` | Expo app metadata |
| `package.json` | App dependencies |
| `tsconfig.json` | TypeScript config |
| `babel.config.js` | Babel config for NativeWind |
| `tailwind.config.js` | Tailwind CSS config |
| `src/app/` | Expo Router screen entry points |
| `src/screens/` | Screen implementations |
| `src/components/` | Reusable UI components |
| `src/services/` | Firebase, location, API services |
| `src/store/` | Zustand state management |
| `src/hooks/` | Custom React hooks |
| `src/types/` | TypeScript type definitions |
| `src/utils/` | Constants and utilities |
| `functions/src/` | Cloud Functions code |
| `.env` | Mobile app environment variables |
| `functions/.env` | Cloud Functions environment variables |

## 💡 Quick Commands

```bash
# Start development
npm start

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Deploy Cloud Functions
firebase deploy --only functions

# View Cloud Function logs
firebase functions:log

# Test in emulator
firebase emulators:start --only functions

# Lint code
npm run lint

# TypeScript check
npx tsc --noEmit
```

## 🆘 Getting Help

- **Expo Documentation**: https://docs.expo.dev
- **Firebase Documentation**: https://firebase.google.com/docs
- **OpenAI API Docs**: https://platform.openai.com/docs
- **Grok API Docs**: https://docs.x.ai
- **Claude API Docs**: https://docs.anthropic.com

## ✨ You're All Set!

Once you complete all checkboxes above:

1. **Run the app**: `npm start`
2. **Submit a test report**: Use the "+" button
3. **View summary**: Check the Map tab
4. **Invite friends**: Share the experience

Enjoy! 🚀
