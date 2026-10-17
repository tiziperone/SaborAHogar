/* =========================================
   CONFIGURACIÓN
   ========================================= */
// Código de país + código de área + número, sin 0 ni 15.
// 54 (Argentina) + 9 (celular) + 3482 (área) + 236252
const WHATSAPP_NUMBER = "5493482236252";

/* =========================================
   PRODUCTOS
   options: cada presentación con su precio
   image: foto de tarjeta (ruta dentro de la carpeta del sitio)
   ========================================= */
const PRODUCTS = [
  // FIDEOS
  {
    id: "fideos-huevo",
    name: "Fideos de huevo",
    desc: "Fideos frescos al huevo, un clásico que siempre va bien.",
    category: "fideos",
    image: "Fotos/FideosTarjeta.webp",
    badge: "",
    options: [
      { label: "500 g", price: 3500 },
      { label: "1 kg", price: 6000 }
    ]
  },
  {
    id: "fideos-espinaca",
    name: "Fideos de espinaca",
    desc: "Fideos verdes de espinaca, especiales para darle color a tu plato.",
    category: "fideos",
    image: "Fotos/FideosEspinacaTarjeta.webp",
    badge: "",
    options: [
      { label: "500 g", price: 4000 },
      { label: "1 kg", price: 7000 }
    ]
  },
  {
    id: "fideos-remolacha",
    name: "Fideos de remolacha",
    desc: "Fideos rojos de remolacha, especiales para darle color a tu plato.",
    category: "fideos",
    image: "Fotos/FideosRemolachaTarjeta.webp",
    badge: "",
    options: [
      { label: "500 g", price: 4000 },
      { label: "1 kg", price: 7000 }
    ]
  },

  // RAVIOLES
  {
    id: "raviolones-jamon-queso",
    name: "Raviolones de jamón y queso",
    desc: "Rellenos generosos de jamón cocido y queso.",
    category: "raviolones",
    image: "Fotos/RaviolesTarjeta.webp",
    badge: "",
    options: [
      { label: "Media docena", price: 5000 },
      { label: "Docena", price: 9000 }
    ]
  },
  {
    id: "raviolones-ricota-espinaca",
    name: "Raviolones de ricota y verduras",
    desc: "Relleno suave de ricota y verduras, con masa de huevo.",
    category: "raviolones",
    image: "Fotos/RaviolesTarjeta.webp",
    badge: "",
    options: [
      { label: "Media docena", price: 5000 },
      { label: "Docena", price: 9000 }
    ]
  },

  // SORRENTINOS
  {
    id: "sorrentinos-jamon-queso",
    name: "Sorrentinos de jamón y queso",
    desc: "Grandes, con jamón cocido y queso de máxima calidad.",
    category: "sorrentinos",
    image: "Fotos/SorrentinosTarjeta.webp",
    badge: "",
    options: [
      { label: "Media docena", price: 5000 },
      { label: "Docena", price: 9000 }
    ]
  },
  {
    id: "sorrentinos-ricota-espinaca",
    name: "Sorrentinos de ricota y verduras",
    desc: "Relleno suave de ricota y espinaca, con masa fina.",
    category: "sorrentinos",
    image: "Fotos/SorrentinosTarjeta.webp",
    badge: "",
    options: [
      { label: "Media docena", price: 5000 },
      { label: "Docena", price: 9000 }
    ]
  }
];

/* =========================================
   ESTADO
   ========================================= */
const STORAGE_KEY = "sabor-a-hogar-cart-v2";
let cart = loadCart();   // { "id__idx": cantidad }
let pickState = {};      // { id: { opt: 0, qty: 1 } }

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

function getPick(id) {
  if (!pickState[id]) pickState[id] = { opt: 0, qty: 1 };
  return pickState[id];
}

function makeKey(id, optIdx) {
  return `${id}__${optIdx}`;
}

function cartEntries() {
  return Object.entries(cart)
    .filter(([, qty]) => qty > 0)
    .map(([key, qty]) => {
      const [id, idx] = key.split("__");
      const product = getProduct(id);
      const option = product ? product.options[Number(idx)] : null;
      return { key, product, option, qty };
    })
    .filter((item) => item.product && item.option);
}

function cartTotal() {
  return cartEntries().reduce((sum, { option, qty }) => sum + option.price * qty, 0);
}

