// The last three digits of the student ID are 711

let courses = [];          // Store course data
let resourceKits = [];     // Store the data of the resource package

// ===== Load course data =====
function loadCourses711() {
  fetch('data/courses.json')
    .then(res => res.json())
    .then(data => {
      courses = data;
      displayCourses711();
    })
    .catch(err => console.error('Error loading courses:', err));
}

// ===== Render the course card =====
function displayCourses711() {
  const container = document.getElementById('courses-list');
  if (!container) return;

  if (container.dataset.rendered === 'true') return;
  container.dataset.rendered = 'true';

  courses.forEach(course => {
    const cardHTML = `
      <div class="course-card">
        <div class="course-img">
          <img src="images/courses/${course.image}" alt="${course.imageAlt}">
        </div>
        <div class="course-content">
          <h3>${course.name}</h3>
          <p>${course.description}</p>
          <p><strong>Assessment:</strong> ${course.assessment}</p>
          <p><strong>Sample Project:</strong> ${course.sampleProject}</p>
        </div>
      </div>
    `;
    container.innerHTML += cardHTML;
  });
}

// ===== Load the resource package data =====
function loadResourceKits711() {
  return fetch('data/resource_kits.json')
    .then(res => res.json())
    .then(data => {
      resourceKits = data;
      displayResourceKits711();
      displayCartItems711();
      return data; // Returns data for chaining
    })
    .catch(err => console.error('Error loading resource kits:', err));
}

// ===== Render a list of resource packs =====
function displayResourceKits711() {
  const container = document.getElementById('resource-kits-list');
  if (!container) return;

  container.innerHTML = '';

  resourceKits.forEach(kit => {
    const kitHTML = `
      <div class="resource-kit-card">
        <img src="images/kits/${kit.image}" alt="${kit.name}">
        <h3>${kit.name}</h3>
        <p>${kit.description}</p>
        <p>$${kit.price.toFixed(2)}</p>
        <button class="btn" onclick="addToCart711('${kit.id}')">Add to Cart</button>
      </div>
    `;
    container.innerHTML += kitHTML;
  });
}

// ===== Shopping cart function =====
function getCartData711() {
  const currentUser = sessionStorage.getItem('currentUser');
  if (!currentUser) return [];

  const cart = JSON.parse(localStorage.getItem(`cart_${JSON.parse(currentUser).username}`)) || [];
  return cart;
}

function displayCartItems711() {
  const cart = getCartData711();
  const container = document.getElementById('cart-items');
  if (!container) return;

  container.innerHTML = '';
  let total = 0;

  cart.forEach(item => {
    const kit = resourceKits.find(kit => kit.id === item.id);
    if (!kit) return;

    const subtotal = kit.price * item.quantity;
    total += subtotal;

    const itemHTML = `
      <div class="cart-item">
        <img src="images/kits/${kit.image}" alt="${kit.name}">
        <div class="cart-item-info">
          <h3>${kit.name}</h3>
          <p>${kit.description}</p>
          <p>$${kit.price.toFixed(2)}</p>
        </div>
        <div class="cart-item-controls">
          <button onclick="updateQuantity711('${item.id}', -1)">-</button>
          <input type="number" value="${item.quantity}" min="1" readonly>
          <button onclick="updateQuantity711('${item.id}', 1)">+</button>
          <button class="btn btn-danger" onclick="removeItemFromCart711('${item.id}')">Remove</button>
        </div>
        <div class="cart-item-subtotal">$${subtotal.toFixed(2)}</div>
      </div>
    `;
    container.innerHTML += itemHTML;
  });

  const totalElement = document.getElementById('cart-total');
  if (totalElement) {
    totalElement.innerText = `Total: $${total.toFixed(2)}`;
  }
}

function addToCart711(id) {
  const currentUser = sessionStorage.getItem('currentUser');
  if (!currentUser) {
    alert('Please login first!');
    window.location.href = 'login.html';
    return;
  }

  const username = JSON.parse(currentUser).username;
  let cart = JSON.parse(localStorage.getItem(`cart_${username}`)) || [];

  const existingItem = cart.find(item => item.id === id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    cart.push({ id, quantity: 1 });
  }

  localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
  displayCartItems711();
}

