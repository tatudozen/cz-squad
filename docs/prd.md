# CopyZen Product Requirements Document (PRD)

**Versão:** 0.1
**Data:** 2026-02-24
**Autor:** Morgan (PM Agent)
**Status:** Draft
**Base:** Project Brief CopyZen v1.0 (Approved)

---

## Goals and Background Context

### Goals

- Construir uma plataforma integrada de automação de marketing conversacional operada por agentes de IA especializados
- Permitir que uma agência OPB (One-Person Business) atenda múltiplos clientes simultaneamente via orquestração de squads de agentes
- Entregar 3 sistemas modulares em pipeline: Conteúdo (posts) → FunWheel (funis A-R-T) → Página de Vendas — com consistência de marca end-to-end
- Validar o modelo via self-dogfooding: a CopyZen será o primeiro cliente da própria plataforma
- Atingir 5 clientes ativos com contratos mensais em até 12 meses, mantendo custos operacionais viáveis

### Background Context

CopyZen é uma agência de marketing digital OPB fundada em 2024, especializada em marketing conversacional para pequenos negócios e profissionais liberais no Brasil. O problema central é claro: profissionais de saúde, consultores e prestadores de serviços precisam de presença digital consistente para atrair clientes, mas não têm tempo, conhecimento técnico ou orçamento para agências tradicionais. As soluções existentes — agências caras, ferramentas fragmentadas, freelancers inconsistentes — falham em entregar um pipeline integrado e acessível.

A proposta é uma plataforma que transforma o briefing de um cliente em entregas completas (posts, funis, páginas de vendas) através de squads de agentes de IA com núcleo compartilhado de briefing, copywriting e branding. O diferencial competitivo está na combinação única de copywriting conversacional + automação por IA + pipeline integrado onde o output de um sistema alimenta o próximo.

**Site atual:** https://copyzen.com.br/ (Builderall — será migrado para stack própria)

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-24 | 0.1 | Draft inicial baseado no Project Brief aprovado | Morgan (PM) |

---

## Requirements

### Functional

**FR1:** O sistema deve fornecer um módulo de Briefing estruturado que captura informações do cliente (marca, público-alvo, tom de voz, objetivos, referências visuais) e gera um briefing padronizado em formato JSON/YAML que alimenta os 3 sistemas downstream.

**FR2:** O Motor de Branding deve interpretar o briefing do cliente e gerar um perfil de marca (cores, tom de voz, vocabulário, estilo visual) que é aplicado como guardrails em todas as entregas dos 3 sistemas.

**FR3:** O Agente de Copywriting deve gerar textos em português brasileiro usando técnicas de copywriting conversacional, respeitando os guardrails de branding definidos por cliente.

**FR4:** O Sistema de Conteúdo (Subsistema Carrossel) deve gerar pacotes de carrosséis para Instagram com copy + briefing visual, suportando os modos Inception (branding/antecipação) e Atração Fatal (CTA direcionando para FunWheel).

**FR5:** O Sistema de Conteúdo (Subsistema Imagem) deve gerar posts estáticos com copy para Instagram e LinkedIn, nos modos Inception e Atração Fatal.

**FR6:** O FunWheel Etapa A (Apresentação) deve gerar uma landing page com narrativa de transformação (estado atual → estado desejado) baseada no briefing do cliente.

**FR7:** O FunWheel Etapa R (Retenção) deve implementar captura de lead com lead magnet (PDF da apresentação como MVP), coletando nome, email e telefone.

**FR8:** O FunWheel Etapa T (Transformação) deve implementar uma pesquisa de qualificação que filtra leads por nível de interesse e fit com o serviço do cliente.

**FR9:** O FunWheel deve integrar com CRMs externos via webhooks genéricos (POST JSON) para envio de leads capturados nas etapas R e T.

**FR10:** O Sistema de Página de Vendas deve gerar uma página long-form responsiva (mobile-first) com estrutura de oferta irresistível: headline, problema, solução, benefícios, prova social, oferta, garantia e CTA.

**FR11:** O pipeline de geração deve funcionar end-to-end: briefing aprovado → output final entregue, com mínimo 80% de automação (intervenção humana apenas para revisão final).

**FR12:** O sistema deve suportar múltiplos clientes simultâneos com isolamento de dados (briefings, entregas, leads) por cliente.

**FR13:** O operador (OPB) deve poder visualizar e aprovar cada entrega antes de publicação ou envio ao cliente.

**FR14:** O sistema deve gerar as entregas de self-dogfooding da CopyZen (posts, FunWheel, página de vendas) como validação do pipeline.

### Non Functional

**NFR1:** Páginas geradas (FunWheel, Página de Vendas) devem atingir Lighthouse score > 90 e carregamento < 2s em conexão 4G.

**NFR2:** O pipeline de geração deve entregar o primeiro output em < 24h após briefing aprovado.

**NFR3:** Cada etapa de agente deve responder em < 60s (tempo de processamento do LLM por step).

**NFR4:** O custo operacional de tokens de IA + infraestrutura por projeto deve ser inferior a 30% do preço cobrado ao cliente.

