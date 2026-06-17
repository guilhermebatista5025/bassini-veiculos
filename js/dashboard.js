/* ==========================================================================
   DASHBOARD JS — Bassini Veículos Admin Panel
   ========================================================================== */

/* -------------------------------------------------------------------------
   VEHICLES DATA (shared with main site, extended for dashboard)
   ------------------------------------------------------------------------- */
let vehicles = [];
let leadsData = [];

function getImagePath(path) {
  if (!path) return "";
  const cleaned = path.replace(/^(\.\.\/|\/)/, "");
  return `../${cleaned}`;
}

/* ==========================================================================
   INIT
   ========================================================================== */
async function loadData() {
  try {
    const vRes = await fetch('http://localhost:3000/api/veiculos');
    if (vRes.ok) {
      vehicles = await vRes.json();
    }
    const lRes = await fetch('http://localhost:3000/api/leads');
    if (lRes.ok) {
      leadsData = await lRes.json();
    }
  } catch (err) {
    console.error("Erro ao buscar dados do servidor:", err);
  }
  renderOverview();
  renderStockTable();
  renderLeadsTable();
  renderAnalyticsCharts();
}

document.addEventListener('DOMContentLoaded', async () => {
  setCurrentDate();
  setupNavigation();
  setupSidebar();
  setupModal();
  await loadData();
});

/* ==========================================================================
   DATE
   ========================================================================== */
function setCurrentDate() {
  const el = document.getElementById('current-date');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

/* ==========================================================================
   SIDEBAR & NAVIGATION
   ========================================================================== */
function setupSidebar() {
  const sidebar   = document.getElementById('sidebar');
  const toggle    = document.getElementById('sidebar-toggle');
  const closeBtn  = document.getElementById('sidebar-close');

  toggle?.addEventListener('click', () => sidebar.classList.toggle('open'));
  closeBtn?.addEventListener('click', () => sidebar.classList.remove('open'));

  // Close on backdrop click (mobile)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900 &&
        !sidebar.contains(e.target) &&
        !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

function setupNavigation() {
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  const tableLinks = document.querySelectorAll('.table-link[data-nav]');

  function navigateTo(sectionName) {
    // Deactivate all sections
    document.querySelectorAll('.dash-section').forEach(s => s.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));

    // Activate target
    const section = document.getElementById(`section-${sectionName}`);
    const navItem = document.querySelector(`.nav-item[data-section="${sectionName}"]`);
    if (section) section.classList.add('active');
    if (navItem) navItem.classList.add('active');

    // Update header
    const titles = {
      overview: ['Visão Geral', 'Bem-vindo ao painel administrativo'],
      estoque:  ['Gestão de Estoque', 'Adicione, edite ou remova veículos'],
      leads:    ['Leads & Contatos', 'Histórico de clientes interessados'],
      analytics:['Analytics', 'Relatórios e gráficos detalhados'],
    };
    const [title, subtitle] = titles[sectionName] || ['Dashboard', ''];
    document.getElementById('page-title').textContent = title;
    document.getElementById('page-subtitle').textContent = subtitle;

    // Re-render charts when switching (they sometimes need resize)
    if (sectionName === 'analytics') renderAnalyticsCharts();
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(item.dataset.section);
    });
  });

  tableLinks.forEach(link => {
    link.addEventListener('click', () => navigateTo(link.dataset.nav));
  });
}

/* ==========================================================================
   OVERVIEW SECTION
   ========================================================================== */
