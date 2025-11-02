# EchoPlay Deployment Checklist

## Prerequisites
- [x] Node.js installed
- [x] Python 3.7+ installed
- [x] Expo CLI available via npx
- [x] All npm dependencies installed
- [x] All Python dependencies installed

## Services to Run

### 1. Python API Server
```bash
cd api
python app.py
```
- [x] Should be running on http://localhost:5000
- [x] Health check endpoint accessible at http://localhost:5000/api/health
- [x] Default admin user created (admin@gmail.com / Luc14c4$tr0)

### 2. Expo Development Server
```bash
npx expo start --host lan
```
- [x] Should be running on local network
- [x] QR code visible for Expo Go scanning
- [x] Web interface accessible at http://localhost:8081

## Testing Connections

### API Endpoints
- [x] GET /api/health - API status check
- [x] POST /api/login - User authentication
- [x] POST /api/register - User registration
- [x] GET /api/user/profile - User profile retrieval
- [x] PUT /api/user/profile - User profile update
- [x] POST /api/user/profile-image - Profile image upload

### Authentication
- [x] Default admin credentials work: admin@gmail.com / Luc14c4$tr0
- [x] Login redirects to profile screen
- [x] Invalid credentials show error messages
- [x] Logout functionality works

## Platform-Specific Features

### Expo Go (Mobile)
- [x] QR code scanning works
- [x] Camera permission requests function
- [x] Gallery permission requests function
- [x] Image picker works for profile photos
- [x] Camera works for taking profile photos
- [x] Haptic feedback works
- [x] Navigation between screens works

### Web Browser
- [x] Direct URL access works
- [x] File input for profile images works
- [x] Responsive design adapts to screen size
- [x] Keyboard navigation works
- [x] Form validation works

## Database & Storage
- [x] In-memory database initialized
- [x] User data persistence works
- [x] Profile image upload works
- [x] Fallback to local storage when API unavailable

## Error Handling
- [x] Network errors handled gracefully
- [x] Invalid credentials show appropriate messages
- [x] Permission denials show helpful alerts
- [x] API failures fallback to local operations

## Performance & Optimization
- [x] App loads within reasonable time
- [x] Animations run smoothly
- [x] Memory usage is stable
- [x] No console errors in development

## Security
- [x] Passwords hashed and not stored in plain text
- [x] JWT tokens used for authentication
- [x] API endpoints properly secured
- [x] CORS settings configured correctly

## Troubleshooting Common Issues

### If Expo Go Can't Connect:
1. Ensure both devices are on the same network
2. Check firewall settings
3. Restart Expo server with `npx expo start --host lan`
4. Clear Expo Go cache if needed

### If Web Version Doesn't Work:
1. Check browser console for errors
2. Ensure no port conflicts (try `npx expo start --host lan --port 8082`)
3. Clear browser cache

### If API Connection Fails:
1. Ensure Python API is running
2. Check if port 5000 is available
3. Verify network connectivity
4. Check API logs for errors

## Useful Commands

### Development
```bash
# Start Expo server for LAN access
npx expo start --host lan

# Start Python API
cd api && python app.py

# Clear all caches
npm run reset-cache

# Reset entire project
npm run reset-project
```

### Testing
```bash
# Test API endpoints
cd api && python test_api.py

# Test profile image upload
cd api && python test_profile_upload.py

# Run connection tests
node test-app-connection.js
```

## Success Criteria
- [x] App loads without errors on both platforms
- [x] Login works with default credentials
- [x] Profile screen accessible after login
- [x] Profile image upload works
- [x] All navigation functions correctly
- [x] No console errors in browser/mobile
- [x] Responsive design works on different screen sizes