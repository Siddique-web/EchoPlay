# Running EchoPlay on Web and Expo Go

This guide will help you run the EchoPlay application correctly on both web and mobile devices using Expo Go.

## Prerequisites

1. Node.js installed
2. Python 3.8+ installed
3. Expo Go app installed on your mobile device
4. Both your development machine and mobile device connected to the same WiFi network

## Starting the Servers

### Method 1: Using the Start Script (Recommended)

Double-click on `start-servers.bat` to automatically start both servers:

- Python API Server (http://localhost:5000)
- Expo Development Server (http://localhost:8081)

### Method 2: Manual Start

1. **Start the Python API Server:**
   ```bash
   cd api
   python app.py
   ```

2. **Start the Expo Development Server:**
   ```bash
   npx expo start --host lan
   ```

## Accessing the Application

### On Web Browser

1. Open your browser
2. Navigate to http://localhost:8081
3. The application should load automatically

### On Mobile Device (Expo Go)

1. Open Expo Go app on your mobile device
2. Ensure your mobile device is on the same WiFi network as your development machine
3. Scan the QR code displayed in the terminal or Expo DevTools
4. The application will download and run on your device

## Default Credentials

- **Admin User**: admin@gmail.com
- **Password**: Luc14c4$tr0

## Adding Videos and Music

1. Log in with the admin credentials
2. Navigate to the Admin section
3. Use the forms to add videos and music
4. The content will be stored in the SQLite database
5. All users will be able to view the added content on the home screen

## Troubleshooting

### Server Not Starting

1. Make sure no other applications are using ports 5000 (API) or 8081 (Expo)
2. Check Windows Firewall settings
3. Try running the commands in separate terminal windows

### Connection Issues on Mobile

1. Ensure both devices are on the same WiFi network
2. Check that the IP address displayed matches your machine's network IP
3. Try restarting both servers

### Video/Music Not Displaying

1. Check that the Python API server is running
2. Verify that videos/music were added successfully
3. Check the browser console or mobile logs for errors

## Features Verification

### Web Platform
- [ ] User authentication (login/register)
- [ ] Admin video/music management
- [ ] Video playback
- [ ] Profile management
- [ ] Responsive design

### Expo Go (Mobile)
- [ ] User authentication (login/register)
- [ ] Admin video/music management
- [ ] Video playback
- [ ] Profile management
- [ ] Native mobile UI

## Database Storage

All data (users, videos, music) is stored in a SQLite database:
- Location: `api/instance/echoplay_api.db`
- The database is automatically created and initialized on first run

## File Storage

Uploaded files (profile images, etc.) are stored in:
- Location: `api/uploads/`

## API Endpoints

- **Health Check**: GET `/api/health`
- **Login**: POST `/api/login`
- **Register**: POST `/api/register`
- **User Profile**: GET/PUT `/api/user/profile`
- **Profile Image**: POST `/api/user/profile-image`
- **Videos**: GET/POST `/api/videos`
- **Music**: GET/POST `/api/music`

## Support

If you encounter any issues:
1. Check the terminal/console logs for error messages
2. Ensure all prerequisites are installed
3. Restart both servers
4. Clear the Expo cache: `npx expo start --clear`