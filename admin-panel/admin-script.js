const API_BASE = '/api';
let adminToken = localStorage.getItem('adminToken') || '';
let allProducts = [];
let allOrders = [];
let currentEditingProductId = null;
let currentProductType = 'bot_service';
let currentEditingOrderId = null;

// Same ordering used by the public storefront (order field, createdAt as tiebreaker)
function byOrder(a, b) {
  return (a.order || 0) - (b.order || 0) || new Date(a.createdAt) - new Date(b.createdAt);
}

// Swap a product with its neighbor and renumber the whole (same-type) list
// sequentially — simplest way to keep `order` values clean and unique even
// when legacy items all still share the default order:0.
async function moveProduct(type, productId, direction) {
  const list = allProducts.filter(p => p.type === type).sort(byOrder);
  const index = list.findIndex(p => p._id === productId);
  const swapWith = direction === 'up' ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= list.length) return;

  [list[index], list[swapWith]] = [list[swapWith], list[index]];

  try {
    await Promise.all(list.map((p, i) => fetch(`${API_BASE}/admin/products/${p._id}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ order: i }),
    })));
    loadProducts();
  } catch (error) {
    alert('Error reordering: ' + error.message);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (adminToken) {
    showDashboard();
  }
});

// ---- Auth (self-contained on this page, no redirect to the public site) ----
async function adminLogin() {
  const password = document.getElementById('adminPassword').value;
  const errorEl = document.getElementById('loginError');

  try {
    const response = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    const data = await response.json();

    if (response.ok) {
      adminToken = data.token;
      localStorage.setItem('adminToken', adminToken);
      errorEl.classList.add('hidden');
      showDashboard();
    } else {
      errorEl.classList.remove('hidden');
    }
  } catch (error) {
    errorEl.textContent = 'Login error: ' + error.message;
    errorEl.classList.remove('hidden');
  }
}

function logoutAdmin() {
  localStorage.removeItem('adminToken');
  adminToken = '';
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('loginScreen').classList.remove('hidden');
}

function showDashboard() {
  document.getElementById('loginScreen').classList.add('hidden');
  document.getElementById('dashboard').classList.remove('hidden');

  loadProducts();
  loadOrders();
  loadExchangeRates();

  setInterval(loadProducts, 5000);
  setInterval(loadOrders, 5000);
  setInterval(loadExchangeRates, 30000);
}

function switchAdminSection(section, el) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.getElementById(section).classList.add('active');
  document.querySelectorAll('.sidebar-item').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
}

function authHeaders(extra) {
  return Object.assign({ Authorization: `Bearer ${adminToken}` }, extra || {});
}

// ---- Products ----
async function loadProducts() {
  try {
    const response = await fetch(`${API_BASE}/products`);
    allProducts = await response.json();
    renderGoldAdminTable();
    renderTypeAdminTable('bot_service', 'botServiceAdminTable');
    renderTypeAdminTable('jockey', 'jockeyAdminTable');
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

// GOLD: dedicated table with inline click-to-edit cells + status toggle
function renderGoldAdminTable() {
  // Don't clobber an in-progress edit when the 5s poll fires
  if (document.activeElement && document.activeElement.classList.contains('editable-cell')) return;

  const tbody = document.querySelector('#goldAdminTable tbody');
  const gold = allProducts.filter(p => p.type === 'gold').sort(byOrder);

  if (gold.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-6"><span class="no-block">No gold servers yet</span></td></tr>';
    return;
  }

  tbody.innerHTML = gold.map((p, i) => `
    <tr data-id="${p._id}">
      <td class="editable-cell" contenteditable="true" data-field="serverName" onblur="saveInlineEdit(this)">${p.serverName || p.name}</td>
      <td class="editable-cell" contenteditable="true" data-field="stock" onblur="saveInlineEdit(this)">${p.stock}</td>
      <td class="editable-cell" contenteditable="true" data-field="price" onblur="saveInlineEdit(this)">${p.price}</td>
      <td>
        <div class="toggle ${p.status === 'available' ? 'on' : ''}" onclick="toggleGoldStatus('${p._id}', this)">
          <div class="toggle-track"></div><div class="toggle-knob"></div>
        </div>
      </td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-sm" ${i === 0 ? 'disabled' : ''} onclick="moveProduct('gold','${p._id}','up')"><span class="no-block">▲</span></button>
          <button class="btn btn-sm" ${i === gold.length - 1 ? 'disabled' : ''} onclick="moveProduct('gold','${p._id}','down')"><span class="no-block">▼</span></button>
        </div>
      </td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteProduct('${p._id}')"><span class="no-block">DELETE</span></button></td>
    </tr>
  `).join('');
}

async function saveInlineEdit(cell) {
  const id = cell.closest('tr').dataset.id;
  const field = cell.dataset.field;
  let value = cell.innerText.trim();
  if (field === 'stock' || field === 'price') value = parseInt(value, 10) || 0;
  if (field === 'serverName') value = { serverName: value, name: value };
  else value = { [field]: value };

  try {
    await fetch(`${API_BASE}/admin/products/${id}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(value),
    });
  } catch (error) {
    alert('Error saving edit: ' + error.message);
  }
}

