import { auth, db, googleProvider } from "./firebase-config.js";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithPopup, 
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, set, get, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const googleBtn = document.getElementById('google-login');

// Handle Email Login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log("Logged in:", userCredential.user);
            
            // Update last login in RTDB
            await update(ref(db, 'users/' + userCredential.user.uid), {
                lastLogin: new Date().toISOString()
            });

            alert("Login successful!");
            window.location.href = "index.html";
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        }
    });
}

// Handle Email Signup
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Set display name
            await updateProfile(user, { displayName: name });

            // Store user in RTDB
            await set(ref(db, 'users/' + user.uid), {
                username: name,
                email: email,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString()
            });

            alert("Account created successfully!");
            window.location.href = "index.html";
        } catch (error) {
            console.error(error);
            alert("Error: " + error.message);
        }
    });
}

// Handle Google Auth
if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user exists in RTDB
            const userRef = ref(db, 'users/' + user.uid);
            const snapshot = await get(userRef);

            if (!snapshot.exists()) {
                // New user via Google
                await set(userRef, {
                    username: user.displayName,
                    email: user.email,
                    createdAt: new Date().toISOString(),
                    lastLogin: new Date().toISOString(),
                    photoURL: user.photoURL
                });
            } else {
                // Existing user - update last login
                await update(userRef, {
                    lastLogin: new Date().toISOString()
                });
            }

            alert("Logged in with Google!");
            window.location.href = "index.html";
        } catch (error) {
            console.error(error);
            alert("Google Auth Error: " + error.message);
        }
    });
}
