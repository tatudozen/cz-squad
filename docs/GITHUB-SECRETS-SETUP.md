# GitHub Secrets Setup - CI/CD Automático

Guia para configurar os secrets necessários para o fluxo de CI/CD automático (build de imagem Docker e deploy).

## 🔐 Fluxo de Automação

```
git push → GitHub Actions (CI/CD)
   ↓
Build da imagem Docker
   ↓
Push para Docker Registry
   ↓
SSH na VPS + Deploy automático
```

Para isso funcionar, precisamos de **5 secrets** configurados no GitHub.

---

## 📋 Lista de Secrets Necessários

| Secret | Valor | Onde conseguir |
|--------|-------|---|
| `DOCKER_USERNAME` | Seu login Docker Hub | hub.docker.com |
| `DOCKER_PASSWORD` | Seu token Docker Hub | hub.docker.com (Settings → Security) |
| `DOCKER_REGISTRY` | `docker.io/seu-username` | Seu username Docker Hub |
| `VPS_HOST` | IP ou hostname da VPS | Seu provider (Hostinger, etc) |
| `VPS_USER` | `root` ou `seu-usuario` | Seu SSH user |
| `VPS_SSH_KEY` | Conteúdo da chave SSH privada | Arquivo `~/.ssh/id_rsa` |

---

## 🚀 Passo-a-Passo de Configuração

### 1️⃣ Abrir GitHub Repository Settings

```
1. Acesse: https://github.com/tatudozen/cz-squad
2. Clique em: Settings (engrenagem no topo direito)
3. Menu esquerdo: Secrets and variables → Actions
```

**Tela esperada:**
```
┌─────────────────────────────────┐
│ Secrets and variables           │
├─────────────────────────────────┤
│ [Actions]  [Dependabot]         │
│                                 │
│ Repository secrets              │
│ [New repository secret] (botão) │
│                                 │
│ No secrets set                  │
└─────────────────────────────────┘
```

---

### 2️⃣ Configurar DOCKER_USERNAME

**Passo A: Obter seu username**

```
1. Acesse: https://hub.docker.com
2. Login com sua conta
3. Clique no ícone de perfil (canto superior direito)
4. Copie seu "Docker ID" (ex: tatudozen)
```

**Passo B: Adicionar Secret**

```
1. Em GitHub → Settings → Secrets
2. Clique em: [New repository secret]
3. Name: DOCKER_USERNAME
4. Value: seu-docker-id (ex: tatudozen)
5. Clique em: [Add secret]
```

**Esperado:**
```
✅ DOCKER_USERNAME = tatudozen
```

---

### 3️⃣ Configurar DOCKER_PASSWORD

**⚠️ IMPORTANTE:** Usar um **Token**, não sua senha Docker!

**Passo A: Gerar Token no Docker Hub**

```
1. Acesse: https://hub.docker.com/settings/security
2. Clique em: [New Access Token]
3. Name: github-copyzen (ou qualquer nome)
4. Permissions: Read & Write (necessário para push)
5. Clique em: [Generate]
6. Copie o token (você só verá uma vez!)
```

**Passo B: Adicionar Secret**

```
1. Em GitHub → Settings → Secrets
2. Clique em: [New repository secret]
3. Name: DOCKER_PASSWORD
4. Value: cole o token inteiro (ex: dckr_pat_abc123...)
5. Clique em: [Add secret]
```

**Esperado:**
```
✅ DOCKER_PASSWORD = dckr_pat_abc123...
```

---

### 4️⃣ Configurar DOCKER_REGISTRY

**Passo A: Formar a URL completa**

```
DOCKER_REGISTRY = docker.io/seu-username

Exemplos:
- docker.io/tatudozen
- docker.io/seu-docker-id
- docker.io/seu-username
```

**Passo B: Adicionar Secret**

```
1. Em GitHub → Settings → Secrets
2. Clique em: [New repository secret]
3. Name: DOCKER_REGISTRY
4. Value: docker.io/seu-username (ex: docker.io/tatudozen)
5. Clique em: [Add secret]
```

**Esperado:**
```
✅ DOCKER_REGISTRY = docker.io/tatudozen
```

---

### 5️⃣ Configurar VPS_HOST

**Passo A: Obter IP da VPS**

```
Hostinger (seu provider):
1. Acesse: https://www.hostinger.com (seu painel)
2. Vá em: Servidores VPS
3. Procure por: Endereço IP
4. Copie o IP (ex: 123.45.67.89)

OU

Se já tem SSH:
$ ssh root@sua-vps
$ hostname -I
123.45.67.89 (seu IP público)
```

**Passo B: Adicionar Secret**

```
1. Em GitHub → Settings → Secrets
2. Clique em: [New repository secret]
3. Name: VPS_HOST
4. Value: seu-ip-vps (ex: 123.45.67.89)
   ou seu hostname (ex: vps.alquimiazen.com.br)
5. Clique em: [Add secret]
```

**Esperado:**
```
✅ VPS_HOST = 123.45.67.89
```

---

### 6️⃣ Configurar VPS_USER

**Passo A: Determinar seu usuário SSH**

```
Normalmente:
- Hostinger VPS: root
- DigitalOcean: root ou seu-usuario
- AWS EC2: ec2-user ou ubuntu

Se usar root:
Value: root

Se usar outro usuário:
Value: seu-usuario
```

