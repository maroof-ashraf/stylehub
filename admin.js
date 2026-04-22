import { db, auth, googleProvider } from "./firebase-config.js";
import { ref, onValue, set, push, remove, update, get } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { onAuthStateChanged, signInWithEmailAndPassword, signInWithRedirect, getRedirectResult, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// DOM Elements - Dashboard
const adminProductList = document.getElementById('admin-product-list');
const adminOrderList = document.getElementById('admin-order-list');
const adminUserList = document.getElementById('admin-user-list');
const addProductForm = document.getElementById('add-product-form');
const productsStat = document.getElementById('stat-products');
const ordersStat = document.getElementById('stat-orders');
const usersStat = document.getElementById('stat-users');

// DOM Elements - Auth/UI
const loginSection = document.getElementById('admin-login-section');
const mainHeader = document.getElementById('main-admin-header');
const mainContainer = document.getElementById('main-admin-container');
const loginForm = document.getElementById('admin-login-form');
const googleBtn = document.getElementById('google-login');
const logoutBtn = document.getElementById('admin-logout');

const defaultProducts = [
    { id: 1, name: "Classic White T-Shirt", price: 29.99, image: "images/tshirt.png", category: "men" },
    { id: 2, name: "Premium Raw Denim Jeans", price: 89.99, image: "images/jeans.png", category: "men" },
    { id: 3, name: "Classic Leather Jacket", price: 199.99, image: "images/jacket.png", category: "men" },
    { id: 4, name: "Modern Fashion Sneakers", price: 119.99, image: "images/sneakers.png", category: "women" },
    { id: 5, name: "Elegant Summer Dress", price: 79.99, image: "images/dress.png", category: "women" },
    { id: 6, name: "Stylish Gold Sunglasses", price: 149.99, image: "images/sunglasses.png", category: "women" }
];

// --- AUTH LOGIC ---

onAuthStateChanged(auth, async (user) => {
    if (user) {
        await verifyAdmin(user);
    } else {
        showLogin();
    }
});

// Check for redirect result on page load
getRedirectResult(auth).then(async (result) => {
    if (result) {
        await verifyAdmin(result.user);
    }
}).catch(err => console.error("Redirect Error:", err));

async function verifyAdmin(user) {
    try {
        const adminRef = ref(db, 'admins/' + user.uid);
        const snapshot = await get(adminRef);
        const isSuperAdmin = user.uid === 'mJrjXJbt2DfLzzKZt1clJYh12M92';

        if (isSuperAdmin || (snapshot.exists() && snapshot.val() === true)) {
            showDashboard();
            initListeners();
        } else {
            // User is logged in but NOT an admin
            signOut(auth).then(() => {
                alert("Access Denied: You do not have admin privileges. Please login with an admin account.");
                showLogin();
            });
        }
    } catch (error) {
        console.error("Verification error:", error);
        showLogin();
    }
}

function showLogin() {
    document.body.classList.remove('admin-authorized');
}

function showDashboard() {
    document.body.classList.add('admin-authorized');
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            alert("Login Failed: " + error.message);
        }
    });
}

if (googleBtn) {
    googleBtn.addEventListener('click', () => {
        signInWithRedirect(auth, googleProvider);
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signOut(auth).then(() => {
            window.location.reload();
        });
    });
}

// --- DASHBOARD LOGIC ---

function initListeners() {
    onValue(ref(db, 'products'), (snapshot) => {
        const data = snapshot.val();
        if (!data) {
            defaultProducts.forEach(p => push(ref(db, 'products'), p));
            return;
        }
        const products = Object.entries(data).map(([id, val]) => ({ ...val, firebaseId: id }));
        renderProductTable(products);
        if (productsStat) productsStat.innerText = products.length;
    });

    onValue(ref(db, 'orders'), (snapshot) => {
        const data = snapshot.val();
        const orders = data ? Object.entries(data).map(([id, val]) => ({ ...val, firebaseId: id })) : [];
        renderOrderTable(orders);
        if (ordersStat) ordersStat.innerText = orders.length;
    });

    onValue(ref(db, 'users'), (snapshot) => {
        const data = snapshot.val();
        const users = data ? Object.entries(data).map(([id, val]) => ({ ...val, firebaseId: id })) : [];
        renderUserTable(users);
        if (usersStat) usersStat.innerText = users.length;
    });
}

function renderProductTable(products) {
    if (!adminProductList) return;
    adminProductList.innerHTML = '';
    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${product.id}</td>
            <td><img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/50'"></td>
            <td><strong>${product.name}</strong></td>
            <td><span class="category-badge">${product.category === 'men' ? "Men's" : "Women's"}</span></td>
            <td>₹${product.price.toFixed(2)}</td>
            <td>
                <button class="btn-delete" data-id="${product.firebaseId}">Delete</button>
            </td>
        `;
        adminProductList.appendChild(tr);
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.onclick = () => {
            const id = btn.getAttribute('data-id');
            if (confirm('Delete this product?')) {
                remove(ref(db, 'products/' + id));
            }
        };
    });
}

if (addProductForm) {
    addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('product-name').value;
        const price = parseFloat(document.getElementById('product-price').value);
        const image = document.getElementById('product-image').value;
        const category = document.getElementById('product-category').value;
        const newProduct = { id: Date.now(), name, price, image, category };
        push(ref(db, 'products'), newProduct).then(() => {
            addProductForm.reset();
            alert('Product added successfully!');
        });
    });
}

function renderOrderTable(orders) {
    if (!adminOrderList) return;
    adminOrderList.innerHTML = '';
    if (orders.length === 0) {
        adminOrderList.innerHTML = '<tr><td colspan="4" style="text-align:center;">No orders found.</td></tr>';
        return;
    }
    orders.reverse().forEach(order => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>#${order.id}</td>
            <td>${order.date}</td>
            <td><span style="font-size: 0.9em; display:block; max-width: 250px; line-height:1.4;">${order.items}</span></td>
            <td><strong>₹${order.total.toFixed(2)}</strong></td>
        `;
        adminOrderList.appendChild(tr);
    });
}

function renderUserTable(users) {
    if (!adminUserList) return;
    adminUserList.innerHTML = '';
    if (users.length === 0) {
        adminUserList.innerHTML = '<tr><td colspan="3" style="text-align:center;">No users registered yet.</td></tr>';
        return;
    }
    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${user.email}</strong></td>
            <td><span style="font-size: 0.9em; color: #64748b;">${user.createdAt || 'N/A'}</span></td>
            <td><span style="font-size: 0.9em; color: #64748b;">${user.lastLogin || 'N/A'}</span></td>
        `;
        adminUserList.appendChild(tr);
    });
}

document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        document.querySelectorAll('.view-section').forEach(view => view.style.display = 'none');
        const targetId = this.getAttribute('data-target') + '-view';
        const targetView = document.getElementById(targetId);
        if (targetView) targetView.style.display = 'block';
    });
});