function renderOverview() {
  // KPIs
  document.getElementById('kpi-total-vehicles').textContent = vehicles.length;
  const totalValue = vehicles.reduce((sum, v) => sum + v.price, 0);
  document.getElementById('kpi-total-value').textContent =
    totalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
  document.getElementById('kpi-leads').textContent = leadsData.length + 39;

  // Overview table (featured only)
  const tbody = document.getElementById('overview-table-body');
  tbody.innerHTML = '';
  vehicles.forEach(car => {
    const price = car.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    const status = car.status || 'disponivel';
    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td>
          <div class="vehicle-name-cell">
            <img src="${getImagePath(car.image)}" alt="${car.model}" class="vehicle-thumb" onerror="this.style.display='none'">
            <div class="vehicle-name-text">
              <strong>${car.brand} ${car.model}</strong>
              <span>${car.version}</span>
            </div>
          </div>
        </td>
        <td><span class="cat-badge ${car.category}">${catLabel(car.category)}</span></td>
        <td>${car.year}</td>
        <td>${car.km}</td>
        <td><strong style="color:#e6edf3">${price}</strong></td>
        <td><span class="status-badge ${status}">${statusLabel(status)}</span></td>
      </tr>
    `);
  });

  renderOverviewCharts();
}

function renderOverviewCharts() {
  // Chart 1: Category distribution
  const catCounts = {};
  vehicles.forEach(v => { catCounts[v.category] = (catCounts[v.category] || 0) + 1; });

  renderChart('chart-category', 'doughnut', {
    labels: Object.keys(catCounts).map(catLabel),
    datasets: [{
      data: Object.values(catCounts),
      backgroundColor: ['#3b82f6','#8b5cf6','#f59e0b','#10b981'],
      borderWidth: 0,
      hoverOffset: 8
    }]
  }, {
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: '#8b949e', font: { size: 11 }, boxWidth: 10, padding: 12 }
      }
    },
    cutout: '68%'
  });

  // Chart 2: Avg price by brand
  const brandPrices = {};
  const brandCounts = {};
  vehicles.forEach(v => {
    brandPrices[v.brand] = (brandPrices[v.brand] || 0) + v.price;
    brandCounts[v.brand] = (brandCounts[v.brand] || 0) + 1;
  });
  const brands = Object.keys(brandPrices);
  const avgPrices = brands.map(b => Math.round(brandPrices[b] / brandCounts[b] / 1000));

  renderChart('chart-brands', 'bar', {
    labels: brands,
    datasets: [{
      label: 'Preço médio (R$ mil)',
      data: avgPrices,
      backgroundColor: 'rgba(37,99,235,0.7)',
      borderRadius: 6,
      borderSkipped: false
    }]
  }, barOptions('R$ mil'));

  // Chart 3: Monthly leads (mock)
  renderChart('chart-leads', 'line', {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
    datasets: [{
      label: 'Leads',
      data: [5, 8, 12, 7, 14, 12],
      borderColor: '#4ade80',
      backgroundColor: 'rgba(74, 222, 128, 0.08)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#4ade80',
      pointRadius: 5,
      pointHoverRadius: 7
    }]
  }, lineOptions('Leads'));
}

/* ==========================================================================
   STOCK TABLE
   ========================================================================== */
function renderStockTable() {
  const tbody = document.getElementById('stock-table-body');
  tbody.innerHTML = '';

  const searchVal  = (document.getElementById('dash-search')?.value || '').toLowerCase();
  const catFilter  = document.getElementById('dash-filter-category')?.value || 'all';

  const filtered = vehicles.filter(v => {
    const matchSearch = !searchVal ||
      v.brand.toLowerCase().includes(searchVal) ||
      v.model.toLowerCase().includes(searchVal);
    const matchCat = catFilter === 'all' || v.category === catFilter;
    return matchSearch && matchCat;
  });

  if (filtered.length === 0) {
    tbody.insertAdjacentHTML('beforeend', `
      <tr><td colspan="10" style="text-align:center;padding:40px;color:var(--text-muted)">
        Nenhum veículo encontrado.
      </td></tr>
    `);
    return;
  }

  filtered.forEach(car => {
    const price = car.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
    const status = car.status || 'disponivel';
    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td style="color:var(--text-muted);font-size:11px">#${car.id}</td>
        <td>
          <img src="${getImagePath(car.image)}" alt="${car.model}" class="vehicle-thumb" onerror="this.style.display='none'">
        </td>
        <td>
          <div class="vehicle-name-text">
            <strong>${car.brand} ${car.model}</strong>
            <span>${car.color || '—'}</span>
          </div>
        </td>
        <td style="max-width:200px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${car.version}</td>
        <td>${car.year}</td>
        <td>${car.km}</td>
        <td>${car.gearbox}</td>
        <td><strong style="color:#e6edf3">${price}</strong></td>
        <td>
          <button class="featured-toggle ${car.featured ? 'on' : ''}" data-id="${car.id}" title="${car.featured ? 'Destaque ativo' : 'Sem destaque'}"></button>
        </td>
        <td>
          <div class="action-btns">
            <button class="action-btn edit" data-id="${car.id}" title="Editar">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </button>
            <button class="action-btn delete" data-id="${car.id}" title="Excluir">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `);
  });

  // Bind edit/delete/featured buttons
  tbody.querySelectorAll('.action-btn.edit').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
  });
  tbody.querySelectorAll('.action-btn.delete').forEach(btn => {
    btn.addEventListener('click', () => deleteVehicle(parseInt(btn.dataset.id)));
  });
  tbody.querySelectorAll('.featured-toggle').forEach(btn => {
    btn.addEventListener('click', () => toggleFeatured(parseInt(btn.dataset.id)));
  });
}