function cartCount() {
  return cartEntries().reduce((sum, { qty }) => sum + qty, 0);
}

function lineText(product, option, qty) {
  return `${qty} x ${product.name} (${option.label}) — ${money.format(option.price * qty)}`;
}

/* =========================================
   RENDER PRODUCTOS
   ========================================= */
function mediaHTML(p) {
  if (p.image) return `<img src="${p.image}" alt="${p.name}" loading="lazy" />`;
  return `<span class="card__emoji">🍝</span>`;
}

function cardHTML(p, i) {
  const pick = getPick(p.id);
  const opt = p.options[pick.opt];

  return `
    <article class="card" data-card="${p.id}" style="animation-delay:${i * 0.05}s">
      <div class="card__media">
        ${mediaHTML(p)}
        ${p.badge ? `<span class="card__badge">${p.badge}</span>` : ""}
      </div>
      <div class="card__body">
        <h3>${p.name}</h3>
        <p class="card__desc">${p.desc}</p>

        <div class="card__label">Presentación</div>
        <div class="card__opts">
          ${p.options
            .map(
              (o, idx) => `
            <button class="opt ${idx === pick.opt ? "is-active" : ""}"
              data-action="opt" data-id="${p.id}" data-idx="${idx}">${o.label}</button>`
            )
            .join("")}
        </div>

        <div class="price">
          <span class="price-value">${money.format(opt.price)}</span>
          <small class="price-unit">/ ${opt.label}</small>
        </div>

        <div class="card__qty">
          <span class="card__qty-label">Cantidad</span>
          <div class="qty">
            <button data-action="minus" data-id="${p.id}" aria-label="Quitar">−</button>
            <span class="qty-value">${pick.qty}</span>
            <button data-action="plus" data-id="${p.id}" aria-label="Agregar">+</button>
          </div>
        </div>

        <div class="card__subtotal">Subtotal: <strong class="subtotal">${money.format(opt.price * pick.qty)}</strong></div>

        <div class="card__actions">
          <button class="btn btn--add" data-action="add" data-id="${p.id}">Al carrito</button>
          <button class="btn btn--buy" data-action="buy" data-id="${p.id}">Comprar</button>
        </div>
      </div>
    </article>`;
}

function renderProducts(filter = "todas") {
  const list = filter === "todas" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);
  $("#productGrid").innerHTML = list.map((p, i) => cardHTML(p, i)).join("");
}

/* Actualiza una tarjeta sin volver a renderizar todo */
function updateCard(id) {
  const p = getProduct(id);
  const card = document.querySelector(`[data-card="${id}"]`);
  if (!p || !card) return;

  const pick = getPick(id);
  const opt = p.options[pick.opt];

  card.querySelectorAll(".opt").forEach((btn, idx) => {
    btn.classList.toggle("is-active", idx === pick.opt);
  });
  card.querySelector(".price-value").textContent = money.format(opt.price);
  card.querySelector(".price-unit").textContent = `/ ${opt.label}`;
  card.querySelector(".qty-value").textContent = pick.qty;
  card.querySelector(".subtotal").textContent = money.format(opt.price * pick.qty);
}

/* =========================================
   RENDER CARRITO
   ========================================= */
