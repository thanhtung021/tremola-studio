@echo off
set "PATH=C:\Users\thanh\AppData\Local\node;%PATH%"
cd /d "%~dp0.."
bun run dev -- --port 8100 --strictPort