// Bind search/filter
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dash-search')?.addEventListener('input', renderStockTable);
  document.getElementById('dash-filter-category')?.addEventListener('change', renderStockTable);
  
  // Botão Salvar Mudanças
  document.getElementById('btn-save-changes')?.addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:3000/api/save-changes', {
        method: 'POST'
      });
      if (response.ok) {
        showToast('Mudanças salvas e site atualizado!');
      } else {
        showToast('Erro ao salvar mudanças.');
      }
    } catch (err) {
      console.error("Erro ao salvar mudanças:", err);
      showToast('Erro ao conectar ao servidor.');
    }
  });
});

/* ==========================================================================
   LEADS TABLE
   ========================================================================== */
function renderLeadsTable() {
  const tbody = document.getElementById('leads-table-body');
  tbody.innerHTML = '';
  leadsData.forEach(lead => {
    const statusColor = {
      'Novo': '#60a5fa', 'Contatado': '#fbbf24',
      'Convertido': '#4ade80', 'Aguardando': '#f87171'
    }[lead.status] || '#8b949e';

    const name = lead.nome || lead.name || '—';
    const phone = lead.telefone || lead.phone || '—';
    const interest = lead.interesse || lead.interest || '—';
    const channel = lead.canal || lead.channel || '—';
    const date = lead.criado_em ? new Date(lead.criado_em).toLocaleDateString('pt-BR') : (lead.date || '—');

    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td><strong style="color:#e6edf3">${name}</strong></td>
        <td>${phone}</td>
        <td>${interest}</td>
        <td><span class="channel-badge ${channel}">${channelLabel(channel)}</span></td>
        <td style="color:var(--text-muted)">${date}</td>
        <td><span style="color:${statusColor};font-weight:600;font-size:12px">${lead.status}</span></td>
      </tr>
    `);
  });
}

/* ==========================================================================
   ANALYTICS CHARTS
   ========================================================================== */
const analyticsChartsRendered = { evolution: false, fuel: false, gearbox: false, category: false };

function renderAnalyticsCharts() {
  if (!analyticsChartsRendered.evolution) {
    renderChart('chart-evolution', 'line', {
      labels: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
      datasets: [{
        label: 'Valor do Estoque (R$ mil)',
        data: [310, 340, 290, 420, 380, 450, 490, 510, 440, 520, 480, 528],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.07)',
        fill: true, tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointRadius: 4, pointHoverRadius: 7
      }]
    }, lineOptions('R$ mil'));
    analyticsChartsRendered.evolution = true;
  }

  if (!analyticsChartsRendered.category) {
    const catCounts = {};
    vehicles.forEach(v => {
      const label = catLabel(v.category);
      catCounts[label] = (catCounts[label] || 0) + 1;
    });
    renderChart('chart-category', 'doughnut', {
      labels: Object.keys(catCounts),
      datasets: [{
        data: Object.values(catCounts),
        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981', '#8b5cf6'],
        borderWidth: 0, hoverOffset: 8
      }]
    }, { plugins: { legend: { position: 'bottom', labels: { color: '#8b949e', font: { size: 11 }, boxWidth: 10, padding: 12 } } }, cutout: '65%' });
    analyticsChartsRendered.category = true;
  }

  if (!analyticsChartsRendered.fuel) {
    const fuelCounts = {};
    vehicles.forEach(v => { fuelCounts[v.fuel] = (fuelCounts[v.fuel] || 0) + 1; });
    renderChart('chart-fuel', 'doughnut', {
      labels: Object.keys(fuelCounts),
      datasets: [{
        data: Object.values(fuelCounts),
        backgroundColor: ['#3b82f6','#f59e0b','#10b981','#8b5cf6'],
        borderWidth: 0, hoverOffset: 8
      }]
    }, { plugins: { legend: { position: 'bottom', labels: { color: '#8b949e', font: { size: 11 }, boxWidth: 10, padding: 12 } } }, cutout: '65%' });
    analyticsChartsRendered.fuel = true;
  }

  if (!analyticsChartsRendered.gearbox) {
    const gbCounts = {};
    vehicles.forEach(v => { gbCounts[v.gearbox] = (gbCounts[v.gearbox] || 0) + 1; });
    renderChart('chart-gearbox', 'doughnut', {
      labels: Object.keys(gbCounts),
      datasets: [{
        data: Object.values(gbCounts),
        backgroundColor: ['#8b5cf6','#f59e0b'],
        borderWidth: 0, hoverOffset: 8
      }]
    }, { plugins: { legend: { position: 'bottom', labels: { color: '#8b949e', font: { size: 11 }, boxWidth: 10, padding: 12 } } }, cutout: '65%' });
    analyticsChartsRendered.gearbox = true;
  }
}

/* ==========================================================================
   MODAL: ADD / EDIT VEHICLE
   ========================================================================== */
/* ==========================================================================
   MODAL POPULATING HELPERS
   ========================================================================== */
const SITE_BRANDS = [
  "Audi", "BMW", "Chevrolet", "Fiat", "Ford", "Honda", "Hyundai", 
  "Jeep", "Mercedes-Benz", "Mitsubishi", "Nissan", "Renault", "Toyota", "Volkswagen"
];

function populateBrandSelect(selectedBrandValue = '') {
  const brandSelect = document.getElementById('form-brand');
  const brandCustomInput = document.getElementById('form-brand-custom');
  const brandCustomWrapper = document.getElementById('brand-custom-wrapper');
  const modelSelect = document.getElementById('form-model');
  const modelCustomInput = document.getElementById('form-model-custom');
  const modelCustomWrapper = document.getElementById('model-custom-wrapper');

  if (!brandSelect) return;

  const dbBrands = vehicles.map(v => v.brand);
  
  const uniqueBrandsMap = new Map();
  SITE_BRANDS.forEach(b => uniqueBrandsMap.set(b.toLowerCase(), b));
  dbBrands.forEach(b => {
    if (b && b.trim()) {
      uniqueBrandsMap.set(b.toLowerCase(), b.trim());
    }
  });

  const sortedBrands = Array.from(uniqueBrandsMap.values()).sort((a, b) => a.localeCompare(b));

  brandSelect.innerHTML = '<option value="">Selecione...</option>';
  sortedBrands.forEach(brand => {
    brandSelect.insertAdjacentHTML('beforeend', `<option value="${brand}">${brand}</option>`);
  });
  brandSelect.insertAdjacentHTML('beforeend', `<option value="__NEW_BRAND__" style="color: #60a5fa; font-weight: 600;">+ Adicionar nova marca...</option>`);

  brandCustomWrapper.style.display = 'none';
  brandCustomInput.value = '';
  brandCustomInput.required = false;
  brandSelect.style.display = 'block';
  brandSelect.required = true;

  modelCustomWrapper.style.display = 'none';
  modelCustomInput.value = '';
  modelCustomInput.required = false;
  modelSelect.style.display = 'block';
  modelSelect.required = true;

  if (selectedBrandValue) {
    const hasBrand = sortedBrands.some(b => b.toLowerCase() === selectedBrandValue.toLowerCase());
    if (hasBrand) {
      const matchedBrand = uniqueBrandsMap.get(selectedBrandValue.toLowerCase());
      brandSelect.value = matchedBrand;
      populateModelSelect(matchedBrand);
    } else {
      brandSelect.value = '__NEW_BRAND__';
      brandSelect.style.display = 'none';
      brandSelect.required = false;
      brandCustomWrapper.style.display = 'flex';
      brandCustomInput.value = selectedBrandValue;
      brandCustomInput.required = true;

      modelSelect.style.display = 'none';
      modelSelect.required = false;
      modelCustomWrapper.style.display = 'flex';
      modelCustomInput.required = true;
    }
  } else {
    brandSelect.value = '';
    modelSelect.innerHTML = '<option value="">Selecione a marca primeiro...</option>';
    modelSelect.disabled = true;
  }
}

function populateModelSelect(brandName, selectedModelValue = '') {
  const modelSelect = document.getElementById('form-model');
  const modelCustomInput = document.getElementById('form-model-custom');
  const modelCustomWrapper = document.getElementById('model-custom-wrapper');
  if (!modelSelect) return;

  if (!brandName || brandName === '__NEW_BRAND__') {
    modelSelect.innerHTML = '<option value="">Selecione a marca primeiro...</option>';
    modelSelect.disabled = true;
    modelSelect.style.display = 'block';
    modelSelect.required = true;
    modelCustomWrapper.style.display = 'none';
    modelCustomInput.required = false;
    return;
  }

  const models = [...new Set(
    vehicles
      .filter(v => v.brand && v.brand.toLowerCase() === brandName.toLowerCase())
      .map(v => v.model)
  )].sort((a, b) => a.localeCompare(b));

  modelSelect.innerHTML = '<option value="">Selecione...</option>';
  models.forEach(model => {
    modelSelect.insertAdjacentHTML('beforeend', `<option value="${model}">${model}</option>`);
  });
  modelSelect.insertAdjacentHTML('beforeend', `<option value="__NEW_MODEL__" style="color: #60a5fa; font-weight: 600;">+ Adicionar novo modelo...</option>`);
  modelSelect.disabled = false;

  modelSelect.style.display = 'block';
  modelSelect.required = true;
  modelCustomWrapper.style.display = 'none';
  modelCustomInput.value = '';
  modelCustomInput.required = false;

  if (selectedModelValue) {
    const hasModel = models.some(m => m.toLowerCase() === selectedModelValue.toLowerCase());
    if (hasModel) {
      const matchedModel = models.find(m => m.toLowerCase() === selectedModelValue.toLowerCase());
      modelSelect.value = matchedModel;
    } else {
      modelSelect.value = '__NEW_MODEL__';
      modelSelect.style.display = 'none';
      modelSelect.required = false;
      modelCustomWrapper.style.display = 'flex';
      modelCustomInput.value = selectedModelValue;
      modelCustomInput.required = true;
    }
  } else {
    modelSelect.value = '';
  }
}

/* ==========================================================================
   MODAL: ADD / EDIT VEHICLE
   ========================================================================== */
function setupModal() {
  const modal     = document.getElementById('vehicle-modal');
  const form      = document.getElementById('vehicle-form');
  const closeBtn  = document.getElementById('modal-close');
  const cancelBtn = document.getElementById('btn-cancel');

  const openAdd = () => {
    document.getElementById('modal-title').textContent = 'Adicionar Veículo';
    document.getElementById('btn-save').textContent = 'Salvar Veículo';
    form.reset();
    document.getElementById('form-id').value = '';
    populateBrandSelect();
    modal.classList.add('open');
  };

  document.getElementById('btn-add-vehicle')?.addEventListener('click', openAdd);
  document.getElementById('btn-add-vehicle-2')?.addEventListener('click', openAdd);
  closeBtn?.addEventListener('click', () => modal.classList.remove('open'));
  cancelBtn?.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

  // Price input dynamic currency formatting
  document.getElementById('form-price')?.addEventListener('input', (e) => {
    let value = e.target.value;
    let cleanValue = value.replace(/\D/g, "");
    if (!cleanValue) {
      e.target.value = "";
      return;
    }
    let number = parseInt(cleanValue, 10);
    e.target.value = "R$ " + number.toLocaleString('pt-BR');
  });

  // Change Brand handler
  document.getElementById('form-brand')?.addEventListener('change', (e) => {
    const val = e.target.value;
    const brandCustomWrapper = document.getElementById('brand-custom-wrapper');
    const brandCustomInput = document.getElementById('form-brand-custom');
    const modelSelect = document.getElementById('form-model');
    const modelCustomWrapper = document.getElementById('model-custom-wrapper');
    const modelCustomInput = document.getElementById('form-model-custom');

    if (val === '__NEW_BRAND__') {
      e.target.style.display = 'none';
      e.target.required = false;
      brandCustomWrapper.style.display = 'flex';
      brandCustomInput.required = true;
      brandCustomInput.value = '';
      brandCustomInput.focus();

      modelSelect.style.display = 'none';
      modelSelect.required = false;
      modelCustomWrapper.style.display = 'flex';
      modelCustomInput.required = true;
      modelCustomInput.value = '';
    } else {
      populateModelSelect(val);
    }
  });

  // Change Model handler
  document.getElementById('form-model')?.addEventListener('change', (e) => {
    const val = e.target.value;
    const modelCustomWrapper = document.getElementById('model-custom-wrapper');
    const modelCustomInput = document.getElementById('form-model-custom');

    if (val === '__NEW_MODEL__') {
      e.target.style.display = 'none';
      e.target.required = false;
      modelCustomWrapper.style.display = 'flex';
      modelCustomInput.required = true;
      modelCustomInput.value = '';
      modelCustomInput.focus();
    }
  });

  // Back button for custom brand
  document.getElementById('btn-brand-back')?.addEventListener('click', () => {
    const brandSelect = document.getElementById('form-brand');
    const brandCustomInput = document.getElementById('form-brand-custom');
    const brandCustomWrapper = document.getElementById('brand-custom-wrapper');
    const modelSelect = document.getElementById('form-model');
    const modelCustomInput = document.getElementById('form-model-custom');
    const modelCustomWrapper = document.getElementById('model-custom-wrapper');

    brandSelect.style.display = 'block';
    brandSelect.required = true;
    brandSelect.value = '';
    
    brandCustomInput.value = '';
    brandCustomInput.required = false;
    brandCustomWrapper.style.display = 'none';

    modelSelect.style.display = 'block';
    modelSelect.required = true;
    modelSelect.innerHTML = '<option value="">Selecione a marca primeiro...</option>';
    modelSelect.disabled = true;

    modelCustomInput.value = '';
    modelCustomInput.required = false;
    modelCustomWrapper.style.display = 'none';
  });

  // Back button for custom model
  document.getElementById('btn-model-back')?.addEventListener('click', () => {
    const modelSelect = document.getElementById('form-model');
    const modelCustomInput = document.getElementById('form-model-custom');
    const modelCustomWrapper = document.getElementById('model-custom-wrapper');

    modelSelect.style.display = 'block';
    modelSelect.required = true;
    modelSelect.value = '';
    
    modelCustomInput.value = '';
    modelCustomInput.required = false;
    modelCustomWrapper.style.display = 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('form-id').value;

    const getBrandValue = () => {
      const select = document.getElementById('form-brand');
      if (select && select.style.display !== 'none') {
        return select.value.trim();
      }
      return document.getElementById('form-brand-custom').value.trim();
    };

    const getModelValue = () => {
      const select = document.getElementById('form-model');
      if (select && select.style.display !== 'none') {
        return select.value.trim();
      }
      return document.getElementById('form-model-custom').value.trim();
    };

    const finalBrand = getBrandValue();
    const finalModel = getModelValue();

    const carData = {
      brand:       finalBrand,
      model:       finalModel,
      version:     document.getElementById('form-version').value.trim(),
      year:        document.getElementById('form-year').value.trim(),
      km:          document.getElementById('form-km').value.trim(),
      price:       parseFloat(document.getElementById('form-price').value.replace(/[^\d]/g, '')) || 0,
      category:    document.getElementById('form-category').value,
      gearbox:     document.getElementById('form-gearbox').value,
      fuel:        document.getElementById('form-fuel').value,
      color:       document.getElementById('form-color').value.trim(),
      plateEnd:    document.getElementById('form-plate-end').value.trim(),
      description: document.getElementById('form-description').value.trim(),
      featured:    document.getElementById('form-featured').checked,
      status:      'disponivel',
      image:       'assets/corolla.png', // cleaned placeholder (no ../ prefix)
      brandLogoUrl: `assets/brands/${finalBrand.toLowerCase()}.svg`
    };

    try {
      if (id) {
        // Edit
        const response = await fetch(`http://localhost:3000/api/veiculos/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(carData)
        });
        if (response.ok) {
          showToast('Veículo atualizado com sucesso!');
        }
      } else {
        // Add
        const response = await fetch('http://localhost:3000/api/veiculos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(carData)
        });
        if (response.ok) {
          showToast('Veículo adicionado ao estoque!');
        }
      }
    } catch (err) {
      console.error("Erro ao salvar veículo no servidor:", err);
      showToast('Erro ao salvar veículo no servidor.');
    }

    modal.classList.remove('open');
    await loadData();
  });
}

