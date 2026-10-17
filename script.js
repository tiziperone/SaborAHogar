/* =========================================
   CONFIGURACIÓN
   ========================================= */
// Código de país + código de área + número, sin 0 ni 15.
// Ejemplo Argentina: 5493424123456
const WHATSAPP_NUMBER = "5493400000000";

/* =========================================
   PRODUCTOS (editá esta lista a gusto)
   image: ruta de la foto de tarjeta (si no hay, se muestra el emoji)
   ========================================= */
const PRODUCTS = [
  {
    id: "ravioles-ricota",
    name: "Ravioles de ricota y espinaca",
    desc: "Rellenos cremosos de ricota y espinaca, con masa fina de huevo.",
    price: 8500,
    unit: "porción 500 g",
    category: "rellenas",
    image: "Fotos/RaviolesTarjeta.webp",
    emoji: "🥟",
    badge: "Más pedido"
  },
  {
    id: "sorrentinos-jamon",
    name: "Sorrentinos de jamón y queso",
    desc: "Grandes, con jamón cocido y queso de máxima calidad.",
    price: 9200,
    unit: "porción 500 g",
    category: "rellenas",
    image: "Fotos/SorrentinosTarjeta.webp",
    emoji: "🥠",
    badge: ""
  },
  {
    id: "capellettis",
    name: "Capelletti de pollo",
    desc: "Pequeños y delicados, rellenos de pollo asado y verduras.",
    price: 8800,
    unit: "porción 500 g",
    category: "rellenas",
    image: "",
    emoji: "🌰",
    badge: ""
  },
  {
    id: "noquis-papa",
    name: "Ñoquis de papa",
    desc: "Tradicionales, livianos, hechos el mismo día.",
    price: 6000,
    unit: "porción 500 g",
    category: "clasicas",
    image: "",
    emoji: "🥔",
    badge: "Clásico"
  },
  {
    id: "tallarines",
    name: "Tallarines frescos",
    desc: "Cortados a mano, con el punto justo de huevo.",
    price: 5500,
    unit: "porción 500 g",
    category: "clasicas",
    image: "Fotos/FideosTarjeta.webp",
    emoji: "🍝",
    badge: ""
  },
  {
    id: "fettuccine-espinaca",
    name: "Fettuccine de espinaca",
    desc: "Cintas verdes de espinaca, perfectas para salsas cremosas.",
    price: 5800,
    unit: "porción 500 g",
    category: "clasicas",
    image: "Fotos/FideosEspinacaTarjeta.webp",
    emoji: "🥬",
    badge: ""
  },
  {
    id: "combo-familiar",
    name: "Combo familiar",
    desc: "1 kg de ravioles + 500 g de tallarines. Ideal para 4 personas.",
    price: 15500,
    unit: "combo 1,5 kg",
    category: "combos",
    image: "",
    emoji: "🎁",
    badge: "Ahorro"
  },
  {
    id: "combo-parejas",
    name: "Combo para dos",
    desc: "500 g de sorrentinos + 500 g de ñoquis, con salsa de regalo.",
    price: 13000,
    unit: "combo 1 kg",
    category: "combos",
    image: "",
    emoji: "💞",
    badge: ""
  }
];

/* =========================================
   ESTADO
   ========================================= */
const STORAGE_KEY = "sabor-a-hogar-cart";
let cart = loadCart();   // { productId: cantidad } -> carrito
let pickQty = {};        // { productId: cantidad } -> selector de cada tarjeta

/* =========================================
   HELPERS
   ========================================= */
const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0
});

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch {
    /* el navegador puede bloquear el almacenamiento */
  }
}

function getProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

function getPickQty(id) {
  return pickQty[id] || 1;
}

function cartEntries() {
  return Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ product: getProduct(id), qty }))
    .filter((item) => item.product);
}

function cartTotal() {
  return cartEntries().reduce((sum, { product, qty }) => sum + product.price * qty, 0);
}