function renderCart() {
  const items = cartEntries();
  const container = $("#cartItems");

  if (items.length === 0) {
    container.innerHTML = `<p class="cart__empty">Todavía no agregaste nada 😔. ¡Elegí tus pastas favoritas! 🍝</p>`;
  } else {
    container.innerHTML = items
      .map(
        ({ key, product, option, qty }) => `
        <div class="cart__item">
          <div>
            <h4>${product.name}</h4>
            <div class="sub">${option.label} · ${money.format(option.price)} × ${qty}</div>
            <button class="remove" data-action="remove" data-key="${key}">Quitar</button>
          </div>
          <div class="line-total">${money.format(option.price * qty)}</div>
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
function addToCart(id) {
  const pick = getPick(id);
  const key = makeKey(id, pick.opt);
  cart[key] = (cart[key] || 0) + pick.qty;
  refreshCart();
  bumpCartButton();
}

function removeFromCart(key) {
  delete cart[key];
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
   (mensajes sin emojis: en algunos celulares se ven rotos)
   ========================================= */
function buildWhatsAppLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function buyNow(id) {
  const p = getProduct(id);
  if (!p) return;
  const pick = getPick(id);
  const opt = p.options[pick.opt];
  const total = money.format(opt.price * pick.qty);

  const msg =
    `¡Hola Sabor a Hogar!\n` +
    `Quisiera hacer el siguiente pedido:\n\n` +
    `• ${lineText(p, opt, pick.qty)}\n\n` +
    `*Total: ${total}*\n\n` +
    `¡Gracias!`;

  window.open(buildWhatsAppLink(msg), "_blank", "noopener");
}

function buildOrderMessage(name, delivery, address, payment, notes) {
  const lines = cartEntries().map(({ product, option, qty }) => `• ${lineText(product, option, qty)}`);

  let msg = `¡Hola Sabor a Hogar!\nQuisiera hacer el siguiente pedido:\n\n`;
  msg += lines.join("\n");
  msg += `\n\n*Total: ${money.format(cartTotal())}*\n\n`;
  msg += `Nombre: ${name}\n`;
  msg += `Entrega: ${delivery}\n`;
  if (delivery === "Envío" && address) msg += `Dirección: ${address}\n`;
  msg += `Forma de pago: ${payment}\n`;
  if (notes) msg += `Notas: ${notes}\n`;
  msg += `\n¡Gracias!`;
  return msg;
}

/* =========================================
   LIMPIAR FORMULARIO DEL CARRITO
   ========================================= */
function resetOrderForm() {
  $("#orderForm").reset();          // vuelve a Retiro / Efectivo y vacía los campos
  $("#addressField").classList.add("is-hidden");
  $("#address").required = false;
}

/* =========================================
   BOTÓN VOLVER ARRIBA
   ========================================= */
function setupBackToTop() {
  const btn = $("#backTop");
  if (!btn) return;

  const toggle = () => {
    btn.classList.toggle("is-visible", window.scrollY > 500);
  };
  window.addEventListener("scroll", toggle, { passive: true });
  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  toggle();
}

/* =========================================
   EVENTOS
   ========================================= */
document.addEventListener("DOMContentLoaded", () => {
  $("#year").textContent = new Date().getFullYear();
  $("#footerWsp").href = buildWhatsAppLink("¡Hola! Quisiera hacer una consulta sobre las pastas.");

  renderProducts();
  renderCart();
  setupBackToTop();

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

    if (action === "opt") {
      getPick(id).opt = Number(btn.dataset.idx);
      updateCard(id);
    }
    if (action === "plus") {
      getPick(id).qty = Math.min(50, getPick(id).qty + 1);
      updateCard(id);
    }
    if (action === "minus") {
      getPick(id).qty = Math.max(1, getPick(id).qty - 1);
      updateCard(id);
    }
    if (action === "add") addToCart(id);
    if (action === "buy") buyNow(id);
  });

  // Quitar desde el carrito
  $("#cartItems").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action='remove']");
    if (btn) removeFromCart(btn.dataset.key);
  });

  // Abrir / cerrar carrito
  const openCart = () => {
    $("#cart").classList.add("is-open");
    $("#cart").setAttribute("aria-hidden", "false");
    $("#overlay").classList.add("is-open");
    document.body.style.overflow = "hidden";
  };

  const closeCart = () => {
    const cartEl = $("#cart");
    // Quitamos el foco de cualquier elemento dentro del carrito antes de ocultarlo
    if (cartEl.contains(document.activeElement)) {
      document.activeElement.blur();
      $("#openCartTop").focus();
    }
    cartEl.classList.remove("is-open");
    cartEl.setAttribute("aria-hidden", "true");
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

  // Enviar pedido: abre WhatsApp, vacía el carrito y limpia los campos
  $("#orderForm").addEventListener("submit", (e) => {
    e.preventDefault();

    if (cartEntries().length === 0) {
      alert("Tu carrito está vacío. Agregá al menos un producto.");
      return;
    }

    const name = $("#customerName").value.trim();
    const delivery = $("input[name='delivery']:checked").value;
    const address = $("#address").value.trim();
    const payment = $("input[name='payment']:checked").value;
    const notes = $("#notes").value.trim();

    const message = buildOrderMessage(name, delivery, address, payment, notes);
    window.open(buildWhatsAppLink(message), "_blank", "noopener");

    // El pedido ya se envió: vaciamos carrito y formulario
    cart = {};
    refreshCart();
    resetOrderForm();
    closeCart();
  });
});