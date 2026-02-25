# CopyZen Full-Stack Architecture Document

**Version:** 1.0
**Date:** 2026-02-24
**Author:** Aria (Architect Agent)
**Status:** Approved
**Project:** CopyZen — Plataforma de Automação de Marketing Conversacional via Agentes IA

---

## Introduction

This document outlines the complete full-stack architecture for **CopyZen**, a conversational marketing automation platform powered by AI agents. The architecture unifies backend systems (briefing, branding, copywriting agents), middleware orchestration (n8n), and frontend page generation (SSG) into a cohesive monorepo structure.

CopyZen's core mission: transform a client briefing into three complete deliverables (Content posts, FunWheel funnel, Sales Page) via an automated multi-stage pipeline, achieving 80%+ automation with minimal human intervention.

### Architecture Approach
- **Monolithic modular architecture** — 3 interconnected systems sharing a common core
- **Serverless-ready backend** — Node.js REST API deployable on existing VPS via Docker Swarm
- **Static site generation for pages** — Astro for performance (Lighthouse > 90, <2s load)
- **LLM adapter pattern** — Claude API abstraction with fallback support
- **Multi-client RLS isolation** — Supabase Row-Level Security enforces per-client data boundaries
- **Orchestration via n8n** — Existing self-hosted n8n on VPS orchestrates pipeline workflows

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-02-24 | 1.0 | Initial architecture based on PRD v0.1 | Aria (Architect) |

---

## High-Level Architecture

### Technical Summary

CopyZen adopts a **distributed monorepo architecture** comprising three specialized systems (Content, FunWheel, Sales Page) unified by a shared core module (Briefing, Branding, Copywriting). The backend runs as a containerized Node.js API on the existing VPS Docker Swarm stack, using Supabase Cloud as the primary database with PostgreSQL + RLS for multi-client isolation. Frontend pages are generated statically using Astro with dynamic branding via CSS custom properties, achieving Lighthouse scores >90 and sub-2s load times on 4G. n8n orchestrates the pipeline workflows end-to-end: triggered by a client briefing approval, it chains briefing → branding → copy generation → system-specific page builds, with lead webhooks flowing back to the client's external CRM or WhatsApp via Evolution API. This design prioritizes operational efficiency (one-person team via CLI), rapid delivery (<24h per project), and cost control via token budgeting and free/low-cost infrastructure tiers.

### Platform and Infrastructure Choice

**Primary Platform:** **VPS Hostinger (existing) + Supabase Cloud + Vercel/VPS (decision below)**

**Key Services:**
- **Compute:** Docker Swarm on VPS KVM4 (16GB RAM) — backend API + n8n orchestration
- **Database:** Supabase Cloud (PostgreSQL 15+ with native RLS, Auth, Storage, Realtime)
- **Frontend Hosting:** Vercel (preferred for Astro SSR caching) OR VPS (Docker containers)
- **External APIs:** Claude API (LLM), Evolution API (WhatsApp, already on VPS), Chatwoot (CRM, already on VPS)
- **CDN:** Vercel Edge Network (if Vercel) OR Cloudflare (if VPS)

**Rationale:**
- VPS infra already paid and operational (n8n, Evolution, Chatwoot installed)
- Supabase free tier supports MVP (<500 concurrent, <100GB storage) with paid option ($25–$100/mo for scale)
- Vercel + Supabase is the optimal pairing for Astro SSG with edge caching
- Avoids AWS complexity; keeps stack lean for single-person OPB operations

**Frontend Hosting Decision:** **Vercel (recommended)** — Astro projects deploy in seconds, Supabase integrates natively, Edge Network caches pages globally, free tier sufficient for MVP. Fallback: Docker containers on VPS if cost-sensitive.

### Repository Structure

**Type:** Monorepo (npm workspaces)

**Rationale:**
- Shared types/utilities between frontend and backend reduce duplication
- Single deployment unit — easier CI/CD and versioning
- CLI-first development — single root `package.json` for all scripts

```
cz-squad/
├── apps/
│   ├── api/                    # Backend API (Node.js/Express)
│   │   ├── src/
│   │   │   ├── core/           # Briefing, Branding, Copywriting agents
│   │   │   ├── systems/        # Content, FunWheel, Sales Page generators
│   │   │   ├── routes/         # REST endpoints
│   │   │   ├── middleware/     # Auth, validation, error handling
│   │   │   ├── services/       # Business logic (no DB direct access)
│   │   │   ├── integrations/   # n8n webhooks, Evolution, Supabase
│   │   │   └── index.ts        # Express server entry
│   │   ├── Dockerfile          # Multi-stage: build + runtime
│   │   └── package.json
│   └── pages/                  # Astro SSG for FunWheel + Sales Pages
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── layouts/        # Page templates (A-R-T, Sales Page)
│       │   ├── pages/          # Dynamic routes (client slugs)
│       │   ├── styles/         # Tailwind + brand CSS vars
│       │   └── lib/            # Branding utilities, typecheck
│       ├── astro.config.mjs
│       └── package.json
├── packages/
│   ├── shared/
│   │   ├── src/
│   │   │   ├── types/          # TypeScript interfaces (Client, Briefing, etc.)
│   │   │   ├── constants/      # ENUMs, Magic numbers
│   │   │   ├── llm/            # LLM adapter interface
│   │   │   └── utils/          # Shared helpers
│   │   └── package.json
│   └── ui/                     # Component library (not used in MVP — future)
├── .github/
│   └── workflows/
│       ├── ci.yaml             # Lint, typecheck, test
│       └── deploy.yaml         # Deploy to Vercel + Docker Swarm
├── .env.example
├── docker-compose.yml          # Local dev stack
├── package.json                # Root workspaces config
├── tsconfig.json               # Shared TypeScript config
├── .eslintrc.js
├── README.md
└── docs/
    ├── prd.md
    ├── architecture.md         # This file
    ├── n8n-workflows/          # Exported n8n JSON workflows
    └── deployment/
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client (OPB Fernando)                     │
│                     CLI / Terminal Interface                     │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CopyZen Backend API                         │
│                   (Docker on VPS Swarm)                          │
├─────────────────────────────────────────────────────────────────┤
│  POST /briefings                 GET /brand-profiles             │
│  POST /briefings/:id/approve     POST /content/generate-package  │
│  POST /copy/generate             POST /funwheel/generate         │
│  POST /sales-page/generate       GET /projects/:id/status        │
└────────────┬────────────────────────────────────────────────────┘
             │ REST + JSON
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      n8n Orchestration                           │
│                   (Self-hosted on VPS)                           │
├─────────────────────────────────────────────────────────────────┤
│  Workflow: Briefing Approved                                     │
│   ├─ Call: POST /branding-engine (parallel)                     │
│   ├─ Call: POST /content/generate-package                       │
│   ├─ Call: POST /funwheel/generate                              │
│   ├─ Call: POST /sales-page/generate                            │
│   └─ Webhook: POST client_webhook_url (lead events)             │
│   └─ WhatsApp: Evolution API notification                       │
└────────────┬────────────────────────────────────────────────────┘
             │
     ┌───────┴─────────┬─────────────────┐
     ▼                 ▼                 ▼
┌───────────┐   ┌──────────────┐   ┌──────────────┐
│ Supabase  │   │ Claude API   │   │ Evolution    │
│ Cloud     │   │ (LLM)        │   │ API          │
│ (DB RLS)  │   │              │   │ (WhatsApp)   │
└───────────┘   └──────────────┘   └──────────────┘
     │
     ▼
┌──────────────────────────────────────────────────┐
│         Generated Pages (Astro SSG)              │
├──────────────────────────────────────────────────┤
│  funwheel.copyzen.com.br/{clientSlug}/a          │
│  funwheel.copyzen.com.br/{clientSlug}/r          │
│  funwheel.copyzen.com.br/{clientSlug}/t          │
│  vendas.copyzen.com.br/{clientSlug}              │
└───────────────────┬──────────────────────────────┘
                    │
                    ▼
            ┌──────────────────┐
            │  Client's Browser │
            │  (Lead End-User)  │
            └──────────────────┘
```

### Architectural Patterns

1. **Monolithic Modular Pattern** — Three independent systems (Content, FunWheel, Sales Page) within a single deployable unit. Reduces complexity vs. microservices for single-person operation; allows independent scaling if needed later.

2. **Repository Pattern** — All data access through typed repository layer (`packages/shared/types` + `apps/api/services`). Enables easy swaps (Supabase → raw PostgreSQL) and clean testing.

3. **LLM Adapter Pattern** — Abstract LLM provider behind interface in `packages/shared/llm/`. Swap providers (Claude → Deepseek → OpenAI) without touching application logic.

4. **Webhook/Event-Driven for Async** — Lead capture → event → n8n webhook → external CRM. Decouples generation from delivery.

5. **SSG with CSS Custom Properties for Branding** — Pages are static HTML but styled dynamically via `--brand-primary`, `--brand-secondary`, etc. Zero runtime overhead; branding baked into build artifacts.

