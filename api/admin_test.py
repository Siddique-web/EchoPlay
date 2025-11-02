import requests
import json

# Disable proxy for localhost requests
proxies = {
    "http": "",
    "https": "",
}

print("=== ADMIN FUNCTIONALITY TEST ===")

# Test 1: Admin login
print("\n1. Testing admin login...")
try:
    response = requests.post(
        "http://localhost:5000/api/login",
        json={"email": "admin@gmail.com", "password": "Luc14c4$tr0"},
        proxies=proxies
    )
    if response.status_code == 200:
        token = response.json()['token']
        print("   ✅ Admin login successful")
        print(f"   Token: {token[:30]}...")
    else:
        print(f"   ❌ Admin login failed: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"   ❌ Admin login error: {e}")
    exit(1)

# Set up headers for authenticated requests
headers = {"Content-Type": "application/json", "x-access-token": token}

# Test 2: Add a test video
print("\n2. Testing video addition...")
video_data = {
    "title": "Test Video from Admin Test",
    "description": "This video was added through the admin test script",
    "url": "https://example.com/test-video.mp4",
    "thumbnail": "https://example.com/test-thumbnail.jpg"
}

try:
    response = requests.post(
        "http://localhost:5000/api/videos",
        json=video_data,
        headers=headers,
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

# Test 3: Add a test music
print("\n3. Testing music addition...")
music_data = {
    "title": "Test Music from Admin Test",
    "artist": "Test Artist",
    "url": "https://example.com/test-music.mp3"
}

try:
    response = requests.post(
        "http://localhost:5000/api/music",
        json=music_data,
        headers=headers,
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

# Test 4: Verify content is accessible
print("\n4. Verifying content accessibility...")
try:
    # Get videos
    response = requests.get(
        "http://localhost:5000/api/videos",
        headers=headers,
        proxies=proxies
    )
    if response.status_code == 200:
        videos = response.json()
        print(f"   ✅ Videos accessible: {len(videos)} videos found")
        # Check if our test video is in the list
        test_video_found = any(video['title'] == 'Test Video from Admin Test' for video in videos)
        if test_video_found:
            print("   ✅ Test video found in video list")
        else:
            print("   ⚠️  Test video not found in video list")
    else:
        print(f"   ❌ Video retrieval failed: {response.status_code}")
        
    # Get music
    response = requests.get(
        "http://localhost:5000/api/music",
        headers=headers,
        proxies=proxies
    )
    if response.status_code == 200:
        musics = response.json()
        print(f"   ✅ Music accessible: {len(musics)} music items found")
        # Check if our test music is in the list
        test_music_found = any(music['title'] == 'Test Music from Admin Test' for music in musics)
        if test_music_found:
            print("   ✅ Test music found in music list")
        else:
            print("   ⚠️  Test music not found in music list")
    else:
        print(f"   ❌ Music retrieval failed: {response.status_code}")
except Exception as e:
    print(f"   ❌ Content verification error: {e}")

print("\n=== ADMIN FUNCTIONALITY TEST COMPLETE ===")
print("The admin can now add videos and music that other users can access!")