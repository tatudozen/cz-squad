# CopyZen API - Authentication

## Overview

A CopyZen API utiliza **API Key authentication** via header `X-API-Key`. Isso garante que apenas clientes autenticados possam acessar os endpoints protegidos.

## Setup

### 1. Configure o OPERATOR_API_KEY

Na VPS ou docker-compose, defina:

```bash
export OPERATOR_API_KEY="seu-api-key-secreto"
```

Ou no docker-compose.prod.yml:

```yaml
environment:
  OPERATOR_API_KEY: "seu-api-key-secreto"
```

### 2. Endpoints Protegidos

Todos esses endpoints requerem autenticação:

- `POST /briefings`
- `GET /briefings/:id`
- `PATCH /briefings/:id`
- `POST /copy/generate`
- `POST /funwheel/presentations`
- `POST /funwheel/qualification`
- `POST /sales-page/generate`
- `POST /projects`
- E mais...

**Endpoints Públicos:**
- `GET /health` - Health check (sem autenticação)
- `GET /metrics` - Métricas (sem autenticação)

## Como Usar com n8n

### 1. Criar Connection HTTP no n8n

```
1. Adicione um nó "HTTP Request"
2. URL: https://fw.alquimiazen.com.br/briefings
3. Method: POST
4. Headers:
   - Key: X-API-Key
   - Value: seu-api-key-secreto
5. Body: seu JSON payload
```

### 2. Exemplo cURL

```bash
curl -X POST https://fw.alquimiazen.com.br/briefings \
  -H "X-API-Key: seu-api-key-secreto" \
  -H "Content-Type: application/json" \
  -d '{
    "businessName": "Test Business",
    "segment": "healthcare",
    "targetAudience": "doctors",
    "voiceTone": "professional",
    "objectives": ["increase-leads"],
    "differentiators": "innovative"
  }'
```

### 3. Exemplo JavaScript/Node.js

```javascript
const apiKey = "seu-api-key-secreto";
const response = await fetch('https://fw.alquimiazen.com.br/briefings', {
  method: 'POST',
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    businessName: "Test Business",
    segment: "healthcare",
    targetAudience: "doctors",
    voiceTone: "professional",
    objectives: ["increase-leads"],
    differentiators: "innovative"
  })
});

const data = await response.json();
console.log(data);
```

## Respostas de Erro

### 401 Unauthorized - Missing API Key

```json
{
  "error": "Unauthorized",
  "message": "Missing X-API-Key header",
  "code": "MISSING_API_KEY"
}
```

**Solução:** Adicione o header `X-API-Key` ao request

### 403 Forbidden - Invalid API Key

```json
{
  "error": "Forbidden",
  "message": "Invalid API key",
  "code": "INVALID_API_KEY"
}
```

**Solução:** Verifique se o API key está correto

## Geração de API Key Segura

### Recomendações

1. **Use uma string aleatória forte:**
   ```bash
   openssl rand -hex 32
   # Saída: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...
   ```

2. **Guarde em local seguro** (secrets manager, .env protegido)

3. **Rote periodicamente** (mude a chave a cada 90 dias)

4. **Use diferentes chaves por cliente** se necessário:
   ```
   OPERATOR_API_KEY_N8N=...
   OPERATOR_API_KEY_EXTERNAL=...
   ```

## Ambiente de Teste

Em `NODE_ENV=test`, a validação é **desativada automaticamente**:

```bash
NODE_ENV=test npm test
# Testes rodam sem precisar de X-API-Key
```

Isso permite que testes E2E funcionem sem configurações extras.

## Auditoria

Todas as requisições autenticadas são registradas com:
- Request ID único
- Timestamp
- API Key (primeiros 8 chars + ***)
- Método HTTP e endpoint

Exemplo log:
```
[AUTH] Authenticated request: POST /briefings
  requestId: db2d4192-ba2b-491b-9975-4fab666de8cc
  apiKeyPrefix: a1b2c3d4***
```

## Segurança

### ✅ Práticas Recomendadas

- [ ] Transmita sempre sobre HTTPS (produção)
- [ ] Use API keys com alta entropia (32+ caracteres)
- [ ] Rote chaves regularmente
- [ ] Monitore acessos suspeitos
- [ ] Separe chaves por ambiente

### ❌ Evite

- Colocar API key em código-fonte
- Compartilhar chaves entre ambientes
- Usar chaves simples ou previsíveis
- Logar a chave completa nos logs

## Troubleshooting

### "Missing X-API-Key header"

```bash
# ❌ Errado
curl https://fw.alquimiazen.com.br/briefings

# ✅ Correto
curl -H "X-API-Key: seu-api-key" https://fw.alquimiazen.com.br/briefings
```

### "Invalid API key"

Verifique se:
1. A chave foi copiada corretamente
2. Não tem espaços em branco extras
3. A variável de ambiente foi exportada corretamente

```bash
# Verificar variável
echo $OPERATOR_API_KEY
# Deve exibir: seu-api-key-secreto
```

### Erro 500 ao usar autenticação

Se a validação do API key está causando erro:

```bash
# Verifique se OPERATOR_API_KEY está configurado
docker service inspect copyzen_api_api | grep OPERATOR_API_KEY

# Se vazio, atualize docker-compose e redeploy
```

---

**Documentação da API:** [Ver OpenAPI Spec](./openapi.yaml)
**Últimas atualizações:** 2026-03-02
