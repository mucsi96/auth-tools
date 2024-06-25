#!/usr/bin/env python3

from pathlib import Path
import sys
from publish_tools import ansible_utils, version_utils, npm_utils

root_directory = Path(__file__).parent.parent

print('root_directory', root_directory)

secrets = ansible_utils.load_vars(sys.argv[2], root_directory / "vars/vault.yaml")
version = version_utils.get_version(
    src=root_directory / "client_lib", tag_prefix="client-lib"
)

npm_utils.publish_npm_package(
    src=root_directory / "client_lib",
    version=version,
    tag_prefix="client-lib",
    npm_access_token=secrets["npm_access_token"],
    github_access_token=sys.argv[1],
)