function openEditModal(id) {
  const car = vehicles.find(v => v.id === id);
  if (!car) return;

  document.getElementById('modal-title').textContent = 'Editar Veículo';
  document.getElementById('btn-save').textContent = 'Salvar Alterações';
  document.getElementById('form-id').value      = car.id;
  
  populateBrandSelect(car.brand);
  populateModelSelect(car.brand, car.model);

  document.getElementById('form-version').value = car.version;
  document.getElementById('form-year').value    = car.year;
  document.getElementById('form-km').value      = car.km;
  document.getElementById('form-price').value   = car.price ? "R$ " + car.price.toLocaleString('pt-BR') : "";
  document.getElementById('form-category').value= car.category;
  document.getElementById('form-gearbox').value = car.gearbox;
  document.getElementById('form-fuel').value    = car.fuel;
  document.getElementById('form-color').value   = car.color || '';
  document.getElementById('form-plate-end').value = car.plateEnd || '';
  document.getElementById('form-description').value = car.description || '';
  document.getElementById('form-featured').checked = !!car.featured;

  document.getElementById('vehicle-modal').classList.add('open');
}

async function deleteVehicle(id) {
  if (!confirm('Deseja realmente excluir este veículo do estoque?')) return;
  try {
    const response = await fetch(`http://localhost:3000/api/veiculos/${id}`, {
      method: 'DELETE'
    });
    if (response.ok) {
      showToast('Veículo removido do estoque.');
      await loadData();
    }
  } catch (err) {
    console.error("Erro ao excluir veículo:", err);
    showToast('Erro ao excluir veículo.');
  }
}