**Passo B: Adicionar Secret**

```
1. Em GitHub → Settings → Secrets
2. Clique em: [New repository secret]
3. Name: VPS_USER
4. Value: root (ou seu-usuario)
5. Clique em: [Add secret]
```

**Esperado:**
```
✅ VPS_USER = root
```

---

### 7️⃣ Configurar VPS_SSH_KEY

**⚠️ CRÍTICO:** Esta chave é sensível. Nunca a compartilhe!

**Passo A: Gerar/Encontrar sua chave SSH**

```bash
# Se já tem chave SSH:
cat ~/.ssh/id_rsa

# Se não tem, gerar (no seu computador):
ssh-keygen -t rsa -b 4096 -C "github-actions"
# Deixe senha vazia (pressione Enter)
# Arquivo será criado em: ~/.ssh/id_rsa

# Depois copie:
cat ~/.ssh/id_rsa | pbcopy  # macOS
# ou
cat ~/.ssh/id_rsa | xclip -selection clipboard  # Linux
```

**Passo B: Copiar Chave Pública para VPS**

```bash
# Adicione a chave pública no servidor:
cat ~/.ssh/id_rsa.pub | ssh root@sua-vps "cat >> ~/.ssh/authorized_keys"

# OU manualmente:
ssh root@sua-vps
nano ~/.ssh/authorized_keys  # adicione a linha da id_rsa.pub
```

**Passo C: Adicionar Secret no GitHub**

```
1. Em GitHub → Settings → Secrets
2. Clique em: [New repository secret]
3. Name: VPS_SSH_KEY
4. Value: Cole TODA a chave privada (~/.ssh/id_rsa)
   - Inclui as linhas:
     -----BEGIN RSA PRIVATE KEY-----
     [conteúdo da chave]
     -----END RSA PRIVATE KEY-----
5. Clique em: [Add secret]
```

**Esperado:**
```
✅ VPS_SSH_KEY = (sua chave privada de 4096 bits)
```

---

## ✅ Verificação Final

**Todos os secrets configurados:**

```
Settings → Secrets and variables → Actions

✅ DOCKER_USERNAME = seu-username
✅ DOCKER_PASSWORD = dckr_pat_...
✅ DOCKER_REGISTRY = docker.io/seu-username
✅ VPS_HOST = 123.45.67.89
✅ VPS_USER = root
✅ VPS_SSH_KEY = -----BEGIN RSA PRIVATE KEY-----...
```

---

## 🧪 Testar o Fluxo

### Trigger Manual do Workflow

```
1. Acesse: https://github.com/tatudozen/cz-squad/actions
2. Procure por: "Deploy" workflow
3. Clique em: [Run workflow]
4. Selecione branch: main
5. Clique em: [Run workflow]
```

**Você verá:**
```
Deploy workflow running...
├─ Build (construindo imagem)
├─ Push (enviando para Docker Hub)
└─ Deploy (SSH e docker stack deploy)
```

### Monitorar Execução

```
1. Workflow está rodando (amarelo)
2. Veja cada step:
   ✅ Checkout code
   ✅ Build Docker image
   ✅ Login to Docker Hub
   ✅ Push Docker image
   ✅ Deploy to VPS

3. Se tudo verde: ✅ Deployment successful!
4. Se algo vermelho: ❌ Veja os logs
```

---

## 🔄 Fluxo Completo Após Configuração

Quando tudo está pronto:

```
1. Você trabalha no código localmente
   git add .
   git commit -m "feat: sua feature"

2. Faz push:
   git push origin main

3. GitHub Actions dispara automaticamente:
   - Lint, typecheck, testes
   - Build de imagem Docker
   - Push para docker.io
   - SSH na VPS
   - docker stack deploy

4. Sua aplicação está ao vivo!
   https://copyzen.alquimiazen.com.br
```

---

## 🚨 Troubleshooting

### Erro: "Authentication failed"

**Causa:** DOCKER_USERNAME ou DOCKER_PASSWORD incorretos

**Solução:**
1. Ir em: Docker Hub → Account Settings → Security
2. Gerar novo Access Token
3. Atualizar secret DOCKER_PASSWORD no GitHub

### Erro: "Permission denied (publickey)"

**Causa:** VPS_SSH_KEY não foi adicionada à VPS

**Solução:**
```bash
# Conecte via Hostinger/outro método temporário
# Adicione a chave pública:
echo "sua-chave-publica" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### Erro: "docker.io/seu-username/copyzen-api:latest not found"

**Causa:** DOCKER_REGISTRY ou Build falhou

**Solução:**
1. Verificar se Build step passou (action log)
2. Confirmar DOCKER_REGISTRY está correto
3. Verificar Docker Hub: hub.docker.com/repository/seu-username/copyzen-api

---

## 📚 Referências

- **GitHub Secrets Docs:** https://docs.github.com/actions/security-guides/encrypted-secrets
- **Docker Hub Access Tokens:** https://docs.docker.com/security/for-developers/access-tokens/
- **SSH Key Generation:** https://docs.github.com/authentication/connecting-to-github-with-ssh

---

**Pronto! Seu CI/CD automático está configurado.** 🚀

Qualquer commit em `main` fará:
1. Build da imagem Docker
2. Push para seu Docker Hub
3. Deploy automático na VPS
