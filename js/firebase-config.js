// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB27Qb1udzGe2nwLu8-55ExFMeJR-TeW48",
    authDomain: "study-dd515.firebaseapp.com",
    databaseURL: "https://study-dd515-default-rtdb.firebaseio.com",
    projectId: "study-dd515",
    storageBucket: "study-dd515.firebasestorage.app",
    messagingSenderId: "288649711011",
    appId: "1:288649711011:web:7213ad3fc5b6abdbed1e16"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const database = firebase.database();

// Export for use in other files
window.firebase = firebase;
window.auth = auth;
window.database = database;