function updateQuantity711(id, change) {
  const currentUser = sessionStorage.getItem('currentUser');
  if (!currentUser) return;

  const username = JSON.parse(currentUser).username;
  let cart = JSON.parse(localStorage.getItem(`cart_${username}`)) || [];

  const index = cart.findIndex(item => item.id === id);
  if (index === -1) return;

  cart[index].quantity += change;
  if (cart[index].quantity <= 0) {
    cart.splice(index, 1);
  }

  localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
  displayCartItems711();
}

function removeItemFromCart711(id) {
  const currentUser = sessionStorage.getItem('currentUser');
  if (!currentUser) return;

  const username = JSON.parse(currentUser).username;
  let cart = JSON.parse(localStorage.getItem(`cart_${username}`)) || [];

  cart = cart.filter(item => item.id !== id);
  localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
  displayCartItems711();
}

function clearCart711() {
  const currentUser = sessionStorage.getItem('currentUser');
  if (!currentUser) return;

  const username = JSON.parse(currentUser).username;
  localStorage.removeItem(`cart_${username}`);
  displayCartItems711();
}

function proceedToCheckout711() {
  const currentUser = sessionStorage.getItem('currentUser');
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  const username = JSON.parse(currentUser).username;
  const cart = getCartData711();

  if (cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  window.location.href = 'order-confirm.html';
}

function getTotalPrice711() {
  const cart = getCartData711();
  return cart.reduce((sum, item) => {
    const kit = resourceKits.find(kit => kit.id === item.id);
    return sum + (kit ? kit.price * item.quantity : 0);
  }, 0);
}

// ===== Order confirmation page feature =====
function initOrderConfirmPage711() {
  const user = JSON.parse(sessionStorage.getItem('currentUser'));
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  document.getElementById('user-display').textContent = user.username;

  const cart = JSON.parse(localStorage.getItem(`cart_${user.username}`)) || [];
  const tbody = document.getElementById('order-items-body');
  const totalElement = document.getElementById('order-total');
  
  let total = 0;
  tbody.innerHTML = '';

  cart.forEach(item => {
    const kit = resourceKits.find(k => k.id === item.id);
    if (!kit) return;

    const subtotal = kit.price * item.quantity;
    total += subtotal;

    tbody.innerHTML += `
      <tr>
        <td>${kit.name}</td>
        <td>${item.quantity}</td>
        <td>$${kit.price.toFixed(2)}</td>
        <td>$${subtotal.toFixed(2)}</td>
      </tr>
    `;
  });

  totalElement.textContent = `Total: $${total.toFixed(2)}`;
}

// ===== Modify the confirmOrder711 function =====
function confirmOrder711() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please login first!');
        return;
    }

    // Get shopping cart data
    const cart = JSON.parse(localStorage.getItem(`cart_${currentUser.username}`)) || [];
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Obtain the resource package data to save the complete order information
    const resourceKits = JSON.parse(localStorage.getItem('resourceKits')) || [];
    
    // Create a line item with full product information
    const orderItems = cart.map(item => {
        const kit = resourceKits.find(k => k.id === item.id);
        return {
            id: item.id,
            quantity: item.quantity,
            name: kit?.name || 'Unknown Product',
            price: kit?.price || 0,
            description: kit?.description || ''
        };
    });

    // Calculate the total amount
    const total = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Create an order object
    const newOrder = {
        user: currentUser.username,  // Use usernames explicitly
        items: orderItems,
        total: total,
        timestamp: new Date().toISOString()  // Add a timestamp
    };

    // Save to localStorage
    const orders = JSON.parse(localStorage.getItem('orders') || []);
    orders.push(newOrder);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Clear the current user's cart
    localStorage.removeItem(`cart_${currentUser.username}`);

    // Jump to the Order Management page
    window.location.href = 'order-management.html';
}


function editOrder711() {
  window.location.href = 'cart.html';
}

// ===== User authentication function =====
function checkLoginState711() {
  if (sessionStorage.getItem('currentUser')) {
    const nav = document.querySelector('nav');
    if (nav && !nav.dataset.linksAdded) {
      nav.dataset.linksAdded = 'true';
      nav.innerHTML += `
        <a href="order-management.html">My Orders</a>
        <a href="logout.html">Logout</a>
      `;
    }
  }
}