6. **RLS-First Multi-Tenancy** — Supabase RLS policies enforce client isolation at the database layer. No application-level tenancy checks needed; the database says "no" if Row violates policy.

---

## Tech Stack

| Category | Technology | Version | Purpose | Rationale |
|----------|-----------|---------|---------|-----------|
| **Frontend Language** | TypeScript | 5.x | Type-safe frontend code | Industry standard; catches bugs early |
| **Frontend Framework** | Astro | 4.x | Static site generation | Perfect for content-heavy pages; Lighthouse >90 native; sub-2s cold starts |
| **UI Styling** | Tailwind CSS | 3.x | Utility-first CSS | CSS custom properties for dynamic branding; no CSS-in-JS overhead |
| **Backend Language** | TypeScript | 5.x | Type-safe backend | Shared types with frontend reduce bugs |
| **Backend Framework** | Express.js | 4.x | Lightweight REST API | Minimal overhead; pairs well with Node ecosystem; easy Docker |
| **API Style** | REST (JSON) | — | Synchronous endpoints | Simpler than GraphQL for small team; n8n integrates easily |
| **Database** | PostgreSQL (Supabase) | 15+ | Primary data store | Mature, ACID, native RLS, JSON support |
| **Cache Layer** | Redis (optional) | 7.x | Session + response caching | Skip MVP; add in Epic 2+ if needed |
| **LLM Runtime** | Claude API (Anthropic) | claude-opus-4 | Primary generative AI | Best-in-class copy quality; Fallback to fallback provider via adapter |
| **Orchestration** | n8n | Latest | Workflow engine | Already on VPS; visual workflow building; webhook support |
| **File Storage** | Supabase Storage | — | User uploads (leads, PDFs) | Integrated with Supabase; S3-compatible |
| **Authentication** | Supabase Auth | — | User login + session | Native RLS integration; MFA ready |
| **Frontend Test** | Vitest + Testing Library | Latest | Unit + component tests | Fast, ESM-native, great DX |
| **Backend Test** | Vitest + Supertest | Latest | Unit + integration tests | Same test runner across monorepo |
| **E2E Test** | Playwright | Latest | End-to-end scenarios | Browser automation; screenshot diffs |
| **Build Tool** | Vite + Astro | Latest | Frontend bundling | Blazing fast; native SSG support |
| **Linter** | ESLint | 8.x | Code quality | Consistent style across monorepo |
| **Formatter** | Prettier | 3.x | Code formatting | Opinionated; zero config |
| **CI/CD** | GitHub Actions | — | Automated testing + deploy | Free; integrates with GitHub |
| **Container Orchestration** | Docker Swarm | Latest | Backend deployment | Already on VPS; simpler than Kubernetes |
| **Monitoring** | Sentry (frontend) + custom logs (backend) | Latest | Error tracking | Sentry free tier for web apps |
| **Environment Management** | dotenv + zod | Latest | Config validation | Type-safe env vars; schema validation |

---

## Data Models

### Client
**Purpose:** Represents a customer of CopyZen (OPB + team, or external client in future).

```typescript
interface Client {
  id: string;                    // UUID
  name: string;                  // "Clínica Dr. Silva"
  segment: string;               // "health" | "consulting" | "ecommerce" | etc.
  contactInfo: {
    email: string;
    phone: string;               // WhatsApp for Evolution notifications
    ownerName: string;
  };
  settings: {
    webhookUrl?: string;         // For lead delivery
    whatsappNumber?: string;      // For notifications
    maxProjects?: number;         // Rate limit
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### Briefing
**Purpose:** Captures client information for downstream systems; becomes source of truth for all deliverables.

```typescript
interface Briefing {
  id: string;
  clientId: string;              // FK → Client
  status: "draft" | "approved" | "processing" | "completed";

  // Core briefing data
  businessName: string;
  segment: string;
  targetAudience: string;        // "Mulheres 30-50, consultoras imobiliárias"
  voiceTone: string;             // "conversational" | "formal" | "technical"
  objectives: string[];          // ["Gerar leads", "Aumentar vendas"]
  differentiators: string;       // Unique selling propositions

  // Optional
  existingColors?: string[];     // ["#06164A", "#6220FF"]
  logoUrl?: string;
  competitorReferences?: string[]; // URLs or descriptions
  monthlyMarketingBudget?: number;

  // System
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;           // Agent or user ID
}
```

### BrandProfile
**Purpose:** AI-generated branding guidelines derived from Briefing; injected into all page generation.

```typescript
interface BrandProfile {
  id: string;
  clientId: string;
  briefingId: string;            // FK → Briefing

  // Generated by Branding Engine
  colorPalette: {
    primary: string;             // Hex
    secondary: string;
    accent: string;
    neutral: string;
  };

  voiceGuidelines: {
    tone: string;                // "consultive, persuasive, friendly"
    keywordsToUse: string[];      // ["transformação", "confiança"]
    keywordsToAvoid: string[];    // ["agressivo", "invasivo"]
    examplePhrases: string[];
  };

  visualStyle: string;           // "minimalist" | "bold" | "playful"
  fontRecommendations: {
    heading: string;             // "Muli"
    body: string;                // "Lato"
  };

  createdAt: Date;
}
```

### ContentPlan
**Purpose:** Strategy for a content package (posts); guides individual post generation.

```typescript
interface ContentPlan {
  id: string;
  clientId: string;
  briefingId: string;

  totalPosts: number;            // e.g., 10
  inceptionRatio: number;        // % of Inception mode (e.g., 70)
  attractionRatio: number;       // % of Attraction mode (e.g., 30)

  posts: PostBrief[];            // Ordered list
  createdAt: Date;
}

interface PostBrief {
  id: string;
  type: "carousel" | "image";
  mode: "inception" | "attraction_fatal";
  theme: string;                 // "Benefícios da transformação"
  angle: string;                 // Specific perspective
  platform: "instagram" | "linkedin";
  orderIndex: number;
}
```

### ContentPackage
**Purpose:** Generated content; one per plan; contains all posts + metadata.

```typescript
interface ContentPackage {
  id: string;
  clientId: string;
  contentPlanId: string;

  status: "generating" | "ready_for_review" | "approved" | "delivered";
  posts: GeneratedPost[];

  // Metadata
  totalTokensUsed: number;
  generationTimeMs: number;
  generatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

interface GeneratedPost {
  id: string;
  briefId: string;               // FK → PostBrief

  type: "carousel" | "image";
  caption: string;
  slides?: CarouselSlide[];       // If carousel
  visualBrief: VisualBrief;

  status: "approved" | "rejected" | "pending_review";
  feedback?: string;             // If rejected
}

interface CarouselSlide {
  orderIndex: number;
  mainText: string;
  supportText?: string;
  designNote?: string;
}

interface VisualBrief {
  colors: string[];              // From brand profile
  layout: string;
  dimensions: { width: number; height: number };
  keywords: string[];
}
```

### FunWheel (3-stage funnel)
**Purpose:** Lead capture & qualification funnel with 3 pages: Apresentação (A), Retenção (R), Transformação (T).

```typescript
interface FunWheel {
  id: string;
  clientId: string;
  briefingId: string;

  status: "draft" | "generating" | "ready_for_review" | "published";

  stageA: EtapaA;
  stageR: EtapaR;
  stageT: EtapaT;

  publishedUrl?: string;         // funwheel.copyzen.com.br/{clientSlug}
  createdAt: Date;
  publishedAt?: Date;
}

interface EtapaA {
  headline: string;
  problem: string;               // Current state of pain
  solution: string;              // Transformation story
  benefits: string[];
  socialProof?: string[];        // Testimonials or stats
  ctaText: string;               // "Próximo passo" button text
  ctaUrl: string;                // Link to Stage R
}

interface EtapaR {
  leadMagnetTitle: string;
  leadMagnetDescription: string;
  form: {
    fields: FormField[];         // name, email, phone
    consentText: string;         // LGPD disclaimer
  };
  pdfUrl?: string;               // Generated lead magnet PDF
}

interface EtapaT {
  questions: Question[];         // 3-5 multiple choice
  successMessage: string;
  ctaByTier: {
    hot: string;                 // Ready to buy → direct contact CTA
    warm: string;                // Interested → more content
    cold: string;                // Curious → follow-up later
  };
}

interface Lead {
  id: string;
  clientId: string;
  funnelId: string;

  name: string;
  email: string;
  phone: string;

  source: "etapa_r" | "etapa_t";
  status: "captured" | "qualified" | "delivered_to_crm";

  qualificationScore?: number;   // 0-100
  qualificationTier?: "hot" | "warm" | "cold";
  surveyResponses?: Record<string, any>;

  consentLGPD: boolean;
  consentAt: Date;

  createdAt: Date;
}
```

### SalesPage
**Purpose:** Long-form sales page for offer & conversion.

```typescript
interface SalesPage {
  id: string;
  clientId: string;
  briefingId: string;