**NFR5:** Custos de infraestrutura devem priorizar free tiers onde aplicável: Supabase (free → $25/mês), Vercel (free → $20/mês), Claude API (~$20-50/mês). VPS KVM4 Hostinger já contratada (16GB RAM).

**NFR6:** A plataforma deve estar em conformidade com a LGPD, incluindo consentimento para coleta de dados de leads e política de privacidade.

**NFR7:** Dados de clientes devem ser isolados via Supabase RLS (Row Level Security), impedindo acesso cruzado entre clientes.

**NFR8:** Secrets e API keys devem ser armazenados em variáveis de ambiente, nunca hardcoded ou versionados.

**NFR9:** A camada de LLM deve ser abstraída para permitir fallback para provedores alternativos em caso de indisponibilidade do Claude API.

**NFR10:** Entregas de copy geradas por IA devem ser publicáveis sem reescrita completa — ajustes finos são aceitáveis, mas a qualidade base deve ser profissional.

**NFR11:** O sistema deve suportar até 10 clientes simultâneos sem degradação de qualidade ou performance como meta de 12 meses.

**NFR12:** Todas as páginas geradas devem ser responsivas (mobile-first) e compatíveis com Chrome, Safari e Firefox (últimas 2 versões).

---

## User Interface Design Goals

> Esta seção captura a visão de produto para UX/UI — não é spec detalhada. Serve para guiar o @ux-design-expert e informar a criação de stories.

### Overall UX Vision

A experiência do CopyZen opera em duas camadas distintas:

**Camada 1 — Operador (Fernando/OPB):** Interface de orquestração via CLI/terminal onde o operador gerencia briefings, dispara pipelines de geração, revisa entregas e aprova outputs. A experiência é técnica, eficiente e orientada a produtividade — não requer UI polida no MVP, o AIOS/Claude Code já serve como interface.

**Camada 2 — Cliente final do cliente (leads/prospects):** Páginas web geradas pelo sistema (FunWheel, Página de Vendas) que devem ser visualmente profissionais, responsivas e otimizadas para conversão. Estas são a "vitrine" — qualidade visual é crítica.

No MVP, não há dashboard web para o operador nem para o cliente da CopyZen. A interação do operador é via CLI. A UI é exclusivamente para as páginas geradas (outputs).

### Key Interaction Paradigms

- **Páginas FunWheel (A-R-T):** Fluxo linear guiado — o visitante é conduzido por uma narrativa sequencial (Apresentação → Retenção → Transformação) com CTAs claros em cada etapa
- **Página de Vendas:** Scroll longo contínuo (long-form) — leitura imersiva com seções que constroem urgência progressiva até o CTA final
- **Posts/Carrosséis:** Consumo passivo em feed — design otimizado para scroll-stopping e swipe (carrosséis)
- **Formulários de captura:** Minimalistas — máximo 3-4 campos (nome, email, telefone, 1 campo qualificador)

### Core Screens and Views

1. **FunWheel — Página A (Apresentação):** Landing page com narrativa de transformação, hero section com headline magnética, seções de dor/solução, CTA para próxima etapa
2. **FunWheel — Página R (Retenção):** Formulário de captura com lead magnet (PDF), preview do material, campo de email/nome/telefone
3. **FunWheel — Página T (Transformação):** Pesquisa de qualificação (3-5 perguntas), thank you page com próximos passos
4. **Página de Vendas:** Long-form com headline, problema, solução, benefícios, prova social, oferta, garantia, FAQ, CTA
5. **Carrosséis/Posts:** Templates visuais com copy — output é imagem/briefing visual, não uma "tela" interativa

### Accessibility: WCAG AA

WCAG AA como padrão mínimo para páginas geradas. Alcançável sem overhead significativo com Tailwind CSS e HTML semântico.

### Branding

- Cada cliente da CopyZen terá seu próprio branding aplicado às páginas geradas (cores, fontes, logo, tom)
- O Motor de Branding (FR2) garante consistência entre todos os outputs
- Para self-dogfooding: branding da CopyZen baseado no site atual (copyzen.com.br)
  - Paleta: Azul escuro (`#06164A`), Roxo (`#6220FF`), Azul claro (`#A1C8F7`), Rosa/Vermelho (`#ED145B`)
  - Fontes: Muli / Lato
  - Tom: Consultivo, educativo, persuasivo
- Templates aceitam variáveis de branding (CSS custom properties / Tailwind theme)

### Target Device and Platforms: Web Responsive

- **Mobile-first** — 60-80% do tráfego esperado vem de Instagram/redes sociais → mobile
- **Responsivo:** Desktop, tablet e mobile
- **Browsers:** Chrome, Safari, Firefox (últimas 2 versões)
- **Sem app nativo** — tudo via web

---

## Technical Assumptions

### Repository Structure: Monorepo

