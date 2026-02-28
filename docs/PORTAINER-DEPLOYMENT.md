# CopyZen Deployment via Portainer

Guia para fazer deploy totalmente via Portainer, sem necessidade de terminal.

## 📋 Pré-requisitos

✅ Portainer rodando na VPS
✅ Docker Swarm inicializado
✅ Rede `AZ_Net` criada
✅ Traefik configurado e rodando

## 🚀 Deployment em 2 Etapas

### ETAPA 1: Preparar o Script de Deploy (Uma vez)

**Via terminal (30 segundos):**

```bash
ssh root@vps-host

# Download do script
curl -L https://raw.githubusercontent.com/tatudozen/cz-squad/main/scripts/deploy-copyzen-auto.sh \
  -o /opt/deploy-copyzen.sh

chmod +x /opt/deploy-copyzen.sh
```

### ETAPA 2: Executar Deploy via Portainer (Principal)

#### OPÇÃO A: Executar Script no Portainer (Recomendado)

1. **Abra Portainer Dashboard**
   - URL: `https://seu-portainer.com`
   - Autentique

2. **Vá para: Containers → Exec**
   - Clique em qualquer container ativo (ex: traefik)
   - Abra o console

3. **Execute o script:**
   ```bash
   /opt/deploy-copyzen.sh
   ```

4. **Responda as perguntas interativas:**
   - `DOCKER_REGISTRY` (ex: `docker.io/seu-username`)
   - `ANTHROPIC_API_KEY` (sua chave Claude)
   - `POSTGRES_PASSWORD` (senha forte)
   - `API_DOMAIN` (ex: `copyzen.alquimiazen.com.br`)
   - Campos opcionais (Supabase)

5. **Acompanhe o deploy:**
   ```
   ✓ Docker
   ✓ Git
   ✓ Docker Swarm
   ✓ Rede AZ_Net
   [clonando repositório...]
   [configurando variáveis...]
   [deploiando stack...]
   ✓ Deploy completo!
   ```

#### OPÇÃO B: Upload Manual (Se preferir)

1. **Em Portainer → File Manager**
   - Navegue até `/opt`
   - Crie arquivo `deploy-copyzen.sh`
   - Cole o conteúdo do script
   - Salve

2. **Execute via Portainer Console:**
   ```bash
   bash /opt/deploy-copyzen.sh
   ```

## 📊 Monitorar Deploy via Portainer

Após executar o script, monitore em Portainer:

### Ver Stacks

```
Portainer Home
  └─ Stacks
      └─ copyzen
          ├─ copyzen_api (2 replicas)
          └─ copyzen_postgres (1 replica)
```

### Ver Logs em Tempo Real

```
Portainer Home
  └─ Containers
      ├─ copyzen_api.1
      │   └─ Logs (ver últimas linhas)
      └─ copyzen_postgres.1
          └─ Logs
```

### Ver Status de Saúde

```
Portainer Home
  └─ Stacks → copyzen
      └─ Overview
          ├─ API: Desired 2, Running 2 ✓
          └─ PostgreSQL: Desired 1, Running 1 ✓
```

## 🧪 Testar após Deploy

### Via Portainer Console

```bash
# Verificar saúde da API
curl https://copyzen.alquimiazen.com.br/health

# Criar cliente (teste)
curl -X POST https://copyzen.alquimiazen.com.br/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","industry":"Tech"}'
```

### Via Portainer Dashboard

1. **Networks → AZ_Net**
   - Veja os containers conectados

2. **Stacks → copyzen → Services**
   - Veja loadbalancer status
   - Veja healthchecks

## 🔄 Atualizar Deployment

### Se houver novo código (após git push)

**Via Portainer Console:**

```bash
cd /opt/copyzen
git pull origin main
export $(cat .env.prod | xargs)
docker stack deploy -c docker-compose.prod.yml copyzen
```

**Ou via script:**

```bash
/opt/deploy-copyzen.sh
# Ele detectará que .env.prod já existe e pulará a configuração
```

## 🛠️ Operações Comuns via Portainer

### Escalar Replicas da API

```
Portainer → Stacks → copyzen → Services → copyzen_api
  └─ Scale: 2 → 3 (ou qual valor desejar)
```

### Ver Logs em Tempo Real

```
Portainer → Containers → copyzen_api.1
  └─ Logs (com follow automático)
```

### Reiniciar Serviço

```
Portainer → Containers → copyzen_api.1
  └─ Restart
```

### Remover Stack (Se necessário)

```
Portainer → Stacks → copyzen
  └─ Remove
```

## 🔐 Gerenciar .env.prod via Portainer

Após deploy inicial:

```
Portainer → Stacks → copyzen → Services → copyzen_api
  └─ Environment (não editável via UI)
```

**Para editar variáveis:**

Via Portainer Console:
```bash
nano /opt/copyzen/.env.prod
# Editar e salvar
docker stack deploy -c docker-compose.prod.yml copyzen
```

## 📈 Monitoramento Contínuo

### Dashboard Recomendado em Portainer

1. **Home**
   - Status geral dos containers
   - Recursos (CPU, memória)

2. **Stacks → copyzen**
   - Visão geral do deployment
   - Replicas e health

3. **Containers**
   - Logs em tempo real
   - Estatísticas de CPU/memória

4. **Events**
   - Histórico de eventos do Docker
   - Restart, deploy, etc

## 🚨 Troubleshooting via Portainer

### Se API não inicia

1. **Containers → copyzen_api**
   - Clique no container
   - Abra "Logs"
   - Procure por erros

2. **Se erro de ambiente:**
   - Console: `docker service logs copyzen_api`
   - Verifique `/opt/copyzen/.env.prod`

### Se PostgreSQL falha

1. **Containers → copyzen_postgres**
   - Ver logs
   - Verificar volume em `/srv/copyzen/postgres_data`

2. **Via Console:**
   ```bash
   docker service logs copyzen_postgres
   docker exec copyzen_postgres.1.CONTAINER_ID pg_isready -U copyzen
   ```

### Se Traefik não roteia

1. **Stacks → copyzen → copyzen_api**
   - Verificar labels Traefik
   - Verificar conectividade com AZ_Net

2. **Via Console:**
   ```bash
   docker service inspect copyzen_api | grep -A 30 Labels
   docker network inspect AZ_Net
   ```

## 💾 Backup via Portainer

### Backup do PostgreSQL

Via Portainer Console:
```bash
docker exec copyzen_postgres.1.CONTAINER_ID \
  pg_dump -U copyzen copyzen > /opt/copyzen_backup.sql

# Ou via serviço:
docker service exec copyzen_postgres \
  pg_dump -U copyzen copyzen > /opt/backup_$(date +%Y%m%d).sql
```

### Backup de Dados

```bash
tar -czf /backup/copyzen_data_$(date +%Y%m%d).tar.gz \
  /srv/copyzen/postgres_data/
```

## 📚 Referências Portainer

- **Documentação:** https://docs.portainer.io/
- **Docker Swarm:** https://docs.docker.com/engine/swarm/
- **Traefik:** https://doc.traefik.io/

## 🎯 Fluxo Recomendado

```
1. Deploy inicial (execute script uma vez)
   ↓
2. Monitorar em Portainer (acompanhar logs e status)
   ↓
3. Testar endpoints (via console ou curl)
   ↓
4. Ajustes conforme necessário (escalar, editar env)
   ↓
5. Backup regular (PostgreSQL e dados)
```

---

**Pronto para deployar via Portainer!** 🚀

Para suporte: Consulte `docs/DEPLOYMENT-TRAEFIK.md` para detalhes técnicos.
