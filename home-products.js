import { db } from "./firebase-config.js";
import { collection, query, where, orderBy, limit, getDocs } 
  from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { addToCart } from "./cart.js";

console.log("🏠 home-products.js loaded");

const categories = ["tops", "jeans", "leggings", "gowns"];

async function loadHomeProducts() {
  for (let category of categories) {
    const section = document.getElementById(`${category}-products`);
    if (!section) continue;

    const q = query(
      collection(db, "products"),
      where("category", "==", category),
      orderBy("createdAt", "desc"),
      limit(4)
    );

    const snapshot = await getDocs(q);
    section.innerHTML = "";

    if (snapshot.empty) {
      section.innerHTML = `<p class="no-products">No ${category} products yet.</p>`;
      continue;
    }

    const grid = document.createElement("div");
    grid.classList.add("product-grid");

    snapshot.forEach(doc => {
      const p = doc.data();

      const card = document.createElement("div");
      card.classList.add("product-card");
      card.setAttribute("data-id", doc.id);

      card.innerHTML = `
        <img src="${p.imageUrl}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="price">₦${Number(p.price).toLocaleString()}</p>
        <button class="add-to-cart-btn"
          data-id="${doc.id}"
          data-name="${p.name}"
          data-price="${p.price}"
          data-image="${p.imageUrl}">
          Add to Cart
        </button>
      `;

      grid.appendChild(card);
    });

    section.appendChild(grid);
  }

  attachCartButtons();
}

function attachCartButtons() {
  document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const product = {
        id: btn.dataset.id,
        name: btn.dataset.name,
        price: parseFloat(btn.dataset.price),
        imageUrl: btn.dataset.image
      };
      addToCart(product);

      // ✅ Button feedback instead of popup
      btn.textContent = "Added ✓";
      btn.disabled = true;
      setTimeout(() => {
        btn.textContent = "Add to Cart";
        btn.disabled = false;
      }, 1500);
    });
  });
}

loadHomeProducts();
