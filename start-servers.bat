@echo off
echo Starting EchoPlay Servers...
echo =========================

echo Starting Python API Server...
start "API Server" /min cmd /c "cd api && python app.py ^^^& pause"

timeout /t 3 /nobreak >nul

echo Starting Expo Development Server...
start "Expo Server" /min cmd /c "npx expo start --host lan ^^^& pause"

echo.
echo Servers started successfully!
echo.
echo API Server: http://localhost:5000
echo Expo Server: http://localhost:8081
echo.
echo Make sure both servers remain running.
echo Press any key to close this window...
pause >nul