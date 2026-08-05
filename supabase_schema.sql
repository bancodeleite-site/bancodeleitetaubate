-- Habilitar a extensão pgcrypto para geração de UUIDs (se já não estiver habilitada)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar tabela de projetos
CREATE TABLE projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ativo', 'encerrado')),
    data_inicio DATE NOT NULL,
    data_fim DATE
);

-- Criar tabela de documentos
CREATE TABLE documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_projeto UUID NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN ('termo', 'circunstanciado', 'financeiro')),
    drive_id TEXT NOT NULL,
    drive_url TEXT NOT NULL,
    ano INTEGER,
    mes INTEGER CHECK (mes >= 1 AND mes <= 12),
    nome_arquivo TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Configurar Row Level Security (RLS)
-- Queremos que qualquer pessoa (público) consiga LER os dados
-- Mas inserções, atualizações e exclusões serão feitas apenas pelo backend (API Routes) 
-- usando a SUPABASE_SERVICE_ROLE_KEY, que ignora as regras do RLS.

ALTER TABLE projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;

-- Política: Permitir leitura pública (anon) para projetos
CREATE POLICY "Permitir leitura pública para projetos" ON projetos
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Política: Permitir leitura pública (anon) para documentos
CREATE POLICY "Permitir leitura pública para documentos" ON documentos
    FOR SELECT
    TO anon, authenticated
    USING (true);
