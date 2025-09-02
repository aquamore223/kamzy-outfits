// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

// 🔥 Firebase config for Kamzy Outfits
const firebaseConfig = {
  apiKey: "AIzaSyD-EXAMPLE-rV8Y4abc1234567zzzzzzz",
  authDomain: "kamzy-outfits.firebaseapp.com",
  projectId: "kamzy-outfits",
  storageBucket: "kamzy-outfits.appspot.com",
  messagingSenderId: "1071234567890",
  appId: "1:1071234567890:web:abc123def456gh789ijk",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firestore
const db = getFirestore(app);

export { db };
