import requests
import json

# Test login with admin credentials
url = "http://localhost:5000/api/login"
data = {
    "email": "admin@gmail.com",
    "password": "Luc14c4$tr0"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")