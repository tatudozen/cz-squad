# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Synkra AIOS** (v4.31.1) — a meta-framework that orchestrates AI agents to handle complex full-stack development workflows. The framework itself lives in `.aios-core/`; project work lives in `docs/` and `src/` (or equivalent app directories).

## Quick Start

All commands run from `.aios-core/` unless otherwise noted:

```bash
# Testing & Quality (run from .aios-core/)
npm run test                      # Run all tests (unit + integration)
npm run test:unit                 # Unit tests only
npm run test:integration          # Integration tests only
npm run test -- --watch           # Watch mode for development
npm run lint                       # ESLint check
npm run typecheck                  # TypeScript check
npm run build                      # Build framework (node ../tools/build-core.js)

# Framework/IDE Sync (run from repo root)
npm run sync:ide                  # Sync IDE configurations
npm run sync:ide:check            # Validate IDE sync
npm run validate:structure         # Validate project structure
npm run validate:agents            # Validate agent definitions
```

**Quality Gates:** All four gates must pass before marking a story Done: `lint` → `typecheck` → `test` → `build`.

## Architecture Overview

The framework uses **strict layered architecture** where each layer can only import from layers below it:

```
.aios-core/
├── cli/                  # CLI entry point — bin/aios-core.js
├── infrastructure/       # Bottom layer: Git, templates, security, utilities
├── core/                 # Middle: Config, elicitation, session management
├── development/          # Mid-upper: Agents (11), tasks (115+), workflows (7)
└── product/              # Top: Templates, checklists, documentation

.claude/rules/           # Claude Code execution rules (auto-loaded)
docs/
├── stories/             # Development stories (source of truth)
├── prd/                 # Product requirements
└── architecture/        # ADRs and system design
```

**Dependency Flow:** `product/` imports → `development/` → `core/` → `infrastructure/`
(Reverse imports = architecture violation)

### Key Directories

| Directory | Purpose | Modification |
|-----------|---------|--------------|
| `.aios-core/` | AIOS framework core | Requires `@architect` approval for changes |
| `core/` | Runtime components (config, elicitation, sessions) | Implementation changes require testing |
| `development/agents/` | 11 AI agent personas (YAML/Markdown files) | Agent behavior changes via `@agent-name` |
| `development/tasks/` | 115+ executable task definitions | Task workflow changes via story implementation |
| `development/workflows/` | Multi-step development workflows | Workflow orchestration via `@aios-master` |
| `infrastructure/` | Git, templates, security, utilities | Base layer — changes impact all above |
| `docs/stories/` | Development work tracking (source of truth) | Updated by @dev during implementation |
| `.claude/rules/` | Agent authority, story lifecycle, workflow execution | Read-only reference for behavior |

## Constitution (Non-Negotiable)

1. **CLI First** — Feature works 100% via CLI before UI. `CLI > Observability > UI`.
2. **Agent Authority** — Only `@devops` pushes code; only `@sm`/`@po` create stories; only `@architect` decides architecture; only `@qa` approves quality. Agents never exceed their authority.
3. **Story-Driven** — All code must be associated with a story in `docs/stories/`. Stories require acceptance criteria before implementation starts. Track progress with checkboxes; maintain File List.
4. **No Invention** — Every feature/spec must trace to FR-*, NFR-*, CON-* requirements or research findings. Zero invented scope.

## IDS: Incremental Development Principles

Before creating new code/artifacts, consult the entity registry: **REUSE > ADAPT > CREATE**

