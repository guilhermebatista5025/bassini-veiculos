-- 1. TABELA DE VEÍCULOS
CREATE TABLE IF NOT EXISTS veiculos (
    id SERIAL PRIMARY KEY,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    version VARCHAR(150) NOT NULL,
    year VARCHAR(15) NOT NULL,
    km VARCHAR(30) NOT NULL,
    gearbox VARCHAR(30) NOT NULL,
    fuel VARCHAR(30) NOT NULL,
    color VARCHAR(50),
    plate_end VARCHAR(5),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(30) NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'disponivel',
    image VARCHAR(255),
    brand_logo_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE EQUIPAMENTOS (Relacionamento 1 para N com veículos)
CREATE TABLE IF NOT EXISTS equipamentos (
    id SERIAL PRIMARY KEY,
    veiculo_id INT NOT NULL REFERENCES veiculos(id) ON DELETE CASCADE,
    nome VARCHAR(100) NOT NULL
);

-- 3. TABELA DE LEADS (Registros de contatos)
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(30) NOT NULL,
    email VARCHAR(100),
    interesse VARCHAR(150),
    canal VARCHAR(30) NOT NULL,
    status VARCHAR(30) DEFAULT 'Novo',
    mensagem TEXT,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