  status: "draft" | "generating" | "ready_for_review" | "published";

  sections: {
    hero: {
      headline: string;
      subheadline: string;
    };
    problem: string;
    solution: string;
    benefits: string[];
    socialProof: string[];
    offer: {
      description: string;
      price: number;
      packages?: Package[];       // Tiered pricing
      guarantee: string;
      bonuses?: string[];
    };
    faq: FAQItem[];
    finalCta: {
      text: string;
      url: string;
    };
  };

  publishedUrl?: string;         // vendas.copyzen.com.br/{clientSlug}
  createdAt: Date;
  publishedAt?: Date;
}

interface Package {
  name: string;
  price: number;
  features: string[];
}

interface FAQItem {
  question: string;
  answer: string;
}
```

### Project (Orchestration wrapper)
**Purpose:** Top-level tracker for a complete end-to-end pipeline run.

```typescript
interface Project {
  id: string;
  clientId: string;
  briefingId: string;

  status: "pending" | "generating" | "ready_for_review" | "approved" | "delivered";

  // Links to sub-systems
  contentPackageId?: string;
  funwheelId?: string;
  salesPageId?: string;

  // Metadata
  startedAt: Date;
  completedAt?: Date;
  tokens: {
    branding: number;
    content: number;
    funwheel: number;
    salesPage: number;
    total: number;
  };
  estimatedCost: number;         // USD
}
```

**Relationships Diagram:**

```
Client (1) ──────→ (many) Briefing
                        ↓
                   BrandProfile
                        ↓
Client (1) ──────→ (many) Project
                        ├─→ ContentPackage
                        ├─→ FunWheel
                        │    └─→ (many) Lead
                        └─→ SalesPage

ContentPackage ──→ (many) GeneratedPost
                        └─→ VisualBrief (nested)

FunWheel ──→ EtapaA, EtapaR (Form), EtapaT
```

---

## API Specification

### REST Endpoints (OpenAPI 3.0 summary)

**Base URL:** `http://api.copyzen.local` (dev) | `https://api.copyzen.com.br` (prod)

#### Briefing Management
```
POST /briefings
  Payload: { clientId, businessName, segment, targetAudience, ... }
  Response: { id, status: "draft", ... }

GET /briefings/:id
  Response: { full briefing }

POST /briefings/:id/approve
  Payload: { approvedBy: "operator_id" }
  Response: { id, status: "approved", ... }
  Side effect: Triggers n8n webhook → Branding Engine
```

#### Branding
```
GET /brand-profiles/:clientId
  Response: { id, colorPalette, voiceGuidelines, ... }
  (Generated on briefing approval; cached)
```

#### Content Generation
```
POST /content/plan
  Payload: { clientId, briefingId, totalPosts: 10, inceptionRatio: 0.7 }
  Response: { id, status: "draft", posts: [] }

POST /content/generate-package
  Payload: { contentPlanId }
  Response: { id, status: "generating", ... }
  Polling: GET /projects/:projectId/status → { status, progress }

GET /content/packages/:packageId
  Response: { posts: [ { type, caption, slides/visualBrief, status } ] }

POST /content/posts/:postId/approve
  Payload: { approved: true/false, feedback?: "..." }
```

#### FunWheel Generation
```
POST /funwheel/generate
  Payload: { clientId, briefingId, brandProfileId }
  Response: { id, status: "generating", ... }

GET /funwheel/:funnelId/pages
  Response: { stageA: {...}, stageR: {...}, stageT: {...} }

POST /funwheel/:funnelId/publish
  Response: { publishedUrl: "funwheel.copyzen.com.br/..." }
```

#### Lead Capture (Etapa R — form submit via Frontend)
```
POST /leads
  Payload: { funnelId, name, email, phone, consentLGPD: true }
  Response: { id, status: "captured" }
  Side effect: Save to Supabase + trigger webhook to client CRM + WhatsApp
```

#### Lead Qualification (Etapa T — form submit via Frontend)
```
POST /leads/:leadId/qualify
  Payload: { surveyResponses: { q1: "a", q2: "b", ... } }
  Response: { id, qualificationScore, qualificationTier: "hot" }
  Side effect: Update Supabase + webhook + WhatsApp
```

#### Sales Page Generation
```
POST /sales-page/generate
  Payload: { clientId, briefingId, brandProfileId, offerDetails: {...} }
  Response: { id, status: "generating", ... }

POST /sales-page/:pageId/publish
  Response: { publishedUrl: "vendas.copyzen.com.br/..." }
```

#### Project Orchestration
```
POST /projects/generate
  Payload: { clientId, briefingId }
  Response: { id, status: "pending", contentPackageId: null, funwheelId: null, ... }
  Side effect: Triggers n8n master workflow

GET /projects/:projectId/status
  Response: { status, contentPackage: {...}, funwheel: {...}, salesPage: {...} }

GET /projects/:projectId/deliverables
  Response: [ { type: "content", data: {...}, status: "approved" }, ... ]

POST /projects/:projectId/approve
  Payload: { deliverableId?, approved: true }
  Response: { status: "approved" | "pending_review" }
```

#### Health & Metrics
```
GET /health
  Response: { status: "ok", version: "0.1.0", uptime: 3600 }

GET /metrics
  Response: { tokens: { today: 15000, month: 450000 }, errors: {...} }
```

---

## Components

### Backend Services (API Layer)

#### 1. **Briefing Service** (`apps/api/services/briefing.ts`)
- **Responsibility:** CRUD for briefings; validation; approval workflow
- **Key Interfaces:** `createBriefing()`, `approveBriefing()`, `getBriefing()`
- **Dependencies:** Supabase client, validation library (zod)
- **Technology:** Express route handlers + Supabase RLS

#### 2. **Branding Engine** (`apps/api/services/branding.ts`)
- **Responsibility:** Accept approved briefing → call Claude API → generate `BrandProfile`
- **Key Interfaces:** `generateBrandProfile(briefing: Briefing): Promise<BrandProfile>`
- **Dependencies:** LLM adapter, Supabase storage
- **Prompt Engineering:** Structured JSON output via Claude system prompt

#### 3. **Copywriting Agent** (`apps/api/services/copywriting.ts`)
- **Responsibility:** Generate copy (headlines, CTAs, body text) respecting brand guardrails
- **Key Interfaces:** `generateCopy(prompt, brandProfile, options): Promise<string>`
- **Dependencies:** LLM adapter, brand profile
- **Guardrails:** Tone injection, vocabulary constraints via prompt engineering

#### 4. **Content System** (`apps/api/services/content/`)
- **Subservices:**
  - `strategy.ts` → Create content plan
  - `carousel.ts` → Generate carousel copy (slide-by-slide)
  - `imagePost.ts` → Generate image post copy (Instagram/LinkedIn)
  - `visualBrief.ts` → Design specs (colors, layout, fonts)
  - `pipeline.ts` → Orchestrate all post generation

#### 5. **FunWheel System** (`apps/api/services/funwheel/`)
- **Subservices:**
  - `etapa-a.ts` → Generate landing page (narrative)
  - `etapa-r.ts` → Lead capture form + PDF generation
  - `etapa-t.ts` → Qualification quiz + scoring
  - `pipeline.ts` → Orchestrate all 3 stages

#### 6. **Sales Page System** (`apps/api/services/sales-page/`)
- **Subservices:**
  - `generator.ts` → Generate long-form copy (hero → FAQ → CTA)
  - `builder.ts` → Assemble into static HTML/Astro components

#### 7. **LLM Adapter** (`packages/shared/llm/adapter.ts`)
```typescript
// Abstract interface
interface LLMAdapter {
  generateCompletion(prompt: string, options?: LLMOptions): Promise<string>;
}

// Implementation
class ClaudeAdapter implements LLMAdapter {
  async generateCompletion(prompt, options) {
    // Call Claude API with cost tracking
    const response = await fetch('https://api.anthropic.com/v1/messages', {...});
    return response.content[0].text;
  }
}

// Fallback pattern
const fallbackAdapters = [new ClaudeAdapter(), new DeepseekAdapter()];
```

### Frontend (Astro SSG)

#### 1. **Page Components** (`apps/pages/src/layouts/`)
- `FunWheelLayout.astro` — Base layout for stages A, R, T
- `SalesPageLayout.astro` — Long-form layout
- `LeadFormComponent.astro` — Reusable form (R & T)

#### 2. **Branding System** (`apps/pages/src/lib/branding.ts`)
```typescript
// At build time, inject brand profile as CSS variables
export function getBrandCSS(brandProfile: BrandProfile): string {
  return `
    :root {
      --brand-primary: ${brandProfile.colorPalette.primary};
      --brand-secondary: ${brandProfile.colorPalette.secondary};
      --font-heading: ${brandProfile.fontRecommendations.heading};
      --font-body: ${brandProfile.fontRecommendations.body};
    }
  `;
}
```

#### 3. **Dynamic Routes** (`apps/pages/src/pages/`)
```
/funwheel/[clientSlug]/a.astro         → EtapaA page
/funwheel/[clientSlug]/r.astro         → EtapaR (lead form)
/funwheel/[clientSlug]/t.astro         → EtapaT (qualification)
/vendas/[clientSlug].astro             → Sales page
```

Each route:
1. Fetches briefing + brand profile from API at build time (or via Astro data loader)
2. Renders static HTML with CSS variables injected
3. Embeds form submission handlers (client-side JS) → API endpoints

#### 4. **Form Handlers** (client-side JavaScript)
```typescript
// apps/pages/src/components/LeadForm.astro
// On form submit:
// - POST /leads (capture) OR
// - POST /leads/:id/qualify (qualification)
// - Show thank-you message
// - Trigger PDF download (R) or redirect (T)
```

---

## External APIs

### Claude API (Anthropic)
- **Purpose:** Primary LLM for copy, branding, content strategy generation
- **Base URL:** `https://api.anthropic.com/v1`
- **Authentication:** Bearer token via `ANTHROPIC_API_KEY` env var
- **Rate Limits:** 50 requests/min (standard), 600 requests/min (high-volume after approval)
- **Key Endpoints:**
  - `POST /messages` — Synchronous generation (used for all copy tasks)
  - Batches API (async) — Planned for bulk generation in future

### n8n Webhooks (Internal to VPS)
- **Purpose:** Trigger workflows (briefing approved → generate all systems)
- **Base URL:** `http://n8n-internal.vps/webhook`
- **Auth:** API key in header
- **Workflows:**
  - `master-pipeline` — Orchestrates Content + FunWheel + Sales Page in parallel
  - `lead-webhook` — Sends lead data to client's external CRM
  - `whatsapp-notification` — Sends lead info via Evolution API

### Evolution API (Already on VPS)
- **Purpose:** WhatsApp notifications to client when leads are captured/qualified
- **Base URL:** `http://evolution.vps/api` (internal)
- **Integration:** Called by n8n workflow after lead save
- **Payload:** `{ number, message: "New lead: ${name} (${tier})" }`

### Supabase Storage & Auth
- **Purpose:** File storage (PDFs, images), user authentication (future)
- **Base URL:** `https://{project-id}.supabase.co`
- **Authentication:** Service role key (for backend), anon key (for frontend if RLS allows)
- **Endpoints:** Standard Supabase REST API

---

## Core Workflows

### Workflow 1: Client Briefing → Complete Deliverables

```
sequence diagram
  Operator->>API: POST /briefings (client info)
  API->>Supabase: Save briefing (status: draft)
  Operator->>API: POST /briefings/:id/approve
  API->>n8n: Webhook: briefing approved

  par Parallel Generation
    n8n->>API: POST /branding/generate
    API->>Claude: "Generate brand profile..."
    Claude-->>API: BrandProfile JSON
    API->>Supabase: Save brand profile

    n8n->>API: POST /content/plan
    API->>Claude: "Create content strategy..."
    Claude-->>API: 10 posts plan
    API->>Supabase: Save plan

    n8n->>API: POST /content/generate-package
    API->>Claude: Generate each post copy
    Claude-->>API: Posts (carousels + images)
    API->>Supabase: Save posts

    n8n->>API: POST /funwheel/generate
    API->>Claude: Generate A, R, T copy
    Claude-->>API: 3-stage funnel
    API->>Supabase: Save funwheel

    n8n->>API: POST /sales-page/generate
    API->>Claude: "Long-form sales copy..."
    Claude-->>API: Page sections
    API->>Supabase: Save sales page
  end

  n8n->>Astro: Build pages (SSG)
  Astro->>CDN: Deploy (Vercel or VPS)
  CDN-->>Operator: "All ready at {urls}"
  n8n->>Evolution: WhatsApp: "Seu projeto está pronto!"
```

### Workflow 2: Lead Capture (Etapa R → CRM)

```
sequence diagram
  Visitor->>Astro: Visit funwheel/.../r
  Visitor->>Form: Fill name, email, phone + consent
  Form->>API: POST /leads
  API->>Supabase: Save lead (RLS: client isolation)
  API->>n8n: Webhook: lead.captured

  n8n->>n8n: Enrich lead (optional)
  n8n->>Client_Webhook: POST {client_webhook_url}
  Client_Webhook->>Client_CRM: Ingest lead

  n8n->>Evolution: WhatsApp to client
  Evolution->>Client_Phone: "New lead: João Silva"

  API-->>Form: { success: true, pdfUrl: "..." }
  Form->>Browser: Auto-download PDF
```

### Workflow 3: Lead Qualification (Etapa T → Scoring)

```
sequence diagram
  Lead->>Astro: Visit funwheel/.../t
  Lead->>Survey: Answer 3-5 questions
  Survey->>API: POST /leads/:id/qualify

  API->>API: Score responses (hot/warm/cold)
  API->>Supabase: Update lead (status: qualified, tier: hot)
  API->>n8n: Webhook: lead.qualified

  n8n->>Evolution: WhatsApp: "QUENTE: João Silva - comprador imediato"
  Evolution->>Client_Phone: Notification

  API-->>Survey: { tier: "hot", thankYouMessage: "..." }
  Survey->>Browser: Show thank-you + next steps
```

---

## Database Schema

### Primary Tables (PostgreSQL via Supabase)

```sql
-- Multi-tenant core
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  segment VARCHAR(50),
  contact_email VARCHAR(255) UNIQUE,
  contact_phone VARCHAR(20),
  owner_name VARCHAR(255),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Row-Level Security: Users can only see their own client
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Briefings
CREATE TABLE briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'draft',

  business_name VARCHAR(255),
  segment VARCHAR(50),
  target_audience TEXT,
  voice_tone VARCHAR(100),
  objectives TEXT[] DEFAULT '{}',
  differentiators TEXT,
  existing_colors TEXT[] DEFAULT '{}',
  logo_url VARCHAR(500),
  competitor_references TEXT[] DEFAULT '{}',
  monthly_budget NUMERIC(10, 2),

  created_at TIMESTAMP DEFAULT now(),
  approved_at TIMESTAMP,
  approved_by VARCHAR(100),
  updated_at TIMESTAMP DEFAULT now(),

  CONSTRAINT fk_client FOREIGN KEY(client_id) REFERENCES clients(id)
);
CREATE INDEX idx_briefings_client_id ON briefings(client_id);
CREATE INDEX idx_briefings_status ON briefings(status);

-- Brand profiles
CREATE TABLE brand_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  briefing_id UUID REFERENCES briefings(id) ON DELETE CASCADE,

  color_palette JSONB NOT NULL, -- { primary, secondary, accent, neutral }
  voice_guidelines JSONB NOT NULL,
  visual_style VARCHAR(100),
  font_recommendations JSONB,

  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  CONSTRAINT fk_client FOREIGN KEY(client_id) REFERENCES clients(id),
  CONSTRAINT fk_briefing FOREIGN KEY(briefing_id) REFERENCES briefings(id)
);
CREATE INDEX idx_brand_profiles_client_id ON brand_profiles(client_id);

-- Content plans
CREATE TABLE content_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  briefing_id UUID REFERENCES briefings(id) ON DELETE CASCADE,

  total_posts INT DEFAULT 10,
  inception_ratio NUMERIC(3, 2) DEFAULT 0.70,
  attraction_ratio NUMERIC(3, 2) DEFAULT 0.30,
  posts_data JSONB NOT NULL, -- Array of post briefs

  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  CONSTRAINT fk_client FOREIGN KEY(client_id) REFERENCES clients(id)
);

-- Generated posts
CREATE TABLE generated_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  content_plan_id UUID REFERENCES content_plans(id) ON DELETE CASCADE,

  type VARCHAR(50), -- 'carousel' or 'image'
  caption TEXT,
  slides JSONB, -- Array of slide objects (carousel only)
  visual_brief JSONB, -- { colors, layout, dimensions, keywords }
  status VARCHAR(50) DEFAULT 'pending_review',
  feedback TEXT,

  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  CONSTRAINT fk_client FOREIGN KEY(client_id) REFERENCES clients(id)
);
CREATE INDEX idx_generated_posts_plan_id ON generated_posts(content_plan_id);

-- Content packages
CREATE TABLE content_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  content_plan_id UUID REFERENCES content_plans(id) ON DELETE CASCADE,

  status VARCHAR(50) DEFAULT 'generating',
  total_tokens_used INT,
  generation_time_ms INT,
  generated_at TIMESTAMP DEFAULT now(),
  approved_at TIMESTAMP,
  approved_by VARCHAR(100),

  CONSTRAINT fk_client FOREIGN KEY(client_id) REFERENCES clients(id)
);

-- FunWheels
CREATE TABLE funwheels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  briefing_id UUID REFERENCES briefings(id) ON DELETE CASCADE,

  status VARCHAR(50) DEFAULT 'draft',
  stage_a JSONB NOT NULL, -- { headline, problem, solution, benefits, cta }
  stage_r JSONB NOT NULL, -- { form fields, pdf_url }
  stage_t JSONB NOT NULL, -- { questions, success_message }

  published_url VARCHAR(500),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  CONSTRAINT fk_client FOREIGN KEY(client_id) REFERENCES clients(id)
);
CREATE INDEX idx_funwheels_client_id ON funwheels(client_id);

-- Leads
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  funwheel_id UUID REFERENCES funwheels(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,

  source VARCHAR(50), -- 'etapa_r' or 'etapa_t'
  status VARCHAR(50) DEFAULT 'captured',
  qualification_score INT,
  qualification_tier VARCHAR(20), -- 'hot', 'warm', 'cold'
  survey_responses JSONB,

  consent_lgpd BOOLEAN DEFAULT false,
  consent_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  CONSTRAINT fk_client FOREIGN KEY(client_id) REFERENCES clients(id),
  CONSTRAINT fk_funwheel FOREIGN KEY(funwheel_id) REFERENCES funwheels(id)
);
CREATE INDEX idx_leads_client_id ON leads(client_id);
CREATE INDEX idx_leads_status ON leads(status);

-- Sales pages
CREATE TABLE sales_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  briefing_id UUID REFERENCES briefings(id) ON DELETE CASCADE,

  status VARCHAR(50) DEFAULT 'draft',
  sections JSONB NOT NULL, -- { hero, problem, solution, benefits, offer, faq, cta }

  published_url VARCHAR(500),
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  CONSTRAINT fk_client FOREIGN KEY(client_id) REFERENCES clients(id)
);

-- Projects (top-level orchestration)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  briefing_id UUID REFERENCES briefings(id) ON DELETE CASCADE,

  status VARCHAR(50) DEFAULT 'pending',
  content_package_id UUID REFERENCES content_packages(id),
  funwheel_id UUID REFERENCES funwheels(id),
  sales_page_id UUID REFERENCES sales_pages(id),

  started_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,

  branding_tokens INT DEFAULT 0,
  content_tokens INT DEFAULT 0,
  funwheel_tokens INT DEFAULT 0,
  sales_page_tokens INT DEFAULT 0,
  estimated_cost_usd NUMERIC(10, 2),

  CONSTRAINT fk_client FOREIGN KEY(client_id) REFERENCES clients(id)
);
CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);

-- Audit/Logging
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  action VARCHAR(100),
  resource_type VARCHAR(50), -- 'briefing', 'lead', etc.
  resource_id UUID,
  actor VARCHAR(100), -- user or agent ID
  changes JSONB, -- { before, after }
  created_at TIMESTAMP DEFAULT now()
);
```

### RLS Policies (Security at DB level)

```sql
-- Clients: Only see own record (admin)
CREATE POLICY clients_isolation ON clients
  FOR SELECT USING (
    auth.uid() = owner_id OR current_user_id() = 'admin'
  );

-- Briefings: Only see own client's briefings
CREATE POLICY briefings_isolation ON briefings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients WHERE id = client_id AND owner_id = auth.uid()
    )
  );

-- Leads: Only see own client's leads (prevents cross-client access)
CREATE POLICY leads_isolation ON leads
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients WHERE id = client_id AND owner_id = auth.uid()
    )
  );

-- Apply same isolation to: brand_profiles, content_plans, funwheels, sales_pages, projects
```

---

## Frontend Architecture

### Component Organization

```
apps/pages/src/
├── components/
│   ├── LeadForm.astro          # Reusable form for R & T
│   ├── HeroSection.astro        # Common hero block
│   ├── BenefitsList.astro       # Benefits section (A & Sales)
│   ├── SocialProof.astro        # Testimonials
│   └── CTAButton.astro
├── layouts/
│   ├── FunWheelLayout.astro    # Base layout for A-R-T
│   ├── SalesPageLayout.astro   # Long-form layout
│   └── BaseLayout.astro         # Global layout (head, nav, footer)
├── pages/
│   ├── funwheel/
│   │   ├── [clientSlug]/
│   │   │   ├── a.astro         # Stage A (EtapaA)
│   │   │   ├── r.astro         # Stage R (EtapaR)
│   │   │   └── t.astro         # Stage T (EtapaT)
│   └── vendas/
│       └── [clientSlug].astro  # Sales page
├── lib/
│   ├── branding.ts             # Brand CSS injection
│   ├── api-client.ts           # HTTP client (form submissions, leads)
│   ├── validation.ts           # Form validation (zod)
│   └── types.ts                # TypeScript interfaces (shared)
└── styles/
    ├── globals.css             # Tailwind + global styles
    └── brand-variables.css     # CSS custom properties template
```

### State Management (Frontend)

**No centralized state management in MVP.** Each page:
1. Fetches briefing + brand profile from API at build time
2. Renders static HTML with injected branding
3. Uses HTML form elements + JavaScript event listeners for interactions

```typescript
// apps/pages/src/pages/funwheel/[clientSlug]/r.astro
---
import { getBriefing, getBrandProfile } from '../../lib/api-client.ts';

export async function getStaticPaths() {
  // Build one page per client at build time
  // Or use dynamic rendering: export const prerender = false;
}

const { clientSlug } = Astro.params;
const briefing = await getBriefing(clientSlug);
const brandProfile = await getBrandProfile(briefing.clientId);
---

<html>
  <head>
    <style>{getBrandCSS(brandProfile)}</style>
  </head>
  <body>
    <LeadForm client:load {...briefing} />
  </body>
</html>
```

Form submission (client-side):
```typescript
// apps/pages/src/components/LeadForm.astro
<form id="lead-form">
  <input name="name" type="text" required />
  <input name="email" type="email" required />
  <input name="phone" type="tel" required />
  <input name="consent" type="checkbox" required />
  <button type="submit">Enviar</button>
</form>

<script>
  const form = document.querySelector('#lead-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const res = await fetch('/api/leads', {
      method: 'POST',
      body: JSON.stringify(Object.fromEntries(data)),
    });
    // Show thank-you, download PDF, redirect to next stage
  });
</script>
```

### Routing Architecture

**Dynamic routes per client + stage:**

```
/funwheel/copyzen/a              → EtapaA (Presentation)
/funwheel/copyzen/r              → EtapaR (Retention, lead capture)
/funwheel/copyzen/t              → EtapaT (Transformation, qualification)
/vendas/copyzen                  → Sales page

/funwheel/clinic-silva/a         → Another client's funwheel
/vendas/clinic-silva             → Another client's sales page
```

Each page is **prerendered at build time** if client list is known, or **dynamically rendered on-demand** if new clients added after deploy.

### API Client Layer

```typescript
// apps/pages/src/lib/api-client.ts
const API_BASE = process.env.PUBLIC_API_URL || 'http://localhost:3000';

export async function getBriefing(clientSlug: string) {
  const res = await fetch(`${API_BASE}/briefings?slug=${clientSlug}`);
  return res.json();
}

export async function getBrandProfile(clientId: string) {
  const res = await fetch(`${API_BASE}/brand-profiles/${clientId}`);
  return res.json();
}

export async function submitLead(data: LeadInput) {
  const res = await fetch(`${API_BASE}/leads`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Lead submission failed');
  return res.json();
}
```

---

## Backend Architecture

### Service Organization

**Controller (Express routes) → Service (business logic) → Repository (data access)**

```typescript
// apps/api/routes/briefings.ts
import { BriefingService } from '../services/briefing.ts';

router.post('/briefings', async (req, res, next) => {
  try {
    const briefing = await BriefingService.createBriefing(req.body);
    res.json(briefing);
  } catch (err) {
    next(err); // Global error handler
  }
});

router.post('/briefings/:id/approve', async (req, res, next) => {
  try {
    const briefing = await BriefingService.approveBriefing(req.params.id);
    // Trigger n8n webhook
    await fetch('http://n8n/webhook/briefing-approved', {
      method: 'POST',
      body: JSON.stringify(briefing),
    });
    res.json(briefing);
  } catch (err) {
    next(err);
  }
});
```

### Data Access Layer (Repository Pattern)

```typescript
// packages/shared/repository/briefing-repository.ts
export interface BriefingRepository {
  create(clientId: string, data: BriefingInput): Promise<Briefing>;
  getById(id: string): Promise<Briefing>;
  getByClient(clientId: string): Promise<Briefing[]>;
  update(id: string, data: Partial<Briefing>): Promise<Briefing>;
  delete(id: string): Promise<void>;
}

// apps/api/repository/supabase-briefing-repository.ts
export class SupabaseBriefingRepository implements BriefingRepository {
  constructor(private supabase: SupabaseClient) {}

  async create(clientId: string, data: BriefingInput) {
    const { data: briefing, error } = await this.supabase
      .from('briefings')
      .insert({ client_id: clientId, ...data })
      .select()
      .single();

    if (error) throw error;
    return briefing;
  }

  async getById(id: string) {
    const { data, error } = await this.supabase
      .from('briefings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
}
```

### Service Example: Branding Engine

```typescript
// apps/api/services/branding.ts
import { LLMAdapter } from '@packages/shared/llm';
import { BrandProfile } from '@packages/shared/types';
import { SupabaseBrandProfileRepository } from '../repository/supabase-brand-repository';

export class BrandingEngine {
  constructor(
    private llm: LLMAdapter,
    private brandRepo: BrandProfileRepository
  ) {}

  async generateBrandProfile(briefing: Briefing): Promise<BrandProfile> {
    const prompt = this.buildPrompt(briefing);

    try {
      const jsonStr = await this.llm.generateCompletion(prompt);
      const profile = JSON.parse(jsonStr) as BrandProfile;

      // Persist
      await this.brandRepo.create(briefing.clientId, profile);

      return profile;
    } catch (error) {
      console.error('Brand generation failed:', error);
      throw new Error(`Branding failed: ${error.message}`);
    }
  }

  private buildPrompt(briefing: Briefing): string {
    return `
      You are a brand strategist. Analyze this briefing and generate a brand profile.

