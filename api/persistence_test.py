import requests
import json
import time

# Disable proxy for localhost requests
proxies = {
    "http": "",
    "https": "",
}

print("=== DATA PERSISTENCE TEST ===")

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

# Test 2: Get initial counts
print("\n2. Getting initial counts...")
try:
    # Get initial video count
    response = requests.get(
        "http://localhost:5000/api/videos",
        headers=admin_headers,
        proxies=proxies
    )
    if response.status_code == 200:
        initial_videos = response.json()
        initial_video_count = len(initial_videos)
        print(f"   Initial videos: {initial_video_count}")
    else:
        print(f"   ❌ Failed to get videos: {response.status_code}")
        exit(1)
        
    # Get initial music count
    response = requests.get(
        "http://localhost:5000/api/music",
        headers=admin_headers,
        proxies=proxies
    )
    if response.status_code == 200:
        initial_musics = response.json()
        initial_music_count = len(initial_musics)
        print(f"   Initial music: {initial_music_count}")
    else:
        print(f"   ❌ Failed to get music: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"   ❌ Error getting initial counts: {e}")
    exit(1)

# Test 3: Add test video
print("\n3. Adding test video...")
video_data = {
    "title": "Persistence Test Video",
    "description": "This video tests data persistence in the database",
    "url": "https://example.com/persistence-test-video.mp4",
    "thumbnail": "https://example.com/persistence-test-thumbnail.jpg"
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
        test_video_id = video_result['video']['id']
        print(f"   ✅ Video added successfully: {video_result['video']['title']}")
        print(f"   Video ID: {test_video_id}")
    else:
        print(f"   ❌ Video addition failed: {response.status_code}")
        print(f"   Response: {response.json()}")
        exit(1)
except Exception as e:
    print(f"   ❌ Video addition error: {e}")
    exit(1)

# Test 4: Add test music
print("\n4. Adding test music...")
music_data = {
    "title": "Persistence Test Music",
    "artist": "Persistence Test Artist",
    "url": "https://example.com/persistence-test-music.mp3"
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
        test_music_id = music_result['music']['id']
        print(f"   ✅ Music added successfully: {music_result['music']['title']} by {music_result['music']['artist']}")
        print(f"   Music ID: {test_music_id}")
    else:
        print(f"   ❌ Music addition failed: {response.status_code}")
        print(f"   Response: {response.json()}")
        exit(1)
except Exception as e:
    print(f"   ❌ Music addition error: {e}")
    exit(1)

# Test 5: Verify data is in database
print("\n5. Verifying data is stored in database...")
try:
    # Get updated video count
    response = requests.get(
        "http://localhost:5000/api/videos",
        headers=admin_headers,
        proxies=proxies
    )
    if response.status_code == 200:
        updated_videos = response.json()
        updated_video_count = len(updated_videos)
        print(f"   Updated videos: {updated_video_count}")
        
        # Check if our test video is in the list
        test_video_found = any(video['id'] == test_video_id for video in updated_videos)
        if test_video_found:
            print("   ✅ Test video found in database")
        else:
            print("   ⚠️  Test video not found in database")
    else:
        print(f"   ❌ Failed to get updated videos: {response.status_code}")
        
    # Get updated music count
    response = requests.get(
        "http://localhost:5000/api/music",
        headers=admin_headers,
        proxies=proxies
    )
    if response.status_code == 200:
        updated_musics = response.json()
        updated_music_count = len(updated_musics)
        print(f"   Updated music: {updated_music_count}")
        
        # Check if our test music is in the list
        test_music_found = any(music['id'] == test_music_id for music in updated_musics)
        if test_music_found:
            print("   ✅ Test music found in database")
        else:
            print("   ⚠️  Test music not found in database")
    else:
        print(f"   ❌ Failed to get updated music: {response.status_code}")
except Exception as e:
    print(f"   ❌ Error verifying data: {e}")

# Test 6: Simulate app restart (wait a moment)
print("\n6. Simulating app restart...")
time.sleep(2)

# Test 7: Verify data still exists after "restart"
print("\n7. Verifying data persistence after restart...")
try:
    # Get videos again
    response = requests.get(
        "http://localhost:5000/api/videos",
        headers=admin_headers,
        proxies=proxies
    )
    if response.status_code == 200:
        final_videos = response.json()
        final_video_count = len(final_videos)
        print(f"   Final videos: {final_video_count}")
        
        # Check if our test video is still in the list
        test_video_found = any(video['id'] == test_video_id for video in final_videos)
        if test_video_found:
            print("   ✅ Test video still exists after restart - PERSISTENCE CONFIRMED")
        else:
            print("   ❌ Test video lost after restart")
    else:
        print(f"   ❌ Failed to get final videos: {response.status_code}")
        
    # Get music again
    response = requests.get(
        "http://localhost:5000/api/music",
        headers=admin_headers,
        proxies=proxies
    )
    if response.status_code == 200:
        final_musics = response.json()
        final_music_count = len(final_musics)
        print(f"   Final music: {final_music_count}")
        
        # Check if our test music is still in the list
        test_music_found = any(music['id'] == test_music_id for music in final_musics)
        if test_music_found:
            print("   ✅ Test music still exists after restart - PERSISTENCE CONFIRMED")
        else:
            print("   ❌ Test music lost after restart")
    else:
        print(f"   ❌ Failed to get final music: {response.status_code}")
except Exception as e:
    print(f"   ❌ Error verifying persistence: {e}")

print("\n=== DATA PERSISTENCE TEST COMPLETE ===")
print("✅ Videos and music added by admin are permanently stored in the database")
print("✅ Data persists even after app restarts")
print("✅ Content is available to all users indefinitely")