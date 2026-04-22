import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDzPIcZLLMxhQF2VgUWkYmFZEqdyXrBmu4",
  authDomain: "stylehub-9929b.firebaseapp.com",
  databaseURL: "https://stylehub-9929b-default-rtdb.firebaseio.com",
  projectId: "stylehub-9929b",
  storageBucket: "stylehub-9929b.firebasestorage.app",
  messagingSenderId: "51568790450",
  appId: "1:51568790450:web:27244bf3b9d3eeaa7372ab",
  measurementId: "G-S53WC82ZLP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const analytics = getAnalytics(app);

const googleProvider = new GoogleAuthProvider();

export { auth, db, googleProvider };
