/* =========================================================
   REST Coffee - script.js
   ========================================================= */

const WHATSAPP_NUMBER = '447551616591';
const MILK_OPTIONS = [
  { label: 'Whole milk', extra: 0 },
  { label: 'Oat milk', extra: 0.5 },
  { label: 'Soy milk', extra: 0.5 },
  { label: 'Almond milk', extra: 0.5 }
];
const MILK_CATEGORIES = ['Espresso', 'Matcha'];

const CATEGORIES = [
  { key: 'All', label: 'All Items' },
  { key: 'Espresso', label: 'Espresso Family' },
  { key: 'Matcha', label: 'Matcha & Specials' },
  { key: 'Filter', label: 'Filter & Brews' },
  { key: 'Bakery', label: 'Bakery' },
  { key: 'Beans', label: 'Coffee Beans' }
];

const IMG = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

const restMenuItems = [
  { id: 'rest-1', title: 'Flat White', category: 'Espresso', price: 3.70, image: IMG('photo-1577968897966-3d4325b36b61'), desc: 'Double espresso shot topped with velvety steamed milk.', flag: 'Popular' },
  { id: 'rest-2', title: 'Spanish Latte', category: 'Espresso', price: 5.10, image: IMG('photo-1541167760496-1628856ab772'), desc: 'Rich espresso blended with condensed milk and steamed milk.' },
  { id: 'rest-7', title: 'Iced Latte', category: 'Espresso', price: 4.40, image: IMG('photo-1517701604599-bb29b565090c'), desc: 'Double espresso poured over ice and cold milk. Smooth and refreshing.' },
  { id: 'rest-3', title: 'Lavender Matcha', category: 'Matcha', price: 6.40, image: IMG('photo-1536256263959-770b48d82b0a'), desc: 'Japanese ceremonial grade matcha with subtle lavender syrup.', flag: 'Signature', diet: ['Vegetarian'] },
  { id: 'rest-6', title: 'Chai Latte', category: 'Matcha', price: 4.20, image: IMG('photo-1576092768241-dec231879fc3'), desc: 'Warm aromatic spiced tea with micro-foamed milk.', diet: ['Vegetarian'] },
  { id: 'rest-4', title: 'V60 Hand Brew', category: 'Filter', price: 8.70, image: IMG('photo-1514432324607-a09d9b4aefdd'), desc: 'Precision hand-poured single origin filter coffee.', diet: ['Vegan'] },
  { id: 'rest-8', title: 'Butter Croissant', category: 'Bakery', price: 3.20, image: IMG('photo-1555507036-ab1f4038808a'), desc: 'Flaky, golden and baked fresh every morning.', flag: 'Fresh', diet: ['Vegetarian'] },
  { id: 'rest-9', title: 'Cinnamon Roll', category: 'Bakery', price: 3.90, image: IMG('photo-1509365465985-25d11c17e812'), desc: 'Soft, sticky and warmly spiced with a light glaze.', diet: ['Vegetarian'] },
  { id: 'rest-5', title: 'Dark Arts Whole Beans (250g)', category: 'Beans', price: 14.50, image: IMG('photo-1559056199-641a0ac8b55e'), desc: 'Dragon / Eternal Light specialty whole roast coffee beans.', diet: ['Vegan'] }
];

/* ---------- State ---------- */
const store = {
  get(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } },
  set(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* storage unavailable */ } }
};

let cart = store.get('rest_cart', []);
let currentCategory = 'All';
let searchTerm = '';
let lastFocus = null;

const $ = (id) => document.getElementById(id);
const money = (n) => `£${n.toFixed(2)}`;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderFilters();
  renderCustomerMenu();
  updateCartUI();
  renderHours();
  updateOpenStatus();
  setInterval(updateOpenStatus, 60000);
  bindEvents();
  initReveal();
  $('year').textContent = new Date().getFullYear();
});

/* ---------- Theme ---------- */
function initTheme() {
  const saved = store.get('rest_theme', null);
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  applyTheme(saved || (prefersLight ? 'light' : 'dark'));
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  $('themeIcon').className = theme === 'dark' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === 'dark' ? '#0f172a' : '#faf7f2';
}

