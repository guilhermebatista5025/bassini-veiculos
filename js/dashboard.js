/* ==========================================================================
   DASHBOARD JS — Bassini Veículos Admin Panel
   ========================================================================== */

/* -------------------------------------------------------------------------
   VEHICLES DATA (shared with main site, extended for dashboard)
   ------------------------------------------------------------------------- */
let vehicles = JSON.parse(localStorage.getItem('bassini_vehicles')) || [
  {
    id: 1,
    brand: "Toyota", model: "Corolla",
    version: "2.0 Altis Premium CVT",
    year: "2022/2022", km: "32.000 km",
    gearbox: "Automático", fuel: "Flex",
    color: "Branco Pérola", plateEnd: "5",
    description: "Veículo em estado de zero quilômetro. Único dono, com todas as revisões na Toyota.",
    price: 139900, image: "../assets/corolla.png",
    category: "sedan", featured: true,
    status: "disponivel",
    brandLogoUrl: "../assets/brands/toyota.svg"
  },
  {
    id: 2,
    brand: "Jeep", model: "Compass",
    version: "2.0 TD350 Limited 4x4",
    year: "2021/2022", km: "45.000 km",
    gearbox: "Automático", fuel: "Diesel",
    color: "Cinza Granite", plateEnd: "8",
    description: "Versão Limited com motor TD350 Turbodiesel, teto solar panorâmico e som Beats.",
    price: 168900, image: "../assets/compass.png",
    category: "suv", featured: true,
    status: "disponivel",
    brandLogoUrl: "../assets/brands/jeep.svg"
  },
  {
    id: 3,
    brand: "Toyota", model: "Hilux",
    version: "2.8 SRX 4x4 Turbodiesel",
    year: "2020/2020", km: "68.000 km",
    gearbox: "Automático", fuel: "Diesel",
    color: "Prata Metalizado", plateEnd: "3",
    description: "Versão SRX topo de linha com motor 2.8 turbodiesel e som JBL.",
    price: 219900, image: "../assets/hilux.png",
    category: "picape", featured: true,
    status: "disponivel",
    brandLogoUrl: "../assets/brands/toyota.svg"
  }
];

/* Mock leads data */
const leadsData = [
  { name: "Carlos Mendes", phone: "(27) 99845-2211", interest: "Toyota Corolla", channel: "whatsapp", date: "12/06/2026", status: "Novo" },
  { name: "Fernanda Lima", phone: "(27) 98712-3344", interest: "Jeep Compass", channel: "formulario", date: "11/06/2026", status: "Contatado" },
  { name: "Roberto Alves", phone: "(27) 99231-8877", interest: "Toyota Hilux", channel: "whatsapp", date: "10/06/2026", status: "Convertido" },
  { name: "Mariana Costa", phone: "(28) 99012-5566", interest: "Qualquer SUV", channel: "telefone", date: "09/06/2026", status: "Aguardando" },
  { name: "André Souza", phone: "(27) 99876-4433", interest: "Toyota Corolla", channel: "whatsapp", date: "08/06/2026", status: "Novo" },
  { name: "Patrícia Ramos", phone: "(27) 98543-1122", interest: "Jeep Compass", channel: "formulario", date: "07/06/2026", status: "Convertido" },
  { name: "Lucas Ferreira", phone: "(27) 99654-3321", interest: "Toyota Hilux", channel: "whatsapp", date: "06/06/2026", status: "Contatado" },
  { name: "Juliana Martins", phone: "(27) 99123-7788", interest: "Sedan premium", channel: "telefone", date: "05/06/2026", status: "Aguardando" },
];

/* ==========================================================================
   INIT
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  setCurrentDate();
  setupNavigation();
  setupSidebar();
  setupModal();
  renderOverview();
  renderStockTable();
  renderLeadsTable();
  renderAnalyticsCharts();
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
            <img src="${car.image}" alt="${car.model}" class="vehicle-thumb" onerror="this.style.display='none'">
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
          <img src="${car.image}" alt="${car.model}" class="vehicle-thumb" onerror="this.style.display='none'">
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

    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td><strong style="color:#e6edf3">${lead.name}</strong></td>
        <td>${lead.phone}</td>
        <td>${lead.interest}</td>
        <td><span class="channel-badge ${lead.channel}">${channelLabel(lead.channel)}</span></td>
        <td style="color:var(--text-muted)">${lead.date}</td>
        <td><span style="color:${statusColor};font-weight:600;font-size:12px">${lead.status}</span></td>
      </tr>
    `);
  });
}

/* ==========================================================================
   ANALYTICS CHARTS
   ========================================================================== */
