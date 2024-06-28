#!/usr/bin/env python3

from os import environ
from pathlib import Path
import sys
from publish_tools import ansible_utils, version_utils, docker_utils

root_directory = Path(__file__).parent.parent

secrets = ansible_utils.load_vars(sys.argv[2], root_directory / "vars/vault.yml")
version = version_utils.get_version(src=root_directory / "agent", tag_prefix="agent")
username = environ.get('GITHUB_REPOSITORY_OWNER')

if username == None:
    print("GitHub username is missing", flush=True, file=sys.stderr)
    exit(1)
    

docker_utils.build_and_push_docker_img(
    src=root_directory / "agent",
    version=version,
    tag_prefix="agent",
    image_name="auth-agent",
    docker_username=username,
    docker_password=secrets["docker_password"],
    github_access_token=sys.argv[1],
)