function toggleTheme() {
  const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  store.set('rest_theme', next);
}

/* ---------- Menu ---------- */
function renderFilters() {
  $('categoryFilterGroup').innerHTML = CATEGORIES.map((c) =>
    `<button class="cat-btn ${c.key === currentCategory ? 'active' : ''}" data-cat="${c.key}" role="tab" aria-selected="${c.key === currentCategory}">${c.label}</button>`
  ).join('');
}

function filterCategory(cat) {
  currentCategory = cat;
  renderFilters();
  renderCustomerMenu();
}

function renderCustomerMenu() {
  const grid = $('customerMenuGrid');
  const q = searchTerm.trim().toLowerCase();

  const items = restMenuItems.filter((i) =>
    (currentCategory === 'All' || i.category === currentCategory) &&
    (!q || `${i.title} ${i.desc} ${i.category}`.toLowerCase().includes(q))
  );

  $('menuEmpty').classList.toggle('hidden', items.length > 0);

  grid.innerHTML = items.map((item, idx) => {
    const hasMilk = MILK_CATEGORIES.includes(item.category);
    return `
    <article class="menu-card" style="animation-delay:${idx * 60}ms">
      <div class="card-media">
        <img src="${item.image}" alt="${esc(item.title)}" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22800%22 height=%22600%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23253047%22/></svg>')}'">
        <span class="card-tag">${esc(item.category)}</span>
        ${item.flag ? `<span class="card-flag">${esc(item.flag)}</span>` : ''}
      </div>
      <div class="card-body">
        <div class="card-title">
          <h3>${esc(item.title)}</h3>
          <span class="price">${money(item.price)}</span>
        </div>
        <p>${esc(item.desc)}</p>
        ${item.diet ? `<div class="diet">${item.diet.map((d) => `<span>${esc(d)}</span>`).join('')}</div>` : ''}
      </div>
      <div class="card-foot">
        ${hasMilk ? `<select class="milk-select" id="milk-${item.id}" aria-label="Milk for ${esc(item.title)}">
          ${MILK_OPTIONS.map((m, i) => `<option value="${i}">${m.label}${m.extra ? ` (+${money(m.extra)})` : ''}</option>`).join('')}
        </select>` : ''}
        <button class="add-btn ${hasMilk ? '' : 'full'}" data-add="${item.id}"><i class="fa-solid fa-plus"></i> Add to Order</button>
      </div>
    </article>`;
  }).join('');
}

/* ---------- Cart ---------- */
function saveCartState() { store.set('rest_cart', cart); }

function addToCart(id) {
  const item = restMenuItems.find((m) => m.id === id);
  if (!item) return;

  let milk = null, extra = 0;
  if (MILK_CATEGORIES.includes(item.category)) {
    const sel = $(`milk-${id}`);
    const opt = MILK_OPTIONS[sel ? Number(sel.value) : 0];
    milk = opt.label;
    extra = opt.extra;
  }

  const key = `${id}|${milk || ''}`;
  const existing = cart.find((c) => c.key === key);
  if (existing) existing.qty += 1;
  else cart.push({ key, id, title: item.title, milk, price: item.price + extra, qty: 1 });

  saveCartState();
  updateCartUI(true);
  showToast(`Added ${item.title} to your order`, 'success');
}

function changeQty(key, delta) {
  const row = cart.find((c) => c.key === key);
  if (!row) return;
  row.qty += delta;
  if (row.qty <= 0) cart = cart.filter((c) => c.key !== key);
  saveCartState();
  updateCartUI();
}

function clearCart() {
  if (!cart.length) return;
  cart = [];
  saveCartState();
  updateCartUI();
  showToast('Order cleared', 'success');
}

