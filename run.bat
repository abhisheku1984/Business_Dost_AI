@echo off
rem Business Dost AI - design review site launcher (Windows)
rem Starts serve.py, which picks a free port, prints the URL and opens the browser.
setlocal
cd /d "%~dp0"

if not exist "design\index.html" (
  echo This folder is not the review folder.
  echo Folder: %CD%
  echo Open the folder that has "design" and "run.bat" side by side, then run this again.
  pause
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  python serve.py
  goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
  py serve.py
  goto :eof
)

echo Python was not found - opening the review site directly.
start "" "design\index.html"
