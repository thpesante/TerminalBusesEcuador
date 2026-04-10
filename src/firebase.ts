import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAzFzD0wskerpaRhObuRTKlJbEQ8rz3fk0",
  authDomain: "movu-5b601.firebaseapp.com",
  databaseURL: "https://movu-5b601-default-rtdb.firebaseio.com",
  projectId: "movu-5b601",
  storageBucket: "movu-5b601.firebasestorage.app",
  messagingSenderId: "493011884279",
  appId: "1:493011884279:web:97e4c757697460ca7ddbf2",
  measurementId: "G-SVFMWK0Z3J"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
