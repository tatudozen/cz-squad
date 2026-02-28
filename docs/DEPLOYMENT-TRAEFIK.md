# CopyZen Deployment com Traefik - Docker Swarm

Guia para integrar CopyZen na sua infraestrutura existente com Traefik e Docker Swarm.

## 🏗️ Sua Infraestrutura Atual

```
VPS (Docker Swarm Manager)
├── Traefik (Reverse Proxy + SSL/TLS)
├── AZ_Net (rede overlay)
├── Site Teste (nginx)
└── [Próximo: CopyZen API + PostgreSQL]
```

## 🚀 Deploy Rápido (3 passos)

### 1️⃣ Preparar a VPS

```bash
# SSH na VPS
ssh root@vps-host

# Criar diretório para dados CopyZen
mkdir -p /srv/copyzen/postgres_data
chmod 755 /srv/copyzen/postgres_data

# Clonar repositório na VPS
cd /opt
git clone https://github.com/seu-usuario/copyzen.git
cd copyzen
```

### 2️⃣ Configurar Variáveis

```bash
# Copiar template
cp .env.prod.example .env.prod

# Editar .env.prod com seus valores
nano .env.prod
```

**Valores críticos:**
```bash
# Obrigatórios
DOCKER_REGISTRY=seu-docker-registry
ANTHROPIC_API_KEY=sk-ant-sua-chave
POSTGRES_PASSWORD=senha-forte-aqui
API_DOMAIN=copyzen.alquimiazen.com.br

# Configurados automaticamente para sua rede Traefik
# AZ_Net é usada automaticamente
# Traefik labels já configurados
```

### 3️⃣ Deploy na Rede Existente

```bash
# Na VPS, em /opt/copyzen
docker stack deploy -c docker-compose.prod.yml copyzen

# Verificar
docker stack ps copyzen
docker service ls
```

## 🌐 Traefik Configuration

A configuração segue **exatamente** o padrão do seu site de teste:

```yaml
# Seu site de teste
traefik.http.routers.site-teste.rule=Host(`site.alquimiazen.com.br`)

# CopyZen API (mesmo padrão)
traefik.http.routers.copyzen-api.rule=Host(`copyzen.alquimiazen.com.br`)
```

### Atributos Traefik Configurados

✅ **Habilitado**: `traefik.enable=true`
✅ **Rede**: `traefik.docker.network=AZ_Net`
✅ **Rota**: `Host(\`copyzen.alquimiazen.com.br\`)`
✅ **Entrypoint**: `websecure` (HTTPS)
✅ **TLS**: Automático com Let's Encrypt
✅ **Resolver**: `letsencryptresolver`
✅ **Porta**: `3000` (porta interna da API)

## 📋 Checklist de Deployment

```
ANTES DO DEPLOY:
☐ DNS apontando para VPS (copyzen.alquimiazen.com.br)
☐ .env.prod preenchido corretamente
☐ DOCKER_REGISTRY configurado
☐ ANTHROPIC_API_KEY válida
☐ Traefik rodando e saudável

DEPLOY:
☐ docker stack deploy executado
☐ Serviços listados (docker stack ps copyzen)
☐ API saudável (docker service logs copyzen_api)
☐ PostgreSQL saudável (docker service logs copyzen_postgres)

PÓS-DEPLOY:
☐ HTTPS funciona (curl https://copyzen.alquimiazen.com.br/health)
☐ Certificado válido (visitando com navegador)
☐ Traefik dashboard mostra rota ativa
```

## 🧪 Testar após Deploy

```bash
# ✅ Saúde da API
curl https://copyzen.alquimiazen.com.br/health

# ✅ Criar cliente
curl -X POST https://copyzen.alquimiazen.com.br/clients \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Client",
    "industry":"Technology",
    "contact_email":"test@example.com"
  }'

# ✅ Ver logs em tempo real
docker service logs copyzen_api -f
docker service logs copyzen_postgres -f

# ✅ Ver status no Traefik
# Abra: https://traefik.alquimiazen.com.br (se tiver dashboard)
```

