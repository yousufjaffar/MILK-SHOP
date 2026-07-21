/* =========================================================
   YOUSUF DAIRY — SCRIPT
   -----------------------------------------------------------
   This file has 6 parts:
   1. Setup (WhatsApp number, footer year)
   2. Mobile nav toggle (hamburger menu)
   3. WhatsApp helper (used everywhere a WA button exists)
   4. Product carousel arrow buttons
   5. Cart system (add/remove/update items, side drawer)
   6. Quick View modal (opens when a product image is clicked)
========================================================= */

/* -------------------------------------------------------
   1. SETUP
   Replace the number below with your real WhatsApp business
   number. Format: country code + number, no + sign, no spaces.
   Example: "923001234567" for +92 300 1234567
------------------------------------------------------- */
const WHATSAPP_NUMBER = "923001234567"; // <-- REPLACE with your WhatsApp business number

// Auto-fills the copyright year in the footer so you never
// have to update it manually.
document.getElementById("year").textContent = new Date().getFullYear();


/* -------------------------------------------------------
   2. MOBILE NAV TOGGLE
   Shows/hides the dropdown nav on phones (<768px).
   On tablet/laptop this menu is hidden by CSS and the
   full nav in the header is shown instead.
------------------------------------------------------- */
const navToggle = document.getElementById("navToggle");
const mobileNav = document.getElementById("mobile-nav");

navToggle.addEventListener("click", () => {
  const isOpen = mobileNav.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", isOpen);
});

// Close the mobile menu automatically once a link is tapped,
// so the user doesn't have to close it manually after navigating.
mobileNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => mobileNav.classList.remove("open"));
});


/* -------------------------------------------------------
   3. WHATSAPP HELPER
   Every "Order on WhatsApp" button on the page (header, hero,
   CTA band, footer, floating button) uses this same helper
   to build a wa.me link and open it in a new tab.
------------------------------------------------------- */
function openWhatsApp(message) {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

// Generic greeting used when someone clicks a plain "Order on
// WhatsApp" button without having added anything to the cart.
function generalGreeting() {
  return "Assalam-o-Alaikum Yousuf Dairy! 🥛\nMujhe fresh milk order karna hai. Please batayein aaj kya available hai.";
}

// Wire up every generic WhatsApp button in one go by ID.
// Add more IDs to this array if you add another WA button elsewhere.
["headerWhatsapp", "heroWhatsapp", "ctaWhatsapp", "footerWhatsapp", "floatWhatsapp"].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener("click", e => { e.preventDefault(); openWhatsApp(generalGreeting()); });
});


/* -------------------------------------------------------
   4. PRODUCT CAROUSEL ARROWS
   The carousel itself scrolls natively (CSS scroll-snap
   handles the swipe/snap behaviour). These buttons just
   nudge the scroll position left/right by one card-width.
------------------------------------------------------- */
const carousel = document.getElementById("carousel");
document.getElementById("arrowLeft").addEventListener("click", () => {
  carousel.scrollBy({ left: -280, behavior: "smooth" });
});
document.getElementById("arrowRight").addEventListener("click", () => {
  carousel.scrollBy({ left: 280, behavior: "smooth" });
});


/* =========================================================
   5. CART SYSTEM
   -----------------------------------------------------------
   `cart` is a plain object keyed by product id, e.g.:
   {
     "cow-milk::1 Litre": { name, emoji, unit, price, qty },
     "butter":            { name, emoji, unit, price, qty }
   }
   CHANGED: for products with size options (Cow/Buffalo/Goat Milk,
   Bread) the key is "id::size" so each size sits in the cart as
   its own line item — e.g. 1 Pao of Cow Milk and 1 Litre of Cow
   Milk can both be in the cart at once. Products without size
   options just use the plain id as before ("butter", not
   "butter::something").
   `note` is optional — only present if the item was added
   through the Quick View modal with special instructions.
========================================================= */
let cart = {};

// Cache the cart DOM elements once so we're not re-querying
// the DOM on every click.
const cartBadge = document.getElementById("cartBadge");
const cartItemsEl = document.getElementById("cartItems");
const cartEmptyEl = document.getElementById("cartEmpty");
const cartTotalEl = document.getElementById("cartTotal");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

document.getElementById("cartTrigger").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart); // clicking the dark backdrop also closes it

