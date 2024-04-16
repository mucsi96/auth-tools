#!/bin/bash

jinja2 docker-compose.j2.yml > docker-compose.rj2.yml
jinja2 test/authelia_configuration.j2.yml > test/authelia_configuration.rj2.yml
jinja2 test/authelia_users.j2.yml > test/authelia_users.rj2.yml
