# CopyZen Deploy via Portainer - Guia Visual (100% UI)

Guia completo para fazer deploy da stack CopyZen usando **apenas** a interface gráfica do Portainer.

## 📋 Pré-requisitos

✅ Portainer rodando na VPS
✅ Docker Swarm inicializado
✅ Rede `AZ_Net` criada
✅ Traefik configurado e rodando
✅ Imagem Docker em `docker-compose.portainer.yml` disponível no repositório

## 🚀 Fluxo Automático (CI/CD)

### Etapa 1: Build Automático via GitHub

**Como funciona:**

```
1. Você faz: git push → main
   ↓
2. GitHub Actions dispara automaticamente:
   - Executa testes (lint, typecheck, test)
   - Constrói imagem Docker: copyzen-api:latest
   - Faz push para docker.io (seu registry)
   ↓
3. Imagem está pronta em: docker.io/seu-username/copyzen-api:latest
```

**Status dos builds:**
- Acesse: https://github.com/tatudozen/cz-squad/actions
- Procure por "Deploy" workflow
- Veja o status: ✅ Sucesso ou ❌ Falha

### Etapa 2: Deploy via Portainer UI (Manual)

Depois que a imagem está pronta, faça o deploy no Portainer:

## 📊 Passo-a-Passo Visual

### 1️⃣ Acessar Portainer

```
URL: https://seu-portainer.com
├─ Faça login
└─ Clique em "Home" ou "Endpoints"
   └─ Selecione seu Docker Swarm (manager node)
```

**Tela esperada:**
```
Portainer Home
├─ Dashboard com status dos containers
├─ Lado esquerdo: Menu de navegação
└─ Status: Green (Connected)
```

---

### 2️⃣ Criar Nova Stack

**Caminho no Portainer:**
```
Portainer Home
  ↓
Stacks (menu esquerdo)
  ↓
"Add Stack" (botão azul no topo)
```

**Tela que aparece:**
```
┌─────────────────────────────────────┐
│ Create Stack                        │
├─────────────────────────────────────┤
│ Name: copyzen                       │
│                                     │
│ Stack type: Docker Swarm            │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [Web editor]  [Upload]  [URL]   │ │ ← CLIQUE EM [Web editor]
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [Área para colar YAML]          │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Cancel]               [Deploy]     │
└─────────────────────────────────────┘
```

---

### 3️⃣ Preparar Variáveis de Ambiente

Antes de colar o YAML, reúna seus valores:

#### 🔧 Valores Obrigatórios

| Variável | Exemplo | Onde conseguir |
|----------|---------|----------------|
| `DOCKER_REGISTRY` | `docker.io/seu-username` | Docker Hub (seu login) |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | console.anthropic.com |
| `POSTGRES_PASSWORD` | `senha-super-segura-123` | Gere uma senha forte |
| `API_DOMAIN` | `copyzen.alquimiazen.com.br` | Seu domínio |

#### 📦 Valores Opcionais (se usar Supabase Cloud)

| Variável | Onde conseguir |
|----------|----------------|
| `SUPABASE_URL` | Supabase Project Settings → API |
| `SUPABASE_ANON_KEY` | Supabase Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings → API |

---

### 4️⃣ Colar YAML no Editor

**Passo A: Copiar YAML**

Copie o conteúdo de `docker-compose.portainer.yml`:

```bash
# Na sua máquina local:
cat docker-compose.portainer.yml | pbcopy  # macOS
# ou
cat docker-compose.portainer.yml | xclip -selection clipboard  # Linux
# ou copie manualmente do arquivo
```

**Passo B: Colar no Editor do Portainer**

```
1. Clique na área branca do editor (Portainer)
2. Pressione Ctrl+A (ou Cmd+A no Mac) para limpar
3. Pressione Ctrl+V (ou Cmd+V) para colar
4. Veja o YAML aparecer no editor
```

**YAML esperado no editor:**
```yaml
version: '3.8'

services:
  copyzen-api:
    image: ${DOCKER_REGISTRY}/copyzen-api:latest
    environment:
      NODE_ENV: production
      API_PORT: 3000
      # ... mais variáveis ...
    networks:
      - AZ_Net
    # ... mais configurações ...

  copyzen-postgres:
    image: postgres:15-alpine
    # ... mais configurações ...

networks:
  AZ_Net:
    external: true
    name: AZ_Net
```

---

### 5️⃣ Definir Variáveis de Ambiente

**Após colar o YAML**, você verá uma seção de variáveis:

