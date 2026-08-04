const API_BASE = '/api';
let allProducts = { gold: [], bot_service: [], jockey: [] };
let exchangeRates = {};

document.addEventListener('DOMContentLoaded', () => {
  loadConfig();
  loadProducts();
  loadExchangeRates();
  // Poll for updates so admin edits show up on the storefront live
  setInterval(loadProducts, 5000);
  setInterval(loadExchangeRates, 30000);

  setupScrollTopButton();
  document.getElementById('footerYear').textContent = new Date().getFullYear();
});

// Floating "back to top" button — stays fixed while scrolling, fades in once
// the user has scrolled past the hero so it doesn't clutter section 1 itself.
function setupScrollTopButton() {
  const btn = document.getElementById('scrollTopBtn');
  const toggle = () => btn.classList.toggle('visible', window.scrollY > window.innerHeight * 0.5);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}

function scrollToTop() {
  document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
}

// Order-now links (Facebook / WhatsApp), configurable via backend .env
async function loadConfig() {
  try {
    const response = await fetch(`${API_BASE}/config`);
    const config = await response.json();
    renderOrderNow('orderNowGold', config);
    renderOrderNow('orderNowBotService', config);
    renderOrderNow('orderNowJockey', config);
    document.getElementById('footerFacebook').href = config.facebookUrl;
    document.getElementById('footerWhatsapp').href = config.whatsappUrl;
  } catch (error) {
    console.error('Error loading config:', error);
  }
}

function renderOrderNow(containerId, config) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = `
    <a class="order-btn" href="${config.facebookUrl}" target="_blank" rel="noopener">
      <span class="no-block">CHAT VIA FACEBOOK</span>
    </a>
    <a class="order-btn" href="${config.whatsappUrl}" target="_blank" rel="noopener">
      <span class="no-block">CHAT VIA WHATSAPP</span>
    </a>
  `;
}

// Load products from API
async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    const products = await response.json();

    allProducts = {
      gold: products.filter(p => p.type === 'gold'),
      bot_service: products.filter(p => p.type === 'bot_service'),
      jockey: products.filter(p => p.type === 'jockey'),
    };

    renderGoldTable();
    renderBotServiceCards();
    renderJockeyCards();
    updateExchange();
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// Load exchange rates
async function loadExchangeRates() {
  try {
    const response = await fetch(`${API_BASE}/exchange-rates`);
    const rates = await response.json();

    exchangeRates = {};
    rates.forEach(r => { exchangeRates[r.currency] = r.rateToIDR; });

    const select = document.getElementById('currencySelect');
    const previousValue = select.value;
    select.innerHTML = rates.map(r => `<option value="${r.currency}">${r.currency}</option>`).join('');
    if (rates.some(r => r.currency === previousValue)) select.value = previousValue;

    updateExchange();
  } catch (error) {
    console.error('Error loading exchange rates:', error);
  }
}

// Render GOLD table — row text is green when available, red when closed
function renderGoldTable() {
  const tbody = document.querySelector('#goldTable tbody');

  if (allProducts.gold.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-6"><span class="no-block">No products available</span></td></tr>';
    return;
  }

  tbody.innerHTML = allProducts.gold.map(product => `
    <tr class="${product.status === 'available' ? 'row-available' : 'row-closed'}">
      <td>${product.serverName || product.name}</td>
      <td>${product.stock}</td>
      <td>IDR ${product.price.toLocaleString('id-ID')}</td>
    </tr>
  `).join('');
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Description + benefit list set by admin (Bot Service / Jockey "Add/Edit Plan" modal)
function renderCardExtras(product) {
  const description = product.description
    ? `<p class="text-xs no-block">${escapeHtml(product.description)}</p>`
    : '';

  const benefitItems = (product.benefit || '').split('\n').map(line => line.trim()).filter(Boolean);
  const benefit = benefitItems.length
    ? `<ul class="text-xs no-block space-y-2">${benefitItems.map(item => `<li>✓ ${escapeHtml(item)}</li>`).join('')}</ul>`
    : '';

  return description || benefit ? `<div class="no-block card-extras">${description}${benefit}</div>` : '<div></div>';
}

// Render BOT SERVICE cards
function renderBotServiceCards() {
  const container = document.getElementById('botServiceContainer');

  if (allProducts.bot_service.length === 0) {
    container.innerHTML = '<div class="col-span-2 text-center py-8 text-gray-400 no-block">No bot services available</div>';
    return;
  }

  container.innerHTML = allProducts.bot_service.map(product => `
    <div class="price-card">
      <h4 class="font-display text-xl no-block">${(product.tier || product.name).toUpperCase()}</h4>
      ${renderCardExtras(product)}
      <div class="price-footer">
        <div class="price font-display no-block">IDR ${product.price.toLocaleString('id-ID')}</div>
        ${product.billingPeriod ? `<p class="text-xs text-gray-600 no-block mt-1">${product.billingPeriod}</p>` : ''}
      </div>
    </div>
  `).join('');
}

// Render JOCKEY cards
function renderJockeyCards() {
  const container = document.getElementById('jockeyContainer');

  if (allProducts.jockey.length === 0) {
    container.innerHTML = '<div class="col-span-3 text-center py-8 text-gray-400 no-block">No jockey plans available</div>';
    return;
  }

  container.innerHTML = allProducts.jockey.map(product => `
    <div class="price-card">
      <h4 class="font-display text-xl no-block">${(product.tier || product.name).toUpperCase()}</h4>
      ${renderCardExtras(product)}
      <div class="price font-display no-block price-footer">IDR ${product.price.toLocaleString('id-ID')}</div>
    </div>
  `).join('');
}

// GOLD calculator: total (IDR) = gold amount x VALOFE product price, final = total / selected currency rate
function updateExchange() {
  const select = document.getElementById('currencySelect');
  const currency = select.value;
  const goldAmount = parseFloat(document.getElementById('goldAmount').value) || 0;
  const rate = exchangeRates[currency] || 0;
  const valofe = allProducts.gold.find(p => /valofe/i.test(p.serverName || p.name));

  document.getElementById('rateDisplay').value = rate ? rate.toLocaleString('id-ID', { maximumFractionDigits: 0 }) : 'Loading...';

  if (!valofe) {
    document.getElementById('finalPrice').value = 'VALOFE product not set';
    return;
  }

  const totalIDR = goldAmount * valofe.price;
  const finalPrice = rate ? totalIDR / rate : 0;
  document.getElementById('finalPrice').value = finalPrice > 0
    ? finalPrice.toLocaleString('id-ID', { maximumFractionDigits: 0 }) + ' ' + currency
    : '0 ' + currency;
}
