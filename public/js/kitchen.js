// js/kitchen.js

// 1. Identify Restaurant
const restaurantId = getQueryParam('id');

if (!restaurantId) {
    document.body.innerHTML = "<h1 class='text-white text-center mt-5'>Error: ID Required in URL</h1>";
} else {
    document.getElementById('rest-title').innerText = restaurantId.toUpperCase();
}

// 2. Real-time Listener
//specific orders
db.collection("orders")
  .where("restaurant_id", "==", restaurantId) 
  .orderBy("timestamp", "desc")
  .limit(20) // Sirf last 20 orders dikhao
  .onSnapshot((snapshot) => {
      const container = document.getElementById("orders-container");
      
      // Check if empty
      if (snapshot.empty) {
          container.innerHTML = "<div class='col-12 text-center text-muted'><h4>No Active Orders</h4></div>";
          return;
      }

      container.innerHTML = ""; // Clear current list

      snapshot.forEach(doc => {
          renderTicket(doc.id, doc.data(), container);
      });
  }, (error) => {
      console.error("Firebase Error:", error);
    
  });

// 3. Render Logic
function renderTicket(docId, data, container) {
    // Generate Items HTML
    const itemsHtml = data.items.map(i => 
        `<li class="d-flex justify-content-between">
            <span>${i.name}</span>
            <small>${i.price}</small>
         </li>`
    ).join('');

    // Status Check
    const isReady = data.status === 'ready';
    const statusClass = isReady ? 'ticket-ready' : '';
    const btnAction = isReady 
        ? `<button class="btn btn-secondary w-100" disabled>SERVED ✅</button>`
        : `<button class="btn btn-warning w-100 fw-bold" onclick="markReady('${docId}')">MARK READY 🍳</button>`;

    // Format Time
    const time = data.timestamp ? new Date(data.timestamp.toDate()).toLocaleTimeString() : 'Just now';

    const html = `
        <div class="col-md-4 col-sm-6">
            <div class="ticket-card ${statusClass}">
                <div class="ticket-header">
                    <h4 class="m-0">Table ${data.table_no}</h4>
                    <span class="badge bg-light text-dark">${time}</span>
                </div>
                <div class="ticket-body">
                    <ul class="list-unstyled ticket-items text-white">
                        ${itemsHtml}
                    </ul>
                    <div class="d-flex justify-content-between mt-3 mb-2 border-top pt-2">
                        <span>Total:</span>
                        <span class="fw-bold text-warning">${data.total_price} PKR</span>
                    </div>
                    ${btnAction}
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML += html;
}

// 4. Update Status in DB
function markReady(docId) {
    db.collection("orders").doc(docId).update({
        status: "ready"
    }).catch(err => console.error(err));
}