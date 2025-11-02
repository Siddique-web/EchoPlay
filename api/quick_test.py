import requests

# Disable proxy for localhost requests
proxies = {
    "http": "",
    "https": "",
}

print("=== QUICK FUNCTIONALITY TEST ===")

# Test API health
try:
    response = requests.get("http://localhost:5000/api/health", proxies=proxies)
    if response.status_code == 200:
        print("✅ API is running")
    else:
        print(f"❌ API health check failed: {response.status_code}")
except Exception as e:
    print(f"❌ API health check error: {e}")

# Test admin login
try:
    response = requests.post(
        "http://localhost:5000/api/login",
        json={"email": "admin@gmail.com", "password": "Luc14c4$tr0"},
        proxies=proxies
    )
    if response.status_code == 200:
        token = response.json()['token']
        print("✅ Admin login successful")
    else:
        print(f"❌ Admin login failed: {response.status_code}")
except Exception as e:
    print(f"❌ Admin login error: {e}")

print("=== TEST COMPLETED ===")