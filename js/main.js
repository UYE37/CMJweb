// ============================================================
// CONFIGURACIÓN MERCADO PAGO
// ============================================================
// 1. Reemplazá este valor con tu Public Key real de MP:
//    mercadopago.com.ar/developers/panel → Tu aplicación → Credenciales
// 2. Usá la clave de TEST para probar, y la de PRODUCCIÓN para cobrar
const MP_PUBLIC_KEY = "TU_PUBLIC_KEY_ACA"; // ← reemplazar

// URLs a donde MP redirige después del pago (reemplazá con tu dominio)
const MP_SUCCESS_URL = "https://tudominio.com/pago-exitoso.html";
const MP_FAILURE_URL = "https://tudominio.com/pago-fallido.html";
const MP_PENDING_URL = "https://tudominio.com/pago-pendiente.html";

// ============================================================
// PRODUCTOS
// ============================================================
const productos = [
  {
    id: 1, nombre: "Amoladora Angular 9\" 2400W", categoria: "electricas",
    precio: 84999, precioOld: 99999,
    emoji: "⚙️", desc: "Disco 230mm. Potencia 2400W. Ideal para corte y desbaste profesional.",
    oferta: true
  },
  {
    id: 2, nombre: "Taladro Percutor 13mm 1050W", categoria: "electricas",
    precio: 62500, precioOld: null,
    emoji: "🔧", desc: "Mandril 13mm. Doble velocidad. Función percutora. Maletín incluido.",
    oferta: false
  },
  {
    id: 3, nombre: "Sierra Circular 7¼\" 1800W", categoria: "electricas",
    precio: 95000, precioOld: 115000,
    emoji: "🪚", desc: "Disco 185mm. Guía de corte paralelo. Plato de aluminio.",
    oferta: true
  },
  {
    id: 4, nombre: "Juego de Llaves Combinadas x12", categoria: "manuales",
    precio: 18900, precioOld: null,
    emoji: "🔩", desc: "Acero cromo vanadio. Medidas 6 al 22mm. Bolsa incluida.",
    oferta: false
  },
  {
    id: 5, nombre: "Martillo Demoledor 28J SDS-Max", categoria: "electricas",
    precio: 189000, precioOld: 220000,
    emoji: "🔨", desc: "28 joules de impacto. Rotación bloqueada. Maletín y accesorios.",
    oferta: true
  },
  {
    id: 6, nombre: "Casco de Seguridad Dieléctrico", categoria: "seguridad",
    precio: 4500, precioOld: null,
    emoji: "⛑️", desc: "Norma IRAM. Ventilado. Ajuste por ruleta. Varios colores.",
    oferta: false
  },
  {
    id: 7, nombre: "Guantes de Nitrilo Reforzados x12", categoria: "seguridad",
    precio: 8900, precioOld: 11000,
    emoji: "🧤", desc: "Resistentes al corte. Agarre antideslizante. Caja x12 pares.",
    oferta: true
  },
  {
    id: 8, nombre: "Tornillos Autoperforantes x500", categoria: "fijaciones",
    precio: 3200, precioOld: null,
    emoji: "🪛", desc: "Medida 8x1\". Acero galvanizado. Punta broca. Ideal para Steel Framing.",
    oferta: false
  },
  {
    id: 9, nombre: "Nivel Láser Autonivelante 3 Líneas", categoria: "manuales",
    precio: 54000, precioOld: 68000,
    emoji: "📐", desc: "3 líneas cruzadas 360°. Alcance 30m. Estuche y soporte incluidos.",
    oferta: true
  },
  {
    id: 10, nombre: "Tarugos Plásticos Surtidos x500", categoria: "fijaciones",
    precio: 2800, precioOld: null,
    emoji: "📦", desc: "Medidas 6, 8 y 10mm. Bolsa surtida. Alta resistencia.",
    oferta: false
  },
  {
    id: 11, nombre: "Soldadora Inverter 160A", categoria: "electricas",
    precio: 148000, precioOld: 175000,
    emoji: "⚡", desc: "Corriente DC 160A. Liviana 3.5kg. Incluye cables y careta.",
    oferta: true
  },
  {
    id: 12, nombre: "Lentes de Seguridad Antiimpacto", categoria: "seguridad",
    precio: 2100, precioOld: null,
    emoji: "🥽", desc: "Anti-UV. Marco ventilado. Lente incolora o oscura.",
    oferta: false
  }
];

// ============================================================
// ESTADO
// ============================================================
let carrito = [];
let categoriaActiva = "todos";
let mpInstance = null;

// ============================================================
// INICIALIZAR MERCADO PAGO SDK
// ============================================================
function inicializarMP() {
  // El SDK de MP se carga desde el HTML (ver script tag en index.html)
  if (typeof MercadoPago !== "undefined" && MP_PUBLIC_KEY !== "TU_PUBLIC_KEY_ACA") {
    try {
      mpInstance = new MercadoPago(MP_PUBLIC_KEY, { locale: "es-AR" });
    } catch (e) {
      console.warn("MP no se pudo inicializar:", e);
    }
  }
}

