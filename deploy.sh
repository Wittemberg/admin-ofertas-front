#!/bin/bash
set -e

echo "=== Atualizando admin-ofertas ==="

# Força pull da imagem mais recente
docker pull ghcr.io/wittemberg/admin-ofertas:latest

# Aplica o stack com a nova imagem
docker stack deploy -c /root/admin-ofertas/docker-compose.yml admin-ofertas

# Aguarda o healthcheck
echo "Aguardando healthcheck..."
sleep 5

# Verifica o status
docker service ps admin-ofertas_admin --format "table {{.Name}}\t{{.CurrentState}}\t{{.Image}}"

echo "=== Concluído ==="