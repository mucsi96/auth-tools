#!/bin/bash

git config --global --add safe.directory $CONTAINER_WORKSPACE_FOLDER
sudo chown $(whoami) /var/run/docker.sock
