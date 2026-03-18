# LocalPulse 📍

A hyper-local, real-time community intelligence platform where users submit reports about what's happening in their area, and AI generates concise summaries for everyone.

## 🎯 Overview

LocalPulse is a mobile app that:
- **Aggregates community reports** (traffic, safety, events, weather, etc.) from users within a defined radius
- **Generates AI summaries** that show "what's happening right now" in your area
- **Operates anonymously** by default—no accounts required
- **Updates in real-time** with automatic refresh every 2 minutes
- **Supports offline work** with queued reports and cached summaries

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project (free tier works)
- OpenAI API key (or Grok / Claude)
- Expo CLI: `npm install -g expo-cli`

### 1. Clone & Setup

```bash
# Clone the repository
git clone <repo-url>
cd localpulse

# Install dependencies
npm install
cd functions && npm install && cd ..

# Create .env file
cp .env.example .env
cp functions/.env.example functions/.env
```

### 2. Configure Firebase

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project or use an existing one
3. **Copy credentials** to `.env`:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=xxx
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=xxx
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
   EXPO_PUBLIC_FIREBASE_APP_ID=xxx
   ```

4. **Enable services** in Firebase Console:
   - Authentication: Enable Anonymous sign-in
   - Firestore Database: Create database (production mode)
   - Storage: Create storage bucket
   - Cloud Functions: Enable

### 3. Configure AI Provider

The app supports **OpenAI**, **Grok**, or **Claude**:

**OpenAI (Recommended):**
```env
EXPO_PUBLIC_AI_PROVIDER=openai
EXPO_PUBLIC_OPENAI_API_KEY=sk-...
```

**Grok:**
```env
EXPO_PUBLIC_AI_PROVIDER=grok
EXPO_PUBLIC_GROK_API_KEY=...
```

**Claude:**
```env
EXPO_PUBLIC_AI_PROVIDER=claude
EXPO_PUBLIC_CLAUDE_API_KEY=sk-ant-...
```

Add the same key to `functions/.env`.

### 4. Deploy Cloud Functions

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only functions
```

Copy the generated Cloud Function URL to `.env`:
```env
EXPO_PUBLIC_CLOUD_FUNCTIONS_URL=https://your-region-your-project.cloudfunctions.net
```

### 5. Set Up Firestore Rules

In Firebase Console → Firestore → Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{document=**} { allow read, write: if true; }
    match /users/{userId} { allow read, write: if request.auth.uid == userId; }
    match /summaries/{document=**} { allow read: if true; }
    match /incidents/{document=**} { allow write: if true; }
  }
}
```

### 6. Run the App

```bash
npm start
# Press 'i' for iOS or 'a' for Android
```

## 📁 Project Structure

```
src/
├── app/               # Expo Router
├── screens/          # Screen components
├── components/       # Reusable UI
├── services/         # Firebase, location, API
├── hooks/            # Custom hooks
├── store/            # Zustand state
├── types/            # TypeScript types
└── utils/            # Constants, helpers

functions/src/
├── index.ts         # Cloud Functions
├── summarizer.ts    # AI summarization
├── moderation.ts    # Content moderation
└── types.ts         # TypeScript types
```

## 🔑 Core Features

### 1. Map Screen (Home)
- Interactive map with location marker
- Adjustable search radius (1, 3, 5, 10 km)
- AI-generated summary card at bottom
- Tap bullets to see contributing reports
- Auto-refreshes every 2 minutes

### 2. Submit Report
- Text area (10-500 characters)
- Category selection (Traffic, Safety, Event, Weather, Lost & Found, Other)
- Optional photo attachment
- Anonymous submission
- Real-time feedback

### 3. My Reports
- View submitted reports
- Edit/delete functionality
- Expandable details

### 4. Alerts
- Toggle push notifications
- Configure notification settings
- Set radius preferences

### 5. Onboarding
- 3-slide tutorial
- Explains Report → Summary flow

## 🤖 AI Summarization

**Prompt Template:**
```
Analyze these [N] community reports and generate a concise summary:

[List of reports]

Provide:
1. A one-sentence headline
2. 3–6 bullet points of key events/trends
3. Mention approximate counts of similar reports

Keep language clear and objective.
```

## 🔄 Switching AI Providers

1. Update `.env` and `functions/.env`:
   ```env
   EXPO_PUBLIC_AI_PROVIDER=grok
   EXPO_PUBLIC_GROK_API_KEY=your_key
   ```

2. Deploy Cloud Functions:
   ```bash
   firebase deploy --only functions
   ```

The `summarizer.ts` automatically routes to the correct provider.

## 🔒 Privacy & Security

- Anonymous by default (no account required)
- Location never stored permanently
- All reports anonymized
- OpenAI content moderation
- Rate limiting: 10 reports/hour, 50/day
- Reports auto-expire after 24 hours

## 📊 Firestore Collections

**reports** – Community reports (text, location, category, photo, timestamp)
**summaries** – AI-generated summaries (headline, bullets, counts)
**users** – User preferences and onboarding status
**incidents** – Flagged reports for review

## 🚀 Deployment

```bash
# Mobile
eas build --platform ios
eas build --platform android

# Cloud Functions
firebase deploy --only functions
```

## 🐛 Troubleshooting

**Problem: No summaries generating**
- Check `firebase functions:log`
- Verify AI API key in `functions/.env`
- Ensure Firestore has reports with timestamps

**Problem: Location permissions denied**
- Settings → LocalPulse → Location → "Always"

**Problem: Firebase auth fails**
- Enable Anonymous sign-in in Firebase Console
- Check `EXPO_PUBLIC_FIREBASE_PROJECT_ID`

**Problem: Slow responses (>3s)**
- Cloud Functions cold start takes 10–30s on first call
- Subsequent calls are fast
- Use Firebase's "Always On" feature (paid) for consistent performance

## 📈 Performance Targets

- Map load: <1.5 seconds
- Summary generation: <3 seconds
- Report submission: <1 second
- Auto-refresh: Every 2 minutes

## 📄 License

MIT

---

**LocalPulse** – Know what's happening, right now, in your community. 🌍