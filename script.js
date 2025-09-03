import { updateCartCountSafe } from "./cart.js";

// 🔄 Load shared header and footer
document.addEventListener("DOMContentLoaded", () => {
  // Load header
  fetch("nav.html")
    .then(res => res.text())
    .then(data => {
      document.querySelector("header").innerHTML = data;
      setupNavFunctionality();
      updateCartCountSafe(); // show cart count
      highlightActivePage(); // Call this AFTER the nav is loaded
    })
    .catch(err => console.error("Error loading header:", err));

  // Load footer
  fetch("footer.html")
    .then(res => res.text())
    .then(data => {
      document.querySelector("footer").innerHTML = data;
    })
    .catch(err => console.error("Error loading footer:", err));
});

// 🧭 Setup nav toggle - FULL SCREEN MOBILE MENU
function setupNavFunctionality() {
  const menuIcon = document.querySelector(".bx-menu");
  const navLinks = document.querySelector(".nav-links");
  const header = document.querySelector("header");
  
  if (menuIcon && navLinks) {
    // Create close icon
    const closeIcon = document.createElement("i");
    closeIcon.className = "bx bx-x close-menu";
    closeIcon.style.display = "none";
    closeIcon.style.position = "fixed";
    closeIcon.style.top = "25px";
    closeIcon.style.left = "25px";
    closeIcon.style.fontSize = "32px";
    closeIcon.style.color = "#fff";
    closeIcon.style.zIndex = "10002";
    closeIcon.style.cursor = "pointer";
    
    document.body.appendChild(closeIcon);
    
    menuIcon.addEventListener("click", () => {
      navLinks.classList.add("active");
      document.body.style.overflow = "hidden"; // Prevent scrolling
      closeIcon.style.display = "block";
      menuIcon.style.display = "none";
    });
    
    closeIcon.addEventListener("click", () => {
      navLinks.classList.remove("active");
      document.body.style.overflow = ""; // Enable scrolling
      closeIcon.style.display = "none";
      menuIcon.style.display = "block";
    });
    
    // Close menu when clicking on nav links
    const links = navLinks.querySelectorAll("a");
    links.forEach(link => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
        document.body.style.overflow = "";
        closeIcon.style.display = "none";
        menuIcon.style.display = "block";
      });
    });
  }
}

// 🌟 Highlight active page in navigation
function highlightActivePage() {
  // Get current page filename
  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  
  // Find all navigation links
  const navLinks = document.querySelectorAll(".nav-links a");
  
  if (navLinks.length === 0) {
    console.log("No navigation links found");
    return;
  }
  
  // Remove active class from all links
  navLinks.forEach(link => {
    link.classList.remove("active");
    
    // Get just the filename from the href
    const linkHref = link.getAttribute("href");
    const linkPage = linkHref ? linkHref.split("/").pop() : "";
    
    // Check if this link points to the current page
    if (linkPage === currentPage || 
        (currentPage === "index.html" && (linkHref === "index.html" || linkHref === "/" || linkHref === "")) ||
        (currentPage === "" && linkHref === "index.html")) {
      link.classList.add("active");
      console.log("Active page set to:", linkPage);
    }
  });
}

// Global addToCart function for HTML onclick attributes
window.addToCart = function (id, name, price, imageUrl, buttonElement) {
  const product = { 
    id, 
    name, 
    price: parseFloat(price), 
    imageUrl 
  };
  
  addToCart(product);
  updateCartCountSafe();

  // Change button text to show feedback ✅
  if (buttonElement) {
    const oldText = buttonElement.innerText;
    buttonElement.innerText = "Added ✓";
    buttonElement.disabled = true;

    setTimeout(() => {
      buttonElement.innerText = oldText;
      buttonElement.disabled = false;
    }, 1500);
  }
};

// Run on page load
document.addEventListener("DOMContentLoaded", updateCartCountSafe);

// Update copyright year in footer
function updateCopyrightYear() {
    const yearElement = document.getElementById('current-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

// Call this function when the footer loads
document.addEventListener('DOMContentLoaded', function() {
    // Your existing code...
    updateCopyrightYear();
});