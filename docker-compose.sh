#!/bin/bash

if [[ -n "$MOCK_IDENTITY_PROVIDER" || -n "$CI" ]]; then
  export TENANT_ID="auth-tools-tenant"
  export ISSUER="http://mock-identity-provider:8080/$TENANT_ID/v2.0"
  export DEMO_API_CLIENT_ID="00000000-0000-0000-0000-000000000001"
  export TRAEFIK_CLIENT_ID="00000000-0000-0000-0000-000000000002"
  export CLIENT_ID="00000000-0000-0000-0000-000000000003"
  export CLIENT_SECRET="test"
else
  source .env
fi

docker compose version

if [[ -n "$CI" ]]; then
  echo "127.0.0.1 web.auth-tools.home" | sudo tee -a /etc/hosts
  echo "127.0.0.1 spa.auth-tools.home" | sudo tee -a /etc/hosts
  echo "127.0.0.1 dashboard.auth-tools.home" | sudo tee -a /etc/hosts
  echo "127.0.0.1 auth.auth-tools.home" | sudo tee -a /etc/hosts
  echo "127.0.0.1 idp.auth-tools.home" | sudo tee -a /etc/hosts
  docker compose up --detach --wait
else
  docker compose up --detach --build --force-recreate --wait --remove-orphans --pull always
fi