| Decision | Threshold | Action |
|----------|-----------|--------|
| **REUSE** | Relevance ≥90% | Use existing artifact as-is (no justification needed) |
| **ADAPT** | Relevance 60-89% | Modify existing (≤30% changes, don't break consumers, document) |
| **CREATE** | No suitable match | Create new artifact (required: evaluated_patterns, rejection_reasons, new_capability; register within 24h) |

This prevents duplicate patterns and keeps the codebase coherent.

## Agent System & Authority

Activate agents with `@agent-name`; use `*` prefix for commands; exit with `*exit`.

| Agent | ID | Exclusive Authority |
|-------|-----|---------------------|
| AIOS Master | `@aios-master` | Framework governance, override when necessary |
| Architect | `@architect` | Architecture decisions, technology selection |
| Developer | `@dev` | Story implementation, code changes (no git push) |
| DevOps | `@devops` | git push, PRs, releases/tags, MCP management |
| QA | `@qa` | Quality verdicts, review gates |
| Product Owner | `@po` | Story validation (10-point checklist), backlog prioritization |
| Scrum Master | `@sm` | Story creation, sprint management |
| Project Manager | `@pm` | Epic creation, epic orchestration |
| Analyst | `@analyst` | Requirements analysis, research |
| Data Engineer | `@data-engineer` | Database schema, query optimization (delegated from @architect) |
| UX Designer | `@ux-design-expert` | Frontend/UX architecture, design decisions |

**Agent files:** `.aios-core/development/agents/` (11 persona definitions)
**Common commands:** `*help`, `*create-story`, `*task {name}`, `*workflow {name}`, `*exit`

See `.claude/rules/agent-authority.md` for detailed delegation matrix.

## Story Lifecycle

Development is story-driven. Stories follow this progression:

```
Draft → Ready → InProgress → InReview → Done
```

| Phase | Agent | Task | Output |
|-------|-------|------|--------|
| 1. Create | @sm | `create-next-story.md` | `{epicNum}.{storyNum}.story.md` in Draft |
| 2. Validate | @po | `validate-next-story.md` (10-point checklist) | Status → Ready (if ≥7/10) |
| 3. Implement | @dev | `dev-develop-story.md` (interactive/YOLO/pre-flight modes) | Status → InProgress, File List updated |
| 4. QA Gate | @qa | `qa-gate.md` (7 quality checks) | Verdict: PASS/CONCERNS/FAIL/WAIVED; Status → Done |

See `.claude/rules/story-lifecycle.md` for detailed checkpoints and phase definitions.

## Testing & Development Workflow

### Running Tests

```bash
cd .aios-core/

# Full test suite
npm run test

# Watch mode (rerun on changes)
npm run test -- --watch

# Run specific test file
npm run test -- create-story.test.js

# Run tests matching a pattern
npm run test -- --testNamePattern="Story Creation"

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration
```

### Development Cycle with CodeRabbit

In the **dev phase** (story phase 3), self-healing runs automatically:

```
Implement code → CodeRabbit (max 2 iterations)
  ├─ CRITICAL found → auto-fix (iteration < 2) → Re-run CodeRabbit
  └─ HIGH found → auto-fix or document as tech debt
After 2 iterations with CRITICAL → HALT (manual intervention needed)
```

In the **QA phase** (story phase 4), CodeRabbit runs before merge with stricter rules (max 3 iterations, auto-fix both CRITICAL and HIGH).

See `.claude/rules/coderabbit-integration.md` for detailed configuration.

### Quality Gate Checklist

All **four** gates must pass sequentially before marking story Done:

1. **Lint** (`npm run lint`) — Code style consistency
2. **TypeScript** (`npm run typecheck`) — Type safety
3. **Tests** (`npm run test`) — All passing, adequate coverage
4. **Build** (`npm run build`) — Framework builds without error

### Updating Story Files

| Section | Who Updates |
|---------|------------|
| Title, Description, AC, Scope | @po only |
| File List, Dev Notes, checkboxes | @dev (during implementation) |
| QA Results | @qa only |
| Change Log | Any agent (append-only) |

## Development Patterns

### Working with Agents

Agents are loaded from `.aios-core/development/agents/`. Each agent has:
- **Persona** — tone, expertise, communication style
- **Authority** — exclusive permissions
- **Commands** — `*create-story`, `*task`, `*workflow`, etc.
- **Context** — access to stories, tasks, workflows

Example:
```javascript
const agentDef = require('./.aios-core/development/agents/dev.md');
// Parse YAML frontmatter, render greeting, assume persona until *exit
```

### Working with Tasks

Tasks are Markdown files in `.aios-core/development/tasks/` with YAML frontmatter:

```yaml
---
id: create-story
executedBy: sm
inputs: [prId, epicContext]
outputs: [storyFile]
---

# Task: Create Story

...execution steps...
```

### Working with Workflows

7 workflow templates in `.aios-core/development/workflows/`:
- `greenfield-fullstack.yaml` — New full-stack project
- `greenfield-service.yaml` — New backend service
- `greenfield-ui.yaml` — New frontend project
- `brownfield-fullstack.yaml` — Enhance full-stack
- `brownfield-service.yaml` — Enhance backend
- `brownfield-ui.yaml` — Enhance frontend

Execute via `@aios-master *workflow {name}` or programmatically.

## MCP & Tool Usage

MCP infrastructure (managed exclusively by `@devops`):
- **playwright** — Browser automation (Claude Code global config)
- **desktop-commander** — Docker container operations
- **EXA** — Web search (via docker-gateway)
- **Context7** — Library documentation (via docker-gateway)
- **Apify** — Web scraping/Actors (via docker-gateway)

**Always prefer native Claude Code tools for local operations:**
- `Read`, `Write`, `Edit` — File operations (not docker-gateway)
- `Bash` — Command execution (not docker-gateway)
- `Grep` — Content search (never use shell grep)
- `Glob` — File pattern matching (never use find)

See `.claude/rules/mcp-usage.md` for detailed tool selection matrix.

## Environment Variables

See `.env.example` for required variables:
- **LLM:** `DEEPSEEK_API_KEY`, `OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
- **Search:** `EXA_API_KEY`
- **Database:** `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Git Conventions

Use conventional commits with story reference:

```bash
git commit -m "feat: implement X [Story 2.1]"
git commit -m "fix: resolve bug Y [Story 3.4]"
git commit -m "docs: update architecture [Story 1.2]"
```

Only `@devops` can push. Other agents use `*push` command to delegate.

## References

- **Agent Authority Rules:** `.claude/rules/agent-authority.md`
- **Story Lifecycle:** `.claude/rules/story-lifecycle.md`
- **Workflow Execution:** `.claude/rules/workflow-execution.md`
- **CodeRabbit Integration:** `.claude/rules/coderabbit-integration.md`
- **IDS Principles:** `.claude/rules/ids-principles.md`
- **MCP Usage:** `.claude/rules/mcp-usage.md`
- **Agent Development:** `.aios-core/development/README.md`
- **Core Module:** `.aios-core/core/README.md`
