@echo off
echo ===================================================
echo   CarePath AI - Push to 'anti-gravity' GitHub Repo
echo ===================================================
echo.

REM Configure Git identity
git config user.name "vishalkirthik2007-ship-it"
git config user.email "vishalkirthik2007@gmail.com"

REM Ensure remote origin points to anti-gravity
git remote set-url origin https://github.com/vishalkirthik2007-ship-it/anti-gravity.git

echo Current Git Remote:
git remote -v
echo.

echo Staging any final changes...
git add .
git commit -m "feat: complete CarePath AI healthcare platform for anti-gravity repo" 2>nul

echo.
echo Pushing branch 'main' to GitHub (anti-gravity)...
echo.
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================
    echo   SUCCESS! Code pushed to:
    echo   https://github.com/vishalkirthik2007-ship-it/anti-gravity
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo   NOTE: If the repository does not exist yet:
    echo   1. Opening https://github.com/new?name=anti-gravity in your browser...
    echo   2. Click 'Create repository' on GitHub (keep it empty, no README)
    echo   3. Press any key in this window to retry pushing!
    echo ===================================================
    echo.
    start https://github.com/new?name=anti-gravity
    pause
    echo Retrying git push...
    git push -u origin main
)

pause
