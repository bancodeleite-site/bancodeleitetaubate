# Banco de Leite Humano de Taubaté

Este é o repositório oficial da plataforma web do **Banco de Leite Humano de Taubaté**. A plataforma serve como uma vitrine institucional e conta com um Portal de Transparência dinâmico, onde os gestores da ONG podem realizar o upload e a gestão de documentos públicos.

## Tecnologias Utilizadas

A aplicação foi construída visando **alta performance, custo zero de hospedagem e modernidade**, utilizando a seguinte arquitetura:

- **Frontend:** Next.js
- **Estilização:** Tailwind CSS
- **Banco de Dados e Autenticação:** Supabase
- **Armazenamento de Arquivos:** API nativa do Google Drive
- **Hospedagem:** Vercel

## Estrutura de Arquitetura

O sistema é dividido em duas frentes principais:
1. **Landing Page:** Estática, contendo história da instituição, carrossel de projetos, atividades e informações de contato e doações.
2. **Painel de Transparência:** Uma página pública de consumo de relatórios categorizados por ano e mês.
3. **Painel de Administração:** Rota `/admin` (protegida por autenticação) que permite à ONG adicionar e excluir arquivos do Google Drive e registros do Supabase em tempo real.

---

## Configuração e Instalação (Para Desenvolvedores)

Siga este guia se você é um novo desenvolvedor (ou mantenedor) e precisa rodar o sistema no seu computador (localhost).

### 1. Pré-requisitos
- **Node.js** (versão 18+ ou 20 LTS) e **npm** instalados.
- Git instalado.

### 2. Clonando o Repositório
Abra seu terminal e execute:
```bash
git clone https://github.com/NOME_DA_CONTA/NOME_DO_REPO.git
cd NOME_DO_REPO
npm install
```

### 3. Variáveis de Ambiente (.env.local)
O sistema exige chaves secretas do Google, Supabase e painel de login. Na raiz do projeto, crie um arquivo chamado `.env.local` e preencha com as credenciais oficiais da ONG:

```env
# Variáveis Públicas (Acessíveis pelo Cliente e Servidor)
NEXT_PUBLIC_SUPABASE_URL="[url-do-supabase]"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[chave-anon-do-supabase]"
NEXT_PUBLIC_ADMIN_EMAIL="bancodeleite.site43@gmail.com"

# Variáveis Privadas (Acessíveis apenas no Servidor - API Routes)
SUPABASE_SERVICE_ROLE_KEY="[chave-service-role-do-supabase]"

# Credenciais Google Drive Storage
GOOGLE_CLIENT_ID="[id-do-cliente-google]"
GOOGLE_CLIENT_SECRET="[segredo-do-cliente-google]"
GOOGLE_REFRESH_TOKEN="[token-de-atualizacao]"
GOOGLE_DRIVE_FOLDER_ID="[id-da-pasta-publica-no-drive]"

# Chave de segurança para o script que acorda o Token do Google
KEEPALIVE_SECRET="[uma-senha-secreta-para-a-rota-keepalive]"
```
*(Importante: Nunca versione ou comite este arquivo!)*

### 4. Rodando o Projeto Localmente
```bash
npm run dev
```
O servidor será iniciado. Abra [http://localhost:3000](http://localhost:3000) no seu navegador para visualizar a aplicação.

---

## Créditos
Plataforma desenvolvida por [Paulo Henrique](https://www.linkedin.com/in/paulo-henrique-dos-santos-0894902b5).
