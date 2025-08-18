@echo off
echo Starting Eurovision Voting Server...
echo ======================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Build the application
echo Building the application...
npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Please check the errors above.
    pause
    exit /b 1
)

echo.
echo Starting the server...
echo Server will be available at:
echo - Local: http://localhost:3000
echo - Network: http://YOUR_IP:3000
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the production server
npm start
