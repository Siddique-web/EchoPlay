# Expo Go Remote Update Error Fix Guide

## Problem
```
Uncaught Error: java.io.lOException: Failed to download remote update
```

This error occurs when Expo Go on your mobile device cannot connect to the development server.

## Root Causes

1. **Wrong Host Configuration**: Using localhost instead of LAN IP
2. **Network Isolation**: Computer and mobile device on different networks
3. **Firewall Blocking**: Security software blocking connections
4. **OTA Updates Enabled**: Automatic update checks failing

## Solutions

### 1. Immediate Fix - Start with LAN Host

Instead of:
```bash
npx expo start
```

Use:
```bash
npx expo start --host lan
```

Or use our custom script:
```bash
npm run start:lan
```

### 2. Disable OTA Updates (Already Done)

In `app.json`:
```json
{
  "expo": {
    "updates": {
      "enabled": false,
      "checkAutomatically": "ON_ERROR_RECOVERY"
    }
  }
}
```

### 3. Network Requirements

- Both computer and mobile device must be on the same WiFi network
- No VPN interference
- Firewall must allow connections on port 8081

### 4. Troubleshooting Steps

1. **Check Network Connection**:
   - Open Network Troubleshooting screen in the app
   - Verify both devices are on the same network

2. **Restart Development Server**:
   - Stop current server (Ctrl+C)
   - Start with: `npx expo start --host lan`

3. **Check Firewall Settings**:
   - Allow Node.js through firewall
   - Allow port 8081

4. **Verify QR Code**:
   - Should show an IP address (e.g., exp://192.168.1.100:8081)
   - NOT localhost (exp://localhost:8081)

### 5. Alternative Connection Methods

If LAN doesn't work:

1. **USB Connection**:
   ```bash
   npx expo start --host usb
   ```

2. **Tunnel Connection** (slower but works anywhere):
   ```bash
   npx expo start --host tunnel
   ```

## Testing Connectivity

Use the "Network Troubleshooting" screen in the app to:
- Check current network status
- Verify Expo Go readiness
- Get connection instructions
- Test database connectivity

## Predefined Test Credentials

- **Email**: admin@gmail.com
- **Password**: Luc14c4$tr0

## Common Issues and Solutions

### Issue: "Failed to download remote update"
**Solution**: Use `--host lan` flag and ensure same network

### Issue: QR code shows localhost
**Solution**: Restart with `npx expo start --host lan`

### Issue: App loads but shows white screen
**Solution**: Check database initialization in logs

### Issue: Database errors
**Solution**: App automatically falls back to in-memory storage

## Best Practices

1. Always start with `npm run start:lan`
2. Keep computer and mobile on same WiFi
3. Close firewall prompts, don't block Node.js
4. Use Network Troubleshooting screen to verify connectivity
5. Check that the QR code shows an IP address, not localhost

## Emergency Reset

If nothing works:

1. Stop the development server
2. Clear Expo Go app cache/data
3. Delete `.expo` folder in project directory
4. Restart with `npm run start:lan`

This comprehensive approach should resolve all remote update errors and ensure smooth development with Expo Go.