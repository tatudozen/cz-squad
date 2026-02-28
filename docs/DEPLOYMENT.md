# CopyZen Deployment Guide - Docker Swarm

Este guia descreve como fazer deploy do CopyZen na VPS usando Docker Swarm.

## 📋 Pré-requisitos

- VPS com Docker Engine 20.10+ instalado
- Docker Swarm inicializado (`docker swarm init`)
- SSH acesso à VPS
- Docker Hub ou registro privado configurado
- Variáveis de ambiente configuradas

## 🚀 Fluxo de Deployment

### 1️⃣ **Push Automatizado via GitHub Actions** (Recomendado)

O workflow de CI/CD (`.github/workflows/deploy.yaml`) automatiza:

1. ✅ Build da imagem Docker
2. ✅ Push para Docker Registry
3. ✅ Deploy na VPS via SSH

**Trigger:** Qualquer push para `main` branch

```bash
# Simplesmente faça commit e push
git add .
git commit -m "feat: add MVP validation [Story 4.5]"
git push origin main
```

### 2️⃣ **Deploy Manual na VPS**

Para deploy manual, siga estes passos:

#### A. Preparar a VPS

```bash
# SSH na VPS
ssh root@vps-host

# Criar diretório para dados
mkdir -p /var/lib/copyzen/postgres_data

# Clonar ou atualizar repositório
cd /opt/copyzen
git pull origin main  # ou clonar se primeira vez
```

#### B. Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env.prod na VPS
cat > /opt/copyzen/.env.prod << 'EOF'
# Docker Registry
DOCKER_REGISTRY=your-registry.docker.io
DOCKER_USERNAME=your-username
DOCKER_PASSWORD=your-password

# API Domain
API_DOMAIN=copyzen.seu-dominio.com

# Database
POSTGRES_USER=copyzen
POSTGRES_PASSWORD=super-secure-password-here
POSTGRES_DB=copyzen

# Supabase/Database (ou use local PostgreSQL)
SUPABASE_URL=https://seu-supabase-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# LLM
ANTHROPIC_API_KEY=sk-ant-your-key-here
ANTHROPIC_MODEL=claude-opus-4

# n8n Integration
N8N_API_URL=http://n8n:5678/api
N8N_API_KEY=n8n-api-key

# Evolution API (WhatsApp)
EVOLUTION_API_URL=http://evolution-api:8080/api
EVOLUTION_INSTANCE_NAME=copyzen-prod

# Operator
OPERATOR_API_KEY=your-operator-key
EOF

# Proteger arquivo
chmod 600 /opt/copyzen/.env.prod
```

#### C. Build e Push da Imagem

```bash
# Na sua máquina local (ou usar GitHub Actions)
cd /Users/nando/Desktop/Playground/cz-squad

# Build
docker build -t copyzen-api:latest -f apps/api/Dockerfile .

# Tag
docker tag copyzen-api:latest your-registry.docker.io/copyzen-api:latest

# Login no registry
docker login your-registry.docker.io

# Push
docker push your-registry.docker.io/copyzen-api:latest
```

#### D. Deploy no Swarm

```bash
# Na VPS
cd /opt/copyzen

# Load .env.prod
export $(cat .env.prod | xargs)

# Deploy stack
docker stack deploy -c docker-compose.prod.yml copyzen

# Verificar status
docker stack ls
docker stack ps copyzen
docker service ls
```

## 📊 Monitorando o Deployment

```bash
# Ver logs da API
docker service logs copyzen_api -f

# Ver logs do PostgreSQL
docker service logs copyzen_postgres -f

# Ver status dos serviços
docker stack ps copyzen

# Ver container status
docker ps | grep copyzen
```

## 🔄 Atualizar Deployment

Para atualizar após push para `main`:

```bash
# GitHub Actions faz automaticamente, ou:

# Manual na VPS
docker pull your-registry.docker.io/copyzen-api:latest
docker stack deploy -c docker-compose.prod.yml copyzen

# Docker atualizará a imagem gracefully (rolling update)
```

## 🧪 Testar a API após Deploy

```bash
# Verificar saúde
curl -s https://copyzen.seu-dominio.com/health | jq .

# Criar cliente
curl -X POST https://copyzen.seu-dominio.com/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Client",
    "industry":"Technology"
  }' | jq .
```

## 🛡️ Segurança em Produção

- ✅ Usar HTTPS/TLS (configurar nginx/traefik reverse proxy)
- ✅ Definir limites de recursos (CPU, memoria)
- ✅ Usar secrets do Docker para credenciais
- ✅ Implementar autenticação na API
- ✅ Configurar logs centralizados
- ✅ Backup diário do PostgreSQL

## 📦 Volumes Persistentes

```bash
# Criar diretório de dados
sudo mkdir -p /var/lib/copyzen/postgres_data
sudo chown 999:999 /var/lib/copyzen/postgres_data

# Backup do banco
docker exec copyzen_postgres pg_dump -U copyzen copyzen > backup.sql

# Restore
docker exec -i copyzen_postgres psql -U copyzen copyzen < backup.sql
```

## 🔧 Troubleshooting

### API não inicia
```bash
docker service logs copyzen_api --details
```

### Banco de dados não conecta
```bash
docker service logs copyzen_postgres --details
docker exec copyzen_postgres pg_isready -U copyzen
```

### Remover stack e redeployer
```bash
docker stack rm copyzen
sleep 10
docker stack deploy -c docker-compose.prod.yml copyzen
```

## 📝 Estrutura de Arquivos na VPS

```
/opt/copyzen/
├── docker-compose.prod.yml
├── .env.prod
└── [código fonte]

/var/lib/copyzen/
└── postgres_data/     # Dados persistentes
```

## 🎯 Próximos Passos

1. ✅ Configurar DNS apontando para VPS
2. ✅ Configurar certificado SSL/TLS
3. ✅ Monitorar com Prometheus/Grafana
4. ✅ Configurar alertas de saúde
5. ✅ Implementar CI/CD completo

---

**Última atualização:** 2026-02-28