```
cz-squad/
├── src/
│   ├── core/              # Núcleo compartilhado
│   │   ├── agents/        # briefing-agent, copywriting-agent, branding-agent
│   │   ├── briefing/      # Módulo de briefing
│   │   └── branding/      # Motor de branding
│   ├── systems/
│   │   ├── content/       # Sistema 1: Posts (Carrossel + Imagem)
│   │   ├── funwheel/      # Sistema 2: FunWheel (A-R-T)
│   │   └── sales-page/    # Sistema 3: Página de Vendas
│   ├── squads/            # Definições de squads de agentes
│   └── shared/            # Utilitários compartilhados
├── pages/                 # Páginas geradas (output)
├── tests/
└── docs/
```

### Service Architecture

Monolith modular — não microserviços. Os 3 sistemas são módulos com interfaces bem definidas. Orquestração via n8n + Claude API para agentes criativos.

### Infrastructure (VPS Existente)

| Recurso | Detalhes |
|---------|---------|
| **VPS** | Hostinger KVM4, 16GB RAM, Docker Swarm + Portainer |
| **n8n** | Self-hosted, já instalado — orquestrador de workflows |
| **Evolution API** | Já instalado — WhatsApp Business API |
| **Chatwoot** | Já instalado — canal de suporte/atendimento |
| **Deploy** | Docker containers no Swarm existente |

### Stack Técnico

| Camada | Tecnologia |
|--------|-----------|
| Frontend (páginas geradas) | Next.js ou Astro (SSG) — decisão @architect |
| Estilização | Tailwind CSS |
| Runtime | Node.js / TypeScript |
| LLM primário | Claude API (Anthropic) |
| LLM fallback | Camada de abstração (adapter pattern) |
| Orquestração | n8n (self-hosted na VPS) |
| WhatsApp | Evolution API (já na VPS) |
| Atendimento | Chatwoot (já na VPS) |
| Database | Supabase Cloud (PostgreSQL + RLS + Storage) |
| Hosting (páginas) | VPS ou Vercel/Netlify — decisão @architect |
| Hosting (backend) | VPS Hostinger (Docker Swarm) |
| CI/CD | GitHub Actions → deploy Docker |

### Testing Requirements

Unit + Integration para o MVP. E2E manual (operador revisa visualmente).

### Additional Technical Assumptions

- Abstração de LLM obrigatória (adapter pattern para swap de provider)
- Deploy containerizado no Docker Swarm existente
- Evolution API disponível para notificações WhatsApp desde o Epic 3
- Supabase Cloud para DB (RLS nativo, Auth, Storage, dashboard) — não PostgreSQL raw na VPS
- Geração de imagens fora do MVP — output é copy + briefing visual para designer

---

## Epic List

### Epic 1: Foundation & Core Module

Estabelecer a infraestrutura do projeto, schema Supabase, e o núcleo compartilhado (Briefing, Branding, Copywriting) — entregando um pipeline funcional que transforma input do cliente em briefing padronizado + perfil de marca.

### Epic 2: Content Generation System (Posts)

Construir o Sistema 1 com subsistemas Carrossel e Imagem nos modos Inception e Atração Fatal — entregando pacotes de posts com copy + briefing visual prontos a partir de um briefing aprovado.

### Epic 3: FunWheel & Lead Capture (A-R-T)

Construir o Sistema 2 com as 3 etapas do funil (Apresentação, Retenção, Transformação), captura de leads, e integração com n8n/webhooks/Evolution — entregando um funil funcional que captura e qualifica leads reais.

### Epic 4: Sales Page, Pipeline Integration & Self-Dogfooding

Construir o Sistema 3 (Página de Vendas long-form), integrar o pipeline completo dos 3 sistemas, e executar self-dogfooding gerando todas as entregas da CopyZen — validando o MVP com resultados reais.

---

## Epic 1: Foundation & Core Module

**Goal:** Estabelecer a infraestrutura do projeto CopyZen como monorepo containerizado, criar o schema Supabase com isolamento por cliente, e implementar o núcleo compartilhado (Briefing, Branding, Copywriting) — entregando ao final um pipeline funcional onde um briefing de cliente é capturado, processado, e resulta em um perfil de marca + capacidade de gerar copy branded.

### Story 1.1: Project Scaffold & Docker Setup

**Como** desenvolvedor,
**quero** um monorepo TypeScript com estrutura modular, linting, testes e configuração Docker para Swarm,
**para que** o projeto tenha uma base sólida e deployável na VPS desde o primeiro dia.

**Acceptance Criteria:**

1. Monorepo `cz-squad/src/` criado com estrutura: `core/`, `systems/content/`, `systems/funwheel/`, `systems/sales-page/`, `shared/`
2. TypeScript configurado com `tsconfig.json` (strict mode, path aliases para `@core/*`, `@systems/*`, `@shared/*`)
3. ESLint + Prettier configurados com regras consistentes
4. Vitest configurado como test runner com script `npm test` funcional
5. `Dockerfile` e `docker-compose.yml` (Swarm-compatible) criados para o serviço backend CopyZen
6. Health check endpoint (`GET /health`) retornando `{ status: "ok", version: "0.1.0" }`
7. `.env.example` com todas as variáveis necessárias documentadas
8. GitHub Actions workflow básico: lint → typecheck → test no push