async function toggleFeatured(id) {
  const car = vehicles.find(v => v.id === id);
  if (car) {
    const updatedFeatured = !car.featured;
    try {
      const response = await fetch(`http://localhost:3000/api/veiculos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...car, featured: updatedFeatured })
      });
      if (response.ok) {
        await loadData();
      }
    } catch (err) {
      console.error("Erro ao alterar destaque:", err);
    }
  }
}

function saveVehicles() {
  // Mantida como vazia para evitar quebras de referência antigas
}

/* ==========================================================================
   TOAST
   ========================================================================== */
function showToast(msg = 'Operação realizada!') {
  const toast = document.getElementById('dash-toast');
  document.getElementById('toast-text').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

/* ==========================================================================
   CHART HELPER
   ========================================================================== */
const chartInstances = {};

function renderChart(canvasId, type, data, options = {}) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  if (chartInstances[canvasId]) {
    chartInstances[canvasId].destroy();
  }

  const ctx = canvas.getContext('2d');
  chartInstances[canvasId] = new Chart(ctx, {
    type,
    data,
    options: {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 600, easing: 'easeInOutQuart' },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1c2230',
          borderColor: '#30363d',
          borderWidth: 1,
          titleColor: '#e6edf3',
          bodyColor: '#8b949e',
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: {},
      ...options
    }
  });
}

function barOptions(unit = '') {
  return {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} ${unit}`
        }
      }
    },
    scales: {
      x: { ticks: { color: '#8b949e', font: { size: 11 } }, grid: { display: false } },
      y: { ticks: { color: '#8b949e', font: { size: 11 } }, grid: { color: '#21262d' }, border: { display: false } }
    }
  };
}

function lineOptions(unit = '') {
  return {
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.parsed.y} ${unit}`
        }
      }
    },
    scales: {
      x: { ticks: { color: '#8b949e', font: { size: 11 } }, grid: { display: false } },
      y: { ticks: { color: '#8b949e', font: { size: 11 } }, grid: { color: '#21262d' }, border: { display: false } }
    }
  };
}

/* ==========================================================================
   HELPERS
   ========================================================================== */
function catLabel(cat) {
  return { suv: 'SUV', sedan: 'Sedan', picape: 'Picape', hatch: 'Hatch' }[cat] || cat;
}

function statusLabel(status) {
  return { disponivel: 'Disponível', reservado: 'Reservado', vendido: 'Vendido' }[status] || status;
}

function channelLabel(ch) {
  return { whatsapp: 'WhatsApp', formulario: 'Formulário', telefone: 'Telefone' }[ch] || ch;
}
