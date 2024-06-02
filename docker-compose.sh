#!/bin/bash

# echo "127.0.0.1 web.auth-tools.home" | sudo tee -a /etc/hosts
# echo "127.0.0.1 spa.auth-tools.home" | sudo tee -a /etc/hosts
# echo "127.0.0.1 dashboard.auth-tools.home" | sudo tee -a /etc/hosts
# echo "127.0.0.1 auth.auth-tools.home" | sudo tee -a /etc/hosts

docker compose version

if [[ -n "$CI" ]]; then
  docker compose up --detach --wait
else
  docker compose up --detach --build --force-recreate --wait --remove-orphans --pull always
fi