### Story 1.2: Supabase Schema & Client Data Layer

**Como** operador (OPB),
**quero** um schema Supabase com tabelas para clientes, briefings e perfis de marca com isolamento via RLS,
**para que** os dados de cada cliente sejam armazenados de forma segura e isolada desde o início.

**Acceptance Criteria:**

1. Tabelas criadas: `clients` (id, name, segment, contact_info, created_at), `briefings` (id, client_id, data JSONB, status, created_at), `brand_profiles` (id, client_id, briefing_id, profile JSONB, created_at)
2. RLS policies ativas em todas as tabelas — isolamento por `client_id`
3. Política admin para o operador (Fernando) com acesso a todos os clientes
4. Supabase client TypeScript configurado em `src/shared/supabase.ts` com tipos gerados
5. CRUD completo para `clients` com validação de input
6. Migration scripts versionados e reproduzíveis
7. Seed script com dados de teste (cliente fictício + briefing de exemplo)
8. Testes de integração validando RLS (cliente A não acessa dados do cliente B)

### Story 1.3: Briefing Module — Capture & Validation

**Como** operador,
**quero** um módulo de briefing que capture informações estruturadas do cliente (marca, público-alvo, tom de voz, objetivos, referências) e persista no Supabase,
**para que** os 3 sistemas downstream recebam input padronizado e completo.

**Acceptance Criteria:**

1. Schema de briefing definido com campos obrigatórios: nome do negócio, segmento, público-alvo, tom de voz, objetivos (lista), diferenciais, referências visuais (URLs/descrições)
2. Campos opcionais: cores existentes, logo URL, concorrentes, orçamento mensal de marketing
3. Validação de input com mensagens de erro claras em PT-BR
4. Briefing salvo no Supabase com status (`draft`, `approved`, `processing`, `completed`)
5. Função `createBriefing(clientId, data)` e `approveBriefing(briefingId)` exportadas como API programática
6. Briefing aprovado dispara evento (webhook/callback) para consumo downstream
7. Testes unitários cobrindo validação (campos obrigatórios, formatos inválidos, edge cases)
8. Um briefing completo de exemplo da CopyZen criado como fixture de teste

### Story 1.4: Branding Engine — Brand Profile Generation

**Como** operador,
**quero** que um briefing aprovado seja processado pelo Motor de Branding que gera automaticamente um perfil de marca completo (cores, tom, vocabulário, estilo) via Claude API,
**para que** todas as entregas dos 3 sistemas mantenham consistência de marca sem esforço manual.

**Acceptance Criteria:**

1. Camada de abstração LLM implementada (`src/shared/llm-adapter.ts`) com interface `generateCompletion(prompt, options)` — Claude API como provider padrão, preparado para fallback (NFR9)
2. Branding Engine recebe briefing e gera `BrandProfile`: paleta de cores (primária, secundária, accent), tom de voz (formal/informal/técnico/conversacional + exemplos), vocabulário recomendado (palavras-chave do nicho), estilo visual (diretrizes para design)
3. Brand Profile salvo no Supabase vinculado ao briefing e cliente
4. Prompt engineering otimizado para output consistente e estruturado (JSON schema)
5. Custo estimado por geração de brand profile: < $0.05 em tokens Claude
6. Testes unitários com mock do LLM adapter validando parsing e persistência
7. Teste de integração: briefing da CopyZen → brand profile gerado e salvo

### Story 1.5: Copywriting Agent — Branded Copy Generation

**Como** operador,
**quero** um agente de copywriting que gere textos em PT-BR usando técnicas de marketing conversacional, respeitando o perfil de marca do cliente,
**para que** toda copy produzida pela plataforma seja profissional, consistente com a marca e pronta para publicação.

**Acceptance Criteria:**

1. Copywriting Agent implementado em `src/core/agents/copywriting-agent/` com função `generateCopy(prompt, brandProfile, options)`
2. Options incluem: tipo de copy (headline, body, CTA, carrossel, landing page), comprimento alvo, nível de urgência, call-to-action desejado
3. Guardrails de branding aplicados automaticamente: tom de voz, vocabulário, persona da marca
4. Output em PT-BR com qualidade publicável (sem erros gramaticais, fluido, conversacional)
5. Suporte a múltiplos formatos: texto curto (posts), texto médio (seções de landing), texto longo (página de vendas)
6. Sistema de prompts versionado e configurável (não hardcoded)
7. Testes com mock do LLM validando que guardrails são injetados no prompt
8. Teste qualitativo: gerar 3 variações de copy para a CopyZen e avaliar aderência ao brand profile

### Story 1.6: Core Pipeline & n8n Integration

**Como** operador,
**quero** um workflow n8n que conecte briefing → branding → copywriting em um pipeline automatizado deployado na VPS,
**para que** ao aprovar um briefing, o perfil de marca e uma amostra de copy sejam gerados automaticamente sem intervenção manual.

**Acceptance Criteria:**

