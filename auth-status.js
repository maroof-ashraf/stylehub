import { auth } from "./firebase-config.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const loginToggle = document.getElementById('login-toggle');
const navMenu = document.getElementById('nav-menu');

onAuthStateChanged(auth, (user) => {
    // Remove existing "My Orders" link if it exists
    const existingOrdersLink = document.getElementById('my-orders-link');
    if (existingOrdersLink) existingOrdersLink.remove();

    if (user) {
        // User is signed in
        const displayName = user.displayName || user.email.split('@')[0];
        if (loginToggle) {
            loginToggle.innerText = `Logout (${displayName})`;
            loginToggle.href = "#";
            loginToggle.onclick = (e) => {
                e.preventDefault();
                signOut(auth).then(() => {
                    alert("Logged out successfully");
                    window.location.href = "index.html";
                });
            };
        }

        // Add "My Orders" link
        const ordersLink = document.createElement('a');
        ordersLink.href = "my-orders.html";
        ordersLink.innerText = "My Orders";
        ordersLink.id = "my-orders-link";
        
        // Insert before cart toggle or at the end
        const cartToggle = document.getElementById('cart-toggle');
        if (cartToggle && navMenu) {
            navMenu.insertBefore(ordersLink, cartToggle);
        } else if (navMenu) {
            navMenu.appendChild(ordersLink);
        }
    } else {
        // User is signed out
        if (loginToggle) {
            loginToggle.innerText = "Login";
            loginToggle.href = "login.html";
            loginToggle.onclick = null;
        }
    }
});
