/* ==========================================================================
   VEHICLE DETAILS DATA & LOGIC
   ========================================================================== */

const defaultVehicles = [
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
    brandLogoUrl: "assets/brands/toyota.svg",
    equipments: [
      "Ar-condicionado digital Dual Zone",
      "Direção elétrica progressiva",
      "Teto solar elétrico",
      "Bancos em couro legítimo",
      "Central Multimídia de 10\" com CarPlay/Android Auto",
      "Painel de instrumentos digital configurável",
      "Sensor de estacionamento dianteiro e traseiro",
      "Câmera de ré de alta definição",
      "Rodas de liga leve aro 17\"",
      "Faróis Full LED com acendimento automático",
      "Alerta de colisão frontal com frenagem autônoma",
      "Controle de tração e estabilidade",
      "7 Airbags (frontais, laterais, cortina e joelho)",
      "Piloto automático adaptativo (ACC)"
    ]
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
    brandLogoUrl: "assets/brands/jeep.svg",
    equipments: [
      "Ar-condicionado digital Dual Zone",
      "Direção elétrica",
      "Teto solar panorâmico Command View",
      "Bancos em couro premium Limited",
      "Tração 4x4 integral com seletor de terrenos",
      "Central Multimídia flutuante de 10.1\"",
      "Sistema de som Premium Beats de fábrica",
      "Painel digital configurável de 10.25\"",
      "Sensor de fadiga do motorista",
      "Faróis Full LED com assinatura em LED DRL",
      "Rodas de liga leve aro 19\" Limited",
      "Assistentes de condução ADAS (Leitor de faixas, frenagem)",
      "Chave presencial com partida por botão",
      "Alerta de ponto cego"
    ]
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
    brandLogoUrl: "assets/brands/toyota.svg",
    equipments: [
      "Ar-condicionado digital Dual Zone",
      "Direção hidráulica progressiva",
      "Bancos em couro com ajuste elétrico e ventilação",
      "Sistema de som Premium JBL com Subwoofer",
      "Tração 4x4 com seletor eletrônico e reduzida",
      "Central Multimídia com GPS nativo e TV digital",
      "Câmera de ré com sensores 360°",
      "Rodas de liga leve aro 18\"",
      "Capota marítima e protetor de caçamba originais",
      "Santo Antônio cromado original Toyota",
      "Assistente de descida e subida de rampa (DAC/HAC)",
      "Faróis Full LED com projetor e DRL",
      "Controle ativo de tração A-TRC",
      "Estribos laterais integrados"
    ]
  }
];

const vehicles = JSON.parse(localStorage.getItem('bassini_vehicles')) || defaultVehicles;

const WHATSAPP_NUMBER = "5527999999999";

