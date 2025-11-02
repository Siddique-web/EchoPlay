# Start Python API Server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\User\Desktop\Aplicativo\EchoPlay\api; python app.py" -WindowStyle Normal

# Start Expo Development Server
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd c:\Users\User\Desktop\Aplicativo\EchoPlay; npx expo start --host lan" -WindowStyle Normal

Write-Host "Servers started successfully!"