import requests

# Disable proxy for localhost requests
proxies = {
    "http": "",
    "https": "",
}

print("=== SIMPLE FUNCTIONALITY TEST ===")

# Test 1: Health check
print("\n1. Testing API health...")
try:
    response = requests.get("http://localhost:5000/api/health", proxies=proxies)
    if response.status_code == 200:
        print("   ✅ API is running")
    else:
        print(f"   ❌ API health check failed: {response.status_code}")
except Exception as e:
    print(f"   ❌ API health check error: {e}")

# Test 2: Admin login
token = None
print("\n2. Testing admin login...")
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
except Exception as e:
    print(f"   ❌ Admin login error: {e}")

# Test 3: Add video
print("\n3. Testing video addition...")
if token:
    try:
        headers = {"Content-Type": "application/json", "x-access-token": token}
        response = requests.post(
            "http://localhost:5000/api/videos",
            json={
                "title": "Test Video from Python",
                "description": "Added via Python script",
                "url": "https://example.com/test.mp4",
                "thumbnail": "https://example.com/thumb.jpg"
            },
            headers=headers,
            proxies=proxies
        )
        if response.status_code == 201:
            print("   ✅ Video added successfully")
        else:
            print(f"   ❌ Video addition failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Video addition error: {e}")
else:
    print("   ⚠️  Skipping video addition (no token)")

# Test 4: Add music
print("\n4. Testing music addition...")
if token:
    try:
        headers = {"Content-Type": "application/json", "x-access-token": token}
        response = requests.post(
            "http://localhost:5000/api/music",
            json={
                "title": "Test Music from Python",
                "artist": "Python Artist",
                "url": "https://example.com/test.mp3"
            },
            headers=headers,
            proxies=proxies
        )
        if response.status_code == 201:
            print("   ✅ Music added successfully")
        else:
            print(f"   ❌ Music addition failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Music addition error: {e}")
else:
    print("   ⚠️  Skipping music addition (no token)")

# Test 5: Get videos
print("\n5. Testing video retrieval...")
if token:
    try:
        headers = {"Content-Type": "application/json", "x-access-token": token}
        response = requests.get(
            "http://localhost:5000/api/videos",
            headers=headers,
            proxies=proxies
        )
        if response.status_code == 200:
            videos = response.json()
            print(f"   ✅ Retrieved {len(videos)} videos")
        else:
            print(f"   ❌ Video retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Video retrieval error: {e}")
else:
    print("   ⚠️  Skipping video retrieval (no token)")

print("\n=== TEST COMPLETED ===")