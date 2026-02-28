#!/bin/bash

################################################################################
# CopyZen Automated Deployment Script
# Use with Portainer or directly via terminal
#
# Purpose: Fully automated deployment of CopyZen stack on Docker Swarm
# Works with: Traefik, AZ_Net, PostgreSQL persistence
#
# Usage:
#   bash deploy-copyzen-auto.sh
#   OR via Portainer: Add as executable script
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/opt/copyzen"
DATA_DIR="/srv/copyzen"
GITHUB_REPO="https://github.com/tatudozen/cz-squad.git"
DOCKER_STACK_NAME="copyzen"

################################################################################
# Functions
################################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Verificando pré-requisitos..."

    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado"
        exit 1
    fi
    log_success "Docker ✓"

    # Check Git
    if ! command -v git &> /dev/null; then
        log_error "Git não está instalado"
        exit 1
    fi
    log_success "Git ✓"

    # Check Docker Swarm
    if ! docker info | grep -q "Swarm: active"; then
        log_error "Docker Swarm não está inicializado"
        exit 1
    fi
    log_success "Docker Swarm ✓"

    # Check AZ_Net network
    if ! docker network ls | grep -q "AZ_Net"; then
        log_error "Rede AZ_Net não encontrada. Crie com: docker network create -d overlay AZ_Net"
        exit 1
    fi
    log_success "Rede AZ_Net ✓"
}

setup_directories() {
    log_info "Criando diretórios..."

    # Create data directory
    mkdir -p "$DATA_DIR/postgres_data"
    chmod 755 "$DATA_DIR/postgres_data"
    log_success "Diretórios criados em $DATA_DIR"
}

clone_or_update_repo() {
    log_info "Configurando repositório..."

    if [ -d "$PROJECT_DIR" ]; then
        log_info "Repositório já existe, atualizando..."
        cd "$PROJECT_DIR"
        git pull origin main
    else
        log_info "Clonando repositório de $GITHUB_REPO..."
        git clone "$GITHUB_REPO" "$PROJECT_DIR"
        cd "$PROJECT_DIR"
    fi

    log_success "Repositório pronto em $PROJECT_DIR"
}

setup_env_file() {
    log_info "Configurando variáveis de ambiente..."

    if [ -f "$PROJECT_DIR/.env.prod" ]; then
        log_warning ".env.prod já existe. Pulando..."
        return
    fi

    # Copy template
    cp "$PROJECT_DIR/.env.prod.example" "$PROJECT_DIR/.env.prod"

    # Ask user to provide values
    echo ""
    echo "========================================"
    echo "  CONFIGURAR VARIÁVEIS DE AMBIENTE"
    echo "========================================"
    echo ""

    # DOCKER_REGISTRY
    read -p "DOCKER_REGISTRY (ex: docker.io/seu-username): " docker_registry
    if [ -z "$docker_registry" ]; then
        log_error "DOCKER_REGISTRY é obrigatório"
        exit 1
    fi
    sed -i "s|DOCKER_REGISTRY=.*|DOCKER_REGISTRY=$docker_registry|" "$PROJECT_DIR/.env.prod"

    # ANTHROPIC_API_KEY
    read -p "ANTHROPIC_API_KEY (sk-ant-...): " anthropic_key
    if [ -z "$anthropic_key" ]; then
        log_error "ANTHROPIC_API_KEY é obrigatório"
        exit 1
    fi
    sed -i "s|ANTHROPIC_API_KEY=.*|ANTHROPIC_API_KEY=$anthropic_key|" "$PROJECT_DIR/.env.prod"

    # POSTGRES_PASSWORD
    read -sp "POSTGRES_PASSWORD (senha forte): " postgres_pwd
    echo ""
    if [ -z "$postgres_pwd" ]; then
        log_error "POSTGRES_PASSWORD é obrigatório"
        exit 1
    fi
    sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$postgres_pwd|" "$PROJECT_DIR/.env.prod"

    # API_DOMAIN
    read -p "API_DOMAIN (ex: copyzen.alquimiazen.com.br): " api_domain
    if [ -z "$api_domain" ]; then
        log_error "API_DOMAIN é obrigatório"
        exit 1
    fi
    sed -i "s|API_DOMAIN=.*|API_DOMAIN=$api_domain|" "$PROJECT_DIR/.env.prod"

    # SUPABASE_URL
    read -p "SUPABASE_URL (opcional, pressione Enter para pular): " supabase_url
    if [ ! -z "$supabase_url" ]; then
        sed -i "s|SUPABASE_URL=.*|SUPABASE_URL=$supabase_url|" "$PROJECT_DIR/.env.prod"
    fi

    # SUPABASE_ANON_KEY
    read -p "SUPABASE_ANON_KEY (opcional, pressione Enter para pular): " supabase_anon
    if [ ! -z "$supabase_anon" ]; then
        sed -i "s|SUPABASE_ANON_KEY=.*|SUPABASE_ANON_KEY=$supabase_anon|" "$PROJECT_DIR/.env.prod"
    fi

    # SUPABASE_SERVICE_ROLE_KEY
    read -p "SUPABASE_SERVICE_ROLE_KEY (opcional, pressione Enter para pular): " supabase_role
    if [ ! -z "$supabase_role" ]; then
        sed -i "s|SUPABASE_SERVICE_ROLE_KEY=.*|SUPABASE_SERVICE_ROLE_KEY=$supabase_role|" "$PROJECT_DIR/.env.prod"
    fi

    chmod 600 "$PROJECT_DIR/.env.prod"
    log_success "Variáveis de ambiente configuradas"

    echo ""
    echo "Arquivo: $PROJECT_DIR/.env.prod"
    echo ""
}

