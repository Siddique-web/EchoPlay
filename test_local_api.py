import requests
import time

# Test the local API endpoints
def test_local_api():
    base_url = "http://127.0.0.1:5000"
    
    print("Testing local API endpoints...\n")
    
    # Test root endpoint
    print("1. Testing root endpoint (/)")
    try:
        response = requests.get(f"{base_url}/")
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: {data}")
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
            print(f"   Response: {data}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")

if __name__ == "__main__":
    test_local_api()