      Business: ${briefing.businessName}
      Segment: ${briefing.segment}
      Target: ${briefing.targetAudience}
      Voice: ${briefing.voiceTone}
      Differentiators: ${briefing.differentiators}

      Respond with JSON: {
        "colorPalette": { "primary": "#HEX", "secondary": "#HEX", "accent": "#HEX", "neutral": "#HEX" },
        "voiceGuidelines": { "tone": "...", "keywordsToUse": [...], "keywordsToAvoid": [...], "examplePhrases": [...] },
        "visualStyle": "minimalist|bold|playful",
        "fontRecommendations": { "heading": "FontName", "body": "FontName" }
      }
    `;
  }
}
```

### Authentication & Authorization

**For MVP (no user login required):**
- Operator interacts via CLI (developer tools)
- Backend API protected by API key (env var) or IP whitelist (VPS internal)
- RLS at database layer prevents cross-client leakage

**For future (multi-user):**
- Supabase Auth (OAuth or email/password)
- JWT tokens + session management
- Role-based access control (admin, operator, viewer)

```typescript
// Middleware: Verify API key
import { verifyApiKey } from '../middleware/auth';

router.use(verifyApiKey);

// Database: RLS prevents row-level leakage
// Supabase RLS policies enforce client_id matching
```

### Error Handling Strategy

```typescript
// apps/api/middleware/error-handler.ts
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err instanceof ValidationError ? 400 : 500;
  const response = {
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message: err.message,
      ...(process.env.NODE_ENV === 'dev' && { stack: err.stack }),
      timestamp: new Date().toISOString(),
      requestId: req.id,
    },
  };

  res.status(statusCode).json(response);

  // Log for monitoring
  if (statusCode >= 500) {
    logger.error(`[${req.id}] ${err.message}`, { stack: err.stack });
  }
}
```

---

## Unified Project Structure

```
cz-squad/
├── .github/
│   └── workflows/
│       ├── ci.yaml               # Lint → Typecheck → Test on push
│       └── deploy.yaml           # Deploy on merge to main
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── core/
│   │   │   │   ├── briefing/
│   │   │   │   ├── branding/
│   │   │   │   └── copywriting/
│   │   │   ├── systems/
│   │   │   │   ├── content/
│   │   │   │   ├── funwheel/
│   │   │   │   └── sales-page/
│   │   │   ├── routes/
│   │   │   │   ├── briefings.ts
│   │   │   │   ├── content.ts
│   │   │   │   ├── funwheel.ts
│   │   │   │   ├── leads.ts
│   │   │   │   └── health.ts
│   │   │   ├── services/
│   │   │   │   ├── briefing.ts
│   │   │   │   ├── branding.ts
│   │   │   │   ├── content-pipeline.ts
│   │   │   │   ├── funwheel-pipeline.ts
│   │   │   │   └── sales-page-pipeline.ts
│   │   │   ├── integrations/
│   │   │   │   ├── supabase.ts
│   │   │   │   ├── llm-adapter.ts
│   │   │   │   ├── n8n-webhook.ts
│   │   │   │   └── evolution-api.ts
│   │   │   ├── middleware/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── validation.ts
│   │   │   │   └── error-handler.ts
│   │   │   ├── utils/
│   │   │   │   ├── logger.ts
│   │   │   │   ├── config.ts
│   │   │   │   └── token-counter.ts
│   │   │   └── index.ts           # Express app entry
│   │   ├── tests/
│   │   │   ├── unit/
│   │   │   └── integration/
│   │   ├── Dockerfile
│   │   ├── .env.example
│   │   └── package.json
│   └── pages/
│       ├── src/
│       │   ├── components/
│       │   ├── layouts/
│       │   ├── pages/
│       │   │   ├── funwheel/[clientSlug]/
│       │   │   │   ├── a.astro
│       │   │   │   ├── r.astro
│       │   │   │   └── t.astro
│       │   │   └── vendas/[clientSlug].astro
│       │   ├── lib/
│       │   └── styles/
│       ├── public/
│       ├── astro.config.mjs
│       ├── .env.example
│       └── package.json
├── packages/
│   ├── shared/
│   │   ├── src/
│   │   │   ├── types/
│   │   │   │   ├── index.ts          # All TypeScript interfaces
│   │   │   │   ├── client.ts
│   │   │   │   ├── briefing.ts
│   │   │   │   ├── brand.ts
│   │   │   │   ├── content.ts
│   │   │   │   ├── funwheel.ts
│   │   │   │   ├── lead.ts
│   │   │   │   └── project.ts
│   │   │   ├── constants/
│   │   │   │   └── index.ts
│   │   │   ├── llm/
│   │   │   │   ├── adapter.ts        # Abstract interface
│   │   │   │   ├── claude.ts         # Claude implementation
│   │   │   │   └── fallback.ts       # Fallback provider
│   │   │   ├── utils/
│   │   │   │   ├── validation.ts     # zod schemas
│   │   │   │   ├── formatting.ts
│   │   │   │   └── logger.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── ui/ (not used MVP)
├── scripts/
│   ├── setup-db.ts              # Supabase migration runner
│   ├── seed-db.ts               # Test data seeding
│   └── build-pages.ts           # Astro build wrapper
├── .env.example
├── .gitignore
├── docker-compose.yml           # Local dev stack
├── package.json                 # Root workspaces
├── tsconfig.json                # Shared TypeScript config
├── tsconfig.paths.json
├── .eslintrc.js
├── prettier.config.js
├── vitest.config.ts             # Test runner config
├── README.md
└── docs/
    ├── prd.md
    ├── architecture.md           # This file
    └── n8n-workflows/
        ├── master-pipeline.json
        ├── lead-webhook.json
        └── README.md
```

---

## Development Workflow

### Local Development Setup

**Prerequisites:**
- Node.js 20+
- Docker & Docker Compose
- PostgreSQL client tools (psql)
- Supabase CLI (optional, for local migrations)

**Initial Setup:**

```bash
# 1. Clone repo
git clone https://github.com/copyzen/cz-squad.git
cd cz-squad

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env.local

# Edit .env.local with:
# ANTHROPIC_API_KEY=sk-...
# SUPABASE_URL=https://xxx.supabase.co
# SUPABASE_ANON_KEY=eyJxxx
# N8N_API_URL=http://localhost:5679

# 4. Start local Supabase (optional, for offline dev)
supabase start

# 5. Run database migrations
npm run db:migrate

# 6. Seed test data
npm run db:seed
```

**Development Commands:**

```bash
# Start all services (API + Astro pages)
npm run dev

# Start only API
npm run dev:api      # localhost:3000

# Start only Astro (pages)
npm run dev:pages    # localhost:3001

# Run tests
npm test             # All tests
npm run test:watch   # Watch mode
npm run test:api     # API only
npm run test:pages   # Frontend only

# Linting & type checking
npm run lint
npm run typecheck

# Build for production
npm run build        # Both API + pages
npm run build:api
npm run build:pages

# Database utilities
npm run db:migrate
npm run db:seed
npm run db:reset     # ⚠️ Danger: drops all data
```

### Environment Configuration

```bash
# .env.local (git-ignored, never commit)

# LLM
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_MODEL=claude-opus-4

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx     # Backend only

# n8n
N8N_API_URL=http://n8n.vps/api
N8N_API_KEY=xxx

# Evolution (WhatsApp)
EVOLUTION_API_URL=http://evolution.vps/api
EVOLUTION_INSTANCE_NAME=copyzen

# Frontend (public env, prefixed PUBLIC_)
PUBLIC_API_URL=http://localhost:3000 (dev) | https://api.copyzen.com.br (prod)

# Development
NODE_ENV=development
LOG_LEVEL=debug
```

---

## Deployment Architecture

### Frontend Deployment (Pages)

**Option A: Vercel (Recommended)**
```bash
# Deploy Astro app to Vercel
vercel deploy ./apps/pages

# Automatic on push to main
# Output: https://cz-pages.vercel.app (preview), https://vendas.copyzen.com.br (production)
```

**Option B: Docker on VPS**
```dockerfile
# apps/pages/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build:pages

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/apps/pages/dist ./dist
EXPOSE 3001
CMD ["npm", "run", "start:pages"]
```

### Backend Deployment (API)

**Docker Swarm Stack (existing VPS)**

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  copyzen-api:
    image: copyzen-api:1.0.0
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    environment:
      NODE_ENV: production
      SUPABASE_URL: ${SUPABASE_URL}
      ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY}
    ports:
      - "3000:3000"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      replicas: 2
      restart_policy:
        condition: on-failure
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