function updateCartUI(bump = false) {
  const container = $('cartItemsContainer');
  let totalQty = 0, subtotal = 0;

  if (!cart.length) {
    container.innerHTML = `<div class="cart-empty"><i class="fa-solid fa-mug-hot"></i>Your order is empty.<br>Add something delicious from the menu.</div>`;
  } else {
    container.innerHTML = cart.map((item) => {
      totalQty += item.qty;
      subtotal += item.price * item.qty;
      return `
      <div class="cart-row">
        <div>
          <h4>${esc(item.title)}</h4>
          ${item.milk ? `<small>${esc(item.milk)}</small>` : ''}
          <div class="line-price">${money(item.price * item.qty)}</div>
        </div>
        <div class="qty">
          <button data-qty="-1" data-key="${esc(item.key)}" aria-label="Decrease quantity of ${esc(item.title)}">−</button>
          <span>${item.qty}</span>
          <button data-qty="1" data-key="${esc(item.key)}" aria-label="Increase quantity of ${esc(item.title)}">+</button>
        </div>
      </div>`;
    }).join('');
  }

  const badge = $('cartCountBadge');
  badge.textContent = totalQty;
  if (bump) { badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump'); }
  $('cartSubtotal').textContent = money(subtotal);
  $('cartTotal').textContent = money(subtotal);
}

function openCart() {
  lastFocus = document.activeElement;
  const d = $('cartDrawer');
  d.classList.remove('hidden');
  d.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  $('closeCartBtn').focus();
}

function closeCart() {
  const d = $('cartDrawer');
  d.classList.add('hidden');
  d.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (lastFocus) lastFocus.focus();
}

function handleCheckout() {
  if (!cart.length) { showToast('Your order is empty!', 'error'); return; }

  const nameEl = $('cartCustomerName');
  const phoneEl = $('cartCustomerPhone');
  const name = nameEl.value.trim();
  const phone = phoneEl.value.trim();
  const note = $('cartNote').value.trim();
  const type = document.querySelector('input[name="orderType"]:checked').value;

  nameEl.classList.toggle('invalid', !name);
  const phoneOk = /^\+?[0-9\s()-]{7,}$/.test(phone);
  phoneEl.classList.toggle('invalid', !phoneOk);

  if (!name) { showToast('Please enter your name', 'error'); nameEl.focus(); return; }
  if (!phoneOk) { showToast('Please enter a valid phone number', 'error'); phoneEl.focus(); return; }

  let lines = '', subtotal = 0;
  cart.forEach((i) => {
    subtotal += i.price * i.qty;
    lines += `• ${i.title}${i.milk ? ` (${i.milk})` : ''} x ${i.qty} = ${money(i.price * i.qty)}\n`;
  });

  const msg =
`*NEW COFFEE ORDER - REST COFFEE GLASGOW* ☕
*Type:* ${type}
*Name:* ${name}
*Phone:* ${phone}

*ITEMS:*
${lines}
*TOTAL:* ${money(subtotal)}${note ? `\n\n*Note:* ${note}` : ''}`;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');

  cart = [];
  saveCartState();
  updateCartUI();
  $('cartNote').value = '';
  closeCart();
  showToast('Order ready, finish sending it in WhatsApp!', 'success');
}

/* ---------- Opening hours ---------- */
// index = JS day (0 Sunday). Times in 24h, Glasgow local time.
const HOURS = [
  { name: 'Sunday', open: 9, close: 18 },
  { name: 'Monday', open: 8, close: 17 },
  { name: 'Tuesday', open: 8, close: 17 },
  { name: 'Wednesday', open: 8, close: 17 },
  { name: 'Thursday', open: 8, close: 17 },
  { name: 'Friday', open: 8, close: 20 },
  { name: 'Saturday', open: 9, close: 18 }
];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

function fmt(h) { const ap = h >= 12 ? 'PM' : 'AM'; const hh = h % 12 || 12; return `${hh}:00 ${ap}`; }

function londonNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'long', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
  const get = (t) => parts.find((p) => p.type === t).value;
  const dayIdx = HOURS.findIndex((h) => h.name === get('weekday'));
  return { day: dayIdx, minutes: (Number(get('hour')) % 24) * 60 + Number(get('minute')) };
}

function renderHours() {
  const { day } = londonNow();
  $('hoursList').innerHTML = DAY_ORDER.map((d) => {
    const h = HOURS[d];
    return `<li class="${d === day ? 'today' : ''}"><span>${h.name}</span><span>${fmt(h.open)} - ${fmt(h.close)}</span></li>`;
  }).join('');
}

