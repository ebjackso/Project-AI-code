# LocalPulse Architecture Guide

## 🏗 System Overview

LocalPulse is built with a **client-server architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Mobile App (React Native + Expo)          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Screens      Components      Hooks      Store      │   │
│  │  (UI Layer)   (Reusable UI)  (Logic)    (State)    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Services (Firebase, Location, API)                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓↑
                   [Network Requests]
                           ↓↑
┌─────────────────────────────────────────────────────────────┐
│              Firebase Infrastructure                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Firestore    │  │   Storage    │  │   Auth       │     │
│  │  (Database)  │  │  (Photos)    │  │ (Anonymous)  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ↓↑
                   [Cloud Functions]
                           ↓↑
┌─────────────────────────────────────────────────────────────┐
│           AI Providers (OpenAI, Grok, Claude)               │
│  - Summarization Engine                                     │
│  - Content Moderation                                       │
│  - Rate Limiting & Validation                               │
└─────────────────────────────────────────────────────────────┘
```

## 📂 Detailed File Structure

### **Root Configuration Files**

| File | Purpose |
|------|---------|
| `package.json` | Mobile app dependencies & scripts |
| `app.json` | Expo app metadata (name, icons, permissions) |
| `tsconfig.json` | TypeScript compiler settings |
| `babel.config.js` | Babel configuration (NativeWind support) |
| `tailwind.config.js` | Tailwind CSS theme configuration |
| `firebase.json` | Firebase CLI configuration |
| `.env.example` | Example environment variables |
| `.gitignore` | Git ignore rules |

### **Mobile App Source (`src/`)**

#### **App Router (`src/app/`)**
Entry points for Expo Router navigation:

```
src/app/
├── _layout.tsx           # Root layout with app initialization
└── (tabs)/              # Tab-based navigation
    ├── _layout.tsx      # Tabs configuration
    ├── index.tsx        # Map screen entry
    ├── submit.tsx       # Submit screen entry
    ├── my-reports.tsx   # My Reports screen entry
    └── alerts.tsx       # Alerts screen entry
