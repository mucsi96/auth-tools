#!/bin/bash

project=auth-tools
pyenv_version=3.12.3

brew update && brew install pyenv pyenv-virtualenv node openjdk

if ! pyenv virtualenvs | grep -q "$project"; then
    pyenv install $pyenv_version
    pyenv virtualenv $pyenv_version $project
    pyenv local $project
fi

pyenv activate $project

pip install -r requirements.txt

(cd agent && npm install)
(cd client_lib && npm install && npm link)
(cd client && npm install && npm link @mucsi96/auth-tools)
(cd mock_identity_provider && npm install)

tenant_id=$(az keyvault secret show --vault-name p02 --name tenant-id --query value -o tsv)
issuer=$(az keyvault secret show --vault-name p02 --name issuer --query value -o tsv)
token_agent_client_id=$(az keyvault secret show --vault-name p02 --name token-agent-client-id --query value -o tsv)
token_agent_client_secret=$(az keyvault secret show --vault-name p02 --name token-agent-client-secret --query value -o tsv)
demo_api_client_id=$(az keyvault secret show --vault-name p02 --name demo-api-client-id --query value -o tsv)
traefik_client_id=$(az keyvault secret show --vault-name p02 --name traefik-client-id --query value -o tsv)
test_user_email=$(az keyvault secret show --vault-name p02 --name test-user-email --query value -o tsv)
test_user_password=$(az keyvault secret show --vault-name p02 --name test-user-password --query value -o tsv)

echo "TENANT_ID=$tenant_id" > .env
echo "ISSUER=$issuer" >> .env
echo "CLIENT_ID=$token_agent_client_id" >> .env
echo "CLIENT_SECRET=$token_agent_client_secret" >> .env
echo "DEMO_API_CLIENT_ID=$demo_api_client_id" >> .env
echo "VITE_DEMO_API_CLIENT_ID=$demo_api_client_id" >> .env
echo "TRAEFIK_CLIENT_ID=$traefik_client_id" >> .env
echo "BASE_PATH=" >> .env
echo "PUBLIC_URL=http://localhost:8080" >> .env
echo "COOKIE_DOMAIN=localhost" >> .env
echo "TEST_USER_EMAIL=$test_user_email" >> .env
echo "TEST_USER_PASSWORD=$test_user_password" >> .env