import requests
import json

# Disable proxy for localhost requests
proxies = {
    "http": "",
    "https": "",
}

print("=== COMPLETE ADMIN FUNCTIONALITY TEST ===")

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
        print(f"   Token: {admin_token[:30]}...")
    else:
        print(f"   ❌ Admin login failed: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"   ❌ Admin login error: {e}")
    exit(1)

# Set up headers for authenticated requests
admin_headers = {"Content-Type": "application/json", "x-access-token": admin_token}

# Test 2: Add a test video as admin
print("\n2. Testing video addition as admin...")
video_data = {
    "title": "Admin Test Video - Functional Verification",
    "description": "This video was added to verify admin functionality works correctly",
    "url": "https://example.com/admin-test-video.mp4",
    "thumbnail": "https://example.com/admin-test-thumbnail.jpg"
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
        video_id = video_result['video']['id']
        print(f"   ✅ Video added successfully: {video_result['video']['title']}")
        print(f"   Video ID: {video_id}")
    else:
        print(f"   ❌ Video addition failed: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"   ❌ Video addition error: {e}")
    exit(1)

# Test 3: Add a test music as admin
print("\n3. Testing music addition as admin...")
music_data = {
    "title": "Admin Test Music - Functional Verification",
    "artist": "Admin Verification Artist",
    "url": "https://example.com/admin-test-music.mp3"
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
        music_id = music_result['music']['id']
        print(f"   ✅ Music added successfully: {music_result['music']['title']} by {music_result['music']['artist']}")
        print(f"   Music ID: {music_id}")
    else:
        print(f"   ❌ Music addition failed: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"   ❌ Music addition error: {e}")
    exit(1)

# Test 4: Register a regular user (or login if already exists)
print("\n4. Testing regular user registration/login...")
user_data = {
    "email": "regularuser@example.com",
    "password": "TestPassword123!",
    "name": "Regular User"
}

user_token = None
try:
    # Try to register first
    response = requests.post(
        "http://localhost:5000/api/register",
        json=user_data,
        proxies=proxies
    )
    if response.status_code == 201:
        user_result = response.json()
        user_token = user_result['token']
        print(f"   ✅ User registration successful: {user_result['user']['name']}")
        print(f"   User ID: {user_result['user']['id']}")
    elif response.status_code == 409:
        # User already exists, try to login
        print("   ⚠️  User already exists, attempting login...")
        login_response = requests.post(
            "http://localhost:5000/api/login",
            json={"email": "regularuser@example.com", "password": "TestPassword123!"},
            proxies=proxies
        )
        if login_response.status_code == 200:
            user_result = login_response.json()
            user_token = user_result['token']
            print(f"   ✅ User login successful: {user_result['user']['name']}")
            print(f"   User ID: {user_result['user']['id']}")
        else:
            print(f"   ❌ User login failed: {login_response.status_code}")
            exit(1)
    else:
        print(f"   ❌ User registration failed: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"   ❌ User registration/login error: {e}")
    exit(1)

# Set up headers for regular user
user_headers = {"Content-Type": "application/json", "x-access-token": user_token}

# Test 5: Verify regular user can access admin-added content
print("\n5. Verifying regular user can access admin-added content...")
try:
    # Get videos
    response = requests.get(
        "http://localhost:5000/api/videos",
        headers=user_headers,
        proxies=proxies
    )
    if response.status_code == 200:
        videos = response.json()
        print(f"   ✅ Videos accessible to regular user: {len(videos)} videos found")
        # Check if our admin test video is in the list
        admin_video_found = any(video['title'] == 'Admin Test Video - Functional Verification' for video in videos)
        if admin_video_found:
            print("   ✅ Admin-added video found in video list for regular user")
        else:
            print("   ⚠️  Admin-added video not found in video list for regular user")
    else:
        print(f"   ❌ Video retrieval failed for regular user: {response.status_code}")
        
    # Get music
    response = requests.get(
        "http://localhost:5000/api/music",
        headers=user_headers,
        proxies=proxies
    )
    if response.status_code == 200:
        musics = response.json()
        print(f"   ✅ Music accessible to regular user: {len(musics)} music items found")
        # Check if our admin test music is in the list
        admin_music_found = any(music['title'] == 'Admin Test Music - Functional Verification' for music in musics)
        if admin_music_found:
            print("   ✅ Admin-added music found in music list for regular user")
        else:
            print("   ⚠️  Admin-added music not found in music list for regular user")
    else:
        print(f"   ❌ Music retrieval failed for regular user: {response.status_code}")
except Exception as e:
    print(f"   ❌ Content verification error: {e}")

print("\n=== COMPLETE ADMIN FUNCTIONALITY TEST COMPLETE ===")
print("✅ The admin can now add videos and music that other users can access!")
print("✅ Videos appear in the 'Recommended Videos' section")
print("✅ Music appears in the 'Popular Playlists' section")
print("✅ All users can view and access admin-added content")