**Deployment:**

```bash
# 1. Build image
docker build -t copyzen-api:1.0.0 -f apps/api/Dockerfile .

# 2. Push to registry (private Docker Hub or Harbor)
docker tag copyzen-api:1.0.0 registry.copyzen.com.br/copyzen-api:1.0.0
docker push registry.copyzen.com.br/copyzen-api:1.0.0

# 3. Deploy to Swarm
docker stack deploy -c docker-compose.prod.yml copyzen
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yaml
name: CI

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test

  deploy:
    needs: [lint, typecheck, test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: |
          docker build -t copyzen-api:${{ github.sha }} -f apps/api/Dockerfile .
          docker push registry.copyzen.com.br/copyzen-api:${{ github.sha }}
      - run: |
          ssh deploy@vps.copyzen.com.br \
            "docker stack deploy -c docker-compose.prod.yml copyzen"
```

### Environments

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|------------|-----------|---------|
| **Development** | http://localhost:3001 | http://localhost:3000 | Local development |
| **Staging** | https://staging-pages.vercel.app | https://staging-api.copyzen.com.br | Pre-production testing |
| **Production** | https://vendas.copyzen.com.br, https://funwheel.copyzen.com.br | https://api.copyzen.com.br | Live customer environment |

---

## Security & Performance