async function toggleGoldStatus(id, toggleEl) {
  toggleEl.classList.toggle('on');
  try {
    await fetch(`${API_BASE}/admin/products/${id}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
  } catch (error) {
    toggleEl.classList.toggle('on');
    alert('Error updating status: ' + error.message);
  }
}

function openGoldModal() {
  document.getElementById('goldServerName').value = '';
  document.getElementById('goldStock').value = '999';
  document.getElementById('goldPrice').value = '';
  document.getElementById('goldModal').classList.add('active');
}

function closeGoldModal() {
  document.getElementById('goldModal').classList.remove('active');
}

async function saveGoldProduct() {
  const serverName = document.getElementById('goldServerName').value.trim();
  const stock = parseInt(document.getElementById('goldStock').value, 10) || 0;
  const price = parseInt(document.getElementById('goldPrice').value, 10) || 0;

  if (!serverName || !price) {
    alert('Please fill in server name and price');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/admin/products`, {
      method: 'POST',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ name: serverName, serverName, type: 'gold', stock, price, status: 'available' }),
    });
    if (response.ok) {
      closeGoldModal();
      loadProducts();
    } else {
      alert('Error saving server');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// BOT SERVICE / JOCKEY: generic modal-based management
function renderTypeAdminTable(type, tableId) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  const items = allProducts.filter(p => p.type === type).sort(byOrder);

  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-6"><span class="no-block">No plans yet</span></td></tr>';
    return;
  }

  tbody.innerHTML = items.map((p, i) => `
    <tr>
      <td class="no-block">${p.name}</td>
      <td class="no-block">${p.tier || '-'}</td>
      <td class="no-block">${p.price.toLocaleString('id-ID')}</td>
      <td class="no-block"><span class="status-badge status-${p.status}">${p.status === 'available' ? 'AVAILABLE' : 'CLOSED'}</span></td>
      <td>
        <div class="action-buttons">
          <button class="btn btn-sm" ${i === 0 ? 'disabled' : ''} onclick="moveProduct('${type}','${p._id}','up')"><span class="no-block">▲</span></button>
          <button class="btn btn-sm" ${i === items.length - 1 ? 'disabled' : ''} onclick="moveProduct('${type}','${p._id}','down')"><span class="no-block">▼</span></button>
          <button class="btn btn-sm" onclick="openProductModal('${type}', '${p._id}')"><span class="no-block">EDIT</span></button>
          <button class="btn btn-sm" onclick="toggleProductStatus('${p._id}')"><span class="no-block">${p.status === 'available' ? 'CLOSE' : 'OPEN'}</span></button>
          <button class="btn btn-sm btn-danger" onclick="deleteProduct('${p._id}')"><span class="no-block">DELETE</span></button>
        </div>
      </td>
    </tr>
  `).join('');
}

function openProductModal(type, productId) {
  currentProductType = type;
  currentEditingProductId = productId || null;

  const product = productId ? allProducts.find(p => p._id === productId) : null;
  document.getElementById('productName').value = product?.name || '';
  document.getElementById('productTier').value = product?.tier || (type === 'bot_service' ? 'elite' : 'daily');
  document.getElementById('productPrice').value = product?.price || '';
  document.getElementById('productStock').value = product?.stock ?? '999';
  document.getElementById('productStatus').value = product?.status || 'available';
  document.getElementById('productBilling').value = product?.billingPeriod || '';
  document.getElementById('productDescription').value = product?.description || '';
  document.getElementById('productBenefit').value = product?.benefit || '';
  document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
  document.getElementById('productModal').classList.remove('active');
}