// Re-renders the cart badge count, the item list, and the
// total price. Call this any time `cart` changes.
function updateCartUI() {
  const ids = Object.keys(cart);
  const totalQty = ids.reduce((sum, id) => sum + cart[id].qty, 0);
  const totalPrice = ids.reduce((sum, id) => sum + cart[id].qty * cart[id].price, 0);

  cartBadge.textContent = totalQty;
  cartTotalEl.textContent = `Rs. ${totalPrice}`;

  // Empty state: show the "cart is empty" message instead of a list.
  if (ids.length === 0) {
    cartItemsEl.innerHTML = "";
    cartItemsEl.appendChild(cartEmptyEl);
    return;
  }

  // Rebuild the item list from scratch — simplest approach for
  // a small cart like this (no virtual DOM needed).
  cartItemsEl.innerHTML = ids.map(id => {
    const item = cart[id];
    return `
      <div class="cart-item" data-id="${id}">
        <span class="cart-item-emoji">${item.emoji}</span>
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <span>Rs. ${item.price}/${item.unit} × ${item.qty}</span>
        </div>
        <div class="cart-item-qty">
          <button data-cart-action="dec">−</button>
          <span>${item.qty}</span>
          <button data-cart-action="inc">+</button>
          <button class="cart-item-remove" data-cart-action="remove">✕</button>
        </div>
      </div>`;
  }).join("");
}

// Single click listener on the container (event delegation) —
// handles +/- and remove for every cart item, even ones added
// after this listener was set up.
cartItemsEl.addEventListener("click", e => {
  const btn = e.target.closest("button[data-cart-action]");
  if (!btn) return;
  const id = btn.closest(".cart-item").dataset.id;
  const action = btn.dataset.cartAction;

  if (action === "inc") {
    cart[id].qty++;
    syncCardQty(id, cart[id].qty);
  } else if (action === "dec") {
    cart[id].qty--;
    if (cart[id].qty <= 0) delete cart[id];
    syncCardQty(id, cart[id] ? cart[id].qty : 0);
  } else if (action === "remove") {
    delete cart[id];
    syncCardQty(id, 0);
  }
  updateCartUI();
});

// Keeps the quantity shown on the product card (in the
// carousel) in sync whenever the cart changes from the drawer
// or the Quick View modal, so the two views never disagree.
//
// CHANGED: cart keys can now be either a plain id ("butter") or a
// compound "id::size" key ("bread::Small") for products that have
// size options. This only updates the number on the card if the
// card's CURRENTLY SELECTED size matches the size in the key —
// otherwise you'd see the wrong size's quantity on screen.
function syncCardQty(cartKey, qty) {
  const [id, size] = cartKey.split("::");
  const card = document.querySelector(`.product-card[data-id="${id}"]`);
  if (!card) return;

  const activeSizeBtn = card.querySelector(".size-select .size-btn.active");
  const cardActiveSize = activeSizeBtn ? activeSizeBtn.dataset.size : undefined;

  // No size in the key (plain id) -> product has no size options, always update.
  // Size in the key -> only update if it matches what's currently selected.
  if (size === undefined || cardActiveSize === size) {
    card.querySelector(".qty-value").textContent = qty;
  }
}


/* =========================================================
   6. QUICK VIEW MODAL
   -----------------------------------------------------------
   Clicking a product's image (the element with
   [data-open-quickview]) opens this modal, pre-filled from
   the product card's data-* attributes. Adding to cart here
   also supports an optional "special instructions" note.
========================================================= */
const qvOverlay = document.getElementById("quickviewOverlay");
const qv = document.getElementById("quickview");
const qvImg = document.getElementById("qvImg");     // CHANGED: real product photo element
const qvEmoji = document.getElementById("qvEmoji");
const qvPrice = document.getElementById("qvPrice");
const qvUnit = document.getElementById("qvUnit");
const qvDesc = document.getElementById("qvDesc");
const qvNote = document.getElementById("qvNote");
const qvNoteCount = document.getElementById("qvNoteCount");
const qvQty = document.getElementById("qvQty");
const qvAddBtn = document.getElementById("qvAddBtn");
const qvSizeSelect = document.getElementById("qvSizeSelect"); // CHANGED: size buttons container

// Holds the product currently shown in the modal, so the
// "Add to Cart" button knows what to save. Reset to null on close.
let qvCurrent = null;

// CHANGED: reads whichever size button is active inside the modal
// (or falls back to the card's plain data-unit/data-price if the
// product has no size options at all).
function getQvActiveSize(card) {
  const activeBtn = qvSizeSelect.querySelector(".size-btn.active");
  if (activeBtn) {
    return { unit: activeBtn.dataset.size, price: Number(activeBtn.dataset.price) };
  }
  return { unit: card.dataset.unit, price: Number(card.dataset.price) };
}