// ============================================================
// RENDER PRODUCTOS
// ============================================================
function renderProductos(cat) {
  const grid = document.getElementById("productosGrid");
  const filtered = cat === "todos" ? productos : productos.filter(p => p.categoria === cat);

  grid.innerHTML = filtered.map(p => `
    <div class="producto-card reveal" data-cat="${p.categoria}">
      <div class="producto-img">
        <span>${p.emoji}</span>
        ${p.oferta ? '<span class="producto-badge">OFERTA</span>' : ''}
      </div>
      <div class="producto-body">
        <div class="producto-cat">${catLabel(p.categoria)}</div>
        <div class="producto-name">${p.nombre}</div>
        <div class="producto-desc">${p.desc}</div>
        <div class="producto-footer">
          <div class="producto-price">
            ${p.precioOld ? `<span class="precio-old">$${p.precioOld.toLocaleString('es-AR')}</span>` : ''}
            $${p.precio.toLocaleString('es-AR')}
          </div>
          <button class="add-btn" onclick="agregarAlCarrito(${p.id})" title="Agregar al carrito">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');

  observeReveal();
}

function catLabel(cat) {
  const labels = { electricas: "Eléctricas", manuales: "Manuales", seguridad: "Seguridad", fijaciones: "Fijaciones" };
  return labels[cat] || cat;
}

// ============================================================
// FILTROS
// ============================================================
document.querySelectorAll('.filtro-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    categoriaActiva = btn.dataset.cat;
    renderProductos(categoriaActiva);
  });
});

// ============================================================
// CARRITO — AGREGAR / QUITAR
// ============================================================
function agregarAlCarrito(id) {
  const prod = productos.find(p => p.id === id);
  const item = carrito.find(i => i.id === id);
  if (item) {
    item.qty++;
  } else {
    carrito.push({ ...prod, qty: 1 });
  }
  actualizarCarrito();
  abrirCarrito();
}

function quitarDelCarrito(id) {
  const idx = carrito.findIndex(i => i.id === id);
  if (idx === -1) return;
  if (carrito[idx].qty > 1) {
    carrito[idx].qty--;
  } else {
    carrito.splice(idx, 1);
  }
  actualizarCarrito();
}

// ============================================================
// CARRITO — RENDER
// ============================================================
function actualizarCarrito() {
  const badge    = document.getElementById('carritoBadge');
  const itemsEl  = document.getElementById('carritoItems');
  const footerEl = document.getElementById('carritoFooter');
  const totalEl  = document.getElementById('carritoTotal');

  const totalQty = carrito.reduce((sum, i) => sum + i.qty, 0);
  badge.textContent = totalQty;

  if (carrito.length === 0) {
    itemsEl.innerHTML = `
      <div class="carrito-empty">
        <i class="fa-solid fa-box-open"></i>
        <p>Tu carrito está vacío</p>
      </div>`;
    footerEl.style.display = 'none';
    return;
  }

  itemsEl.innerHTML = carrito.map(i => `
    <div class="carrito-item">
      <div class="carrito-item-emoji">${i.emoji}</div>
      <div class="carrito-item-info">
        <div class="carrito-item-name">${i.nombre}</div>
        <div class="carrito-item-price">$${(i.precio * i.qty).toLocaleString('es-AR')}</div>
      </div>
      <div class="carrito-item-qty">
        <button class="qty-btn" onclick="quitarDelCarrito(${i.id})"><i class="fa-solid fa-minus"></i></button>
        <span class="qty-num">${i.qty}</span>
        <button class="qty-btn" onclick="agregarAlCarrito(${i.id})"><i class="fa-solid fa-plus"></i></button>
      </div>
    </div>
  `).join('');

  const total = carrito.reduce((sum, i) => sum + i.precio * i.qty, 0);
  totalEl.textContent = `$${total.toLocaleString('es-AR')}`;
  footerEl.style.display = 'block';
}

// ============================================================
// TOGGLE CARRITO
// ============================================================
function toggleCarrito() {
  document.getElementById('carritoSidebar').classList.toggle('open');
  document.getElementById('carritoOverlay').classList.toggle('open');
}

function abrirCarrito() {
  document.getElementById('carritoSidebar').classList.add('open');
  document.getElementById('carritoOverlay').classList.add('open');
}

// ============================================================
// PAGAR CON MERCADO PAGO
// ============================================================
async function pagarConMP() {
  if (carrito.length === 0) return;

  const btn = document.getElementById('btnPagarMP');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Procesando...';

  // Verificar que la Public Key fue configurada
  if (MP_PUBLIC_KEY === "TU_PUBLIC_KEY_ACA") {
    mostrarModalConfig();
    btn.disabled = false;
    btn.innerHTML = '<img src="images/mp-logo.svg" alt="MP" style="height:20px"> Pagar con Mercado Pago';
    return;
  }

  try {
    // Construir items para MP
    const items = carrito.map(i => ({
      id: String(i.id),
      title: i.nombre,
      quantity: i.qty,
      unit_price: i.precio,
      currency_id: "ARS"
    }));

    // Llamar a la API de MP para crear la preferencia
    // NOTA: En producción con backend PHP/Node esto se hace server-side.
    // Con GitHub Pages usamos el endpoint público de preferencias de MP.
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // En frontend estático usamos el Access Token de TEST temporalmente.
        // ⚠️ Cuando tengas hosting con PHP, mover esta lógica al backend.
        "Authorization": `Bearer ${window.MP_ACCESS_TOKEN || ""}`
      },
      body: JSON.stringify({
        items,
        back_urls: {
          success: MP_SUCCESS_URL,
          failure: MP_FAILURE_URL,
          pending: MP_PENDING_URL
        },
        auto_return: "approved",
        statement_descriptor: "CMJ FERRETERIA",
        external_reference: `CMJ-${Date.now()}`
      })
    });

    if (!response.ok) throw new Error("No se pudo crear la preferencia");

    const data = await response.json();
    // Redirigir al Checkout Pro de MP
    window.location.href = data.init_point; // producción
    // Para sandbox/test usar: data.sandbox_init_point

  } catch (err) {
    console.error(err);
    // Fallback: mostrar modal con instrucciones
    mostrarModalConfig();
  }

  btn.disabled = false;
  btn.innerHTML = '<img src="images/mp-logo.svg" alt="MP" style="height:20px"> Pagar con Mercado Pago';
}

// ============================================================
// MODAL — CONFIGURACIÓN PENDIENTE
// ============================================================
function mostrarModalConfig() {
  const total = carrito.reduce((sum, i) => sum + i.precio * i.qty, 0);
  const items = carrito.map(i => `• ${i.nombre} x${i.qty}`).join('\n');

  const modal = document.createElement('div');
  modal.className = 'mp-modal-overlay';
  modal.innerHTML = `
    <div class="mp-modal">
      <div class="mp-modal-header">
        <div class="mp-modal-icon"><i class="fa-solid fa-circle-info"></i></div>
        <h3>Configuración de Mercado Pago</h3>
        <button onclick="this.closest('.mp-modal-overlay').remove()" class="mp-modal-close">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      <div class="mp-modal-body">
        <p>Para activar el pago online, necesitás configurar tu <strong>Public Key</strong> de Mercado Pago en el archivo <code>js/main.js</code>:</p>
        <div class="mp-code-block">
          <code>const MP_PUBLIC_KEY = "<span class="mp-highlight">TU_PUBLIC_KEY_ACA</span>";</code>
        </div>
        <p>Obtené tus credenciales en:</p>
        <a href="https://www.mercadopago.com.ar/developers/panel" target="_blank" class="mp-link-btn">
          <i class="fa-solid fa-external-link"></i> mercadopago.com.ar/developers/panel
        </a>
        <div class="mp-divider">Mientras tanto, podés consultar por WhatsApp:</div>
        <div class="mp-pedido-resumen">
          <strong>Total: $${total.toLocaleString('es-AR')}</strong>
        </div>
      </div>
      <div class="mp-modal-footer">
        <button onclick="this.closest('.mp-modal-overlay').remove()" class="btn btn-ghost">Cerrar</button>
        <button onclick="consultarWhatsApp(); this.closest('.mp-modal-overlay').remove();" class="btn btn-wa">
          <i class="fa-brands fa-whatsapp"></i> Consultar por WhatsApp
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('visible'), 10);
}

