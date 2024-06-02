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
(cd client_lib && npm install)

identity_provider_client_id=$(az keyvault secret show --vault-name p02 --name identity-provider-client-id --query value -o tsv)
identity_provider_client_secret=$(az keyvault secret show --vault-name p02 --name identity-provider-client-secret --query value -o tsv)
identity_provider_issuer=$(az keyvault secret show --vault-name p02 --name identity-provider-issuer --query value -o tsv)

echo "ISSUER=$identity_provider_issuer" > .env
echo "CLIENT_ID=$identity_provider_client_id" >> .env
echo "CLIENT_SECRET=$identity_provider_client_secret" >> .env
echo "BASE_PATH=" >> .env
echo "PUBLIC_URL=http://localhost:8080" >> .env
echo "COOKIE_DOMAIN=localhost" >> .env