### Security Requirements

**Frontend:**
- CSP Headers: `default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'`
- XSS Prevention: Astro auto-escapes by default; DOMPurify for user-generated content
- Form Validation: Client-side (UX) + Server-side (security)
- HTTPS only in production

**Backend:**
- Input Validation: zod schema validation on all endpoints
- Rate Limiting: 100 requests/min per IP (n8n webhooks whitelisted)
- CORS: Allow frontend origin only
- HTTPS only in production
- API Key authentication for service-to-service calls
- Never log sensitive data (passwords, tokens, API keys)

**Database:**
- RLS policies enforce multi-tenancy at row level
- Encrypted secrets in `.env` (never committed)
- Regular backups via Supabase
- SQL injection prevention: Parameterized queries (Supabase client handles this)

**LLM Integration:**
- No sensitive user data in prompts (strip email, phone from briefing)
- Prompt injection prevention: Validate user input before passing to Claude
- Monitor token usage to detect misuse

**Authentication (MVP):**
- API key for CLI operator (env var `OPERATOR_API_KEY`)
- Supabase RLS for database access
- Future: OAuth login + JWT sessions

### Performance Optimization

**Frontend:**
- Astro SSG: Zero JavaScript for static content
- CSS Custom Properties for branding: No runtime CSS generation
- Image optimization: Use Astro's native image component
- Bundle size target: <50KB gzipped per page
- Lighthouse target: > 90 (performance, accessibility, best practices)
- Load time target: < 2s on 4G (150 Mbps, 400ms RTT)