function validateRegistrationForm711(event) {
  event.preventDefault();

  let isValid = true;
  const errorMessages = document.querySelectorAll('.error-message');
  errorMessages.forEach(msg => msg.style.display = 'none');

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirm-password').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[!@#$%^&*]).{8,}$/;
  const phoneRegex = /^\d{10,11}$/;

  if (username === '') {
    document.querySelector('#username ~ .error-message').style.display = 'block';
    isValid = false;
  }

  if (!passwordRegex.test(password)) {
    document.querySelector('#password ~ .error-message').style.display = 'block';
    isValid = false;
  }

  if (password !== confirmPassword) {
    document.querySelector('#confirm-password ~ .error-message').style.display = 'block';
    isValid = false;
  }

  if (!emailRegex.test(email)) {
    document.querySelector('#email ~ .error-message').style.display = 'block';
    isValid = false;
  }

  if (!phoneRegex.test(phone)) {
    document.querySelector('#phone ~ .error-message').style.display = 'block';
    isValid = false;
  }

  if (isValid) {
    const users = JSON.parse(localStorage.getItem('users') || []);
    const userExists = users.some(user => user.username === username || user.email === email);

    if (userExists) {
      alert('Username or email already exists.');
      return;
    }

    users.push({ username, password, email, phone });
    localStorage.setItem('users', JSON.stringify(users));

    alert('Registration successful!');
    window.location.href = 'login.html';
  }
}

function validateLoginForm711(event) {
  event.preventDefault();

  let isValid = true;
  const errorMessages = document.querySelectorAll('.error-message');
  errorMessages.forEach(msg => msg.style.display = 'none');

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  if (username === '') {
    document.querySelector('#username ~ .error-message').style.display = 'block';
    isValid = false;
  }

  if (password === '') {
    document.querySelector('#password ~ .error-message').style.display = 'block';
    isValid = false;
  }

  if (isValid) {
    const storedUsers = JSON.parse(localStorage.getItem('users')) || [];

    const userFound = storedUsers.find(user => user.username === username);

    if (!userFound) {
      alert('Username not found.');
      return;
    }

    if (userFound.password !== password) {
      alert('Incorrect password.');
      return;
    }

    sessionStorage.setItem('currentUser', JSON.stringify({ username }));
    alert('Login successful!');
    window.location.href = 'cart.html';
  }
}
// ===== Order management module =====
function initOrderManagement711() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    // Make sure that there is a rebinding event for the button
    const downloadBtn = document.getElementById('download-orders');
    const clearBtn = document.getElementById('clear-storage');
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', handleDownloadOrders711);
    }
    
    if (clearBtn) {
        clearBtn.addEventListener('click', handleClearStorage711);
    }

    // The order is displayed after the package data is loaded
    fetch('data/resource_kits.json')
        .then(res => res.json())
        .then(data => {
            resourceKits = data;
            loadAndDisplayOrders711();
        })
        .catch(error => {
            console.error('Failed to load resource kits:', error);
            loadAndDisplayOrders711(); // Still trying to show the order
        });
}

function initOrderManagementEvents711() {
  // Download order events
  document.getElementById('download-orders').addEventListener('click', () => {
    try {
      const orders = getFilteredOrders711();
      if (orders.length === 0) {
        alert('No orders available to download');
        return;
      }
      downloadOrdersAsJson711(orders);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download orders. Please try again.');
    }
  });

  // Clear data events
  document.getElementById('clear-orders').addEventListener('click', () => {
    if (confirm('This will permanently delete your order history and cart. Proceed?')) {
      clearUserData711();
      alert('Your data has been cleared');
      window.location.reload();
    }
  });

  // Log out of the event
  document.getElementById('logout-btn').addEventListener('click', () => {
    sessionStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  });
}

// ===== Core function implementation =====
// ===== Order management features =====
function initOrderManagement711() {
    // Verify your sign-in status
    const currentUser = sessionStorage.getItem('currentUser');
    if (!currentUser) {
        alert('Please login to access order management');
        window.location.href = 'login.html';
        return;
    }

    // Initialize event listening
    document.getElementById('download-orders').addEventListener('click', handleDownloadOrders711);
    document.getElementById('clear-storage').addEventListener('click', handleClearStorage711);

    // Load and display the order
    loadAndDisplayOrders711();
}

