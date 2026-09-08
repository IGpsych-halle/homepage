@echo off
setlocal
set "BASH=C:\Program Files\Git\bin\bash.exe"

if not exist "%BASH%" (
  echo Git Bash wurde nicht unter "%BASH%" gefunden.
  echo.
  echo Starte alternativ deploy-website.sh direkt in Git Bash.
  pause
  exit /b 1
)

"%BASH%" "%~dp0deploy-website.sh"
endlocal
