#!/bin/bash

pip install -r requirements.txt

playwright install chromium --with-deps

cd client && npm install

#https://www.authelia.com/reference/guides/generating-secure-values/#generating-an-rsa-keypair
openssl genrsa -out /tmp/test_jwks.pem 4096
# openssl rsa -in /tmp/test_jwks.pem -pubout -outform PEM | base64 | tr -d '\n' >> /tmp/test_jwks.pub
echo 'export TEST_JWKS_KEY=$(cat /tmp/test_jwks.pem)' >> $HOME/.bashrc

output=$(docker run authelia/authelia:latest authelia crypto hash generate argon2 --random --random.length 5 --random.charset alphanumeric)
echo "$output" | grep -oP '(?<=Random Password: ).*' > /tmp/test_password
echo "$output" | grep -oP '(?<=Digest: ).*' > /tmp/test_password_hash
echo 'export TEST_PASSWORD=$(cat /tmp/test_password)' >> $HOME/.bashrc
echo 'export TEST_PASSWORD_HASH=$(cat /tmp/test_password_hash)' >> $HOME/.bashrc
