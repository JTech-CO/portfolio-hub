#!/usr/bin/env sh
set -eu
python3 tools/validate_catalog.py
python3 -m http.server 8080
