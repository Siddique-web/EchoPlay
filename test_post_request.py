import requests

# Test POST request to root endpoint
def test_post_request():
    url = "http://127.0.0.1:5000/"
    
    print("Testing POST request to root endpoint (/)")
    try:
        response = requests.post(url, json={})
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_post_request()