function updateOpenStatus() {
  const { day, minutes } = londonNow();
  const h = HOURS[day];
  const el = $('openStatus');
  const txt = $('openStatusText');
  const open = minutes >= h.open * 60 && minutes < h.close * 60;
  el.classList.toggle('open', open);
  el.classList.toggle('closed', !open);

  if (open) {
    const left = h.close * 60 - minutes;
    txt.textContent = left <= 60 ? `Open now • closing soon (${fmt(h.close)})` : `Open now • until ${fmt(h.close)}`;
  } else if (minutes < h.open * 60) {
    txt.textContent = `Closed • opens today at ${fmt(h.open)}`;
  } else {
    const next = HOURS[(day + 1) % 7];
    txt.textContent = `Closed • opens ${next.name} at ${fmt(next.open)}`;
  }
}

/* ---------- Toasts ---------- */
function showToast(msg, type = 'success') {
  const c = $('toastContainer');
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 2600);
}

/* ---------- Wi-Fi ---------- */
function toggleWifi() {
  const el = $('wifiPass');
  const btn = $('wifiRevealBtn');
  const hidden = el.classList.contains('blurred');
  el.textContent = hidden ? el.dataset.pass : '••••••••••••';
  el.classList.toggle('blurred', !hidden);
  btn.innerHTML = hidden ? '<i class="fa-solid fa-eye-slash"></i> Hide' : '<i class="fa-solid fa-eye"></i> Show';
}

async function copyWifi() {
  const pass = $('wifiPass').dataset.pass;
  try { await navigator.clipboard.writeText(pass); showToast('Wi-Fi password copied', 'success'); }
  catch { showToast('Could not copy, please type it manually', 'error'); }
}

/* ---------- Scroll effects ---------- */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, { threshold: 0.12 });
  els.forEach((e) => io.observe(e));
}

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  $('scrollProgress').style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
  $('siteHeader').classList.toggle('scrolled', y > 10);
  $('toTopBtn').classList.toggle('show', y > 600);
}

/* ---------- Events ---------- */
function bindEvents() {
  $('themeToggleBtn').addEventListener('click', toggleTheme);
  $('openCartBtn').addEventListener('click', openCart);
  $('closeCartBtn').addEventListener('click', closeCart);
  $('cartOverlay').addEventListener('click', closeCart);
  $('checkoutBtn').addEventListener('click', handleCheckout);
  $('clearCartBtn').addEventListener('click', clearCart);
  $('wifiRevealBtn').addEventListener('click', toggleWifi);
  $('wifiCopyBtn').addEventListener('click', copyWifi);
  $('toTopBtn').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  $('checkoutForm').addEventListener('submit', (e) => e.preventDefault());

  $('menuToggle').addEventListener('click', () => {
    const nav = $('mainNav');
    const open = nav.classList.toggle('open');
    $('menuToggle').setAttribute('aria-expanded', open);
    $('menuToggle').querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
  });

  $('mainNav').addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;
    if (link.dataset.filter) filterCategory(link.dataset.filter);
    $('mainNav').classList.remove('open');
    $('menuToggle').setAttribute('aria-expanded', 'false');
    $('menuToggle').querySelector('i').className = 'fa-solid fa-bars';
  });

  $('categoryFilterGroup').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (btn) filterCategory(btn.dataset.cat);
  });

  $('customerMenuGrid').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-add]');
    if (btn) addToCart(btn.dataset.add);
  });

  $('cartItemsContainer').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-qty]');
    if (btn) changeQty(btn.dataset.key, Number(btn.dataset.qty));
  });

  let t;
  $('menuSearch').addEventListener('input', (e) => {
    clearTimeout(t);
    t = setTimeout(() => { searchTerm = e.target.value; renderCustomerMenu(); }, 150);
  });

  $('resetFiltersBtn').addEventListener('click', () => {
    searchTerm = '';
    $('menuSearch').value = '';
    filterCategory('All');
  });

  ['cartCustomerName', 'cartCustomerPhone'].forEach((id) =>
    $(id).addEventListener('input', (e) => e.target.classList.remove('invalid'))
  );

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !$('cartDrawer').classList.contains('hidden')) closeCart();
  });

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}
