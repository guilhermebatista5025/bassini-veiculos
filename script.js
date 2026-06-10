/* ==========================================================================
   VEHICLES DATA (SIMULATION OF DATABASE)
   ========================================================================== */
const vehicles = [
  {
    id: 1,
    brand: "Toyota",
    model: "Corolla",
    version: "2.0 Altis Premium CVT",
    year: "2022/2022",
    km: "32.000 km",
    gearbox: "Automático",
    fuel: "Flex",
    color: "Branco Pérola",
    plateEnd: "5",
    description: "Veículo em estado de zero quilômetro. Único dono, com todas as revisões realizadas rigorosamente na concessionária autorizada Toyota. Possui manual do proprietário, chave reserva e laudo de vistoria cautelar 100% aprovado, sem qualquer retoque ou leilão. Versão Altis Premium com teto solar elétrico e alerta de colisão frontal.",
    price: 139900,
    image: "assets/corolla.png",
    category: "sedan",
    featured: true,
    brandLogoUrl: "https://static.autoconf.com.br/marcas/toyota.png"
  },
  {
    id: 2,
    brand: "Jeep",
    model: "Compass",
    version: "2.0 TD350 Limited 4x4",
    year: "2021/2022",
    km: "45.000 km",
    gearbox: "Automático",
    fuel: "Diesel",
    color: "Cinza Granite",
    plateEnd: "8",
    description: "Versão Limited equipada com o eficiente motor TD350 Turbodiesel de 170cv e tração integral 4x4. Equipado com painel de instrumentos digital configurável, central multimídia flutuante de 10.1 polegadas com espelhamento sem fio, teto solar panorâmico, som premium Beats e assistentes de condução semiautônoma (ADAS). Revisado.",
    price: 168900,
    image: "assets/compass.png",
    category: "suv",
    featured: true,
    brandLogoUrl: "https://static.autoconf.com.br/marcas/jeep.png"
  },
  {
    id: 3,
    brand: "Toyota",
    model: "Hilux",
    version: "2.8 SRX 4x4 Turbodiesel",
    year: "2020/2020",
    km: "68.000 km",
    gearbox: "Automático",
    fuel: "Diesel",
    color: "Prata Metalizado",
    plateEnd: "3",
    description: "Excelente picape para uso urbano e off-road. Versão SRX topo de linha equipada com motor 2.8 turbodiesel com 204cv. Acompanha ar-condicionado digital duas zonas, bancos em couro com ajuste elétrico e ventilação, sistema de som Premium JBL com subwoofer, além de capota marítima e protetor de caçamba originais.",
    price: 219900,
    image: "assets/hilux.png",
    category: "picape",
    featured: true,
    brandLogoUrl: "https://static.autoconf.com.br/marcas/toyota.png"
  },
  {
    id: 4,
    brand: "Honda",
    model: "Civic",
    version: "1.5 Touring Turbo CVT",
    year: "2021/2021",
    km: "28.000 km",
    gearbox: "Automático",
    fuel: "Gasolina",
    color: "Preto Cristal",
    plateEnd: "1",
    description: "O mais desejado da categoria. Versão Touring equipada com o potente e econômico motor 1.5 Turbo de 173cv. Possui teto solar elétrico, conjunto óptico Full LED, LaneWatch (câmera de ponto cego no retrovisor), sistema de som premium com 10 alto-falantes e carregamento de celular por indução. Procedência impecável.",
    price: 147900,
    image: "assets/civic.png",
    category: "sedan",
    featured: true,
    brandLogoUrl: "https://static.autoconf.com.br/marcas/honda.png"
  }
];

// WhatsApp Configs
const WHATSAPP_NUMBER = "5527999999999"; // Linhares, ES WhatsApp