const analyticsChartsRendered = { evolution: false, fuel: false, gearbox: false };

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
    modal.classList.add('open');
  };

  document.getElementById('btn-add-vehicle')?.addEventListener('click', openAdd);
  document.getElementById('btn-add-vehicle-2')?.addEventListener('click', openAdd);
  closeBtn?.addEventListener('click', () => modal.classList.remove('open'));
  cancelBtn?.addEventListener('click', () => modal.classList.remove('open'));
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('open'); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('form-id').value;
    const carData = {
      brand:       document.getElementById('form-brand').value.trim(),
      model:       document.getElementById('form-model').value.trim(),
      version:     document.getElementById('form-version').value.trim(),
      year:        document.getElementById('form-year').value.trim(),
      km:          document.getElementById('form-km').value.trim(),
      price:       parseFloat(document.getElementById('form-price').value),
      category:    document.getElementById('form-category').value,
      gearbox:     document.getElementById('form-gearbox').value,
      fuel:        document.getElementById('form-fuel').value,
      color:       document.getElementById('form-color').value.trim(),
      plateEnd:    document.getElementById('form-plate-end').value.trim(),
      description: document.getElementById('form-description').value.trim(),
      featured:    document.getElementById('form-featured').checked,
      status:      'disponivel',
      image:       '../assets/corolla.png', // placeholder
      brandLogoUrl:`../assets/brands/${document.getElementById('form-brand').value.toLowerCase()}.svg`
    };

    if (id) {
      // Edit
      const idx = vehicles.findIndex(v => v.id === parseInt(id));
      if (idx !== -1) vehicles[idx] = { ...vehicles[idx], ...carData };
      showToast('Veículo atualizado com sucesso!');
    } else {
      // Add
      const newId = Math.max(...vehicles.map(v => v.id), 0) + 1;
      vehicles.push({ id: newId, ...carData });
      showToast('Veículo adicionado ao estoque!');
    }

    saveVehicles();
    modal.classList.remove('open');
    renderOverview();
    renderStockTable();
  });
}

function openEditModal(id) {
  const car = vehicles.find(v => v.id === id);
  if (!car) return;

  document.getElementById('modal-title').textContent = 'Editar Veículo';
  document.getElementById('btn-save').textContent = 'Salvar Alterações';
  document.getElementById('form-id').value      = car.id;
  document.getElementById('form-brand').value   = car.brand;
  document.getElementById('form-model').value   = car.model;
  document.getElementById('form-version').value = car.version;
  document.getElementById('form-year').value    = car.year;
  document.getElementById('form-km').value      = car.km;
  document.getElementById('form-price').value   = car.price;
  document.getElementById('form-category').value= car.category;
  document.getElementById('form-gearbox').value = car.gearbox;
  document.getElementById('form-fuel').value    = car.fuel;
  document.getElementById('form-color').value   = car.color || '';
  document.getElementById('form-plate-end').value = car.plateEnd || '';
  document.getElementById('form-description').value = car.description || '';
  document.getElementById('form-featured').checked = !!car.featured;

  document.getElementById('vehicle-modal').classList.add('open');
}

function deleteVehicle(id) {
  if (!confirm('Deseja realmente excluir este veículo do estoque?')) return;
  vehicles = vehicles.filter(v => v.id !== id);
  saveVehicles();
  renderOverview();
  renderStockTable();
  showToast('Veículo removido do estoque.');
}

function toggleFeatured(id) {
  const car = vehicles.find(v => v.id === id);
  if (car) {
    car.featured = !car.featured;
    saveVehicles();
    renderStockTable();
  }
}

function saveVehicles() {
  localStorage.setItem('bassini_vehicles', JSON.stringify(vehicles));
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
