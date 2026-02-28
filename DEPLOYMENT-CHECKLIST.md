# 🚀 CopyZen Deployment Checklist

## Pre-Deployment (Ambiente Local)

- [ ] Todas as mudanças commitadas
- [ ] Testes passando: `npm run test`
- [ ] Lint passando: `npm run lint`
- [ ] TypeScript checando: `npm run typecheck`
- [ ] Build funciona: `npm run build`

## Preparação da VPS

- [ ] Docker instalado (v20.10+)
- [ ] Docker Swarm inicializado: `docker swarm init`
- [ ] Diretório criado: `mkdir -p /var/lib/copyzen/postgres_data`
- [ ] Repositório clonado: `cd /opt/copyzen && git clone ...`
- [ ] `.env.prod` configurado (copiar de `.env.prod.example`)
- [ ] Domínio DNS apontando para VPS
- [ ] SSL/TLS certificado pronto (Certbot/Let's Encrypt)

## Configuração de Variáveis de Ambiente

- [ ] `DOCKER_REGISTRY` ← Docker Hub ou registry privado
- [ ] `ANTHROPIC_API_KEY` ← Claude API key
- [ ] `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` ← Banco de dados
- [ ] `POSTGRES_PASSWORD` ← Senha forte para PostgreSQL
- [ ] `API_DOMAIN` ← Seu domínio
- [ ] `OPERATOR_API_KEY` ← Chave de operador aleatória

## Build & Push da Imagem

```bash
# Local
docker build -t copyzen-api:latest -f apps/api/Dockerfile .
docker tag copyzen-api:latest $DOCKER_REGISTRY/copyzen-api:latest
docker login $DOCKER_REGISTRY
docker push $DOCKER_REGISTRY/copyzen-api:latest
```

- [ ] Imagem built com sucesso
- [ ] Imagem pushed para registry
- [ ] Registry acessível da VPS

## Deploy no Swarm

```bash
# VPS
cd /opt/copyzen
export $(cat .env.prod | xargs)
docker stack deploy -c docker-compose.prod.yml copyzen
```

- [ ] Stack deploy executado
- [ ] Serviços rodando: `docker stack ps copyzen`
- [ ] API saudável: `docker service logs copyzen_api`
- [ ] PostgreSQL saudável: `docker service logs copyzen_postgres`

## Testes Pós-Deploy

```bash
# Verificar saúde
curl https://copyzen.seu-dominio.com/health

# Testar endpoint
curl -X POST https://copyzen.seu-dominio.com/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","industry":"Test"}'
```

- [ ] Endpoint `/health` responde 200
- [ ] Endpoint `/clients` funciona
- [ ] Logs sem erros críticos
- [ ] Performance aceitável (< 200ms)

## Monitoramento

- [ ] Logs configurados e testados
- [ ] Healthcheck funcionando
- [ ] Alertas em caso de falha
- [ ] Backup do banco de dados agendado

## Rollback (Se necessário)

```bash
# Remover stack
docker stack rm copyzen

# Wait
sleep 10

# Redeployer versão anterior
docker pull $DOCKER_REGISTRY/copyzen-api:previous-version
docker stack deploy -c docker-compose.prod.yml copyzen
```

- [ ] Plano de rollback documentado
- [ ] Backup de dados anterior disponível

---

## 📊 Fluxo Automático via GitHub Actions

Se usar GitHub Actions, você precisa apenas:

1. Fazer push para `main`
2. GitHub Actions cuida do resto automaticamente

**Secrets necessários no GitHub:**
- [ ] `DOCKER_USERNAME`
- [ ] `DOCKER_PASSWORD`
- [ ] `VPS_HOST`
- [ ] `VPS_USER`
- [ ] `VPS_SSH_KEY`

---

## 🔗 Links Úteis

- [Documentação de Deployment](./docs/DEPLOYMENT.md)
- [Dockerfile](./apps/api/Dockerfile)
- [docker-compose.prod.yml](./docker-compose.prod.yml)
- [GitHub Actions Workflow](./.github/workflows/deploy.yaml)

---

**Data de Ultima Atualização:** 2026-02-28