async function saveProduct() {
  const productData = {
    name: document.getElementById('productName').value.trim(),
    type: currentProductType,
    tier: document.getElementById('productTier').value,
    price: parseInt(document.getElementById('productPrice').value, 10) || 0,
    stock: parseInt(document.getElementById('productStock').value, 10) || 0,
    status: document.getElementById('productStatus').value,
    billingPeriod: document.getElementById('productBilling').value.trim(),
    description: document.getElementById('productDescription').value.trim(),
    benefit: document.getElementById('productBenefit').value.trim(),
  };

  if (!productData.name || !productData.price) {
    alert('Please fill in name and price');
    return;
  }

  try {
    const url = currentEditingProductId ? `${API_BASE}/admin/products/${currentEditingProductId}` : `${API_BASE}/admin/products`;
    const method = currentEditingProductId ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(productData),
    });

    if (response.ok) {
      closeProductModal();
      loadProducts();
    } else {
      alert('Error saving plan');
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function toggleProductStatus(productId) {
  try {
    const response = await fetch(`${API_BASE}/admin/products/${productId}/status`, {
      method: 'PATCH',
      headers: authHeaders(),
    });
    if (response.ok) loadProducts();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

async function deleteProduct(productId) {
  if (!confirm('Delete this item?')) return;
  try {
    const response = await fetch(`${API_BASE}/admin/products/${productId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (response.ok) loadProducts();
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// ---- Orders ----
async function loadOrders() {
  try {
    const response = await fetch(`${API_BASE}/orders`);
    allOrders = await response.json();
    renderOrdersTable();
  } catch (error) {
    console.error('Error loading orders:', error);
  }
}

function renderOrdersTable() {
  const tbody = document.querySelector('#ordersTable tbody');

  if (allOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-6"><span class="no-block">No orders yet</span></td></tr>';
    return;
  }

  tbody.innerHTML = allOrders.map(order => `
    <tr>
      <td class="no-block">${order._id.substring(0, 8)}...</td>
      <td class="no-block">${order.productId?.name || 'Unknown'}</td>
      <td class="no-block">${order.customerName || 'N/A'}</td>
      <td class="no-block">${order.quantity}</td>
      <td class="no-block">${order.totalPrice.toLocaleString('id-ID')}</td>
      <td class="no-block"><span class="status-badge status-${order.status === 'completed' ? 'available' : 'closed'}">${order.status.toUpperCase()}</span></td>
      <td class="no-block">${new Date(order.createdAt).toLocaleDateString('id-ID')}</td>
      <td><button class="btn btn-sm" onclick="openOrderStatusModal('${order._id}')"><span class="no-block">UPDATE</span></button></td>
    </tr>
  `).join('');
}

function openOrderStatusModal(orderId) {
  const order = allOrders.find(o => o._id === orderId);
  if (!order) return;
  currentEditingOrderId = orderId;
  document.getElementById('orderStatus').value = order.status;
  document.getElementById('orderStatusModal').classList.add('active');
}

function closeOrderStatusModal() {
  document.getElementById('orderStatusModal').classList.remove('active');
}

async function updateOrderStatus() {
  const status = document.getElementById('orderStatus').value;
  try {
    const response = await fetch(`${API_BASE}/orders/${currentEditingOrderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (response.ok) {
      closeOrderStatusModal();
      loadOrders();
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
}

// ---- Exchange rates ----
async function loadExchangeRates() {
  try {
    const response = await fetch(`${API_BASE}/exchange-rates`);
    const rates = await response.json();
    renderExchangeRatesTable(rates);
  } catch (error) {
    console.error('Error loading exchange rates:', error);
  }
}

function renderExchangeRatesTable(rates) {
  const tbody = document.querySelector('#exchangeRatesTable tbody');
  if (rates.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" class="text-center py-6"><span class="no-block">No rates yet</span></td></tr>';
    return;
  }
  tbody.innerHTML = rates.map(r => `
    <tr>
      <td class="no-block">${r.currency}</td>
      <td class="no-block">${r.rateToIDR.toLocaleString('id-ID')}</td>
      <td class="no-block">${new Date(r.lastUpdated).toLocaleString('id-ID')}</td>
    </tr>
  `).join('');
}

async function syncExchangeRates() {
  try {
    const response = await fetch(`${API_BASE}/exchange-rates/sync/update`, { method: 'POST' });
    if (response.ok) loadExchangeRates();
    else alert('Sync failed');
  } catch (error) {
    alert('Error syncing rates: ' + error.message);
  }
}
