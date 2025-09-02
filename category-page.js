import { db } from "./firebase-config.js";
import { collection, query, where, orderBy, getDocs } 
  from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { addToCart } from "./cart.js";

document.addEventListener("DOMContentLoaded", async () => {
  const category = document.body.dataset.category; 
  const section = document.getElementById("category-products");

  try {
    const q = query(
      collection(db, "products"),
      where("category", "==", category),
      orderBy("createdAt", "desc")
    );

    const querySnapshot = await getDocs(q);
    let html = "";

    querySnapshot.forEach(doc => {
      const p = doc.data();
      html += `
        <div class="product-card">
          <img src="${p.imageUrl}" alt="${p.name}">
          <h3>${p.name}</h3>
          <p>₦${p.price.toLocaleString()}</p>
          <button class="add-to-cart-btn"
            data-id="${doc.id}"
            data-name="${p.name}"
            data-price="${p.price}"
            data-image="${p.imageUrl}">
            Add to Cart
          </button>
        </div>
      `;
    });

    section.innerHTML = html || "<p>No products found in this category yet.</p>";

    // Attach cart handlers
    section.querySelectorAll(".add-to-cart-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const product = {
          id: btn.dataset.id,
          name: btn.dataset.name,
          price: parseFloat(btn.dataset.price),
          imageUrl: btn.dataset.image
        };
        addToCart(product);

        // ✅ Feedback
        btn.textContent = "Added ✓";
        btn.disabled = true;
        setTimeout(() => {
          btn.textContent = "Add to Cart";
          btn.disabled = false;
        }, 1500);
      });
    });
  } catch (err) {
    console.error("⚠️ Error loading category products:", err);
    section.innerHTML = "<p>Failed to load products. Try again later.</p>";
  }
});
