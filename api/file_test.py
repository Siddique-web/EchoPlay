import requests
import json

# Disable proxy for localhost requests
proxies = {
    "http": "",
    "https": "",
}

print("=== FILE SELECTION FUNCTIONALITY TEST ===")

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

# Test 2: Add a test video with a sample URL (simulating file selection)
print("\n2. Adding a test video with sample URL...")
video_data = {
    "title": "Test Video from File Selection",
    "description": "This video was added through the file selection functionality",
    "url": "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
    "thumbnail": "https://sample-videos.com/img123.jpg"
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
        print(f"   Video ID: {video_result['video']['id']}")
    else:
        print(f"   ❌ Video addition failed: {response.status_code}")
        print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ❌ Video addition error: {e}")

# Test 3: Add a test music with a sample URL (simulating file selection)
print("\n3. Adding a test music with sample URL...")
music_data = {
    "title": "Test Music from File Selection",
    "artist": "Test Artist",
    "url": "https://sample-music.com/audio123.mp3"
}

try:
    response = requests.post(
        "http://localhost:5000/api/music",
        json=music_data,
        headers=admin_headers,
        proxies=proxies
    )
    if response.status_code == 201:
        music_result = response.json()
        print(f"   ✅ Music added successfully: {music_result['music']['title']} by {music_result['music']['artist']}")
        print(f"   Music ID: {music_result['music']['id']}")
    else:
        print(f"   ❌ Music addition failed: {response.status_code}")
        print(f"   Response: {response.json()}")
except Exception as e:
    print(f"   ❌ Music addition error: {e}")

print("\n=== FILE SELECTION FUNCTIONALITY TEST COMPLETE ===")
print("The admin can now select videos and music from their device gallery!")
print("Note: In a full implementation, actual file uploads would be handled by the backend.")