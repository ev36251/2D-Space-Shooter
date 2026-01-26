# Firebase Global Leaderboard Setup Guide

Follow these steps to enable the global leaderboard for Cosmic Defender.

## Step 1: Create Firebase Project

1. Go to **https://firebase.google.com/**
2. Click **"Get Started"** (sign in with Google account)
3. Click **"Add project"**
4. Enter project name: **"Cosmic Defender"**
5. Disable Google Analytics (not needed)
6. Click **"Create project"**
7. Wait for setup to complete, then click **"Continue"**

## Step 2: Set Up Firestore Database

1. In the Firebase Console, click **"Firestore Database"** in the left sidebar
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose your location (select closest to your users)
5. Click **"Enable"**

## Step 3: Configure Security Rules

1. In Firestore Database, click the **"Rules"** tab
2. Replace the default rules with this:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Leaderboard collection rules
    match /leaderboard/{document} {
      // Anyone can read the leaderboard
      allow read: if true;

      // Allow writes with valid data
      allow create: if request.resource.data.keys().hasAll(['name', 'score', 'date', 'timestamp'])
                    && request.resource.data.name is string
                    && request.resource.data.name.size() > 0
                    && request.resource.data.name.size() <= 15
                    && request.resource.data.score is int
                    && request.resource.data.score >= 0
                    && request.resource.data.score <= 10000000
                    && request.resource.data.timestamp is int;

      // Prevent updates and deletes (leaderboard entries are immutable)
      allow update, delete: if false;
    }
  }
}
```

3. Click **"Publish"**

## Step 4: Get Your Firebase Config

1. Click the **gear icon** ⚙️ next to "Project Overview"
2. Click **"Project settings"**
3. Scroll down to **"Your apps"**
4. Click the **web icon** `</>`
5. Enter app nickname: **"Cosmic Defender Web"**
6. Click **"Register app"**
7. **Copy the `firebaseConfig` object** (it looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

## Step 5: Update Your Config File

1. Open **`js/firebase-config.js`**
2. Replace the placeholder config with your actual Firebase config
3. Save the file

**Before:**
```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    // ...
};
```

**After (with your actual values):**
```javascript
const firebaseConfig = {
    apiKey: "AIzaSyC...",  // Your actual API key
    authDomain: "cosmic-defender-12345.firebaseapp.com",
    projectId: "cosmic-defender-12345",
    storageBucket: "cosmic-defender-12345.appspot.com",
    messagingSenderId: "987654321",
    appId: "1:987654321:web:abc123def456"
};
```

## Step 6: Test Locally

1. Open **`index.html`** in your browser
2. Play the game and get a score
3. Open browser console (F12 or Cmd+Option+I)
4. Look for: **"Firebase initialized successfully!"**
5. Check Firestore Database in Firebase Console to see your score!

## Step 7: Deploy

1. Commit and push to GitHub:
```bash
git add .
git commit -m "Add Firebase global leaderboard"
git push origin main
```

2. Wait 1-2 minutes for GitHub Pages to update
3. Visit your game URL: **https://ev36251.github.io/2D-Space-Shooter/**

## Verification

✅ **Firebase working if you see:**
- Console message: "Firebase initialized successfully!"
- Console message: "Score added to Firebase leaderboard"
- Scores appear in Firebase Console > Firestore Database

❌ **Using local leaderboard if you see:**
- Console warning: "Firebase not configured. Using local leaderboard only."

## Security Notes

**Your API key is safe to expose publicly!**
- Firebase API keys are meant to be public
- Security is controlled by Firestore Rules (Step 3)
- Our rules only allow:
  - Reading leaderboard entries
  - Creating valid score entries (15 char names, reasonable scores)
  - No updates or deletes

## Cost

Firebase free tier includes:
- **50,000 reads/day** (plenty for a game)
- **20,000 writes/day**
- **1 GiB storage**

Your game will stay **FREE** unless you get massive traffic (thousands of players daily).

## Troubleshooting

**"Firebase not configured" warning**
- Make sure you replaced ALL placeholder values in `firebase-config.js`
- Check that `apiKey !== "YOUR_API_KEY_HERE"`

**Scores not appearing**
- Check browser console for errors
- Verify Firestore rules are published
- Make sure database location matches your config

**"Permission denied" errors**
- Double-check Firestore security rules (Step 3)
- Ensure rules allow `create: if true` for testing
- Check Firebase Console > Firestore > Rules tab

Need help? Check the Firebase Console for detailed error messages!