// ===== Modify the loadAndDisplayOrders711 function =====
function loadAndDisplayOrders711() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return;

    // Get and filter orders
    const orders = JSON.parse(localStorage.getItem('orders') || []);
    const userOrders = orders.filter(order => order.user === currentUser.username);

    // Render the list of orders
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = userOrders.length > 0 
        ? userOrders.map((order, index) => `
            <div class="order-card">
                <div class="order-header">
                    <span>Order #${index + 1}</span>
                    <span>${new Date(order.timestamp).toLocaleDateString()}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `
                        <div class="order-item">
                            <p>${item.name} x${item.quantity}</p>
                            <p>Price: $${item.price.toFixed(2)}</p>
                            <p>Subtotal: $${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    `).join('')}
                </div>
                <div class="order-total">
                    Total: $${order.total.toFixed(2)}
                </div>
            </div>
        `).join('')
        : '<p class="no-orders">No orders found.</p>';
}

function handleDownloadOrders711() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) {
        alert('Please login first!');
        return;
    }

    // Get and filter orders
    const orders = JSON.parse(localStorage.getItem('orders') || []);
    const userOrders = orders.filter(order => 
        order.user === currentUser.username && order.items.length > 0
    );

    if (userOrders.length === 0) {
        alert('No orders available to download');
        return;
    }

    // Build download data (with full product information)
    const downloadData = {
        meta: {
            generatedAt: new Date().toISOString(),
            user: currentUser.username,
            recordCount: userOrders.length
        },
        orders: userOrders.map(order => ({
            ...order,
            items: order.items.map(item => ({
                ...item,
                // Add package details
                kitDetails: resourceKits.find(k => k.id === item.id) || null
            }))
        }))
    };

    try {
        // Create a blob object
        const blob = new Blob(
            [JSON.stringify(downloadData, null, 2)], 
            { type: 'application/json;charset=utf-8' }
        );
        
        // Create a download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `TechLearn_Orders_${currentUser.username}_${Date.now()}.json`;
        
        // Trigger the download
        document.body.appendChild(a);
        a.click();
        
        // Clean up resources
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    } catch (error) {
        console.error('Download failed:', error);
        alert('Error generating download file');
    }
}


function handleClearStorage711() {
       const currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
    if (!currentUser) return;

    if (!confirm('This will permanently delete ALL your data. Continue?')) return;

    // Clear cart (quarantine with username)
    localStorage.removeItem(`cart_${currentUser.username}`);
    
    // Clear order history (keep other user data)
    const allOrders = JSON.parse(localStorage.getItem('orders') || []);
    const filteredOrders = allOrders.filter(order => 
        order.user !== currentUser.username
    );
    localStorage.setItem('orders', JSON.stringify(filteredOrders));
    
    // Update the display immediately
    if (document.getElementById('orders-list')) {
        document.getElementById('orders-list').innerHTML = 
            '<p class="no-orders">No orders found</p>';
    }
    
    // Show feedback
    alert('All your data has been cleared');
    
    // Refresh if it is currently on the order page
    if (window.location.pathname.includes('order-management.html')) {
        setTimeout(() => window.location.reload(), 500);
    }
}




// ===== Page initialization =====
document.addEventListener('DOMContentLoaded', () => {
      // Make sure that the package data is loaded first
    fetch('data/resource_kits.json')
        .then(res => res.json())
        .then(data => {
            localStorage.setItem('resourceKits', JSON.stringify(data));

  
  checkLoginState711();

  if (document.getElementById('courses-list')) {
    loadCourses711();
  }

  if (document.getElementById('cart-items')) {
    loadResourceKits711();
  }

  if (document.getElementById('order-items-body')) {
    loadResourceKits711().then(() => initOrderConfirmPage711());
  }

  if (document.getElementById('orders-list')) {
                initOrderManagement711();
  }
  if (!localStorage.getItem('orders')) {
    localStorage.setItem('orders', '[]');
  }

  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');

  if (registerForm) {
    registerForm.addEventListener('submit', validateRegistrationForm711);
  }

  if (loginForm) {
    loginForm.addEventListener('submit', validateLoginForm711);
  }
   })
        .catch(error => console.error('Error loading resource kits:', error));
});
