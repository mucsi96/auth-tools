#!/bin/bash

echo "172.16.238.10 dashboard.auth-tools.home" | sudo tee -a /etc/hosts
echo "172.16.238.10 authelia.auth-tools.home" | sudo tee -a /etc/hosts
echo "172.16.238.10 auth-tools.home" | sudo tee -a /etc/hosts

if [ ! -f /tmp/test_jwks.pem ]; then
  #https://www.authelia.com/reference/guides/generating-secure-values/#generating-an-rsa-keypair
  openssl genrsa -out /tmp/test_jwks.pem 4096
fi
# openssl rsa -in /tmp/test_jwks.pem -pubout -outform PEM | base64 | tr -d '\n' >> /tmp/test_jwks.pub
export TEST_JWKS_KEY=$(cat /tmp/test_jwks.pem)

if [ ! -f /tmp/test_password ]; then
  output=$(docker run authelia/authelia:latest authelia crypto hash generate argon2 --random --random.length 5 --random.charset alphanumeric)
  echo "$output" | grep -oP '(?<=Random Password: ).*' > /tmp/test_password
  echo "$output" | grep -oP '(?<=Digest: ).*' > /tmp/test_password_hash
fi
export TEST_PASSWORD=$(cat /tmp/test_password)
export TEST_PASSWORD_HASH=$(cat /tmp/test_password_hash)

jinja2 docker-compose.j2.yml > docker-compose.rj2.yml
jinja2 test/authelia_configuration.j2.yml > test/authelia_configuration.rj2.yml
jinja2 test/authelia_users.j2.yml > test/authelia_users.rj2.yml

if [ -n "$CI"]; then
  docker network create auth-tools --subnet 172.16.238.0/24
  cat docker-compose.rj2.yml
fi

docker-compose --file docker-compose.rj2.yml up --detach --build --force-recreate --wait --remove-orphans --pull always

