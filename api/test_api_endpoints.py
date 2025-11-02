import requests
import json

# Base URL for the API
BASE_URL = "http://localhost:5000/api"

# Disable proxy for localhost requests
proxies = {
    "http": "",
    "https": "",
}

def test_login():
    """Test admin login"""
    print("Testing admin login...")
    url = f"{BASE_URL}/login"
    data = {
        "email": "admin@gmail.com",
        "password": "Luc14c4$tr0"
    }
    
    try:
        response = requests.post(url, json=data, proxies=proxies)
        print(f"Login Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Login successful. Token: {result['token'][:20]}...")
            print(f"User is admin: {result['user']['is_admin']}")
            return result['token']
        else:
            print(f"Login failed: {response.json()}")
            return None
    except Exception as e:
        print(f"Error during login: {e}")
        return None

def test_add_video(token):
    """Test adding a video as admin"""
    print("\nTesting video addition...")
    url = f"{BASE_URL}/videos"
    data = {
        "title": "Sample Video",
        "description": "This is a sample video added by admin",
        "url": "https://example.com/sample-video.mp4",
        "thumbnail": "https://example.com/sample-thumbnail.jpg"
    }
    
    headers = {
        "Content-Type": "application/json",
        "x-access-token": token
    }
    
    try:
        response = requests.post(url, json=data, headers=headers, proxies=proxies)
        print(f"Add Video Status Code: {response.status_code}")
        if response.status_code == 201:
            result = response.json()
            print(f"Video added successfully: {result['video']['title']}")
            return True
        else:
            print(f"Failed to add video: {response.json()}")
            return False
    except Exception as e:
        print(f"Error adding video: {e}")
        return False

def test_add_music(token):
    """Test adding music as admin"""
    print("\nTesting music addition...")
    url = f"{BASE_URL}/music"
    data = {
        "title": "Sample Music",
        "artist": "Sample Artist",
        "url": "https://example.com/sample-music.mp3"
    }
    
    headers = {
        "Content-Type": "application/json",
        "x-access-token": token
    }
    
    try:
        response = requests.post(url, json=data, headers=headers, proxies=proxies)
        print(f"Add Music Status Code: {response.status_code}")
        if response.status_code == 201:
            result = response.json()
            print(f"Music added successfully: {result['music']['title']} by {result['music']['artist']}")
            return True
        else:
            print(f"Failed to add music: {response.json()}")
            return False
    except Exception as e:
        print(f"Error adding music: {e}")
        return False

def test_get_videos(token):
    """Test retrieving videos"""
    print("\nTesting video retrieval...")
    url = f"{BASE_URL}/videos"
    
    headers = {
        "Content-Type": "application/json",
        "x-access-token": token
    }
    
    try:
        response = requests.get(url, headers=headers, proxies=proxies)
        print(f"Get Videos Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Retrieved {len(result)} videos")
            for video in result:
                print(f"  - {video['title']} by {video['uploaded_by']}")
            return True
        else:
            print(f"Failed to get videos: {response.json()}")
            return False
    except Exception as e:
        print(f"Error getting videos: {e}")
        return False

def test_get_music(token):
    """Test retrieving music"""
    print("\nTesting music retrieval...")
    url = f"{BASE_URL}/music"
    
    headers = {
        "Content-Type": "application/json",
        "x-access-token": token
    }
    
    try:
        response = requests.get(url, headers=headers, proxies=proxies)
        print(f"Get Music Status Code: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"Retrieved {len(result)} music items")
            for music in result:
                print(f"  - {music['title']} by {music['artist']}")
            return True
        else:
            print(f"Failed to get music: {response.json()}")
            return False
    except Exception as e:
        print(f"Error getting music: {e}")
        return False

def main():
    # Test login
    token = test_login()
    if not token:
        return
    
    # Test adding a video
    if test_add_video(token):
        # Test retrieving videos
        test_get_videos(token)
    
    # Test adding music
    if test_add_music(token):
        # Test retrieving music
        test_get_music(token)

if __name__ == "__main__":
    main()