@echo off
set "PATH=C:\Users\thanh\AppData\Local\node;%PATH%"
cd /d "%~dp0.."
call npx -y wrangler@4 dev --config .output/server/wrangler.json --port 8101 --local --persist-to .wrangler/state
