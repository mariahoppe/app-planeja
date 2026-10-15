<p align="center">
  <img src="../docs/logo.png" alt="Logo Gestão de Viagens" width="140">
</p>

<h1 align="center">Backend — Sistema de Organização de Viagens</h1>

<p align="center">
  API REST para gerenciamento de viagens, destinos, roteiros e atividades.
</p>

---

## Stack

- **Node.js** + **Express 4** — servidor HTTP
- **Sequelize 6** — ORM para PostgreSQL
- **PostgreSQL** (Supabase) — banco de dados
- **JWT** + **bcrypt** — autenticação e hash de senhas
- **Joi** — validação de entrada
- **Helmet** — headers de segurança HTTP
- **express-rate-limit** — proteção contra abuso

## Configuração

### 1. Instalar dependências

```bash
cd viagensback
npm install
```

### 2. Configurar variáveis de ambiente

Copiar o arquivo de exemplo e preencher:

```bash
cp .env.example .env
```

Variáveis necessárias:

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão PostgreSQL (Supabase) |
| `JWT_SECRET` | Chave secreta para assinar tokens JWT |
| `JWT_EXPIRES_IN` | Tempo de expiração do token (padrão: `7d`) |
| `PORT` | Porta do servidor (padrão: 3000) |
| `CORS_ORIGIN` | URL do frontend (padrão: `http://localhost:5173`) |

> **Atenção:** a `DATABASE_URL` deve usar o **Session pooler** do Supabase, na porta **5432** (Project Settings > Database > Connection string > Session pooler). A porta 6543 (Transaction pooler) não funciona com a API.

### 3. Iniciar o servidor

```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

Verificar se está rodando: `GET http://localhost:3000/health`

## Comandos do Banco

```bash
# Executar migrations
npm run db:migrate

# Desfazer última migration
npm run db:migrate:undo

# Popular com dados de demonstração
npm run db:seed

# Desfazer seeds
npm run db:seed:undo

# Reset completo (desfaz tudo, migra e popula)
npm run db:reset
```

## Estrutura de Pastas

```
viagensback/
├── src/
│   ├── config/
│   │   └── database.js          # Conexão com PostgreSQL (Supabase)
│   ├── controllers/
│   │   ├── authController.js    # Login, registro, reset de senha
│   │   ├── dashboardController.js
│   │   ├── destinoController.js
│   │   ├── roteiroController.js
│   │   ├── atividadeController.js
│   │   └── usuarioController.js
│   ├── database/
│   │   ├── migrations/          # 4 migrations (usuarios, destinos, roteiros, atividades)
│   │   └── seeders/             # Dados de demonstração
│   ├── middlewares/
│   │   ├── auth.js              # Verificação JWT
│   │   ├── adminOnly.js         # Restrição a administradores
│   │   ├── validate.js          # Validação Joi genérica
│   │   └── rateLimiter.js       # Limites de requisição
│   ├── models/
│   │   ├── Usuario.js
│   │   ├── Destino.js
│   │   ├── Roteiro.js
│   │   ├── Atividade.js
│   │   └── index.js             # Carrega modelos e associações
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── destinoRoutes.js
│   │   ├── roteiroRoutes.js
│   │   ├── atividadeRoutes.js
│   │   ├── usuarioRoutes.js
│   │   └── index.js             # Agrupa todas as rotas
│   ├── services/
│   │   ├── authService.js       # Lógica de autenticação
│   │   ├── dashboardService.js  # Agregações do painel
│   │   ├── destinoService.js
│   │   ├── roteiroService.js
│   │   ├── atividadeService.js
│   │   └── usuarioService.js
│   ├── validators/
│   │   ├── authValidator.js     # Schemas de login/registro
│   │   ├── destinoValidator.js
│   │   ├── roteiroValidator.js
│   │   ├── atividadeValidator.js
│   │   └── usuarioValidator.js
│   ├── utils/
│   │   └── errorHandler.js      # AppError + tratamento Sequelize
│   ├── app.js                   # Configuração do Express
│   └── server.js                # Ponto de entrada
├── .env.example
├── .sequelizerc
└── package.json
```

## Banco de Dados

