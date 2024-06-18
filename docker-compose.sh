#!/bin/bash

source .env
docker compose version

if [[ -n "$MOCK_IDENTITY_PROVIDER" ]]; then
  export ISSUER="http://mock-identity-provider:8080/$TENANT_ID/v2.0"
fi

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