**Backend:**
- Response time target: < 500ms p95 (excluding LLM generation)
- Database query optimization:
  - Indexes on frequently queried columns (`client_id`, `status`)
  - Connection pooling via Supabase
  - N+1 query prevention via explicit SELECT fields
- LLM generation (60s max): Async via n8n, not blocking requests
- Caching strategy:
  - Brand profiles: Cache in-memory (1h TTL)
  - Generated content: Cache in Supabase (immutable once approved)

**Scaling (Future):**
- Database: Supabase scales horizontally (standard → dedicated plans)
- Backend: Multiple API instances via Docker Swarm
- Frontend: Vercel Edge Network caches pages globally
- CDN: Cloudflare for additional caching layer

---

## Testing Strategy

### Testing Pyramid

```
                 E2E Tests
              /            \
         Integration Tests
            /              \
    Frontend Unit        Backend Unit
```

### Test Organization

**Backend Unit Tests:**
```
apps/api/tests/unit/
├── services/
│   ├── briefing.test.ts
│   ├── branding.test.ts
│   ├── content-pipeline.test.ts
│   ├── funwheel-pipeline.test.ts
│   └── sales-page-pipeline.test.ts
├── utils/
│   ├── token-counter.test.ts
│   └── validation.test.ts
└── integrations/
    └── llm-adapter.test.ts (mock Claude)
```

**Backend Integration Tests:**
```
apps/api/tests/integration/
├── routes/
│   ├── briefings.test.ts        # Happy path + error cases
│   ├── content.test.ts          # Content generation end-to-end
│   ├── funwheel.test.ts
│   ├── leads.test.ts
│   └── sales-page.test.ts
└── supabase/
    └── rls-policies.test.ts     # RLS enforcement
```

**Frontend Component Tests:**
```
apps/pages/tests/
├── components/
│   ├── LeadForm.test.ts
│   └── HeroSection.test.ts
└── pages/
    ├── funwheel-a.test.ts
    ├── funwheel-r.test.ts
    ├── funwheel-t.test.ts
    └── sales-page.test.ts
```

**E2E Tests:**
```
tests/e2e/
├── briefing-to-delivery.spec.ts      # Full pipeline: briefing → all 3 systems
├── lead-capture.spec.ts              # Lead capture + qualification flow
└── cross-browser.spec.ts             # Chrome, Safari, Firefox
```

### Test Examples

**Backend Unit Test (Branding Engine):**
```typescript
// apps/api/tests/unit/services/branding.test.ts
import { describe, it, expect, vi } from 'vitest';
import { BrandingEngine } from '../../../src/services/branding';
import { MockLLMAdapter } from '../mocks/llm-adapter';

describe('BrandingEngine', () => {
  it('generates brand profile from briefing', async () => {
    const mockLLM = new MockLLMAdapter({
      response: JSON.stringify({
        colorPalette: { primary: '#06164A', secondary: '#6220FF', accent: '#ED145B', neutral: '#999' },
        voiceGuidelines: { tone: 'consultive', keywordsToUse: ['transformação'], keywordsToAvoid: [] },
      }),
    });
    const engine = new BrandingEngine(mockLLM);

    const briefing = {
      businessName: 'Clínica Silva',
      segment: 'health',
      targetAudience: 'Mulheres 30-50',
      voiceTone: 'conversational',
      differentiators: 'Atendimento personalizado',
    };

    const profile = await engine.generateBrandProfile(briefing);

    expect(profile.colorPalette.primary).toBe('#06164A');
    expect(profile.voiceGuidelines.tone).toBe('consultive');
  });
});
```

**Integration Test (Briefing Approval Workflow):**
```typescript
// apps/api/tests/integration/routes/briefings.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import { app } from '../../../src/index';

describe('Briefing Approval Workflow', () => {
  it('triggers n8n webhook on briefing approval', async () => {
    const res = await app.request('/briefings/approve', {
      method: 'POST',
      body: JSON.stringify({ briefingId: 'test-id' }),
    });

    expect(res.status).toBe(200);
    // Assert n8n webhook was called (mock n8n or use nock)
  });
});
```

**E2E Test (Lead Capture):**
```typescript
// tests/e2e/lead-capture.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Lead Capture (Etapa R)', () => {
  test('captures lead and generates PDF', async ({ page }) => {
    // Navigate to funwheel/a → click CTA → funwheel/r
    await page.goto('http://localhost:3001/funwheel/copyzen/r');

    // Fill form
    await page.fill('input[name="name"]', 'João Silva');
    await page.fill('input[name="email"]', 'joao@example.com');
    await page.fill('input[name="phone"]', '11999999999');
    await page.check('input[name="consent"]');

    // Submit
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button[type="submit"]'),
    ]);

    expect(download.suggestedFilename()).toMatch(/lead-magnet.*\.pdf/);

    // Verify lead in database
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    const { data } = await supabase.from('leads').select('*').eq('email', 'joao@example.com');
    expect(data).toHaveLength(1);
  });
});
```

---

## Coding Standards

### Critical Full-Stack Rules

1. **Type Sharing:** All TypeScript interfaces defined in `packages/shared/types/`. Import from there in both frontend and backend. Never duplicate types.

2. **API Calls:** Never make direct `fetch()` calls outside of `api-client.ts` (frontend) or routes (backend). Use service layer.

3. **Environment Variables:** Access only through `config.ts` object. Never `process.env.FOO` directly. Use zod validation.

