# CopyZen

Plataforma de Automação de Marketing Conversacional via Agentes IA

## Visão Geral

CopyZen automatiza a geração completa de campanhas de marketing conversacional para pequenos negócios e profissionais liberais. A plataforma transforma um briefing do cliente em 3 sistemas de entrega:

1. **Sistema de Conteúdo** — Posts e carrosséis para Instagram/LinkedIn
2. **FunWheel (Funil A-R-T)** — Landing pages + captura de leads
3. **Página de Vendas** — Long-form de conversão

Tudo orquestrado via n8n e impulsionado por Claude API para geração de copy.

## Quick Start

### Pré-requisitos

- Node.js 20+
- Docker & Docker Compose
- Git

### Setup Local

```bash
# 1. Clone o repositório
git clone https://github.com/copyzen/cz-squad.git
cd cz-squad

# 2. Configure variáveis de ambiente
cp .env.example .env.local
# Edit .env.local com suas chaves

# 3. Instale dependências
npm install

# 4. Inicie o banco de dados
docker-compose up -d postgres

# 5. Inicie o desenvolvimento
npm run dev

# Abra http://localhost:3000 (API) e http://localhost:3001 (Frontend)
```

### Comandos Principais

```bash
# Desenvolvimento
npm run dev              # Inicia API + Frontend
npm run dev:api         # Apenas API
npm run dev:pages       # Apenas Frontend

# Build
npm run build           # Build de tudo
npm run build:api
npm run build:pages

# Testes
npm test                # Executa todos os testes
npm run test:watch      # Watch mode

# Linting & Type Checking
npm run lint
npm run typecheck

# Database
npm run db:migrate      # Executa migrations
npm run db:seed         # Seed com dados de teste
```

## Estrutura do Projeto

```
cz-squad/
├── apps/
│   ├── api/            # Backend Node.js/Express
│   └── pages/          # Frontend Astro SSG
├── packages/
│   └── shared/         # Tipos TypeScript + Utilities
├── docs/
│   ├── architecture.md # Arquitetura técnica completa
│   └── prd.md          # Requisitos do produto
├── .github/workflows/  # CI/CD (GitHub Actions)
└── docker-compose.yml  # Stack local
```

## Documentação

- **[Arquitetura Técnica](docs/architecture.md)** — Design completo do sistema
- **[Requisitos do Produto](docs/prd.md)** — Especificação funcional

## Roadmap

### Epic 1: Foundation & Core Module
- [x] Scaffold do projeto
- [ ] Schema Supabase + RLS
- [ ] Módulo de Briefing
- [ ] Motor de Branding
- [ ] Agente de Copywriting
- [ ] Integração n8n

### Epic 2: Content Generation System
- [ ] Estratégia de conteúdo
- [ ] Gerador de carrosséis
- [ ] Gerador de posts estáticos
- [ ] Especificações visuais

### Epic 3: FunWheel & Lead Capture
- [ ] Etapa A (Apresentação)
- [ ] Etapa R (Retenção + Lead Capture)
- [ ] Etapa T (Transformação + Qualificação)
- [ ] Integração com webhooks

### Epic 4: Sales Page & MVP Validation
- [ ] Gerador de página de vendas
- [ ] Orquestração end-to-end
- [ ] Self-dogfooding da CopyZen
- [ ] Validação do MVP

## Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | Astro 4.x + Tailwind CSS |
| **Backend** | Express.js + TypeScript |
| **Database** | PostgreSQL (Supabase Cloud) |
| **LLM** | Claude API (Anthropic) |
| **Orquestração** | n8n |
| **Deploy** | Vercel (frontend) + Docker Swarm (backend) |
| **CI/CD** | GitHub Actions |

## Variáveis de Ambiente

Veja `.env.example` para a lista completa. Mínimo obrigatório:

```
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
```

## Desenvolvimento

### Padrões de Código

1. **Type Sharing** — Todos os tipos em `packages/shared/types/`
2. **Repository Pattern** — Data access abstraction
3. **Service Layer** — Business logic separation
4. **Error Handling** — Consistent error responses
5. **Validation** — zod schemas em APIs

### Testes

```bash
# Rodar testes
npm test

# Watch mode
npm run test:watch

# Apenas backend
npm run test:api

# Apenas frontend
npm run test:pages
```

### Linting & Formatting

```bash
npm run lint          # ESLint
npm run lint:fix      # Auto-fix
npm run typecheck     # TypeScript check
```

## Contribuindo

1. Crie uma branch a partir de `develop`
2. Faça suas mudanças
3. Rode `npm test` e `npm run lint`
4. Abra um Pull Request

## Deployments

### Staging
```bash
git push origin feature/xyz
# GitHub Actions roda CI/CD automaticamente
```

### Production
```bash
git push origin main
# GitHub Actions faz deploy para VPS via Docker Swarm
```

## Support

- 📧 Email: dev@copyzen.com.br
- 💬 Issues: [GitHub Issues](https://github.com/copyzen/cz-squad/issues)
- 📖 Docs: [docs/](docs/)

## License

Proprietary - CopyZen 2026

---

**Desenvolvido com ❤️ por Aria (Architect Agent)**
