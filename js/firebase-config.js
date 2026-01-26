// Firebase configuration
// INSTRUCTIONS: Replace this with your actual Firebase config from Firebase Console
// Get it from: Firebase Console > Project Settings > Your apps > Web app config

const firebaseConfig = {
  apiKey: "AIzaSyCbCeTCmfT3Mjo9qLnQK916vnkpZXuht_Q",
  authDomain: "cosmic-defender-d5ccb.firebaseapp.com",
  projectId: "cosmic-defender-d5ccb",
  storageBucket: "cosmic-defender-d5ccb.firebasestorage.app",
  messagingSenderId: "458112972055",
  appId: "1:458112972055:web:fed060d8063683c1e1f352"
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
