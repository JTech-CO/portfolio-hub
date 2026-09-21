@echo off
python tools\validate_catalog.py || exit /b 1
python -m http.server 8080
