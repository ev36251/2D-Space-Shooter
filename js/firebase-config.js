// Firebase configuration
// INSTRUCTIONS: Replace this with your actual Firebase config from Firebase Console
// Get it from: Firebase Console > Project Settings > Your apps > Web app config

const firebaseConfig = {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let db = null;
let firebaseInitialized = false;

function initializeFirebase() {
    try {
        // Check if config is still using placeholder values
        if (firebaseConfig.apiKey === "YOUR_API_KEY_HERE") {
            console.warn('Firebase not configured. Using local leaderboard only.');
            return false;
        }

        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firebaseInitialized = true;
        console.log('Firebase initialized successfully!');
        return true;
    } catch (error) {
        console.error('Error initializing Firebase:', error);
        return false;
    }
}
