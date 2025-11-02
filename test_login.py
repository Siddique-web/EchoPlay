import requests
import json

# Test login with the newly registered user
url = "http://localhost:5000/api/login"
data = {
    "email": "siddique@gmail.com",
    "password": "password123"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")