## 📊 Comparação: Seu Site vs CopyZen

| Aspecto | Site Teste | CopyZen |
|---------|-----------|---------|
| **Imagem** | `nginx:alpine` | `seu-registry/copyzen-api:latest` |
| **Volumes** | `/srv/sites/teste` | `/srv/copyzen/postgres_data` |
| **Rede** | `AZ_Net` | `AZ_Net` |
| **Traefik** | ✅ Labels | ✅ Labels (mesmo padrão) |
| **Domínio** | `site.alquimiazen.com.br` | `copyzen.alquimiazen.com.br` |
| **HTTPS** | ✅ Let's Encrypt | ✅ Let's Encrypt |
| **Replicas** | 1 | 2 (configurável) |
| **Banco Dados** | Nenhum | PostgreSQL integrado |

## 🔄 Atualizar Deployment

```bash
# Após novo push para main:
# 1. GitHub Actions constrói e faz push
# 2. Na VPS:

docker pull seu-registry/copyzen-api:latest
docker stack deploy -c docker-compose.prod.yml copyzen

# Docker realiza rolling update (sem downtime)
# Traefik roteia automaticamente para serviços saudáveis
```

## 🛠️ Troubleshooting

### API não conecta
```bash
# Verificar logs
docker service logs copyzen_api -f

# Verificar se está na rede correta
docker inspect copyzen_api | grep -A 5 Networks

# Verificar saúde
docker service ps copyzen_api
```

### Traefik não roteia
```bash
# Verificar se labels estão presentes
docker service inspect copyzen_api | grep -A 30 Labels

# Verificar dashboard do Traefik
# Procure por "copyzen-api" em:
# - Routers
# - Services
# - Middlewares
```

### PostgreSQL não inicializa
```bash
docker service logs copyzen_postgres -f

# Se precisar reiniciar:
docker service update --force copyzen_postgres
```

## 📂 Estrutura de Arquivos na VPS

```
/opt/copyzen/
├── docker-compose.prod.yml    ← Use este arquivo
├── .env.prod                  ← Suas variáveis (NÃO commitar)
├── scripts/
│   └── init-db.sql            ← Inicialização do banco
└── [código fonte]

/srv/copyzen/
└── postgres_data/             ← Dados persistentes
```

## 🔐 Segurança

✅ **HTTPS automático** via Traefik + Let's Encrypt
✅ **Rede isolada** com AZ_Net overlay
✅ **Senhas secretas** em .env.prod (não commit)
✅ **Healthchecks** para detecção de falhas
✅ **Restart automático** em caso de crash

## 📈 Monitoramento

```bash
# Ver stack status
watch docker stack ps copyzen

# Logs contínuos
docker service logs copyzen_api -f --tail=100

# Métricas
docker stats copyzen_api copyzen_postgres

# Usar mesmo padrão de monitoramento do seu site:
# Prometheus, Grafana, Datadog, etc
```

## 💡 Dicas

1. **Use sempre `.env.prod`** para produção (nunca commit)
2. **Replicas**: Configure `API_REPLICAS=2` para alta disponibilidade
3. **Backup**: Faça backup de `/srv/copyzen/postgres_data` regularmente
4. **DNS**: Aponte o subdomínio antes do deploy
5. **Certificado**: Traefik emite automaticamente via Let's Encrypt

## 🎯 Próximas Etapas

1. ✅ Deploy inicial na VPS
2. 📊 Testar MVP validation script
3. 🔄 Configurar backups automáticos
4. 📈 Adicionar monitoramento (Prometheus/Grafana)
5. 📧 Setup alertas de saúde

---

**Última atualização:** 2026-02-28
**Seu domínio:** `alquimiazen.com.br`
**Rede:** `AZ_Net` (overlay)
**Reverse Proxy:** Traefik com Let's Encrypt
