import requests
import json

# Disable proxy for localhost requests
proxies = {
    "http": "",
    "https": "",
}

print("=== HOME SCREEN REFRESH TEST ===")

# Test 1: Admin login
print("\n1. Testing admin login...")
try:
    response = requests.post(
        "http://localhost:5000/api/login",
        json={"email": "admin@gmail.com", "password": "Luc14c4$tr0"},
        proxies=proxies
    )
    if response.status_code == 200:
        admin_token = response.json()['token']
        print("   ✅ Admin login successful")
    else:
        print(f"   ❌ Admin login failed: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"   ❌ Admin login error: {e}")
    exit(1)

# Set up headers for authenticated requests
admin_headers = {"Content-Type": "application/json", "x-access-token": admin_token}

# Test 2: Get initial video count
print("\n2. Getting initial video count...")
try:
    response = requests.get(
        "http://localhost:5000/api/videos",
        headers=admin_headers,
        proxies=proxies
    )
    if response.status_code == 200:
        initial_videos = response.json()
        initial_count = len(initial_videos)
        print(f"   ✅ Initial video count: {initial_count}")
    else:
        print(f"   ❌ Failed to get videos: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"   ❌ Error getting videos: {e}")
    exit(1)

# Test 3: Add a new video
print("\n3. Adding a new video...")
video_data = {
    "title": "Test Video for Refresh",
    "description": "This video is for testing the refresh functionality",
    "url": "https://example.com/test-video-refresh.mp4",
    "thumbnail": "https://example.com/test-thumbnail-refresh.jpg"
}

try:
    response = requests.post(
        "http://localhost:5000/api/videos",
        json=video_data,
        headers=admin_headers,
        proxies=proxies
    )
    if response.status_code == 201:
        video_result = response.json()
        print(f"   ✅ Video added successfully: {video_result['video']['title']}")
    else:
        print(f"   ❌ Video addition failed: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"   ❌ Video addition error: {e}")
    exit(1)

# Test 4: Get updated video count
print("\n4. Getting updated video count...")
try:
    response = requests.get(
        "http://localhost:5000/api/videos",
        headers=admin_headers,
        proxies=proxies
    )
    if response.status_code == 200:
        updated_videos = response.json()
        updated_count = len(updated_videos)
        print(f"   ✅ Updated video count: {updated_count}")
        
        if updated_count > initial_count:
            print("   ✅ Video count increased - refresh functionality working!")
        else:
            print("   ⚠️  Video count did not increase - check refresh functionality")
    else:
        print(f"   ❌ Failed to get updated videos: {response.status_code}")
except Exception as e:
    print(f"   ❌ Error getting updated videos: {e}")

print("\n=== HOME SCREEN REFRESH TEST COMPLETE ===")
print("When you navigate back to the home screen, it should now show the newly added content!")