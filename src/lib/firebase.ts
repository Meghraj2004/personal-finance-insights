
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB4y4-QY9FvI6-eF_Dnc0116b-HL2s72so",
  authDomain: "financetracker-de651.firebaseapp.com",
  projectId: "financetracker-de651",
  storageBucket: "financetracker-de651.firebasestorage.app",
  messagingSenderId: "144119288153",
  appId: "1:144119288153:web:9cc969b2d47685df057c48",
  measurementId: "G-V8DR2VY87T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics may not work in all environments
let analytics;
try {
  analytics = getAnalytics(app);
} catch (error) {
  console.log("Analytics not available in this environment");
}

export { app, analytics };