function cartCount() {
  return cartEntries().reduce((sum, { qty }) => sum + qty, 0);
}

/* =========================================
   RENDER PRODUCTOS
   ========================================= */
function mediaHTML(p) {
  if (p.image) {
    return `<img src="${p.image}" alt="${p.name}" loading="lazy" />`;
  }
  return `<span class="card__emoji">${p.emoji}</span>`;
}

function renderProducts(filter = "todas") {
  const grid = $("#productGrid");
  const list = filter === "todas" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  grid.innerHTML = list
    .map((p, i) => {
      const qty = getPickQty(p.id);
      return `
        <article class="card" style="animation-delay:${i * 0.05}s">
          <div class="card__media">
            ${mediaHTML(p)}
            ${p.badge ? `<span class="card__badge">${p.badge}</span>` : ""}
          </div>
          <div class="card__body">
            <h3>${p.name}</h3>
            <p class="card__desc">${p.desc}</p>
            <div class="price">${money.format(p.price)} <small>/ ${p.unit}</small></div>

            <div class="card__qty">
              <span class="card__qty-label">Cantidad</span>
              <div class="qty">
                <button data-action="minus" data-id="${p.id}" aria-label="Quitar">−</button>
                <span id="pick-${p.id}">${qty}</span>
                <button data-action="plus" data-id="${p.id}" aria-label="Agregar">+</button>
              </div>
            </div>

            <div class="card__actions">
              <button class="btn btn--add" data-action="add" data-id="${p.id}">Al carrito</button>
              <button class="btn btn--buy" data-action="buy" data-id="${p.id}">Comprar</button>
            </div>
          </div>
        </article>`;
    })
    .join("");
}

/* =========================================
   RENDER CARRITO
   ========================================= */
function renderCart() {
  const items = cartEntries();
  const container = $("#cartItems");

  if (items.length === 0) {
    container.innerHTML = `<p class="cart__empty">Todavía no agregaste nada. ¡Elegí tus pastas favoritas! 🍝</p>`;
  } else {
    container.innerHTML = items
      .map(
        ({ product, qty }) => `
        <div class="cart__item">
          <div>
            <h4>${product.name}</h4>
            <div class="sub">${money.format(product.price)} × ${qty} (${product.unit})</div>
            <button class="remove" data-action="remove" data-id="${product.id}">Quitar</button>
          </div>
          <div class="line-total">${money.format(product.price * qty)}</div>
        </div>`
      )
      .join("");
  }

  $("#cartTotal").textContent = money.format(cartTotal());
  const count = cartCount();
  $("#cartCountTop").textContent = count;
  $("#cartCountFloat").textContent = count;
}

function refreshCart() {
  renderCart();
  saveCart();
}

/* =========================================
   ACCIONES
   ========================================= */
function changePickQty(id, delta) {
  pickQty[id] = Math.max(1, getPickQty(id) + delta);
  const el = document.getElementById(`pick-${id}`);
  if (el) el.textContent = pickQty[id];
}

function addToCart(id, qty) {
  cart[id] = (cart[id] || 0) + qty;
  refreshCart();
  bumpCartButton();
}

function removeFromCart(id) {
  delete cart[id];
  refreshCart();
}

function bumpCartButton() {
  const btn = $("#openCartFloat");
  btn.classList.remove("bump");
  void btn.offsetWidth;
  btn.classList.add("bump");
}

/* =========================================
   WHATSAPP
   ========================================= */
function buildWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function buyNow(id, qty) {
  const p = getProduct(id);
  if (!p) return;
  const subtotal = money.format(p.price * qty);
  const msg =
    `¡Hola Sabor a Hogar! 🍝\n` +
    `Quisiera hacer el siguiente pedido:\n\n` +
    `• ${qty} x ${p.name} (${p.unit}) — ${subtotal}\n\n` +
    `*Total: ${subtotal}*\n\n` +
    `¡Gracias! 🙌`;
  window.open(buildWhatsAppLink(msg), "_blank", "noopener");
}