// ============================================================
// CONSULTAR POR WHATSAPP
// ============================================================
function consultarWhatsApp() {
  if (carrito.length === 0) return;
  const items = carrito.map(i => `• ${i.nombre} x${i.qty} = $${(i.precio * i.qty).toLocaleString('es-AR')}`).join('\n');
  const total = carrito.reduce((sum, i) => sum + i.precio * i.qty, 0);
  const msg = `Hola! Quiero realizar el siguiente pedido:\n\n${items}\n\n💰 Total: $${total.toLocaleString('es-AR')}\n\n¿Me pueden confirmar disponibilidad y forma de pago?`;
  window.open(`https://wa.me/541132507568?text=${encodeURIComponent(msg)}`, '_blank');
}

// Alias para compatibilidad con el HTML anterior
function finalizarCompra() { consultarWhatsApp(); }

// ============================================================
// NAVBAR
// ============================================================
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  navbar.style.background = window.scrollY > 60
    ? 'rgba(10,10,10,0.98)'
    : 'rgba(10,10,10,0.92)';
});

// ============================================================
// SCROLL REVEAL
// ============================================================
function observeReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

function addRevealClasses() {
  ['.servicio-card', '.local-card', '.nosotros-text', '.nosotros-visual', '.red-link', '.contacto-item']
    .forEach(sel => document.querySelectorAll(sel).forEach(el => el.classList.add('reveal')));
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  renderProductos('todos');
  addRevealClasses();
  observeReveal();
  inicializarMP();
});