```
┌──────────────────────────────────────┐
│ Environment Variables                │
├──────────────────────────────────────┤
│ ☑ Use repository environment file    │
│                                      │
│ Variable Name | Value                │
├──────────────────────────────────────┤
│ DOCKER_REGISTRY | [______]           │
│ ANTHROPIC_API_KEY | [______]         │
│ POSTGRES_PASSWORD | [______]         │
│ API_DOMAIN | [______]                │
│ SUPABASE_URL | [______]              │
│ N8N_API_URL | [______]               │
│ ... (mais campos)                    │
└──────────────────────────────────────┘
```

**Preencha cada campo:**

1. **DOCKER_REGISTRY**
   - Digite: `docker.io/seu-username`
   - Exemplo: `docker.io/tatudozen`

2. **ANTHROPIC_API_KEY**
   - Digite: `sk-ant-...` (sua chave completa)
   - Clique no olho para ocultar

3. **POSTGRES_PASSWORD**
   - Digite: Uma senha **FORTE** (mínimo 16 caracteres)
   - Exemplo: `GvqJ7#mK9$nL2@pQ4xT8wZ1`

4. **API_DOMAIN**
   - Digite: `copyzen.alquimiazen.com.br`

5. **Outras variáveis (opcionais)**
   - Deixe em branco se não tiver
   - Portainer usa defaults automaticamente

---

### 6️⃣ Deploy da Stack

**Clique no botão [Deploy Stack]**

```
Portainer fará:
1. ✓ Validar o YAML
2. ✓ Verificar network AZ_Net
3. ✓ Fazer pull da imagem docker.io/seu-username/copyzen-api:latest
4. ✓ Criar volumes
5. ✓ Iniciar copyzen-api (2 replicas)
6. ✓ Iniciar copyzen-postgres (1 replica)
7. ✓ Configurar Traefik automaticamente
```

**Você verá:**
```
Status: Creating stack...
│
├─ Downloading images...
├─ Creating network...
├─ Starting services...
│
└─ ✅ Stack deployed successfully
```

---

## 📊 Monitorar Deploy via Portainer UI

Após o deploy, monitore em tempo real:

### Ver Status da Stack

```
Portainer → Stacks → copyzen
│
├─ Overview
│  ├─ copyzen_api: 2 replicas running ✅
│  └─ copyzen_postgres: 1 replica running ✅
│
├─ Services
│  ├─ copyzen_api
│  │  ├─ Running: 2/2 ✅
│  │  └─ Healthy: 2/2 ✅
│  │
│  └─ copyzen_postgres
│     ├─ Running: 1/1 ✅
│     └─ Healthy: 1/1 ✅
│
└─ Tasks
   ├─ copyzen_api.1
   ├─ copyzen_api.2
   └─ copyzen_postgres.1
```

### Ver Logs em Tempo Real

```
Portainer → Containers
│
├─ copyzen_api.1
│  └─ Logs (botão)
│     ├─ [Follow] (ativa scroll automático)
│     └─ (vê mensagens em tempo real)
│
└─ copyzen_postgres.1
   └─ Logs
      └─ (vê início do banco)
```

**Logs esperados:**

**API:**
```
[INFO] API server listening on 0.0.0.0:3000
[INFO] Health check: OK
[INFO] Connected to Supabase
```

**PostgreSQL:**
```
...
2026-02-28 12:45:30.123 UTC [1] LOG:  database system is ready to accept connections
```

### Ver Estatísticas

```
Portainer → Containers → copyzen_api.1
│
└─ Stats (aba)
   ├─ CPU: 5-10%
   ├─ Memory: 150-200 MB
   └─ Network: gráficos em tempo real
```

---

## ✅ Validar Deploy

### 1. Testar Health Check via Portainer

```
Portainer → Stacks → copyzen → Services → copyzen_api
│
└─ Health: Healthy ✅
```

### 2. Acessar API pelo Domínio

```
URL: https://copyzen.alquimiazen.com.br/health

Esperado (200 OK):
{
  "status": "ok",
  "timestamp": "2026-02-28T12:45:30Z"
}
```

### 3. Ver Traefik Dashboard

```
URL: https://traefik.alquimiazen.com.br (se tiver)
│
└─ Routers
   └─ copyzen-api: ACTIVE ✅
```

### 4. Criar Teste de Cliente

Pode fazer via Postman, curl ou qualquer client HTTP:

```
POST https://copyzen.alquimiazen.com.br/clients
Content-Type: application/json

{
  "name": "Teste Portainer",
  "industry": "Technology"
}
```

**Esperado (201 Created):**
```json
{
  "id": "uuid-aqui",
  "name": "Teste Portainer",
  "industry": "Technology",
  "created_at": "2026-02-28T12:45:30Z"
}
```

---

