// script.js for Kamzy Outfits
import { 
  getCart, 
  saveCart, 
  addToCart, 
  updateCartCountSafe 
} from "./cart.js";

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

// 🧭 Setup nav toggle (fullscreen dropdown)
function setupNavFunctionality() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const menuIcon = menuToggle ? menuToggle.querySelector("i") : null;

  if (menuToggle && navLinks && menuIcon) {
    // Toggle menu open/close
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      document.body.classList.toggle("menu-open"); // lock/unlock scroll

      if (navLinks.classList.contains("active")) {
        menuIcon.classList.replace("bx-menu", "bx-x"); // change to close icon
      } else {
        menuIcon.classList.replace("bx-x", "bx-menu"); // back to hamburger
      }
    });

    // Auto-close when a link is clicked
    const links = navLinks.querySelectorAll("a");
    links.forEach(link => {
      link.addEventListener("click", () => {
        if (navLinks.classList.contains("active")) {
          navLinks.classList.remove("active");
          document.body.classList.remove("menu-open"); // unlock scroll
          menuIcon.classList.replace("bx-x", "bx-menu"); // reset icon
        }
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

// 🛒 Global addToCart function for HTML onclick attributes
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
