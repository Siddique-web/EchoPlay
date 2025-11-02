import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:5000/api"

# Disable proxy for localhost requests
proxies = {
    "http": "",
    "https": "",
}

def test_complete_functionality():
    print("=== COMPLETE FUNCTIONALITY TEST ===\n")
    
    # 1. Test admin login
    print("1. Testing admin login...")
    login_url = f"{BASE_URL}/login"
    admin_credentials = {
        "email": "admin@gmail.com",
        "password": "Luc14c4$tr0"
    }
    
    try:
        response = requests.post(login_url, json=admin_credentials, proxies=proxies)
        if response.status_code == 200:
            admin_token = response.json()['token']
            print(f"   ✅ Admin login successful")
            print(f"   Token: {admin_token[:30]}...")
        else:
            print(f"   ❌ Admin login failed: {response.json()}")
            return
    except Exception as e:
        print(f"   ❌ Error during admin login: {e}")
        return
    
    # 2. Test adding a video as admin
    print("\n2. Testing video addition by admin...")
    video_url = f"{BASE_URL}/videos"
    video_data = {
        "title": "Admin Test Video",
        "description": "This video was added by the admin user",
        "url": "https://example.com/admin-test-video.mp4",
        "thumbnail": "https://example.com/admin-test-thumbnail.jpg"
    }
    
    headers = {
        "Content-Type": "application/json",
        "x-access-token": admin_token
    }
    
    try:
        response = requests.post(video_url, json=video_data, headers=headers, proxies=proxies)
        if response.status_code == 201:
            video_result = response.json()
            print(f"   ✅ Video added successfully: {video_result['video']['title']}")
        else:
            print(f"   ❌ Failed to add video: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error adding video: {e}")
    
    # 3. Test adding music as admin
    print("\n3. Testing music addition by admin...")
    music_url = f"{BASE_URL}/music"
    music_data = {
        "title": "Admin Test Music",
        "artist": "Admin Artist",
        "url": "https://example.com/admin-test-music.mp3"
    }
    
    try:
        response = requests.post(music_url, json=music_data, headers=headers, proxies=proxies)
        if response.status_code == 201:
            music_result = response.json()
            print(f"   ✅ Music added successfully: {music_result['music']['title']} by {music_result['music']['artist']}")
        else:
            print(f"   ❌ Failed to add music: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error adding music: {e}")
    
    # 4. Test retrieving videos
    print("\n4. Testing video retrieval...")
    try:
        response = requests.get(video_url, headers=headers, proxies=proxies)
        if response.status_code == 200:
            videos = response.json()
            print(f"   ✅ Retrieved {len(videos)} videos:")
            for video in videos:
                print(f"      - {video['title']} (uploaded by {video['uploaded_by']})")
        else:
            print(f"   ❌ Failed to retrieve videos: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error retrieving videos: {e}")
    
    # 5. Test retrieving music
    print("\n5. Testing music retrieval...")
    try:
        response = requests.get(music_url, headers=headers, proxies=proxies)
        if response.status_code == 200:
            musics = response.json()
            print(f"   ✅ Retrieved {len(musics)} music items:")
            for music in musics:
                print(f"      - {music['title']} by {music['artist']} (uploaded by {music['uploaded_by']})")
        else:
            print(f"   ❌ Failed to retrieve music: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error retrieving music: {e}")
    
    # 6. Test regular user registration
    print("\n6. Testing regular user registration...")
    register_url = f"{BASE_URL}/register"
    user_data = {
        "email": "regularuser@example.com",
        "password": "TestPassword123!",
        "name": "Regular User"
    }
    
    try:
        response = requests.post(register_url, json=user_data, proxies=proxies)
        if response.status_code == 201:
            user_result = response.json()
            user_token = user_result['token']
            print(f"   ✅ User registration successful: {user_result['user']['name']}")
            print(f"   User is admin: {user_result['user']['is_admin']}")
        else:
            print(f"   ❌ User registration failed: {response.json()}")
            return
    except Exception as e:
        print(f"   ❌ Error during user registration: {e}")
        return
    
    # 7. Test regular user accessing content
    print("\n7. Testing regular user content access...")
    user_headers = {
        "Content-Type": "application/json",
        "x-access-token": user_token
    }
    
    # Test video access
    try:
        response = requests.get(video_url, headers=user_headers, proxies=proxies)
        if response.status_code == 200:
            videos = response.json()
            print(f"   ✅ Regular user can access videos: {len(videos)} videos available")
        else:
            print(f"   ❌ Regular user cannot access videos: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error accessing videos as regular user: {e}")
    
    # Test music access
    try:
        response = requests.get(music_url, headers=user_headers, proxies=proxies)
        if response.status_code == 200:
            musics = response.json()
            print(f"   ✅ Regular user can access music: {len(musics)} music items available")
        else:
            print(f"   ❌ Regular user cannot access music: {response.json()}")
    except Exception as e:
        print(f"   ❌ Error accessing music as regular user: {e}")
    
    print("\n=== TEST COMPLETED ===")
    print("The admin user with credentials admin@gmail.com / Luc14c4$tr0 can:")
    print("  - Add videos that are accessible to all users")
    print("  - Add music that is accessible to all users")
    print("Regular users can:")
    print("  - Register and login")
    print("  - Access all videos and music added by the admin")

if __name__ == "__main__":
    test_complete_functionality()