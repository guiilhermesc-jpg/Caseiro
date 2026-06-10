@echo off
rem === PUBLICAR O JOGO (2 cliques) — caseiro.pages.dev ===
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File publicar.ps1
echo.
echo Pronto! Abra https://caseiro.pages.dev e de Ctrl+Shift+R no navegador.
pause
