import requests
import json

# Register a new user
url = "http://localhost:5000/api/register"
data = {
    "email": "siddique@gmail.com",
    "password": "password123",
    "name": "Siddique"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")