1. Workflow n8n criado: trigger (webhook de briefing aprovado) → chamar Branding Engine API → salvar brand profile → chamar Copywriting Agent para gerar amostra de copy → notificar operador
2. Backend CopyZen expõe endpoints REST: `POST /briefings`, `POST /briefings/:id/approve`, `GET /brand-profiles/:clientId`, `POST /copy/generate`
3. Workflow deployado no n8n existente na VPS via import de JSON
4. Notificação ao operador via n8n (email ou webhook) quando pipeline completa
5. Error handling: retry 1x em caso de falha do LLM, log de erros, notificação de falha
6. Teste end-to-end: criar cliente → submeter briefing → aprovar → verificar brand profile + copy amostra gerados
7. Docker service `copyzen-api` adicionado ao stack Swarm existente via Portainer
8. Documentação: README com instruções de deploy e variáveis de ambiente

---

## Epic 2: Content Generation System (Posts)

**Goal:** Construir o Sistema 1 de geração de conteúdo, capaz de receber um briefing aprovado com brand profile e produzir pacotes completos de posts — carrosséis e imagens estáticas — nos modos Inception (branding/antecipação) e Atração Fatal (CTA para FunWheel). Ao final deste epic, o operador pode gerar um pacote de posts publicáveis para qualquer cliente.

### Story 2.1: Content Strategy & Planning Module

**Como** operador,
**quero** que o sistema analise o briefing e brand profile do cliente e gere automaticamente um plano de conteúdo (quantidade, tipos e mix de modos),
**para que** cada pacote de posts siga uma estratégia coerente.

**Acceptance Criteria:**

1. Módulo `src/systems/content/strategy/` implementado com função `createContentPlan(briefing, brandProfile, options)`
2. Options incluem: quantidade total de posts (default: 10), proporção Inception/Atração Fatal (default: 70/30), formatos desejados (carrossel, imagem, ou mix)
3. Plano de conteúdo gerado via LLM contém para cada post: tipo (carrossel/imagem), modo (inception/atração fatal), tema/ângulo, plataforma-alvo (Instagram/LinkedIn), e ordem sugerida de publicação
4. Cada post no plano inclui um brief criativo de 2-3 linhas descrevendo o conceito e o objetivo
5. Modo Atração Fatal inclui obrigatoriamente referência ao FunWheel como destino do CTA
6. Plano salvo no Supabase vinculado ao briefing (`content_plans` table)
7. Testes unitários validando distribuição de modos, formatos e coerência temática
8. Teste com briefing CopyZen: plano de 10 posts gerado com temas relevantes para marketing conversacional

### Story 2.2: Carousel Copy Generator

**Como** operador,
**quero** gerar copy completa slide-por-slide para carrosséis de Instagram a partir de um item do plano de conteúdo,
**para que** o output seja publicável e siga a estratégia definida no plano.

**Acceptance Criteria:**

1. Módulo `src/systems/content/generators/carousel.ts` com função `generateCarousel(planItem, brandProfile)`
2. Output estruturado: capa (headline impactante), 4-8 slides internos (conteúdo educativo/persuasivo com progressão lógica), slide final (CTA)
3. Modo Inception: narrativa de branding, educação, antecipação — CTA suave (seguir, salvar, compartilhar)
4. Modo Atração Fatal: narrativa que cria urgência/curiosidade — CTA direto para link do FunWheel
5. Cada slide inclui: texto principal (max 150 caracteres), texto de apoio (opcional), nota de design (sugestão visual)
6. Caption do post gerada (copy para a legenda do Instagram, com hashtags relevantes)
7. Guardrails de branding aplicados via Copywriting Agent (tom, vocabulário, persona)
8. Testes com mock validando estrutura do output e aderência a limites de caracteres

### Story 2.3: Image Post Copy Generator

**Como** operador,
**quero** gerar copy para posts estáticos de imagem para Instagram e LinkedIn,
**para que** o cliente tenha variedade de formatos com adaptação por plataforma.

**Acceptance Criteria:**

1. Módulo `src/systems/content/generators/image-post.ts` com função `generateImagePost(planItem, brandProfile, platform)`
2. Output para Instagram: headline (max 80 chars), subtítulo (opcional), caption com copy conversacional + hashtags, nota de design visual
3. Output para LinkedIn: headline profissional, body text adaptado ao tom da plataforma (mais formal/educativo), sem hashtags excessivas
4. Modo Inception e Atração Fatal suportados com variação de CTA por modo
5. Cada post inclui: texto para a imagem, caption/body text, e briefing visual (cores, layout sugerido, elementos gráficos)
6. Guardrails de branding aplicados consistentemente via brand profile
7. Testes validando diferenças de output entre Instagram e LinkedIn
8. Testes validando limites de caracteres por plataforma

### Story 2.4: Visual Briefing & Design Specs

**Como** operador,
**quero** que cada post gerado inclua um briefing visual estruturado com especificações de design,
**para que** um designer ou template engine possa executar a peça visual sem ambiguidade.

**Acceptance Criteria:**

