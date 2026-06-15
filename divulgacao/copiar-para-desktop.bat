@echo off
rem ============================================================
rem  Copia a pasta "divulgacao" para o Desktop e Documentos
rem  (dois cliques - Windows). Mantem a copia local + nuvem.
rem ============================================================
setlocal
cd /d "%~dp0"

set "ORIGEM=%~dp0"
set "DEST1=%USERPROFILE%\Desktop\Divulgacao-Campanhas"
set "DEST2=%USERPROFILE%\Documents\Divulgacao-Campanhas"

echo.
echo Copiando material de divulgacao...
echo   Origem : %ORIGEM%
echo.

rem Copia para o Desktop (ignora a propria copia e arquivos do git)
robocopy "%ORIGEM%." "%DEST1%" /E /XF copiar-para-desktop.bat /XD .git >nul
echo  [OK] Desktop    -> %DEST1%

rem Copia para Documentos
robocopy "%ORIGEM%." "%DEST2%" /E /XF copiar-para-desktop.bat /XD .git >nul
echo  [OK] Documentos -> %DEST2%

echo.
echo Pronto! As copias locais estao atualizadas.
echo (A versao "fonte" continua versionada na nuvem/Git.)
echo.
pause
endlocal