## 🔄 Atualizar Deployment

### Quando novo código é feito push:

**Fluxo automático:**
```
1. git push → main
   ↓
2. GitHub Actions:
   - Build novo (copyzen-api:latest)
   - Push para Docker Hub
   ↓
3. Na VPS, faça (via Portainer):
   - Vá em: Stacks → copyzen
   - Clique em: [Update the stack]
   - Deixe o YAML igual
   - Clique em: [Update]
   ↓
4. Docker Swarm:
   - Faz pull da nova imagem
   - Para replicas antigas
   - Inicia novas (rolling update, sem downtime)
```

**Passos no Portainer:**

```
Portainer → Stacks → copyzen
│
├─ [Update the stack] (botão)
│  │
│  ├─ YAML permanece igual (editar aqui se necessário)
│  │
│  └─ [Update] (botão)
│
└─ ✅ Stack updated
   │
   └─ Veja em: Services → copyzne_api
      └─ Tasks atualizando (old → new)
```

---

## 🛠️ Operações Comuns via Portainer

### Escalar Replicas da API

```
Portainer → Stacks → copyzen → Services → copyzen_api
│
└─ [Scale] (número ao lado do status)
   │
   ├─ Altere de 2 para 3 (ou o valor desejado)
   │
   └─ [Done]
```

### Reiniciar Serviço

```
Portainer → Containers → copyzen_api.1
│
└─ [Restart] (botão no topo)
```

### Remover Stack

```
Portainer → Stacks → copyzen
│
└─ [Remove] (botão no topo)
   │
   └─ ✅ Confirmar
```

---

## 🔐 Gerenciar Variáveis de Ambiente

### Ver Variáveis Atuais

```
Portainer → Stacks → copyzen → Services → copyzen_api
│
└─ Environment (aba)
   ├─ NODE_ENV: production
   ├─ API_PORT: 3000
   ├─ ... (todas visíveis)
   └─ (valores sensíveis não são editáveis aqui)
```

### Mudar Variáveis

**Para alterar (ex: ANTHROPIC_API_KEY):**

```
1. Vá em: Stacks → copyzen
2. Clique em: [Edit Stack]
3. Na seção de variáveis, altere o valor
4. Clique em: [Update]
5. Docker reinicia os containers com novos valores
```

---

## 📈 Monitoramento Contínuo

### Dashboard Recomendado

```
Portainer Home
├─ Visão geral dos containers
├─ Recursos (CPU, memória em tempo real)
└─ Eventos recentes (restart, updates)

Stacks → copyzen
├─ Status das replicas
├─ Health status
└─ Logs das últimas alterações

Containers
├─ Logs em tempo real
├─ Estatísticas (CPU, memória, rede)
└─ Histórico de restart
```

---

## 🚨 Troubleshooting via Portainer

### Se API não inicia (Status: Pending)

```
Portainer → Containers
│
├─ Procure por: copyzen_api.1, copyzen_api.2
│
├─ Veja Status: Pending / Preparing
│
└─ Abra [Logs]
   │
   ├─ Se vê erro: "image not found"
   │  → Verificar DOCKER_REGISTRY em variáveis
   │
   ├─ Se vê erro: "connection refused"
   │  → Verificar SUPABASE_URL
   │
   └─ Se vê: "health check failed"
      → Aguardar 40s (start_period) ou reiniciar
```

### Se PostgreSQL não inicializa

```
Portainer → Containers → copyzen_postgres.1
│
└─ Logs
   │
   ├─ Se vê: "could not open data directory"
   │  → Verificar /srv/copyzen/postgres_data permissões
   │
   └─ Se vê: "database already exists"
      → Normal, pode ignorar
```

### Se Traefik não roteia

```
Portainer → Stacks → copyzen → Services → copyzen_api
│
└─ Ver labels (confirmando Traefik config):
   ├─ traefik.enable: true
   ├─ traefik.http.routers.copyzen-api.rule: Host(`copyzen.alquimiazen.com.br`)
   └─ traefik.http.services.copyzen-api.loadbalancer.server.port: 3000
```

---

## 📚 Próximas Etapas

```
✅ 1. Deploy inicial via Portainer UI
✅ 2. Validar health checks
✅ 3. Testar endpoints HTTPS

→ 4. Monitorar logs contínuamente
→ 5. Configurar alertas (Portainer alerts)
→ 6. Setup backups automáticos (PostgreSQL)
→ 7. Escalar conforme necessário
```

---

**Pronto para fazer deploy 100% visual via Portainer!** 🚀

Qualquer dúvida com a interface, consulte `docs/PORTAINER-DEPLOYMENT.md` para detalhes técnicos.