1. Módulo `src/systems/content/visual-briefing.ts` com função `generateVisualBrief(post, brandProfile)`
2. Visual brief inclui: paleta de cores do cliente (do brand profile), dimensões (1080x1080 feed, 1080x1350 carrossel), hierarquia tipográfica, posicionamento sugerido de elementos
3. Referências visuais: keywords de estilo derivadas do brand profile
4. Para carrosséis: brief visual por slide com indicação de progressão visual
5. Output em formato JSON estruturado e Markdown legível (dual output)
6. Brand profile da CopyZen usado como caso de teste: cores `#06164A`, `#6220FF`, `#ED145B`
7. Testes unitários validando que cores e estilo do brand profile são corretamente refletidos

### Story 2.5: Content Package Pipeline & n8n Integration

**Como** operador,
**quero** que ao aprovar um plano de conteúdo, o sistema gere automaticamente todos os posts e os empacote em um deliverable revisável,
**para que** eu possa revisar e aprovar o pacote completo antes de entregar ao cliente.

**Acceptance Criteria:**

1. Endpoint `POST /content/generate-package` que recebe `contentPlanId` e dispara geração de todos os posts do plano
2. Geração em sequência com progress tracking (status por post: pending → generating → done → error)
3. Package output: documento Markdown consolidado com todos os posts organizados por ordem de publicação
4. Package salvo no Supabase (`content_packages` table) com status (`generating`, `ready_for_review`, `approved`, `delivered`)
5. Workflow n8n: plano aprovado → chamar API de geração → polling de status → notificar operador quando pronto
6. Operador pode aprovar/rejeitar posts individuais e solicitar regeneração
7. Teste end-to-end: briefing CopyZen → plano de 5 posts → package gerado
8. Custo estimado de tokens por pacote de 10 posts documentado

---

## Epic 3: FunWheel & Lead Capture (A-R-T)

**Goal:** Construir o Sistema 2 — o funil FunWheel com 3 etapas (Apresentação, Retenção, Transformação) — como páginas web geradas automaticamente, com captura e qualificação de leads, integração com n8n/webhooks e notificação via Evolution API (WhatsApp).

### Story 3.1: FunWheel Page Engine & Template System

**Como** operador,
**quero** um engine de geração de páginas web estáticas (SSG) com sistema de templates brandáveis e pipeline de deploy,
**para que** as páginas do FunWheel sejam geradas automaticamente com o branding de cada cliente e publicadas na VPS.

**Acceptance Criteria:**

1. Framework SSG configurado em `src/systems/funwheel/pages/` (decisão Next.js vs Astro delegada ao @architect)
2. Sistema de templates com CSS custom properties para branding: `--brand-primary`, `--brand-secondary`, `--brand-accent`, `--brand-font-heading`, `--brand-font-body`
3. Brand profile mapeado para CSS variables via função `brandToCSS(brandProfile)`
4. Layout base responsivo mobile-first: header, content area, footer (disclaimer LGPD)
5. Tailwind CSS com theme dinâmico consumindo CSS variables de branding
6. Build pipeline: `generatePages(clientId, funnelConfig)` → SSG build → output estático
7. Deploy config: Nginx/Caddy na VPS com rota `funwheel.copyzen.com.br/{clientSlug}`
8. Lighthouse score > 90 no template base
9. Testes validando injeção correta de brand variables

### Story 3.2: Etapa A — Apresentação (Narrativa de Transformação)

**Como** visitante (lead potencial),
**quero** acessar uma landing page com narrativa envolvente que mostra meu estado atual e o estado desejado,
**para que** eu me identifique com o problema e visualize a transformação.

**Acceptance Criteria:**

1. Template da Etapa A com seções: hero (headline + subheadline), estado atual (dores), ponte de transformação, estado desejado (benefícios), prova social, CTA para Etapa R
2. Copy gerada automaticamente via Copywriting Agent a partir do briefing + brand profile
3. Função `generateEtapaA(briefing, brandProfile)` retorna page content completo
4. CTA final direciona para Etapa R com texto persuasivo conversacional
5. Prova social aceita depoimentos do briefing ou gera placeholders
6. Mobile-first: hero ocupa viewport, scroll natural, fonte legível
7. Tempo de carregamento < 2s em 4G
8. Teste com briefing CopyZen gerando página A funcional

### Story 3.3: Etapa R — Retenção & Lead Capture

**Como** visitante engajado pela Etapa A,
**quero** receber um material de valor em troca dos meus dados de contato,
**para que** eu obtenha algo útil enquanto o cliente captura meu lead.

**Acceptance Criteria:**

1. Template com: headline do lead magnet, preview/mockup, formulário de captura, disclaimer LGPD (checkbox obrigatório)
2. Formulário: nome (obrigatório), email (obrigatório, validação), telefone/WhatsApp (obrigatório, máscara BR)
3. Lead magnet MVP: PDF auto-gerado a partir do conteúdo da Etapa A
4. PDF gerado via biblioteca Node.js — template brandado com logo e cores do cliente
5. Lead salvo em `leads` no Supabase: `client_id`, `funnel_id`, `name`, `email`, `phone`, `source`, `status`, `consent_lgpd` (boolean + timestamp)
6. After submit: thank you + download automático do PDF
7. RLS no Supabase: cada cliente só vê seus leads
8. Validação server-side (sanitização, email válido, telefone BR)
9. Testes de submissão com dados válidos e inválidos