```

**How it works:**
1. `_layout.tsx` initializes Firebase, auth, location, and shows onboarding
2. `(tabs)/_layout.tsx` configures the 4 bottom tabs
3. Each `*.tsx` file imports from `src/screens/`

#### **Screens (`src/screens/`)**
Full-screen implementations:

- **MapScreen.tsx** – Map view with summary display
  - Shows interactive map
  - Displays AI summary card
  - Handles map interaction (zoom, pan, tap)
  - Shows/hides report detail modal

- **SubmitScreen.tsx** – Report submission form
  - Large text area for report text
  - Category selection
  - Photo picker
  - Location display
  - Submit button with validation

- **MyReportsScreen.tsx** – User's submitted reports
  - List of past submissions
  - Delete functionality
  - Expandable report details
  - Timestamp display

- **AlertsScreen.tsx** – Notification settings
  - Toggle notifications on/off
  - Notification frequency settings
  - Radius preferences
  - Privacy information

- **OnboardingScreen.tsx** – First-run tutorial
  - 3 slides explaining the app
  - Skip/Next navigation
  - Onboarding completion flag

#### **Components (`src/components/`)**
Reusable UI elements:

- **UI.tsx** – Basic components
  - `Text` – Styled text with variants (h1, h2, body, caption, etc.)
  - `Button` – Pressable button with variants (primary, secondary, danger, outline)
  - `Input` – Text input field
  - `Badge` – Small label/tag component

- **Layout.tsx** – Layout helpers
  - `Container` – Full screen wrapper
  - `SafeContainer` – Container respecting safe areas
  - `Card` – Bordered box container
  - `Row` / `Column` – Flex containers
  - `Spacer` – Fixed height spacing
  - `Divider` – Horizontal line

- **SummaryCard.tsx** – AI summary display
  - Shows headline, bullets, report count
  - Expandable reports under each bullet
  - Refresh button
  - `ReportDetailModal` for showing full bullet details

- **ReportForm.tsx** – Report submission form
  - Text input
  - Category selector
  - Photo picker
  - Location display
  - `FloatingActionButton` – Floating "+" button

#### **Services (`src/services/`)**
Backend communication and utilities:

- **firebase.ts** – Firebase operations
  - `initializeAuth()` – Anonymous auth setup
  - `submitReport()` – Save report to Firestore
  - `getUserReports()` – Fetch user's reports
  - `updateReport()` / `deleteReport()` – Edit/delete reports
  - `uploadReportPhoto()` – Upload photo to Storage
  - `getReportsInRadius()` – Fetch reports within radius
  - `saveSummary()` / `getSummary()` – Cache summaries

- **location.ts** – Location services
  - `requestLocationPermission()` – Ask for permission
  - `getCurrentLocation()` – Get current position
  - `geocodeAddress()` – Convert address to coordinates
  - `reverseGeocode()` – Convert coordinates to address
  - `watchLocation()` – Subscribe to location changes

- **api.ts** – Cloud Functions API
  - `generateSummary()` – Request AI summary
  - `moderateReport()` – Check content moderation
  - `checkRateLimit()` – Verify rate limit
  - `reportIncident()` – Flag harmful content
  - `healthCheck()` – Check service status

#### **State Management (`src/store/`)**

- **index.ts** – Zustand store
  - Authentication state (userId)
  - User data and preferences
  - Current & map location
  - Map settings (radius, timeRange)
  - Reports list
  - Summary & AI state
  - UI state (form visibility, dark mode)
  - Offline queue for reports
  - Persistence to AsyncStorage

**Key functions:**
- `useAppStore()` – Hook to access store
- `initializeStore()` – Restore from AsyncStorage

#### **Hooks (`src/hooks/`)**
Custom React hooks:

- `useLocation()` – Manage device location
- `useSummary()` – Fetch and cache summary
- `useAutoRefresh()` – Auto-refresh on interval
- `useRateLimit()` – Check submission limits
- `useDebounce()` – Debounce callback
- `usePullToRefresh()` – Pull-to-refresh state
- `useOfflineQueue()` – Queue reports when offline

#### **Types (`src/types/`)**

- **index.ts** – TypeScript interfaces
  - `Location` – GPS coordinates
  - `Report` – Community report
  - `Summary` – AI-generated summary
  - `SummaryBullet` – Summary bullet point
  - `User` – User preferences
  - `ReportCategory` – Category types

#### **Utilities (`src/utils/`)**

- **constants.ts**
  - `REPORT_CATEGORIES` – Available categories
  - `RADIUS_OPTIONS` – Map radius choices
  - `COLORS` – Dark mode color palette
  - `ONBOARDING_SLIDES` – Tutorial content
  - Helper functions (validation, distance calculation, time formatting)

### **Cloud Functions (`functions/`)**

Backend logic for summarization and moderation:

```
functions/
├── src/
│   ├── index.ts       # Cloud Function entry points
│   ├── summarizer.ts  # AI summarization logic
│   ├── moderation.ts  # Content moderation
│   ├── types.ts       # TypeScript types
├── package.json
└── tsconfig.json
```

#### **index.ts** – HTTP Cloud Functions

- **generateSummaryFn** – POST `/generateSummary`
  - Input: latitude, longitude, radiusKm, timeRangeHours
  - Output: AI-generated summary
  - Process:
    1. Fetch reports in radius from Firestore
    2. Call Anthropic/Grok/OpenAI with prompt
    3. Parse response into Summary object
    4. Cache in Firestore
    5. Return to client

- **moderateReportFn** – POST `/moderateReport`
  - Input: report text
  - Output: approved boolean + reason
  - Uses OpenAI moderation API

- **checkRateLimitFn** – POST `/checkRateLimit`
  - Input: userId
  - Output: allowed boolean
  - Checks reports/hour and reports/day limits

- **reportIncidentFn** – POST `/reportIncident`
  - Input: reportId, reason
  - Output: success boolean
  - Saves incident to Firestore for review

- **health** – GET `/health`
  - Simple health check endpoint

#### **summarizer.ts** – AI Integration

- `generateSummary()` – Main function
  - Routes to OpenAI, Grok, or Claude
  - Calls appropriate API
  - Parses response
  - Falls back to basic summary if AI fails

- `buildPrompt()` – Create AI prompt
  - Formats reports into readable prompt
  - Instructs AI to create headline + bullets

- `parseSummaryResponse()` – Parse AI response
  - Extracts headline (first line)
  - Extracts bullets (lines with `-` or `•`)
  - Maps reports to bullets

- Fallback functions for when AI not available

#### **moderation.ts** – Content Safety

- `moderateReport()` – Main moderation check
  - Uses OpenAI moderation API
  - Returns approved/flagged status
  - Falls back to regex patterns if API fails

- `analyzeContentSafety()` – Detailed analysis
  - Returns scores for different violation types
  - Used for logging/analytics

## 🔄 Data Flow Examples

### **Submitting a Report**

```
User taps "Submit Report"
    ↓