function askAboutProduct(id) {
  const p = getProduct(id);
  if (!p) return;
  const msg = `¡Hola! 👋 Quisiera consultar por *${p.name}* (${money.format(p.price)} / ${p.unit}).`;
  window.open(buildWhatsAppLink(msg), "_blank", "noopener");
}

function buildOrderMessage(name, delivery, address, notes) {
  const lines = cartEntries().map(
    ({ product, qty }) =>
      `• ${qty} x ${product.name} (${product.unit}) — ${money.format(product.price * qty)}`
  );

  let msg = `¡Hola Sabor a Hogar! 🍝\nQuisiera hacer el siguiente pedido:\n\n`;
  msg += lines.join("\n");
  msg += `\n\n*Total: ${money.format(cartTotal())}*\n\n`;
  msg += `👤 Nombre: ${name}\n`;
  msg += `🛵 Entrega: ${delivery}\n`;
  if (delivery === "Envío" && address) msg += `📍 Dirección: ${address}\n`;
  if (notes) msg += `📝 Notas: ${notes}\n`;
  msg += `\n¡Gracias! 🙌`;
  return msg;
}

/* =========================================
   EVENTOS
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  $("#footerWsp").href = buildWhatsAppLink("¡Hola! Quisiera hacer una consulta sobre las pastas. 🍝");

  renderProducts();
  renderCart();

  // Filtros
  $("#filters").addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    $$(".chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    renderProducts(chip.dataset.filter);
  });

  // Acciones de las tarjetas
  $("#productGrid").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const { action, id } = btn.dataset;

    if (action === "plus") changePickQty(id, 1);
    if (action === "minus") changePickQty(id, -1);
    if (action === "add") addToCart(id, getPickQty(id));
    if (action === "buy") buyNow(id, getPickQty(id));
    if (action === "ask") askAboutProduct(id);
  });

  // Quitar desde el carrito
  $("#cartItems").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='remove']");
    if (btn) removeFromCart(btn.dataset.id);
  });

  // Abrir / cerrar carrito
  const openCart = () => {
    $("#cart").classList.add("is-open");
    $("#cart").setAttribute("aria-hidden", "false");
    $("#overlay").classList.add("is-open");
    document.body.style.overflow = "hidden";
  };
  const closeCart = () => {
    $("#cart").classList.remove("is-open");
    $("#cart").setAttribute("aria-hidden", "true");
    $("#overlay").classList.remove("is-open");
    document.body.style.overflow = "";
  };

  $("#openCartFloat").addEventListener("click", openCart);
  $("#openCartTop").addEventListener("click", openCart);
  $("#closeCart").addEventListener("click", closeCart);
  $("#overlay").addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeCart());

  // Dirección sólo si es envío
  $$("input[name='delivery']").forEach((radio) => {
    radio.addEventListener("change", () => {
      const isShipping = $("input[name='delivery']:checked").value === "Envío";
      $("#addressField").classList.toggle("is-hidden", !isShipping);
      $("#address").required = isShipping;
    });
  });

  // Vaciar carrito
  $("#clearCart").addEventListener("click", () => {
    if (!confirm("¿Seguro que querés vaciar el carrito?")) return;
    cart = {};
    refreshCart();
  });

  // Enviar pedido del carrito
  $("#orderForm").addEventListener("submit", (e) => {
    e.preventDefault();

    if (cartEntries().length === 0) {
      alert("Tu carrito está vacío. Agregá al menos un producto. 🍝");
      return;
    }

    const name = $("#customerName").value.trim();
    const delivery = $("input[name='delivery']:checked").value;
    const address = $("#address").value.trim();
    const notes = $("#notes").value.trim();

    const message = buildOrderMessage(name, delivery, address, notes);
    window.open(buildWhatsAppLink(message), "_blank", "noopener");
  });
});