import { auth, db, googleProvider } from "./firebase-config.js";
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signInWithRedirect, 
    getRedirectResult,
    updateProfile 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, set, get, update } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const googleBtn = document.getElementById('google-login');

// Check for redirect result on page load
getRedirectResult(auth)
    .then((result) => {
        if (result) {
            handleUserAuth(result.user);
        }
    })
    .catch((error) => {
        console.error("Redirect Auth Error:", error);
        alert("Auth Error: " + error.message);
    });

async function handleUserAuth(user) {
    try {
        // Check if user exists in RTDB
        const userRef = ref(db, 'users/' + user.uid);
        const snapshot = await get(userRef);

        if (!snapshot.exists()) {
            // New user
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

        alert("Logged in successfully!");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error handling user data:", error);
        alert("Error syncing user data: " + error.message);
    }
}

// Handle Email Login
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            handleUserAuth(userCredential.user);
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
            await updateProfile(user, { displayName: name });
            handleUserAuth(user);
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
            await signInWithRedirect(auth, googleProvider);
        } catch (error) {
            console.error(error);
            alert("Google Auth Error: " + error.message);
        }
    });
}
