# Expo Authorization Error Resolution

This document explains how to resolve the "Entidade não autorizada" (Unauthorized Entity) error when accessing your Expo project.

## Problem

When users try to access the Expo project at:
```
https://expo.dev/accounts/siddique_faizy_rego/projects/EchoPlay/updates/83b5c1c1-07c8-4b04-8b11-ee9a332cc569
```

They encounter this error:
```
Entidade não autorizada: UpdateEntity[16c72375-ab52-4c36-b307-fffaa849df3b] (viewer = RegularUserViewerContext[99bfb6b4-92f5-456c-9655-fed452b1b51b], action = READ, ruleIndex = -1)
```

## Root Cause

This error occurs because the Expo update is not properly configured for public access. The update entity is not authorized for READ access by regular users.

## Solution

### 1. Verify Configuration Files

Ensure your `app.json` includes:

```json
{
  "expo": {
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_ERROR_RECOVERY",
      "url": "https://u.expo.dev/a4f99eb4-b893-4b5b-80ff-853e26b2b9b4"
    },
    "extra": {
      "eas": {
        "projectId": "a4f99eb4-b893-4b5b-80ff-853e26b2b9b4"
      }
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  }
}
```

### 2. Configure EAS Update

Run these commands:

```bash
# Install EAS CLI if not already installed
npm install -g eas-cli

# Login to Expo
eas login

# Configure project for EAS Update
eas update:configure

# Publish an update
eas update --branch production --message "Fix authorization error"
```

### 3. Verify Project Settings

Make sure your project settings on Expo.dev allow public access:

1. Go to https://expo.dev/accounts/siddique_faizy_rego/projects/EchoPlay/settings
2. Check that the project visibility is set to "Public" or "Unlisted"
3. Ensure the update channel is properly configured

### 4. Test the Fix

After publishing the update, users should be able to access:
```
https://expo.dev/@siddique_faizy_rego/EchoPlay
```

## Additional Scripts

This project includes helper scripts:

- `verify-expo-config.js` - Verifies Expo configuration
- `publish-update.js` - Publishes a new update
- `configure-expo-project.js` - Configures the project for EAS

Run them with:
```bash
node verify-expo-config.js
node publish-update.js
node configure-expo-project.js
```

## Troubleshooting

If the error persists:

1. Ensure you're using the correct project ID
2. Check that you have owner/admin permissions for the project
3. Verify the update exists and is published to the correct branch
4. Confirm the runtime version matches between builds and updates

## Contact Support

If you continue to experience issues, contact Expo support with:
- Project ID: a4f99eb4-b893-4b5b-80ff-853e26b2b9b4
- Error message and timestamp
- Steps to reproduce the issue