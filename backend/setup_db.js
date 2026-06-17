const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Erro: SUPABASE_URL e/ou SUPABASE_KEY não estão configurados no arquivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: WebSocket
  }
});

const defaultVehicles = [
  {
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

async function setup() {
  console.log("Conectando ao Supabase para verificar dados...");
  try {
    // Verificar se a tabela veiculos já possui registros
    const { data, count, error } = await supabase
      .from('veiculos')
      .select('*', { count: 'exact', head: false });

    if (error) {
      console.error("Erro ao verificar tabela de veículos.");
      console.error("Mensagem de erro:", error.message);
      console.log("\n>>> CERTIFIQUE-SE DE CRIAR AS TABELAS NO SUPABASE RODANDO O CONTEÚDO DO ARQUIVO 'setup.sql' NO SEU SQL EDITOR DO PAINEL SUPABASE ANTES DE RODAR ESTE SETUP! <<<\n");
      return;
    }

    if (data.length === 0) {
      console.log("A tabela de veículos está vazia. Populando veículos iniciais padrões...");

      for (const car of defaultVehicles) {
        const { data: insertedCar, error: insertError } = await supabase
          .from('veiculos')
          .insert([{
            brand: car.brand,
            model: car.model,
            version: car.version,
            year: car.year,
            km: car.km,
            gearbox: car.gearbox,
            fuel: car.fuel,
            color: car.color,
            plate_end: car.plateEnd,
            description: car.description,
            price: car.price,
            category: car.category,
            featured: car.featured,
            status: 'disponivel',
            image: car.image,
            brand_logo_url: car.brandLogoUrl
          }])
          .select()
          .single();

        if (insertError) {
          console.error(`Erro ao inserir veículo ${car.model}:`, insertError.message);
          continue;
        }

        console.log(`Veículo ${insertedCar.brand} ${insertedCar.model} cadastrado com ID ${insertedCar.id}!`);

        // Popular lista de equipamentos
        const eqInserts = car.equipments.map(eqName => ({
          veiculo_id: insertedCar.id,
          nome: eqName
        }));

        const { error: eqError } = await supabase
          .from('equipamentos')
          .insert(eqInserts);

        if (eqError) {
          console.error(`Erro ao cadastrar equipamentos para o veículo ${insertedCar.model}:`, eqError.message);
        } else {
          console.log(`Cadastrados ${eqInserts.length} equipamentos para o veículo ${insertedCar.model}.`);
        }
      }
      console.log("\nPopulação do banco de dados concluída com sucesso!");
    } else {
      console.log(`A tabela de veículos já possui ${data.length} registros. Nenhuma população foi necessária.`);
    }
  } catch (err) {
    console.error("Erro inesperado durante o setup:", err.message);
  }
}

setup();