### Story 3.4: Etapa T — Transformação & Qualificação

**Como** lead capturado,
**quero** responder uma pesquisa rápida sobre minha situação,
**para que** eu receba orientação relevante e o cliente identifique meu nível de interesse.

**Acceptance Criteria:**

1. Template com: headline, 3-5 perguntas múltipla escolha, botão submit, thank you page
2. Perguntas geradas via Copywriting Agent baseadas no briefing do cliente
3. Scoring: Hot (pronto para comprar), Warm (interessado), Cold (curioso) com peso por resposta
4. Resultado salvo em `leads`: `qualification_score` (0-100), `qualification_tier`, `survey_responses` (JSONB)
5. Thank you personalizada por tier: Hot → CTA contato; Warm → conteúdo adicional; Cold → follow-up futuro
6. Lead status atualizado para `qualified`
7. Transição R → T via link no email ou redirect pós-download
8. Testes de scoring para diferentes combinações de respostas

### Story 3.5: Lead Pipeline, Webhooks & Evolution Integration

**Como** operador,
**quero** que cada lead capturado dispare notificações via webhook e WhatsApp (Evolution API),
**para que** o cliente receba leads em tempo real.

**Acceptance Criteria:**

1. Eventos `lead.captured` e `lead.qualified` disparados ao salvar/atualizar lead
2. Workflow n8n: lead → enriquecer → webhook genérico (POST JSON) → WhatsApp via Evolution API
3. Payload webhook: `{ client_id, lead: { name, email, phone, source, qualification_tier, created_at } }`
4. WhatsApp via Evolution: mensagem formatada para o número do cliente com dados do lead
5. Configuração por cliente: `client_settings` com `webhook_url`, `whatsapp_number`, `notification_preferences`
6. Retry 3x com backoff em falhas
7. Query view de leads no Supabase com filtros por cliente, tier, data
8. Teste end-to-end: briefing → FunWheel → lead fake → Supabase + webhook + WhatsApp
9. Workflow n8n exportado como JSON no repo

---

## Epic 4: Sales Page, Pipeline Integration & Self-Dogfooding

**Goal:** Construir o Sistema 3 (Página de Vendas long-form), integrar o pipeline completo dos 3 sistemas em um fluxo end-to-end orquestrado via n8n, e executar self-dogfooding gerando todas as entregas da CopyZen — validando o MVP com resultados reais.

### Story 4.1: Sales Page Copy Generator

**Como** operador,
**quero** gerar automaticamente a copy completa de uma página de vendas long-form,
**para que** o output siga a estrutura de oferta irresistível e seja publicável.

**Acceptance Criteria:**

1. Módulo `src/systems/sales-page/generator.ts` com função `generateSalesPage(briefing, brandProfile, offerDetails)`
2. Seções: hero, problema, solução, benefícios, prova social, oferta, garantia, FAQ (3-5), CTA final
3. `offerDetails` input: preço, pacotes/planos, garantia, bônus, prazo — campos opcionais com defaults
4. Copy em PT-BR conversacional via Copywriting Agent com guardrails
5. Cada seção com: copy principal, sugestão visual, nota de design
6. Output em JSON estruturado e Markdown renderizável
7. Testes validando geração de todas as 9 seções
8. Teste qualitativo: página de vendas da CopyZen gerada

### Story 4.2: Sales Page Build & Deploy

**Como** operador,
**quero** que a copy gerada seja transformada em página web responsiva publicada na VPS,
**para que** o cliente tenha página de vendas profissional no ar.

**Acceptance Criteria:**

1. Reutilizar Page Engine do Epic 3 (Story 3.1)
2. Template Sales Page: layout conversão, seções full-width alternando fundo, CTAs sticky mobile
3. Função `buildSalesPage(salesPageContent, brandProfile)` → output estático
4. Elementos de conversão: CTA accent, countdown (opcional), badge garantia
5. Mobile-first: CTA sticky bottom < 768px
6. Deploy na VPS: `vendas.copyzen.com.br/{clientSlug}`
7. Lighthouse > 90, < 2s em 4G
8. Build com dados CopyZen renderizada corretamente

### Story 4.3: End-to-End Pipeline Orchestration

**Como** operador,
**quero** um pipeline unificado via n8n que orquestre os 3 sistemas a partir de um briefing,
**para que** eu dispare geração completa com um comando e acompanhe progresso.

**Acceptance Criteria:**