document.addEventListener("DOMContentLoaded", () => {
  // Mobile navigation drawer toggle
  const mobileToggle = document.getElementById("mobile-toggle");
  const navMenu = document.getElementById("nav-menu");
  
  if (mobileToggle) {
    mobileToggle.addEventListener("click", () => {
      mobileToggle.classList.toggle("active");
      navMenu.classList.toggle("active");
    });
  }

  // Get Vehicle ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const carId = parseInt(urlParams.get("id"));
  
  const detailContainer = document.getElementById("detail-container");
  const breadcrumbCarName = document.getElementById("breadcrumb-car-name");

  // Fetch vehicle details from API asynchronously
  async function loadCarDetails() {
    let car;
    try {
      const response = await fetch(`http://localhost:3000/api/veiculos/${carId}`);
      if (response.ok) {
        car = await response.json();
      } else {
        car = defaultVehicles.find(v => v.id === carId);
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes do carro da API, usando padrão local:", err);
      car = defaultVehicles.find(v => v.id === carId);
    }

    if (!car) {
      breadcrumbCarName.textContent = "Veículo não encontrado";
      detailContainer.innerHTML = `
        <div style="text-align: center; padding: 60px 20px;">
          <h2 style="font-size: 1.8rem; color: var(--primary-navy); margin-bottom: 12px;">Veículo não encontrado</h2>
          <p style="color: var(--text-gray); margin-bottom: 24px;">O carro solicitado não está disponível ou foi vendido.</p>
          <a href="estoque.html" class="btn btn-primary">Voltar para o Estoque</a>
        </div>
      `;
      return;
    }

    // Helper to normalize and build path for subpages
    const getImagePath = (path) => {
      if (!path) return "";
      const cleaned = path.replace(/^(\.\.\/|\/)/, "");
      return `../${cleaned}`;
    };

    // Populate dynamic header and page metadata
    document.title = `${car.brand} ${car.model} ${car.year} - Bassini Veículos`;
    breadcrumbCarName.textContent = `${car.brand} ${car.model}`;

    // Format price
    const formattedPrice = car.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
    const wppText = encodeURIComponent(`Olá! Estou no site da Bassini Veículos e gostaria de mais informações sobre o ${car.brand} ${car.model} ${car.version} (${car.year}) anunciado por ${formattedPrice}.`);
    const wppLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${wppText}`;

    // Fallback default list of equipments for dashboard-created vehicles
    const equipments = (car.equipments && car.equipments.length > 0) ? car.equipments : [
      "Garantia de fábrica",
      "Laudo cautelar aprovado",
      "Procedência garantida",
      "Revisado",
      "Manual do proprietário",
      "Chave reserva",
      "Direção hidráulica ou elétrica progressiva",
      "Vidros elétricos dianteiros/traseiros",
      "Travas elétricas",
      "Freios ABS com EBD",
      "Airbags frontais",
      "Conexão Bluetooth e rádio AM/FM"
    ];

    // Generate Equipment List HTML
    const equipmentsHtml = equipments.map(eq => `
      <div class="equipment-item">
        <svg class="equipment-check-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${eq}</span>
      </div>
    `).join("");

    // Render detail layout
    detailContainer.innerHTML = `
      <div class="detail-grid">
        <!-- Left Side: Photo Gallery -->
        <div class="detail-gallery">
          <div class="main-image-container">
            <img id="main-gallery-img" src="${getImagePath(car.image)}" alt="${car.brand} ${car.model}">
          </div>
          <div class="thumbnail-list">
            <button class="thumbnail-btn active" onclick="updateGallery('${getImagePath(car.image)}', this)">
              <img src="${getImagePath(car.image)}" alt="Frente">
            </button>
            <button class="thumbnail-btn" onclick="updateGallery('${getImagePath(car.image)}', this)">
              <img src="${getImagePath(car.image)}" alt="Traseira">
            </button>
            <button class="thumbnail-btn" onclick="updateGallery('${getImagePath(car.image)}', this)">
              <img src="${getImagePath(car.image)}" alt="Lateral">
            </button>
            <button class="thumbnail-btn" onclick="updateGallery('${getImagePath(car.image)}', this)">
              <img src="${getImagePath(car.image)}" alt="Interior">
            </button>
          </div>
        </div>

        <!-- Right Side: Details Info -->
        <div class="detail-info-panel">
          <div class="detail-header-block">
            <div class="brand-badge">
              ${car.brandLogoUrl ? `<img src="${getImagePath(car.brandLogoUrl)}" alt="${car.brand}" class="brand-badge-logo">` : ""}
              <span>${car.brand}</span>
            </div>
            <h1 class="detail-car-title">${car.brand} <span style="font-weight: 400;">${car.model}</span></h1>
            <p class="detail-car-version">${car.version}</p>
          </div>

          <div class="detail-price-box">
            <span class="price-label">Preço à vista</span>
            <span class="price-value">${formattedPrice}</span>
          </div>

          <div class="detail-actions">
            <a href="${wppLink}" target="_blank" class="btn btn-whatsapp-detail">
              <svg class="detail-btn-icon" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.035-4.135l.386.23c1.606.953 3.605 1.459 5.619 1.46h.005c5.626 0 10.201-4.577 10.204-10.205.002-2.727-1.059-5.29-2.99-7.222C17.385 2.196 14.825 1.13 12.1 1.127 6.474 1.127 1.897 5.705 1.894 11.334c-.001 1.919.506 3.794 1.466 5.422l.252.428L2.61 20.35l3.482-1.09.398-.242zM17.382 14.23c-.29-.145-1.716-.848-1.98-.943-.266-.096-.459-.145-.652.145-.193.29-.748.943-.918 1.137-.168.193-.338.217-.628.072-.29-.145-1.226-.452-2.336-1.442-.864-.771-1.447-1.723-1.616-2.014-.17-.29-.018-.447.127-.59.13-.13.29-.338.435-.508.145-.17.193-.29.29-.483.096-.193.048-.362-.024-.508-.072-.145-.652-1.573-.894-2.153-.236-.57-.475-.49-.652-.49-.168-.008-.362-.01-.556-.01-.193 0-.507.072-.772.362-.266.29-1.014.992-1.014 2.418 0 1.425 1.038 2.802 1.182 2.995.145.193 2.043 3.12 4.948 4.373.69.298 1.23.476 1.65.61.693.22 1.324.19 1.823.115.556-.084 1.716-.7 1.957-1.378.24-.677.24-1.257.17-1.377-.072-.12-.266-.193-.556-.338z"/>
              </svg>
              Fale Conosco pelo WhatsApp
            </a>
            
            <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá! Gostaria de fazer uma simulação de financiamento para o veículo ' + car.brand + ' ' + car.model + '.')}" target="_blank" class="btn btn-secondary">
              Simular Financiamento
            </a>
          </div>

          <!-- Specifications Grid inside Panel -->
          <h4 class="detail-specs-title">Ficha Técnica</h4>
          <div class="specs-grid">
            <div class="spec-item">
              <span class="spec-label">Ano / Modelo</span>
              <span class="spec-value">${car.year}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Quilometragem</span>
              <span class="spec-value">${car.km}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Câmbio</span>
              <span class="spec-value">${car.gearbox}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Combustível</span>
              <span class="spec-value">${car.fuel}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Cor</span>
              <span class="spec-value">${car.color}</span>
            </div>
            <div class="spec-item">
              <span class="spec-label">Final da Placa</span>
              <span class="spec-value">${car.plateEnd}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Full Width Details: Description and Equipment -->
      <div class="detail-full-width">
        <!-- Description Section -->
        <div class="detail-section-card">
          <h3 class="detail-section-title">Descrição deste Veículo</h3>
          <p class="description-text">${car.description}</p>
        </div>

        <!-- Equipment Section -->
        <div class="detail-section-card">
          <h3 class="detail-section-title">Equipamentos e Acessórios</h3>
          <div class="equipments-grid">
            ${equipmentsHtml}
          </div>
        </div>
      </div>
    `;
  }

  loadCarDetails();
});

// Global Function to Update Gallery
window.updateGallery = (imageUrl, thumbnailElement) => {
  const mainImg = document.getElementById("main-gallery-img");
  if (mainImg) {
    mainImg.src = imageUrl;
  }
  
  // Update active thumbnail border
  const thumbnails = document.querySelectorAll(".thumbnail-btn");
  thumbnails.forEach(thumb => thumb.classList.remove("active"));
  if (thumbnailElement) {
    thumbnailElement.classList.add("active");
  }
};