// CHANGED: refreshes the price display + quantity stepper to match
// whichever size is currently selected in the modal.
function refreshQvForSize(card) {
  const { unit, price } = getQvActiveSize(card);
  const cartKey = qvSizeSelect.querySelector(".size-btn.active") ? `${card.dataset.id}::${unit}` : card.dataset.id;
  qvPrice.textContent = `Rs. ${price}`;
  qvUnit.textContent = `per ${unit}`;
  qvQty.textContent = cart[cartKey] ? cart[cartKey].qty : 1;
}

function openQuickview(card) {
  // Pull all product info straight from the card's data-* attributes,
  // so there's only one place (the HTML) where product data lives.
  const id = card.dataset.id;
  const name = card.dataset.name;
  const emoji = card.dataset.emoji;
  const desc = card.dataset.desc || "";
  const img = card.dataset.img || ""; // CHANGED: optional real product photo

  qvCurrent = { id, name, emoji, card };

  // CHANGED: show the real photo if data-img is set on the card,
  // otherwise fall back to the emoji icon (so nothing looks broken
  // for products that don't have a photo uploaded yet).
  if (img) {
    qvImg.src = img;
    qvImg.alt = name;
    qvImg.style.display = "block";
    qvEmoji.style.display = "none";
  } else {
    qvImg.style.display = "none";
    qvEmoji.style.display = "block";
    qvEmoji.textContent = emoji;
  }

  // CHANGED: rebuild the size selector from the card's own size
  // buttons (if it has any). Cloning the labels/values means the
  // sizes and prices only ever need to be edited in one place —
  // the product card in index.html.
  const cardSizeButtons = card.querySelectorAll(".size-select .size-btn");
  qvSizeSelect.innerHTML = "";
  if (cardSizeButtons.length) {
    qvSizeSelect.style.display = "flex";
    cardSizeButtons.forEach(srcBtn => {
      const btn = document.createElement("button");
      btn.className = "size-btn" + (srcBtn.classList.contains("active") ? " active" : "");
      btn.dataset.size = srcBtn.dataset.size;
      btn.dataset.price = srcBtn.dataset.price;
      btn.innerHTML = srcBtn.innerHTML;
      btn.addEventListener("click", () => {
        qvSizeSelect.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        refreshQvForSize(card);
      });
      qvSizeSelect.appendChild(btn);
    });
  } else {
    qvSizeSelect.style.display = "none";
  }

  qvDesc.textContent = desc;
  qvNote.value = "";
  qvNoteCount.textContent = "0/500";
  refreshQvForSize(card); // sets price, unit, and starting quantity together

  qvOverlay.classList.add("open");
  qv.classList.add("open");
  qv.setAttribute("aria-hidden", "false");
}

function closeQuickview() {
  qvOverlay.classList.remove("open");
  qv.classList.remove("open");
  qv.setAttribute("aria-hidden", "true");
  qvCurrent = null;
}

// Every product card has a .card-media element marked with
// [data-open-quickview] — wire all of them up in one loop.
document.querySelectorAll("[data-open-quickview]").forEach(media => {
  media.addEventListener("click", () => openQuickview(media.closest(".product-card")));
});

document.getElementById("qvClose").addEventListener("click", closeQuickview);
qvOverlay.addEventListener("click", closeQuickview); // clicking the backdrop also closes it

// Live character counter for the special instructions box.
qvNote.addEventListener("input", () => {
  qvNoteCount.textContent = `${qvNote.value.length}/500`;
});

document.getElementById("qvInc").addEventListener("click", () => {
  qvQty.textContent = Number(qvQty.textContent) + 1;
});
document.getElementById("qvDec").addEventListener("click", () => {
  qvQty.textContent = Math.max(1, Number(qvQty.textContent) - 1); // never below 1 in the modal
});

qvAddBtn.addEventListener("click", () => {
  if (!qvCurrent) return;
  const { id, name, emoji, card } = qvCurrent;
  const { unit, price } = getQvActiveSize(card);
  const qty = Number(qvQty.textContent);

  // CHANGED: compound key when a size is selected, so different
  // sizes of the same product live as separate cart lines.
  const activeSizeBtn = qvSizeSelect.querySelector(".size-btn.active");
  const cartKey = activeSizeBtn ? `${id}::${unit}` : id;

  // Save (or overwrite) this product in the cart, including
  // the special instructions note if the user typed one.
  cart[cartKey] = { name, emoji, unit, price, qty, note: qvNote.value.trim() };
  syncCardQty(cartKey, qty);
  updateCartUI();
  closeQuickview();
  openCart(); // show the cart drawer immediately so the add feels confirmed
});