1. Workflow n8n master: briefing → paralelo: Content Pipeline + FunWheel Pipeline + Sales Page Pipeline
2. Sub-pipelines reportam status: `pending` → `generating` → `ready_for_review` → `approved`
3. Tabela `projects` no Supabase: `client_id`, `briefing_id`, `status`, IDs dos 3 sistemas
4. Endpoint `POST /projects/generate` e `GET /projects/:id/status`
5. Notificação WhatsApp (Evolution) ao completar: "Projeto {cliente} pronto para revisão"
6. Error handling: sistemas independentes; falha isolada permite retry individual
7. Tempo total < 30 minutos para pacote completo
8. Workflow n8n exportado como JSON com documentação
9. Teste end-to-end com briefing CopyZen

### Story 4.4: Operator Review & Approval Flow

**Como** operador,
**quero** revisar todas as entregas e aprovar/rejeitar peças individuais,
**para que** eu garanta qualidade antes de publicar.

**Acceptance Criteria:**

1. Endpoint `GET /projects/:id/deliverables` com preview de todas as peças
2. Endpoints `POST /deliverables/:id/approve` e `POST /deliverables/:id/reject` com campo `feedback`
3. Regeneração: `POST /deliverables/:id/regenerate` com feedback como contexto no prompt
4. Máximo 2 regenerações por peça
5. Projeto `completed` só quando todas as peças `approved`
6. Relatório de entrega: resumo, stats (tokens, tempo, custo)
7. Testes do fluxo approve/reject/regenerate

### Story 4.5: CopyZen Self-Dogfooding & MVP Validation

**Como** fundador da CopyZen,
**quero** executar o pipeline completo usando a CopyZen como primeiro cliente,
**para que** o MVP seja validado com entregas reais.

**Acceptance Criteria:**

1. Cliente "CopyZen" criado no Supabase com dados reais
2. Briefing completo: segmento, público-alvo, tom de voz, referências do site atual (cores `#06164A`, `#6220FF`, `#ED145B`, fontes Muli/Lato)
3. Brand profile validado contra identidade visual de copyzen.com.br
4. 10 posts gerados: 7 Inception + 3 Atração Fatal
5. FunWheel completo publicado e acessível (A-R-T)
6. Página de vendas publicada com oferta do serviço CopyZen
7. Pipeline end-to-end executado: briefing → 3 sistemas → review → approved → publicado
8. Métricas documentadas: tempo, custo tokens, qualidade, Lighthouse scores
9. Relatório `docs/mvp-validation-report.md` com resultados e lições
10. FunWheel capturando leads reais (formulário funcional e integrado)

---

## Checklist Results Report

### Executive Summary

- **Completude geral do PRD:** ~88%
- **Adequação do MVP scope:** Just Right
- **Prontidão para fase de arquitetura:** READY FOR ARCHITECT
- **Gaps mais críticos:** Nenhum blocker; 3 itens HIGH para melhorar qualidade

### Category Statuses

| Category | Status | Critical Issues |
|----------|--------|-----------------|
| 1. Problem Definition & Context | PASS | Nenhum — brief aprovado fornece base sólida |
| 2. MVP Scope Definition | PASS | Out of scope e success criteria bem definidos |
| 3. User Experience Requirements | PARTIAL | Faltam user flows detalhados (diagramas) e edge cases |
| 4. Functional Requirements | PASS | 14 FRs cobrindo todos os sistemas; testáveis |
| 5. Non-Functional Requirements | PASS | 12 NFRs com métricas mensuráveis |
| 6. Epic & Story Structure | PASS | 4 epics, 21 stories, sequência lógica, ACs testáveis |
| 7. Technical Guidance | PASS | Stack definido, infra existente documentada |
| 8. Cross-Functional Requirements | PARTIAL | Data retention policies ausentes |
| 9. Clarity & Communication | PASS | Linguagem clara, estrutura consistente |

### Top Issues

**HIGH:**
1. User flows diagramáticos ausentes — delegar ao @ux-design-expert
2. Data retention LGPD não especificada — adicionar NFR13
3. Monitoring & alerting não definidos — delegar ao @architect

**MEDIUM:**
4. Competitive analysis ausente — delegar ao @analyst
5. Pricing não definido — decidir antes do primeiro cliente externo
6. Error states nas páginas geradas — refinar durante implementação

**LOW:**
7. PRD text-only (sem diagramas visuais)
8. Backup/recovery da VPS — delegar ao @devops

### Final Decision

**READY FOR ARCHITECT** — PRD completo e com detalhe suficiente para iniciar arquitetura. Gaps HIGH são refinamentos paralelos, sem bloqueio.

---

## Next Steps

### UX Expert Prompt

Ativar @ux-design-expert para criar a arquitetura de design do CopyZen usando este PRD como input. Foco: design system para páginas geradas (FunWheel A-R-T + Sales Page), sistema de templates brandáveis com CSS custom properties, e especificações mobile-first para os 5 core screens definidos na seção UI Design Goals.

### Architect Prompt

Ativar @architect para criar a arquitetura técnica do CopyZen usando este PRD como input. Decisões-chave pendentes: Next.js vs Astro para SSG, Vercel vs VPS para hosting de páginas, estrutura detalhada dos módulos, API design, e integração n8n. Considerar a VPS KVM4 existente (16GB RAM, Docker Swarm) com n8n, Evolution API e Chatwoot já instalados.