4. **Error Handling:** All routes MUST use try/catch + error middleware. Errors MUST NOT expose internals (stack traces, DB errors) in production.

5. **State Updates:** No mutation of database objects. Always use repository pattern + immutable updates.

6. **Validation:** Schema validation with zod at API boundaries (routes, form submit). Don't trust user input.

7. **Logging:** Use structured logging (winston or pino). Never log sensitive data (passwords, tokens, emails).

8. **Testing:** Every new service MUST have unit tests. Integration tests for critical workflows.

9. **Comments:** Code should be self-documenting. Comments only for "why" not "what".

10. **Secrets:** Never hardcode secrets. Use `.env` + `.env.example` (without values).

### Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| TypeScript files | camelCase | `briefingService.ts` |
| Interfaces | PascalCase | `interface Briefing {...}` |
| Functions (service) | camelCase | `generateBrandProfile()` |
| Routes/API paths | kebab-case | `POST /briefings/approve` |
| Database tables | snake_case | `brand_profiles` |
| Database columns | snake_case | `color_palette`, `created_at` |
| React/Astro components | PascalCase | `LeadForm.astro`, `HeroSection.tsx` |
| CSS classes | kebab-case | `.lead-form`, `.hero-section` |
| Environment variables | SCREAMING_SNAKE_CASE | `ANTHROPIC_API_KEY` |

---

## Error Handling Strategy

### Error Flow

```
User Input → Route Handler → Service → Repository
     ↓              ↓            ↓          ↓
Validation   Route Logic   Business    DB Query
     ↓              ↓            ↓          ↓
Error?      Error?       Error?       Error?
     ↓              ↓            ↓          ↓
400      →    403/500   →   400/500   →   5xx
```

### Standard Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": {
      "field": "email",
      "rule": "required"
    },
    "timestamp": "2026-02-24T12:00:00Z",
    "requestId": "abc-123"
  }
}
```

### Error Codes & HTTP Status

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `UNAUTHORIZED` | 401 | Missing/invalid API key |
| `FORBIDDEN` | 403 | Client can't access this resource |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `RATE_LIMITED` | 429 | Too many requests |
| `LLM_ERROR` | 503 | Claude API unavailable (fallback triggered) |
| `INTERNAL_ERROR` | 500 | Server error (logged, not exposed to client) |

### Frontend Error Handling

```typescript
// apps/pages/src/lib/api-client.ts
export async function submitLead(data: LeadInput) {
  try {
    const res = await fetch(`${API_URL}/leads`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const error = await res.json();
      if (res.status === 400) {
        throw new ValidationError(error.error.message);
      } else if (res.status === 429) {
        throw new RateLimitError('Too many submissions. Try again later.');
      } else {
        throw new Error(`Lead submission failed (${res.status})`);
      }
    }

    return res.json();
  } catch (err) {
    // User-facing error message
    console.error('Lead submission error:', err);
    throw err;
  }
}
```

### Backend Error Handling

```typescript
// apps/api/middleware/error-handler.ts
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log for debugging
  logger.error(`[${req.id}] ${err.message}`, {
    path: req.path,
    method: req.method,
    stack: process.env.NODE_ENV === 'dev' ? err.stack : undefined,
  });

  // Don't expose internals to client
  const statusCode = getStatusCode(err);
  const message = getClientMessage(err);

  res.status(statusCode).json({
    error: {
      code: getErrorCode(err),
      message,
      timestamp: new Date().toISOString(),
      requestId: req.id,
    },
  });
}

function getStatusCode(err: Error): number {
  if (err instanceof ValidationError) return 400;
  if (err instanceof ForbiddenError) return 403;
  if (err instanceof NotFoundError) return 404;
  return 500;
}

function getClientMessage(err: Error): string {
  if (err instanceof ValidationError) return err.message;
  if (process.env.NODE_ENV === 'production') {
    return 'An error occurred. Please try again later.';
  }
  return err.message;
}
```

---

## Monitoring & Observability

### Monitoring Stack

- **Frontend Monitoring:** Sentry (error tracking + performance)
- **Backend Monitoring:** Custom structured logs (Winston) → ELK Stack (optional)
- **Error Tracking:** Sentry unified (frontend + backend)
- **Performance Monitoring:** Vercel Analytics (frontend), custom metrics (backend)
- **Uptime Monitoring:** Pingdom or similar (health check endpoint)

### Key Metrics

**Frontend:**
- Lighthouse Performance Score (target: >90)
- Core Web Vitals (LCP, FID, CLS)
- JavaScript errors (Sentry)
- API response times (from browser)
- Form submission success rate

**Backend:**
- Request latency (p50, p95, p99)
- Error rate by endpoint
- LLM token usage (cost tracking)
- Database query performance (slow logs)
- API key/rate limit violations

**Business:**
- Projects completed (per day/month)
- Tokens consumed (cost analysis)
- Lead capture rate
- Lead qualification distribution (hot/warm/cold)

---

## Checklist Results Report

### Architecture Readiness: ✅ APPROVED

| Category | Status | Notes |
|----------|--------|-------|
| **Technical Summary** | ✅ | Clear vision: monorepo, Astro SSG, Claude LLM, Supabase RLS |
| **Platform & Infrastructure** | ✅ | VPS + Vercel + Supabase → cost-effective, scalable |
| **Repository Structure** | ✅ | Monorepo (npm workspaces), clear separation of concerns |
| **Data Models** | ✅ | 8 core entities, relationships mapped, TypeScript interfaces ready |
| **API Specification** | ✅ | RESTful endpoints defined, examples provided |
| **Components** | ✅ | 7 backend services, 4 frontend layouts, integrations clear |
| **Workflows** | ✅ | 3 core workflows diagrammed (briefing→delivery, lead capture, qualification) |
| **Database Schema** | ✅ | PostgreSQL DDL complete, RLS policies defined, indexes planned |
| **Frontend Architecture** | ✅ | Astro SSG, component org, routing, state management (none needed MVP) |
| **Backend Architecture** | ✅ | Service layer, repository pattern, error handling, LLM adapter |
| **Project Structure** | ✅ | Monorepo layout with clear boundaries |
| **Development Workflow** | ✅ | Local setup, commands, env config documented |
| **Deployment** | ✅ | Vercel (frontend), Docker Swarm (backend), CI/CD pipeline |
| **Security** | ✅ | RLS, input validation, API auth, no secrets in code |
| **Performance** | ✅ | Lighthouse >90, <2s load, response time targets defined |
| **Testing** | ✅ | Unit + integration + E2E pyramid, examples provided |
| **Coding Standards** | ✅ | 10 critical rules, naming conventions, type sharing |
| **Error Handling** | ✅ | Unified error format, status codes, middleware strategy |
| **Monitoring** | ✅ | Sentry, structured logs, key metrics identified |

### Open Decisions (Delegated)

1. **Frontend Hosting:** Vercel recommended, Docker on VPS as fallback — @devops to finalize
2. **n8n Workflow Details:** Master pipeline JSON to be created during Epic 1 implementation — @dev
3. **Monitoring/Alerting:** Sentry setup + email alerts — @devops
4. **Load Testing:** Benchmark under 10-concurrent-clients before MVP release — @qa

---

## Next Steps

### Phase 1: Foundation (Epic 1)
1. **@dev:** Implement monorepo scaffold + Docker setup
2. **@dev:** Create Supabase schema + RLS policies
3. **@dev:** Build briefing module + API endpoints
4. **@dev:** Implement branding engine (Claude integration)
5. **@dev:** Build copywriting agent
6. **@devops:** Deploy first API version to VPS Swarm
7. **@dev:** Create n8n master workflow

### Phase 2: Content System (Epic 2)
1. **@dev:** Implement content strategy module
2. **@dev:** Build carousel + image post generators
3. **@dev:** Create visual briefing specs
4. **@devops:** Deploy Astro pages to Vercel
5. **@dev:** Create n8n content pipeline workflow

### Phase 3: FunWheel (Epic 3)
1. **@dev:** Build EtapaA (landing page) generator
2. **@dev:** Build EtapaR (lead capture form) + PDF generation
3. **@dev:** Build EtapaT (qualification quiz) + scoring
4. **@dev:** Implement lead webhook + Evolution integration
5. **@dev:** Create n8n lead pipeline workflow

### Phase 4: Sales Page & MVP Validation (Epic 4)
1. **@dev:** Build sales page generator (long-form)
2. **@dev:** Implement project orchestration
3. **@dev:** Create operator review/approval flow
4. **@dev:** Execute self-dogfooding (CopyZen as first client)
5. **@qa:** Full MVP validation (Lighthouse, performance, lead capture)

---

**Prepared by:** Aria (Architect Agent)
**Approved for Development:** 2026-02-24
**Architecture Version:** 1.0 (Stable)

---

_Document Status: APPROVED FOR IMPLEMENTATION_
_Next Review: After Epic 1 completion (end of March 2026)_
