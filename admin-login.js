import { auth, db, googleProvider } from "./firebase-config.js";
import { 
    signInWithEmailAndPassword, 
    signInWithRedirect, 
    getRedirectResult 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const loginForm = document.getElementById('admin-login-form');
const googleBtn = document.getElementById('google-login');

// Handle Redirect Result
getRedirectResult(auth).then(async (result) => {
    if (result) {
        await verifyAdmin(result.user);
    }
});

async function verifyAdmin(user) {
    try {
        // Check if user is in the admins node
        const adminRef = ref(db, 'admins/' + user.uid);
        const snapshot = await get(adminRef);
        
        // Also check if it's the hardcoded super admin
        const isSuperAdmin = user.uid === 'mJrjXJbt2DfLzzKZt1clJYh12M92';

        if (isSuperAdmin || (snapshot.exists() && snapshot.val() === true)) {
            alert("Admin Access Granted");
            window.location.href = "admin.html";
        } else {
            alert("Access Denied: You do not have admin privileges.");
            // Log out unauthorized user from admin session
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("Verification error:", error);
        alert("Error verifying admin status: " + error.message);
    }
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await verifyAdmin(userCredential.user);
        } catch (error) {
            console.error(error);
            alert("Login Failed: " + error.message);
        }
    });
}

if (googleBtn) {
    googleBtn.addEventListener('click', () => {
        signInWithRedirect(auth, googleProvider);
    });
}
