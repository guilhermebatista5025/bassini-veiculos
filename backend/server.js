const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Erro: As variáveis de ambiente SUPABASE_URL e/ou SUPABASE_KEY não foram definidas no arquivo .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  realtime: {
    transport: WebSocket
  }
});

console.log('Cliente Supabase inicializado com sucesso.');

// Helper to format vehicle database response to frontend camelCase
function formatVehicle(car) {
  if (!car) return null;
  return {
    id: car.id,
    brand: car.brand,
    model: car.model,
    version: car.version,
    year: car.year,
    km: car.km,
    gearbox: car.gearbox,
    fuel: car.fuel,
    color: car.color,
    plateEnd: car.plate_end,
    description: car.description,
    price: parseFloat(car.price),
    category: car.category,
    featured: car.featured,
    status: car.status,
    image: car.image,
    brandLogoUrl: car.brand_logo_url,
    created_at: car.created_at,
    updated_at: car.updated_at
  };
}

/* ==============================================================================
   ROTAS DE VEÍCULOS
   ============================================================================== */

// 1. GET ALL VEHICLES (com filtros, categorias, busca e ordenação)
app.get('/api/veiculos', async (req, res) => {
  try {
    let query = supabase.from('veiculos').select('*');

    // Filtro de Categoria
    if (req.query.category && req.query.category !== 'all') {
      query = query.eq('category', req.query.category.toLowerCase());
    }

    // Filtro de Marca
    if (req.query.brand) {
      query = query.ilike('brand', req.query.brand);
    }

    // Filtro de Câmbio
    if (req.query.gearbox && req.query.gearbox !== 'all') {
      query = query.ilike('gearbox', req.query.gearbox);
    }

    // Filtro de Combustível
    if (req.query.fuel && req.query.fuel !== 'all') {
      query = query.ilike('fuel', req.query.fuel);
    }

    // Busca Textual (por termo: marca, modelo ou versão)
    if (req.query.search) {
      const searchPattern = `%${req.query.search.toLowerCase()}%`;
      query = query.or(`brand.ilike.${searchPattern},model.ilike.${searchPattern},version.ilike.${searchPattern}`);
    }

    // Ordenação
    const sort = req.query.sort || 'default';
    if (sort === 'price-asc') {
      query = query.order('price', { ascending: true });
    } else if (sort === 'price-desc') {
      query = query.order('price', { ascending: false });
    } else if (sort === 'year-desc') {
      query = query.order('year', { ascending: false });
    } else if (sort === 'km-asc') {
      query = query.order('km', { ascending: true });
    } else {
      query = query.order('id', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    res.json(data.map(formatVehicle));
  } catch (err) {
    console.error("Erro ao buscar veículos no Supabase:", err.message);
    res.status(500).json({ error: 'Erro ao buscar veículos.' });
  }
});

// 2. GET SINGLE VEHICLE BY ID (incluindo array de equipamentos)
app.get('/api/veiculos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar veículo por id
    const { data: car, error: carError } = await supabase
      .from('veiculos')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (carError) {
      throw carError;
    }

    if (!car) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

    // Buscar equipamentos associados
    const { data: equipments, error: eqError } = await supabase
      .from('equipamentos')
      .select('nome')
      .eq('veiculo_id', id);

    if (eqError) {
      throw eqError;
    }

    const formattedCar = formatVehicle(car);
    formattedCar.equipments = equipments.map(row => row.nome);

    res.json(formattedCar);
  } catch (err) {
    console.error("Erro ao buscar detalhes do veículo:", err.message);
    res.status(500).json({ error: 'Erro ao buscar detalhes do veículo.' });
  }
});

// 3. POST - ADICIONAR NOVO VEÍCULO
app.post('/api/veiculos', async (req, res) => {
  try {
    const {
      brand, model, version, year, km, gearbox, fuel,
      color, description, price, category, featured, status,
      image, equipments
    } = req.body;

    const plate_end = req.body.plate_end || req.body.plateEnd || '';
    const brand_logo_url = req.body.brand_logo_url || req.body.brandLogoUrl || '';

    // Inserir veículo
    const { data: newCar, error: carError } = await supabase
      .from('veiculos')
      .insert([{
        brand, model, version, year, km, gearbox, fuel,
        color, plate_end, description, price, category, 
        featured: featured || false, status: status || 'disponivel',
        image, brand_logo_url
      }])
      .select()
      .single();

    if (carError) {
      throw carError;
    }

    // Se houver equipamentos, salvá-los
    const equipmentList = equipments || [];
    if (equipmentList.length > 0) {
      const eqInserts = equipmentList.map(eqName => ({
        veiculo_id: newCar.id,
        nome: eqName
      }));

      const { error: eqError } = await supabase
        .from('equipamentos')
        .insert(eqInserts);

      if (eqError) {
        throw eqError;
      }
    }

    const formattedCar = formatVehicle(newCar);
    formattedCar.equipments = equipmentList;

    res.status(201).json(formattedCar);
  } catch (err) {
    console.error("Erro ao salvar veículo no Supabase:", err.message);
    res.status(500).json({ error: 'Erro ao salvar veículo no estoque.' });
  }
});

