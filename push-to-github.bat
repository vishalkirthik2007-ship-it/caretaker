@echo off
echo ===================================================
echo   CarePath AI - Push to 'caretaker' GitHub Repo
echo ===================================================
echo.

REM Configure Git identity
git config user.name "vishalkirthik2007-ship-it"
git config user.email "vishalkirthik2007@gmail.com"

REM Ensure remote origin points to caretaker
git remote set-url origin https://github.com/vishalkirthik2007-ship-it/caretaker.git

echo Current Git Remote:
git remote -v
echo.

echo Staging any final changes...
git add .
git commit -m "feat: complete CarePath AI healthcare platform for caretaker repo" 2>nul

echo.
echo Pushing branch 'main' to GitHub (caretaker)...
echo.
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================
    echo   SUCCESS! Code pushed to:
    echo   https://github.com/vishalkirthik2007-ship-it/caretaker
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo   NOTE: If Git Credential Manager prompted for login:
    echo   Please sign in with your GitHub account.
    echo   Press any key in this window to retry pushing!
    echo ===================================================
    echo.
    pause
    echo Retrying git push...
    git push -u origin main
)

pause
