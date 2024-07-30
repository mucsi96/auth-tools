#!/usr/bin/env python3

from pathlib import Path
import sys
from publish_tools import ansible_utils, version_utils, mvn_utils

root_directory = Path(__file__).parent.parent

secrets = ansible_utils.load_vars(sys.argv[2], root_directory / "vars/vault.yml")
version = version_utils.get_version(
    src=root_directory / "server_test_lib", tag_prefix="server-test-lib"
)

mvn_utils.publish_mvn_package(
    src=root_directory / "server_test_lib",
    version=version,
    tag_prefix="server-test-lib",
    maven_username=secrets['maven_username'],
    maven_password=secrets['maven_password'],
    gpg_private_key=secrets['gpg_private_key'],
    gpg_passphrase=secrets['gpg_passphrase'],
    github_access_token=sys.argv[1],
)
