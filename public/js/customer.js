// js/customer.js

// 1. Get Params from URL
const restaurantId = getQueryParam('id');
const tableId = getQueryParam('table');

// Basic Validation
if (!restaurantId) alert("Error: No Restaurant ID in URL!");
if (tableId) document.getElementById('table-badge').innerText = `Table ${tableId}`;
document.getElementById('restaurant-name').innerText = restaurantId ? restaurantId.toUpperCase().replace('_', ' ') : "Loading...";

// 2. Static Menu Data (Baad main Database se ayega)
const menuItems = [
    { id: 1, name: "Chicken Karahi (Half)", price: 1200 },
    { id: 2, name: "Chicken Tikka (Leg)", price: 450 },
    { id: 3, name: "Garlic Naan", price: 80 },
    { id: 4, name: "Mineral Water (L)", price: 120 },
    { id: 5, name: "Salad / Raita", price: 150 }
];

// 3. Render Menu
const menuContainer = document.getElementById('menu-list');
menuItems.forEach(item => {
    menuContainer.innerHTML += `
        <div class="menu-card d-flex justify-content-between align-items-center">
            <div>
                <h5 class="mb-1">${item.name}</h5>
                <span class="price-tag">${item.price} PKR</span>
            </div>
            <button class="btn-add" onclick="addToCart('${item.name}', ${item.price})">ADD +</button>
        </div>
    `;
});

// 4. Cart Logic
let cart = [];
let total = 0;

function addToCart(name, price) {
    cart.push({ name, price });
    total += price;
    
    // UI Update
    document.getElementById('total-price').innerText = `${total} PKR`;
    
    // Optional: Button feedback
    const btn = event.target;
    const originalText = btn.innerText;
    btn.innerText = "Added";
    btn.style.backgroundColor = "#4caf50";
    setTimeout(() => {
        btn.innerText = originalText;
        btn.style.backgroundColor = "#ff5722";
    }, 500);
}

// 5. Place Order Logic
function placeOrder() {
    if (cart.length === 0) return alert("Select food first!");
    if (!restaurantId || !tableId) return alert("Scan QR Code again (Missing ID/Table)");

    const btn = document.querySelector('.btn-danger');
    btn.disabled = true;
    btn.innerText = "Sending...";

    db.collection("orders").add({
        restaurant_id: restaurantId,  // CRITICAL: Links to Kitchen
        table_no: tableId,
        items: cart,
        total_price: total,
        status: "pending",
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("Order Sent to Kitchen!");
        location.reload(); // Reset page
    }).catch(err => {
        console.error(err);
        alert("Order Failed. Check Internet.");
        btn.disabled = false;
        btn.innerText = "Send Order 🚀";
    });
}