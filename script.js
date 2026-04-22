import { db, auth } from "./firebase-config.js";
import { ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

let products = [];
let cart = [];
let currentUser = null;

// DOM Elements
const mensProductGrid = document.getElementById('mens-product-grid');
const womensProductGrid = document.getElementById('womens-product-grid');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartTotal = document.getElementById('cart-total');

// Auth State Listener
onAuthStateChanged(auth, (user) => {
    currentUser = user;
});

// Fetch Products from RTDB
onValue(ref(db, 'products'), (snapshot) => {
    const data = snapshot.val();
    if (data) {
        products = Object.entries(data).map(([id, val]) => ({ ...val, firebaseId: id }));
    } else {
        products = [];
    }
    renderProducts();
});

// Render Products
function renderProducts() {
    if (mensProductGrid) mensProductGrid.innerHTML = '';
    if (womensProductGrid) womensProductGrid.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-price">₹${product.price.toFixed(2)}</p>
                <button class="btn add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
            </div>
        `;
        
        if (product.category === 'men') {
            if (mensProductGrid) mensProductGrid.appendChild(card);
        } else if (product.category === 'women') {
            if (womensProductGrid) womensProductGrid.appendChild(card);
        }
    });

    // Add event listeners to buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.onclick = () => addToCart(parseInt(btn.getAttribute('data-id')));
    });
}

// Add to Cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const cartItem = cart.find(item => item.id === productId);

    if (cartItem) {
        cartItem.quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCart();
    
    // Toast notification would be better, but alert for now
    console.log(`${product.name} added to cart!`);
}

// Update Cart Display
function updateCart() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.innerText = totalItems;

    if (!cartItemsContainer) return;
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty.</p>';
        if (cartTotal) cartTotal.innerText = '0.00';
        return;
    }

    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-details">
                <h4>${item.name}</h4>
                <p>₹${item.price.toFixed(2)} <span style="color:#64748b;font-size:0.9em;">x ${item.quantity}</span></p>
            </div>
            <div class="cart-item-actions">
                <button class="btn-remove" data-id="${item.id}">Remove</button>
            </div>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });

    // Add remove listeners
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.onclick = () => removeFromCart(parseInt(btn.getAttribute('data-id')));
    });

    if (cartTotal) cartTotal.innerText = total.toFixed(2);
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Checkout button handler
const checkoutBtn = document.getElementById('checkout-btn');
if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
        if (!currentUser) {
            alert('Please login to place an order.');
            window.location.href = 'login.html';
            return;
        }

        if (cart.length > 0) {
            const order = {
                id: Date.now(),
                userId: currentUser.uid,
                userEmail: currentUser.email,
                date: new Date().toLocaleString(),
                items: cart.map(item => `${item.name} (x${item.quantity})`).join(', '),
                total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
            };

            push(ref(db, 'orders'), order).then(() => {
                alert('Thank you for your purchase! Your order has been placed.');
                cart = [];
                updateCart();
            });
        } else {
            alert('Your cart is empty.');
        }
    });
}

// Mobile Menu Toggle
const hamburgerBtn = document.getElementById('hamburger-btn');
const navMenu = document.getElementById('nav-menu');

if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    document.querySelectorAll('#nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            hamburgerBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Export for window if needed (not strictly necessary with listeners but good for debugging)
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