### Diagrama de Entidades

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   usuarios   │ 1───N │   destinos   │ 1───N │   roteiros   │ 1───N │  atividades  │
├──────────────┤       ├──────────────┤       ├──────────────┤       ├──────────────┤
│ id           │       │ id           │       │ id           │       │ id           │
│ nome         │       │ usuario_id   │←──FK  │ nome         │       │ nome         │
│ email        │       │ cidade       │       │ destino_id   │←──FK  │ roteiro_id   │←──FK
│ senha_hash   │       │ pais         │       │ data_ida     │       │ local        │
│ perfil       │       │ descricao    │       │ data_volta   │       │ horario      │
│ reset_token  │       │ custo_estimado│      │ status       │       │ custo        │
│ reset_token_ │       │ created_at   │       │ created_at   │       │ feito        │
│   expira     │       │ updated_at   │       │ updated_at   │       │ created_at   │
│ created_at   │       └──────────────┘       └──────────────┘       │ updated_at   │
│ updated_at   │                                                      └──────────────┘
└──────────────┘
```

### Regras de exclusão

- **Destino com roteiros** → bloqueado (RESTRICT) — excluir roteiros primeiro
- **Roteiro excluído** → remove todas as atividades automaticamente (CASCADE)

### Status dos roteiros

`rascunho` → `planejando` → `confirmado` → `concluido`

## Endpoints

Base URL: `http://localhost:3000/api`

### Autenticação (públicas)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/registro` | Criar conta |
| POST | `/auth/login` | Fazer login (retorna token) |
| POST | `/auth/esqueci-senha` | Solicitar reset de senha |
| POST | `/auth/redefinir-senha` | Redefinir senha com token |

### Dashboard (JWT)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/dashboard` | Resumo geral (totais, próxima viagem, atividades) |

### Destinos (JWT)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/destinos` | Listar destinos (filtros: `busca`, `pais`, `custo_min`, `custo_max`) |
| POST | `/destinos` | Criar destino |
| GET | `/destinos/:id` | Detalhes de um destino |
| PUT | `/destinos/:id` | Atualizar destino |
| DELETE | `/destinos/:id` | Excluir destino |

### Roteiros (JWT)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/roteiros` | Listar roteiros (filtros: `busca`, `status`, `destino_id`, `ordenar`) |
| POST | `/roteiros` | Criar roteiro |
| GET | `/roteiros/:id` | Detalhes com atividades |
| PUT | `/roteiros/:id` | Atualizar roteiro |
| DELETE | `/roteiros/:id` | Excluir roteiro (CASCADE nas atividades) |
| GET | `/roteiros/:id/resumo` | Progresso e custos do roteiro |

### Atividades (JWT)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/atividades` | Listar atividades (filtros: `busca`, `roteiro_id`, `feito`, `data_inicio`, `data_fim`) |
| POST | `/atividades` | Criar atividade |
| GET | `/atividades/:id` | Detalhes da atividade |
| PUT | `/atividades/:id` | Atualizar atividade |
| PATCH | `/atividades/:id/toggle` | Alternar concluída/pendente |
| DELETE | `/atividades/:id` | Excluir atividade |

### Usuários (JWT / Admin)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/usuarios/perfil` | Dados do usuário logado |
| PUT | `/usuarios/trocar-senha` | Trocar senha (exige senha atual) |
| GET | `/usuarios` | Listar todos (admin) |
| GET | `/usuarios/:id` | Buscar por ID |
| PUT | `/usuarios/:id` | Atualizar usuário |
| DELETE | `/usuarios/:id` | Excluir usuário (admin) |

**Total: 27 endpoints**

## Autenticação

Todas as rotas protegidas exigem o header:

```
Authorization: Bearer <token>
```

O token é retornado no login/registro e expira em 7 dias.

### Ownership

Cada usuário só acessa seus próprios dados. A cadeia de verificação é:

```
atividade → roteiro → destino → usuario_id
```

Usuários com perfil `admin` têm acesso a todos os recursos.

## Formato das Respostas

### Sucesso

```json
{
  "data": { ... }
}
```

### Erro

```json
{
  "error": {
    "message": "Descrição do erro em português",
    "details": ["campo X é obrigatório"]
  }
}
```

### Códigos HTTP

| Código | Significado |
|---|---|
| 200 | Sucesso |
| 201 | Criado |
| 204 | Excluído (sem body) |
| 400 | Dados inválidos |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 409 | Conflito (email duplicado, destino com roteiros) |
| 429 | Rate limit excedido |

## Segurança

- **Helmet** — proteção contra XSS, clickjacking e sniffing
- **Rate limiting** — 20 req/15min em auth, 100 req/15min geral
- **bcrypt 12 rounds** — hash irreversível de senhas
- **Joi** — validação rigorosa de todos os inputs
- **Token de reset SHA-256** — expira em 30 minutos
- **Ownership** — isolamento total entre usuários
- **Mensagens genéricas** — não expõe se um email existe no sistema

## Dados de Demonstração

Após rodar o seeder (`npm run db:seed`), o banco terá:

| Usuário | Email | Senha | Perfil |
|---|---|---|---|
| Administrador | admin@viagens.com | admin123 | admin |
| Viajante Demo | viajante@viagens.com | viajante123 | comum |

Além de 4 destinos, 3 roteiros e 6 atividades vinculados ao viajante demo.

## Testes

```bash
# Rodar todos os testes
npm test

# Modo watch
npm run test:watch
```

---

<p align="center">
  Projeto acadêmico — 2026
</p>
