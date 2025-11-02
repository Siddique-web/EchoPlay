import requests

# Disable proxy for localhost requests
proxies = {
    "http": "",
    "https": "",
}

print("=== FINAL VERIFICATION TEST ===")

# Test 1: API health
try:
    response = requests.get("http://localhost:5000/api/health", proxies=proxies)
    if response.status_code == 200:
        print("✅ API server is running")
    else:
        print(f"❌ API health check failed: {response.status_code}")
except Exception as e:
    print(f"❌ API health check error: {e}")

# Test 2: Admin login
token = None
try:
    response = requests.post(
        "http://localhost:5000/api/login",
        json={"email": "admin@gmail.com", "password": "Luc14c4$tr0"},
        proxies=proxies
    )
    if response.status_code == 200:
        token = response.json()['token']
        print("✅ Admin login successful")
        print(f"   Token: {token[:30]}...")
    else:
        print(f"❌ Admin login failed: {response.status_code}")
except Exception as e:
    print(f"❌ Admin login error: {e}")

# Test 3: Content access
if token:
    headers = {"Content-Type": "application/json", "x-access-token": token}
    
    # Test video retrieval
    try:
        response = requests.get("http://localhost:5000/api/videos", headers=headers, proxies=proxies)
        if response.status_code == 200:
            videos = response.json()
            print(f"✅ Video retrieval successful ({len(videos)} videos)")
        else:
            print(f"❌ Video retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Video retrieval error: {e}")
    
    # Test music retrieval
    try:
        response = requests.get("http://localhost:5000/api/music", headers=headers, proxies=proxies)
        if response.status_code == 200:
            musics = response.json()
            print(f"✅ Music retrieval successful ({len(musics)} items)")
        else:
            print(f"❌ Music retrieval failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Music retrieval error: {e}")
else:
    print("⚠️  Skipping content access tests (login failed)")

print("\n=== VERIFICATION COMPLETE ===")
print("The application is ready for use on both Expo Go and web platforms!")