/* ==========================================================================
   APP INITIALIZATION & DYNAMIC RENDERING
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  // Navigation elements
  const header = document.querySelector(".header");
  const navMenu = document.getElementById("nav-menu");
  const mobileToggle = document.getElementById("mobile-toggle");
  const navLinks = document.querySelectorAll(".nav-link");
  
  // Stock elements
  const carGrid = document.getElementById("car-grid");
  const filterTags = document.querySelectorAll(".filter-tag");
  const searchInput = document.getElementById("term");
  const searchForm = document.getElementById("searchForm");
  
  // Brand links elements
  const brandLinks = document.querySelectorAll(".brand-link");
  
  // Modal elements
  const modalOverlay = document.getElementById("modal-overlay");
  const modalContainer = document.querySelector(".modal-container");
  
  // Testimonial or auxiliary buttons
  const resetFiltersBtn = document.getElementById("see-all-novidades-btn");
  
  // Contact elements
  const contactForm = document.getElementById("contact-form");
  const toast = document.getElementById("toast");
  
  // Active state filters
  let activeCategory = "all";
  let activeBrandFilter = "";
  let activeSearchQuery = "";

  /* ------------------------------------------------------------------------
     1. MOBILE NAVIGATION & MENU DRAWER
     ------------------------------------------------------------------------ */
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      mobileToggle.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }

  // Close drawer when link clicked
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      if (mobileToggle) mobileToggle.classList.remove("active");
      if (navMenu) navMenu.classList.remove("active");
    });
  });

  /* ------------------------------------------------------------------------
     2. STOCK RENDERING & FILTERS
     ------------------------------------------------------------------------ */
  renderStock();

  // Category Filters (Capsules)
  filterTags.forEach(tag => {
    tag.addEventListener("click", () => {
      filterTags.forEach(t => t.classList.remove("active"));
      tag.classList.add("active");
      activeCategory = tag.dataset.filter;
      
      // Clear brand active circles if category is changed
      if (activeCategory !== "all") {
        activeBrandFilter = "";
        brandLinks.forEach(b => b.classList.remove("active"));
      }
      
      renderStock();
    });
  });

  // Search input typing or submitting
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      activeSearchQuery = e.target.value.toLowerCase().trim();
      renderStock();
    });
  }
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      activeSearchQuery = searchInput.value.toLowerCase().trim();
      renderStock();
      scrollToStock();
    });
  }

  // Brand filter clicks (circles)
  brandLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      
      const brand = link.dataset.brand;
      
      // Toggle logic
      if (link.classList.contains("active")) {
        link.classList.remove("active");
        activeBrandFilter = "";
      } else {
        brandLinks.forEach(b => b.classList.remove("active"));
        link.classList.add("active");
        activeBrandFilter = brand;
        
        // Reset category pills back to 'all' to prevent collision
        activeCategory = "all";
        filterTags.forEach(t => t.classList.remove("active"));
        filterTags[0].classList.add("active"); // 'Todos' tag
      }
      
      renderStock();
      scrollToStock();
    });
  });

  // Button: Veja todas as novidades / Reset Filters
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener("click", () => {
      resetAllFilters();
      scrollToStock();
    });
  }

  function resetAllFilters() {
    activeCategory = "all";
    activeBrandFilter = "";
    activeSearchQuery = "";
    
    if (searchInput) searchInput.value = "";
    
    filterTags.forEach(t => t.classList.remove("active"));
    if (filterTags[0]) filterTags[0].classList.add("active");
    
    brandLinks.forEach(b => b.classList.remove("active"));
    
    renderStock();
  }

  function scrollToStock() {
    const stockSection = document.getElementById("estoque");
    if (stockSection) {
      stockSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  // Stock Renderer in Menelli Card Format
  function renderStock() {
    const filtered = vehicles.filter(car => {
      const matchesCategory = activeCategory === "all" || car.category === activeCategory;
      const matchesBrand = activeBrandFilter === "" || car.brand.toLowerCase() === activeBrandFilter.toLowerCase();
      const matchesSearch = car.brand.toLowerCase().includes(activeSearchQuery) ||
                            car.model.toLowerCase().includes(activeSearchQuery) ||
                            car.version.toLowerCase().includes(activeSearchQuery);
      return matchesCategory && matchesBrand && matchesSearch;
    });

    carGrid.innerHTML = "";

    if (filtered.length === 0) {
      carGrid.innerHTML = `
        <div class="stock-empty" style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background-color: var(--bg-card); border: 1px dashed var(--border-color); border-radius: var(--radius-sm);">
          <svg style="width: 48px; height: 48px; color: var(--text-muted); margin-bottom: 16px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 style="font-size: 1.3rem; margin-bottom: 8px;">Nenhum veículo encontrado</h3>
          <p style="color: var(--text-gray); font-size: 0.9rem; margin-bottom: 20px;">Tente redefinir seus filtros ou buscar por outro modelo.</p>
          <button class="btn btn-primary btn-sm" id="reset-stock-btn">Limpar Filtros</button>
        </div>
      `;
      document.getElementById("reset-stock-btn").addEventListener("click", () => {
        resetAllFilters();
      });
      return;
    }

    filtered.forEach(car => {
      const formattedPrice = car.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
      const card = document.createElement("div");
      card.className = "card-car";
      card.innerHTML = `
        <div class="card-header">
          <img src="${car.image}" alt="${car.brand} ${car.model}">
          ${car.featured ? '<div class="badges"><span class="badge">Destaque</span></div>' : ''}
        </div>
        <div class="card-body">
          <div class="car-description">
            <div class="brand-logo-badge">
              ${car.brandLogoUrl ? `<img src="${car.brandLogoUrl}" alt="${car.brand}" style="width:100%;height:100%;object-fit:contain;">` : ''}
            </div>
            <div class="col p-0">
              <h3>${car.brand} <span class="fw-bold">${car.model}</span></h3>
            </div>
          </div>
          <p class="car-version-title" title="${car.version}">${car.version}</p>
          
          <div class="car-detail-info">
            <div class="info-item">
              <svg class="info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>${car.year}</span>
            </div>
            <div class="info-item">
              <svg class="info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>${car.km}</span>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <div class="price-row">
            <div class="price-box">
              <b>R$</b><strong class="fs-4">${car.price.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace("R$", "")}</strong>
            </div>
            <button class="btn btn-secondary btn-sm open-details-btn" data-id="${car.id}">Ver mais</button>
          </div>
        </div>
      `;
      carGrid.appendChild(card);
    });

    // Modal click bindings
    document.querySelectorAll(".open-details-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const carId = parseInt(btn.dataset.id);
        openDetailsModal(carId);
      });
    });
  }

  /* ------------------------------------------------------------------------
     3. DETAILS MODAL LOGIC
     ------------------------------------------------------------------------ */
  function openDetailsModal(id) {
    const car = vehicles.find(c => c.id === id);
    if (!car) return;

    const formattedPrice = car.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
    const message = encodeURIComponent(`Olá, Bassini Veículos! Tenho interesse no ${car.brand} ${car.model} ${car.version} (${car.year}) anunciado por ${formattedPrice}. Gostaria de mais informações.`);
    const whatsAppLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;

    modalContainer.innerHTML = `
      <button class="modal-close-btn" id="modal-close" aria-label="Fechar">
        <svg style="width: 18px; height: 18px;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div class="modal-grid">
        <div class="modal-gallery">
          <img class="modal-gallery-img" src="${car.image}" alt="${car.brand} ${car.model}">
        </div>
        <div class="modal-content">
          <div class="modal-header">
            <span class="badge mb-2">${car.brand}</span>
            <h3>${car.model}</h3>
            <p class="modal-version">${car.version}</p>
          </div>
          
          <div class="modal-price-wrapper">
            <span class="modal-price-label">Preço Especial</span>
            <span class="modal-price">${formattedPrice}</span>
          </div>
          
          <h4 class="modal-specs-title">Ficha Técnica</h4>
          <ul class="modal-specs-list">
            <li class="modal-spec-item">
              <span class="modal-spec-label">Ano / Modelo</span>
              <span class="modal-spec-value">${car.year}</span>
            </li>
            <li class="modal-spec-item">
              <span class="modal-spec-label">Quilometragem</span>
              <span class="modal-spec-value">${car.km}</span>
            </li>
            <li class="modal-spec-item">
              <span class="modal-spec-label">Câmbio</span>
              <span class="modal-spec-value">${car.gearbox}</span>
            </li>
            <li class="modal-spec-item">
              <span class="modal-spec-label">Combustível</span>
              <span class="modal-spec-value">${car.fuel}</span>
            </li>
            <li class="modal-spec-item">
              <span class="modal-spec-label">Cor</span>
              <span class="modal-spec-value">${car.color}</span>
            </li>
            <li class="modal-spec-item">
              <span class="modal-spec-label">Final da Placa</span>
              <span class="modal-spec-value">${car.plateEnd}</span>
            </li>
          </ul>
          
          <h4 class="modal-specs-title" style="margin-bottom: 8px;">Sobre este Carro</h4>
          <p style="color: var(--text-gray); font-size: 0.85rem; margin-bottom: 24px; line-height: 1.5;">${car.description}</p>
          
          <a href="${whatsAppLink}" target="_blank" class="btn btn-primary w-100" style="background-color: var(--accent-green); border-color: var(--accent-green); display: flex; align-items: center; justify-content: center; gap: 8px;">
            <svg style="width: 18px; height: 18px;" fill="currentColor" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.035-4.135l.386.23c1.606.953 3.605 1.459 5.619 1.46h.005c5.626 0 10.201-4.577 10.204-10.205.002-2.727-1.059-5.29-2.99-7.222C17.385 2.196 14.825 1.13 12.1 1.127 6.474 1.127 1.897 5.705 1.894 11.334c-.001 1.919.506 3.794 1.466 5.422l.252.428L2.61 20.35l3.482-1.09.398-.242zM17.382 14.23c-.29-.145-1.716-.848-1.98-.943-.266-.096-.459-.145-.652.145-.193.29-.748.943-.918 1.137-.168.193-.338.217-.628.072-.29-.145-1.226-.452-2.336-1.442-.864-.771-1.447-1.723-1.616-2.014-.17-.29-.018-.447.127-.59.13-.13.29-.338.435-.508.145-.17.193-.29.29-.483.096-.193.048-.362-.024-.508-.072-.145-.652-1.573-.894-2.153-.236-.57-.475-.49-.652-.49-.168-.008-.362-.01-.556-.01-.193 0-.507.072-.772.362-.266.29-1.014.992-1.014 2.418 0 1.425 1.038 2.802 1.182 2.995.145.193 2.043 3.12 4.948 4.373.69.298 1.23.476 1.65.61.693.22 1.324.19 1.823.115.556-.084 1.716-.7 1.957-1.378.24-.677.24-1.257.17-1.377-.072-.12-.266-.193-.556-.338z"/>
            </svg>
            Negociar no WhatsApp
          </a>
        </div>
      </div>
    `;

    document.getElementById("modal-close").addEventListener("click", closeModal);
    modalOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modalOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modalOverlay.classList.contains("active")) {
      closeModal();
    }
  });

  /* ------------------------------------------------------------------------
     4. CONTACT FORM SUBMISSION
     ------------------------------------------------------------------------ */
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("client-name").value.trim();
      const phone = document.getElementById("client-phone").value.trim();
      const email = document.getElementById("client-email").value.trim();
      const message = document.getElementById("client-message").value.trim();

      if (!name || !phone || !email || !message) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      const submitBtn = contactForm.querySelector("button[type='submit']");
      const originalText = submitBtn.innerHTML;
      
      submitBtn.disabled = true;
      submitBtn.innerHTML = "Enviando...";

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        contactForm.reset();

        showToast("Mensagem Enviada!", "Retornaremos o contato em instantes.");

        // Form WhatsApp redirect
        const whatsAppText = encodeURIComponent(`Olá, Bassini Veículos! Sou ${name}, enviei uma mensagem pelo site e gostaria de atendimento sobre seminovos. Meus contatos: Telefone ${phone}, Email ${email}. Mensagem: ${message}`);
        const link = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsAppText}`;
        
        setTimeout(() => {
          window.open(link, "_blank");
        }, 1200);

      }, 1500);
    });
  }

  function showToast(title, text) {
    const toastTitle = toast.querySelector(".toast-content h4");
    const toastText = toast.querySelector(".toast-content p");
    
    toastTitle.textContent = title;
    toastText.textContent = text;
    
    toast.classList.add("active");

    setTimeout(() => {
      toast.classList.remove("active");
    }, 4000);
  }
});
