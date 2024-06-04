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
identity_provider_client_scope=$(az keyvault secret show --vault-name p02 --name identity-provider-client-scope --query value -o tsv)
identity_provider_issuer=$(az keyvault secret show --vault-name p02 --name identity-provider-issuer --query value -o tsv)
test_user_email=$(az keyvault secret show --vault-name p02 --name test-user-email --query value -o tsv)
test_user_password=$(az keyvault secret show --vault-name p02 --name test-user-password --query value -o tsv)

echo "ISSUER=$identity_provider_issuer" > .env
echo "CLIENT_ID=$identity_provider_client_id" >> .env
echo "CLIENT_SECRET=$identity_provider_client_secret" >> .env
echo "CLIENT_SCOPE=$identity_provider_client_scope" >> .env
echo "BASE_PATH=" >> .env
echo "PUBLIC_URL=http://localhost:8080" >> .env
echo "COOKIE_DOMAIN=localhost" >> .env
echo "TEST_USER_EMAIL=$test_user_email" >> .env
echo "TEST_USER_PASSWORD=$test_user_password" >> .env