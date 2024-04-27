#!/bin/bash

npm i -g playwright

pip install -r requirements.txt

playwright install chromium --with-deps

cd client && npm install
