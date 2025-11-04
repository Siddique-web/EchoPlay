import requests
import json

# Test the API endpoints
def test_api():
    base_url = "https://echoplay-apii.onrender.com"
    
    print("Testing API endpoints...\n")
    
    # Test root endpoint
    print("1. Testing root endpoint (/)")
    try:
        response = requests.get(f"{base_url}/")
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test health endpoint
    print("2. Testing health endpoint (/api/health)")
    try:
        response = requests.get(f"{base_url}/api/health")
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    
    print("\n" + "="*50 + "\n")
    
    # Test login endpoint (without credentials)
    print("3. Testing login endpoint (/api/login) - POST request")
    try:
        response = requests.post(f"{base_url}/api/login", json={})
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 400:
            data = response.json()
            print(f"   Response: {json.dumps(data, indent=2)}")
            print("   Expected behavior - missing credentials")
        else:
            print(f"   Unexpected response: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")

if __name__ == "__main__":
    test_api()