deploy_stack() {
    log_info "Fazendo deploy do stack Docker..."

    cd "$PROJECT_DIR"

    # Load environment variables
    export $(cat .env.prod | xargs)

    # Deploy stack
    docker stack deploy \
        -c docker-compose.prod.yml \
        "$DOCKER_STACK_NAME"

    log_success "Stack '$DOCKER_STACK_NAME' deploiado"
}

wait_for_services() {
    log_info "Aguardando serviços ficarem saudáveis..."

    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        # Check if services are running
        local api_replicas=$(docker service ls --filter "name=copyzen_api" --format "{{.Replicas}}" 2>/dev/null || echo "0/0")

        if [[ "$api_replicas" == "1/1" ]] || [[ "$api_replicas" == "2/2" ]]; then
            log_success "Serviços estão saudáveis!"
            return 0
        fi

        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    log_warning "Timeout aguardando serviços. Verifique com: docker stack ps copyzen"
}

show_status() {
    log_info "Status do Deploy"
    echo ""
    echo "Stack: $DOCKER_STACK_NAME"
    echo "Diretório: $PROJECT_DIR"
    echo "Dados: $DATA_DIR/postgres_data"
    echo ""

    docker stack ps "$DOCKER_STACK_NAME" 2>/dev/null || true

    echo ""
    log_success "Deploy completo!"
    echo ""
    echo "Próximos passos:"
    echo "  1. Verificar logs:"
    echo "     docker service logs copyzen_api -f"
    echo ""
    echo "  2. Testar API:"
    echo "     curl https://<seu-dominio>/health"
    echo ""
    echo "  3. Acessar Portainer:"
    echo "     https://<seu-portainer>/stacks"
    echo ""
}

show_error_help() {
    log_error "Deploy falhou!"
    echo ""
    echo "Troubleshooting:"
    echo "  • Ver logs: docker service logs copyzen_api"
    echo "  • Ver status: docker stack ps copyzen"
    echo "  • Remover stack: docker stack rm copyzen"
    echo "  • Verificar rede: docker network ls"
    echo ""
}

################################################################################
# Main Execution
################################################################################

main() {
    echo ""
    echo "╔════════════════════════════════════════════════╗"
    echo "║   🚀 CopyZen Automated Deployment Script       ║"
    echo "║   Docker Swarm + Traefik Integration           ║"
    echo "╚════════════════════════════════════════════════╝"
    echo ""

    # Run deployment steps
    check_requirements || { show_error_help; exit 1; }
    setup_directories || { show_error_help; exit 1; }
    clone_or_update_repo || { show_error_help; exit 1; }
    setup_env_file || { show_error_help; exit 1; }
    deploy_stack || { show_error_help; exit 1; }
    wait_for_services
    show_status
}

# Run main function
main "$@"
