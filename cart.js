// cart.js (Kamzy Outfits) - Complete Version
import { db } from "./firebase-config.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

console.log("🛒 cart.js loaded");

// === CART CORE FUNCTIONS ===
export function getCart() {
  return JSON.parse(localStorage.getItem("kamzyOutfitsCart")) || [];
}

export function saveCart(cart) {
  localStorage.setItem("kamzyOutfitsCart", JSON.stringify(cart));
  updateCartCountSafe();
}

export function addToCart(product) {
  let cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  
  saveCart(cart);
  console.log("Product added to cart:", product.name);
  
  // Show notification
  showCartNotification(`${product.name} added to cart!`);
}

export function removeFromCart(productId) {
  let cart = getCart().filter(item => item.id !== productId);
  saveCart(cart);
  showCartNotification("Item removed from cart");
}

export function updateQuantity(productId, quantity) {
  let cart = getCart();
  const item = cart.find(p => p.id === productId);
  
  if (item) {
    item.quantity = quantity;
    if (item.quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    saveCart(cart);
  }
}

export function updateCartCountSafe() {
  const cart = getCart();
  const totalQuantity = cart.reduce((sum, p) => sum + p.quantity, 0);
  
  // Update cart count in navbar
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    cartCount.textContent = totalQuantity;
  }
  
  // Also update any elements with class "cart-count"
  const cartCountElements = document.querySelectorAll(".cart-count");
  cartCountElements.forEach(el => {
    el.textContent = totalQuantity;
  });
}

// Show notification
function showCartNotification(message) {
  // Remove existing notification if any
  const existingNotification = document.querySelector('.cart-notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  // Create new notification
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.innerHTML = `
    <div class="cart-notification-content">
      <i class='bx bx-check-circle'></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Show notification
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  // Hide after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// === CHECKOUT FUNCTION ===
export async function checkoutCart() {
  const cart = getCart();
  if (cart.length === 0) {
    showCartNotification("Your cart is empty");
    return;
  }

  try {
    // 🗄️ Save to Firestore orders collection
    const orderRef = await addDoc(collection(db, "orders"), {
      items: cart,
      total: calculateTotal(cart),
      createdAt: serverTimestamp(),
      status: "pending"
    });

    console.log("Order saved with ID: ", orderRef.id);

    // 📱 Prepare WhatsApp message
    let message = "🛍️ *KAMZY OUTFITS - NEW ORDER* 🛍️\n\n";
    message += "================================\n\n";
    
    let total = 0;
    cart.forEach((item, index) => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      message += `*${index + 1}. ${item.name}*\n`;
      message += `   Quantity: ${item.quantity}\n`;
      message += `   Price: ₦${item.price.toLocaleString()}\n`;
      message += `   Total: ₦${itemTotal.toLocaleString()}\n`;
      message += `   Image: ${item.imageUrl}\n\n`;
    });

    message += "================================\n";
    message += `*ORDER TOTAL: ₦${total.toLocaleString()}*\n\n`;
    message += `*Order ID:* ${orderRef.id}\n`;
    message += `*Order Date:* ${new Date().toLocaleString()}\n\n`;
    message += "Please process this order and confirm delivery details with the customer.";

    // Admin WhatsApp number (your number)
    const adminNumber = "2347033800470"; // Your actual WhatsApp number
    const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;

    // Clear cart after successful order creation
    localStorage.removeItem("kamzyOutfitsCart");
    updateCartCountSafe();

    // Redirect to WhatsApp
    window.open(whatsappUrl, "_blank");

  } catch (error) {
    console.error("❌ Error during checkout:", error);
    showCartNotification("Failed to place order. Try again.");
  }
}

// Calculate total order amount
function calculateTotal(cart) {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Display cart items (for cart.html)
export function displayCartItems() {
  const cartContainer = document.getElementById("cart-container");
  const cartSummary = document.getElementById("cart-summary");
  const cartTotal = document.getElementById("cart-total");
  
  if (!cartContainer) return; // Exit if not on cart page
  
  const cart = getCart();
  
  if (cart.length === 0) {
    cartContainer.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
    if (cartSummary) cartSummary.classList.add("hidden");
    return;
  }
  
  let html = '';
  let total = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    html += `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.imageUrl}" alt="${item.name}">
        <div class="cart-item-details">
          <h3>${item.name}</h3>
          <p>Price: ₦${item.price.toLocaleString()}</p>
        </div>
        <div class="cart-actions">
          <div class="quantity-controls">
            <button onclick="window.updateItemQuantity('${item.id}', ${item.quantity - 1})">-</button>
            <span>${item.quantity}</span>
            <button onclick="window.updateItemQuantity('${item.id}', ${item.quantity + 1})">+</button>
          </div>
          <button class="remove-btn" onclick="window.removeItem('${item.id}')">Remove</button>
        </div>
      </div>
    `;
  });
  
  cartContainer.innerHTML = html;
  if (cartTotal) cartTotal.textContent = `₦${total.toLocaleString()}`;
  if (cartSummary) cartSummary.classList.remove("hidden");
}

// Initialize cart count on load
document.addEventListener("DOMContentLoaded", function() {
  updateCartCountSafe();
  
  // Display cart items if on cart page
  if (window.location.pathname.includes("cart.html")) {
    displayCartItems();
    
    // Add checkout button event listener
    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", checkoutCart);
    }
  }
  
  // Add notification styles
  if (!document.querySelector('#cart-notification-styles')) {
    const styles = document.createElement('style');
    styles.id = 'cart-notification-styles';
    styles.textContent = `
      .cart-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        transform: translateX(100%);
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
      }
      
      .cart-notification.show {
        transform: translateX(0);
        opacity: 1;
      }
      
      .cart-notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      
      .cart-notification-content i {
        font-size: 24px;
      }
    `;
    document.head.appendChild(styles);
  }
});

// Global functions for HTML onclick attributes
window.updateItemQuantity = function(productId, newQuantity) {
  updateQuantity(productId, newQuantity);
  displayCartItems();
};

window.removeItem = function(productId) {
  removeFromCart(productId);
  displayCartItems();
};