/* -------------------------------------------------------
   PRODUCT CARD QTY CONTROLS
   The +/- buttons directly on each carousel card (as opposed
   to the ones inside the Quick View modal or the cart drawer).
   All three update the same `cart` object, so they always
   stay in sync with each other.

   CHANGED: products can now optionally have a .size-select with
   several .size-btn options (Cow/Buffalo/Goat Milk, Bread). When
   present, the ACTIVE size button decides the unit + price, and
   the cart key becomes "id::size" so different sizes of the same
   product can sit in the cart at the same time as separate lines.
   Products without a .size-select behave exactly as before.
------------------------------------------------------- */
document.querySelectorAll(".product-card").forEach(card => {
  const id = card.dataset.id;
  const name = card.dataset.name;
  const emoji = card.dataset.emoji;
  const qtyValue = card.querySelector(".qty-value");
  const sizeButtons = card.querySelectorAll(".size-select .size-btn");

  // Returns the currently selected unit/price/cartKey for this card,
  // whether it has size options or just a single fixed price.
  function getActive() {
    const activeBtn = card.querySelector(".size-select .size-btn.active");
    if (activeBtn) {
      return {
        unit: activeBtn.dataset.size,
        price: Number(activeBtn.dataset.price),
        cartKey: `${id}::${activeBtn.dataset.size}`
      };
    }
    return {
      unit: card.dataset.unit,
      price: Number(card.dataset.price),
      cartKey: id
    };
  }

  // Updates the number shown on the card to match whatever's
  // already in the cart for the currently selected size.
  function refreshQtyDisplay() {
    const { cartKey } = getActive();
    qtyValue.textContent = cart[cartKey] ? cart[cartKey].qty : 0;
  }

  // Switching size shows that size's own quantity (not the
  // previous size's), so the number on screen is never misleading.
  sizeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      sizeButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      refreshQtyDisplay();
    });
  });

  card.querySelectorAll(".qty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const { unit, price, cartKey } = getActive();
      let qty = cart[cartKey] ? cart[cartKey].qty : 0;

      if (btn.dataset.action === "inc") qty++;
      if (btn.dataset.action === "dec") qty = Math.max(0, qty - 1);

      qtyValue.textContent = qty;

      // At 0 the item shouldn't exist in the cart at all —
      // this keeps Object.keys(cart) accurate for the badge count.
      if (qty === 0) {
        delete cart[cartKey];
      } else {
        cart[cartKey] = { name, emoji, unit, price, qty };
      }
      updateCartUI();
    });
  });
});


/* -------------------------------------------------------
   CHECKOUT
   Builds one consolidated, nicely formatted WhatsApp message
   listing every item in the cart (with notes, if any) and
   the grand total, then opens it via the WhatsApp helper.
------------------------------------------------------- */
document.getElementById("checkoutBtn").addEventListener("click", () => {
  const ids = Object.keys(cart);

  // Nothing in the cart — fall back to the generic greeting
  // instead of sending an empty order.
  if (ids.length === 0) {
    openWhatsApp(generalGreeting());
    return;
  }

  let lines = ids.map(id => {
    const item = cart[id];
    let line = `${item.emoji} ${item.name} — ${item.qty} x Rs.${item.price}/${item.unit} = Rs.${item.qty * item.price}`;
    if (item.note) line += `\n   Note: ${item.note}`;
    return line;
  });

  const total = ids.reduce((sum, id) => sum + cart[id].qty * cart[id].price, 0);

  const message =
    "Assalam-o-Alaikum Yousuf Dairy! 🥛\n" +
    "Mujhe yeh order karna hai:\n\n" +
    lines.join("\n") +
    `\n\nTotal: Rs. ${total}\n\n` +
    "📍 Delivery Address: [Apna address yahan likhein]\n" +
    "⏰ Preferred Time: Subah 8 baje se pehle\n\n" +
    "Shukriya!";

  openWhatsApp(message);
});


/* -------------------------------------------------------
   STICKY HEADER SHADOW
   Purely cosmetic: adds a subtle shadow under the header
   once the page is scrolled, so it visually separates from
   the content beneath it.
------------------------------------------------------- */
const header = document.getElementById("header");
window.addEventListener("scroll", () => {
  header.style.boxShadow = window.scrollY > 30 ? "0 4px 16px rgba(31,59,77,.06)" : "none";
});