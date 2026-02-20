# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Synkra AIOS** (v4.31.1) — a meta-framework that orchestrates AI agents to handle complex full-stack development workflows. The framework itself lives in `.aios-core/`; project work lives in `docs/` and `src/` (or equivalent app directories).

## Commands

All commands run from `.aios-core/`:

```bash
npm run build          # node ../tools/build-core.js
npm run test           # unit + integration (jest)
npm run test:unit      # jest tests/unit
npm run test:integration # jest tests/integration
npm run lint           # eslint
npm run typecheck      # tsc --noEmit
```

Framework/IDE sync commands (run from repo root):

```bash
npm run sync:ide            # sync IDE configurations
npm run sync:ide:check      # validate IDE sync
npm run validate:structure  # validate project structure
npm run validate:agents     # validate agent definitions
```

All four quality gates must pass before any story is marked Done: `lint`, `typecheck`, `test`, `build`.

## Architecture

```
.aios-core/               # Framework core (do not modify without @architect approval)
├── cli/                  # CLI entry point — `aios-core` bin
├── core/                 # Runtime: MetaAgent, TaskManager, ElicitationEngine
├── development/
│   ├── agents/           # Agent persona definitions (YAML/Markdown)
│   ├── tasks/            # 115+ executable task definitions
│   └── workflows/        # Multi-step workflow templates
├── infrastructure/       # GitWrapper, TemplateEngine, SecurityChecker, etc.
└── product/              # Templates, checklists

.claude/rules/            # Claude Code execution rules (loaded automatically)
docs/
├── stories/              # All development stories (source of truth for work)
├── prd/                  # Product requirement documents
└── architecture/         # ADRs and system design
```

**Layered dependency order (imports must flow top→bottom):**
`infrastructure/` → `core/` → `development/` → `product/`

## Constitution (Non-Negotiable Rules)

1. **CLI First** — Every feature works 100% via CLI before any UI is built. `CLI > Observability > UI`.
2. **Agent Authority** — Only `@devops` can `git push`, create PRs, create releases/tags. Only `@sm`/`@po` can create stories. Only `@architect` makes architecture decisions. Only `@qa` issues quality verdicts. Agents never assume another agent's authority.
3. **Story-Driven** — No code is written without an associated story in `docs/stories/`. Stories need acceptance criteria before implementation starts. Track progress via checkboxes; keep the File List updated.
4. **No Invention** — Every spec statement must trace to a requirement (FR-*, NFR-*), constraint (CON-*), or verified research finding. Do not add features not in the requirements.

## Agent System

Activate agents with `@agent-name`; use `*` prefix for commands; exit with `*exit`.

| Shortcut | Agent | Exclusive Authority |
|----------|-------|---------------------|
| `@aios-master` | Orchestrator | Overall coordination |
| `@architect` | Architect | Architecture decisions |
| `@dev` | Developer | Implementation |
| `@devops` | DevOps | git push, PRs, releases |
| `@qa` | QA | Quality verdicts |
| `@po` / `@sm` | Product Owner / Scrum Master | Story creation |
| `@pm` | Project Manager | — |
| `@analyst` | Business Analyst | — |
| `@data-engineer` | Data Engineer | — |
| `@ux-design-expert` | UX Designer | — |

Agent files live in `.aios-core/development/agents/`.

Common agent commands: `*help`, `*create-story`, `*task {name}`, `*workflow {name}`.

## MCP Servers

MCP infrastructure is managed exclusively by `@devops`. Other agents are consumers only.

- **playwright** — browser automation (Claude Code global config)
- **desktop-commander (docker-gateway)** — Docker container operations
- **EXA** (via docker-gateway) — web search
- **Context7** (via docker-gateway) — library docs
- **Apify** (via docker-gateway) — web scraping

Always prefer native Claude Code tools (`Read`, `Write`, `Bash`, `Grep`, `Glob`) over docker-gateway for local file/command operations.

## Environment Variables

See `.env.example` for required variables:
- LLM: `DEEPSEEK_API_KEY`, `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
- Search: `EXA_API_KEY`
- Database: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Git Conventions

Conventional commits referencing story ID: `feat: implement X [Story 2.1]`