SubmitScreen shown with form
    ↓
User enters text, selects category, uploads photo
    ↓
User taps "Submit Report" button
    ↓
validateReports(text) checks length
    ↓
getCurrentLocation() gets device location
    ↓
uploadReportPhoto() uploads to Firebase Storage (optional)
    ↓
submitReport() saves to Firestore collection:reports
    ↓
Success message shown
    ↓
useAppStore.addReport() adds to local state
    ↓
User sees report in "My Reports" tab
    ↓
Next time summary generates, this report is included
```

### **Generating a Summary**

```
User opens Map tab or taps "Refresh Summary"
    ↓
generateSummary({ latitude, longitude, radiusKm, timeRangeHours })
    ↓
Cloud Function triggered: generateSummaryFn
    ↓
fetchReportsInRadius() grabs reports from Firestore
    ↓
AI provider called with prompt + reports
    ↓
OpenAI/Grok/Claude returns summary text
    ↓
parseSummaryResponse() creates Summary object with:
  - headline (one sentence)
  - bullets (3-6 key points)
  - reportCount
  - generatedAt timestamp
    ↓
saveSummary() caches in Firestore
    ↓
Response returned to mobile app
    ↓
useAppStore.setSummary() updates state
    ↓
SummaryCard component re-renders with new data
    ↓
User sees updated summary on map
```

### **Viewing Report Details**

```
User taps a bullet point in summary
    ↓
SummaryCard.onBulletPress() handler called
    ↓
useAppStore.setSelectedBulletIndex(index)
    ↓
ReportDetailModal becomes visible
    ↓
Modal displays:
  - Full bullet text
  - Count of contributing reports
  - Anonymity note
    ↓
User taps "Close"
    ↓
Modal hides
```

## 🔐 Security Considerations

### **Client-Side**
- No sensitive keys exposed
- All API calls go through environment variables
- Location only used for filtering, not tracked

### **Server-Side (Cloud Functions)**
- API keys kept in environment, not in code
- CORS enabled for mobile app only
- Rate limiting on all endpoints
- Input validation on all parameters
- Content moderation on all reports

### **Firebase Rules**
```
- Reports: Public read, anyone can write (rate-limited server-side)
- Users: Private, read/write own only
- Summaries: Public read-only
- Incidents: Write-only (for abuse reporting)
```

## 🚀 Performance Optimization

### **Mobile App**
- **Firestore caching** – Summaries cached locally, reduces API calls
- **Lazy loading** – Reports fetched on-demand
- **Memoization** – Component memo prevents re-renders
- **Zustand store** – Minimal re-renders of subscribers only
- **Image optimization** – Photos compressed to 0.8 quality

### **Cloud Functions**
- **Cold start optimization** – Lightweight dependencies
- **Parallel data fetches** – Firebase queries run in parallel
- **Response caching** – Summaries cached in Firestore
- **Fallbacks** – Works even if AI API is slow/down

### **Firestore**
- **Composite indexes** – Set up for reports + timeRange queries
- **Batched writes** – Photos + metadata in one transaction
- **TTL delete** – Automatic report deletion after 24h (with extension)

## 🧪 Testing Strategy

### **Unit Tests** (TODO)
- Test validation functions in `utils/constants.ts`
- Test distance calculation
- Test data parsing

### **Integration Tests** (TODO)
- Test Firebase operations with emulator
- Test Cloud Function logic locally
- Test API error handling

### **Manual Testing Checklist**
1. ✓ Report submission
2. ✓ Location permission
3. ✓ Summary generation
4. ✓ Map interaction
5. ✓ Offline mode
6. ✓ Rate limiting
7. ✓ Content moderation

## 📊 Monitoring & Debugging

### **Cloud Function Logs**
```bash
firebase functions:log
```

### **Firestore Inspector**
- Check document structure
- Verify timestamps
- Monitor collection size

### **Expo Debugging**
- Open Expo dev tools (press `j` in CLI)
- View console logs
- Network inspector

### **Performance Monitoring**
- Firebase Performance SDK (planned)
- Sentry error tracking (planned)

---

**This architecture is designed to be:**
- ✅ Scalable – Can handle 1000+ concurrent users
- ✅ Maintainable – Clear separation of concerns
- ✅ Extensible – Easy to add new features
- ✅ Secure – Follows Firebase best practices
