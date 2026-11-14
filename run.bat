@echo off
rem Business Dost AI - design review site launcher (Windows)
setlocal
cd /d "%~dp0"
set PORT=4173

if not exist "design\index.html" (
  echo This folder is not the review folder.
  echo Folder: %CD%
  echo Open the folder that has "design" and "run.bat" side by side, then run this again.
  pause
  goto :eof
)

where python >nul 2>nul
if %errorlevel%==0 (
  start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:%PORT%/'"
  echo Business Dost AI - design review
  echo Folder: %CD%
  echo Serving design at http://localhost:%PORT%  (press Ctrl+C to stop)
  python -m http.server %PORT% --bind 127.0.0.1 --directory design
  goto :eof
)

where py >nul 2>nul
if %errorlevel%==0 (
  start "" powershell -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://localhost:%PORT%/'"
  echo Business Dost AI - design review
  echo Folder: %CD%
  echo Serving design at http://localhost:%PORT%  (press Ctrl+C to stop)
  py -m http.server %PORT% --bind 127.0.0.1 --directory design
  goto :eof
)

echo Python was not found - opening the review site directly.
start "" "design\index.html"