// 4. PUT - ATUALIZAR VEÍCULO
app.put('/api/veiculos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      brand, model, version, year, km, gearbox, fuel,
      color, description, price, category, featured, status,
      image, equipments
    } = req.body;

    const plate_end = req.body.plate_end || req.body.plateEnd || '';
    const brand_logo_url = req.body.brand_logo_url || req.body.brandLogoUrl || '';

    // Atualizar dados gerais do veículo
    const { data: updatedCar, error: carError } = await supabase
      .from('veiculos')
      .update({
        brand, model, version, year, km, gearbox, fuel,
        color, plate_end, description, price, category, 
        featured, status, image, brand_logo_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (carError) {
      throw carError;
    }

    if (!updatedCar) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

    // Se houver lista de equipamentos, substituir
    if (equipments) {
      // Deletar antigos
      const { error: deleteEqError } = await supabase
        .from('equipamentos')
        .delete()
        .eq('veiculo_id', id);

      if (deleteEqError) {
        throw deleteEqError;
      }

      // Inserir novos
      if (equipments.length > 0) {
        const eqInserts = equipments.map(eqName => ({
          veiculo_id: id,
          nome: eqName
        }));

        const { error: insertEqError } = await supabase
          .from('equipamentos')
          .insert(eqInserts);

        if (insertEqError) {
          throw insertEqError;
        }
      }
    }

    const formattedCar = formatVehicle(updatedCar);
    
    // Buscar equipamentos finais
    const { data: currentEqs } = await supabase
      .from('equipamentos')
      .select('nome')
      .eq('veiculo_id', id);

    formattedCar.equipments = currentEqs ? currentEqs.map(r => r.nome) : [];

    res.json(formattedCar);
  } catch (err) {
    console.error("Erro ao atualizar veículo no Supabase:", err.message);
    res.status(500).json({ error: 'Erro ao atualizar dados do veículo.' });
  }
});

// 5. DELETE - APAGAR VEÍCULO DO ESTOQUE
app.delete('/api/veiculos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data: deletedCar, error } = await supabase
      .from('veiculos')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!deletedCar) {
      return res.status(404).json({ error: 'Veículo não encontrado.' });
    }

    res.json({ message: 'Veículo excluído com sucesso!', vehicle: formatVehicle(deletedCar) });
  } catch (err) {
    console.error("Erro ao excluir veículo do Supabase:", err.message);
    res.status(500).json({ error: 'Erro ao excluir veículo.' });
  }
});


/* ==============================================================================
   ROTAS DE LEADS (Contatos recebidos)
   ============================================================================== */

// 1. GET ALL LEADS
app.get('/api/leads', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (err) {
    console.error("Erro ao buscar leads no Supabase:", err.message);
    res.status(500).json({ error: 'Erro ao buscar leads.' });
  }
});

// 2. POST - CRIAR NOVO LEAD
app.post('/api/leads', async (req, res) => {
  try {
    const { nome, telefone, email, interesse, canal, status, mensagem } = req.body;

    if (!nome || !telefone || !canal) {
      return res.status(400).json({ error: 'Nome, telefone e canal de entrada são obrigatórios.' });
    }

    const { data: newLead, error } = await supabase
      .from('leads')
      .insert([{
        nome, 
        telefone, 
        email: email || null, 
        interesse: interesse || null, 
        canal, 
        status: status || 'Novo', 
        mensagem: mensagem || null
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(newLead);
  } catch (err) {
    console.error("Erro ao registrar lead no Supabase:", err.message);
    res.status(500).json({ error: 'Erro ao registrar contato (lead).' });
  }
});

// 3. POST - SALVAR MUDANÇAS E ATUALIZAR FRONTEND
app.post('/api/save-changes', async (req, res) => {
  try {
    // Escreve um arquivo de timestamp na raiz do projeto para forçar o Live Server a recarregar as abas
    const filePath = path.join(__dirname, '..', 'last_update.json');
    fs.writeFileSync(filePath, JSON.stringify({ updated_at: new Date().toISOString() }, null, 2));
    console.log("last_update.json atualizado para disparar o reload do Live Server.");
    res.json({ message: 'Mudanças salvas e frontend atualizado!' });
  } catch (err) {
    console.error("Erro ao salvar mudanças no local:", err.message);
    res.status(500).json({ error: 'Erro ao salvar mudanças.' });
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando e ouvindo na porta ${PORT}`);
});
