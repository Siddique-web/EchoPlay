import requests
import json

# Test the Python API endpoints

BASE_URL = 'http://localhost:5000/api'

def test_health():
    """Test if the API is running"""
    try:
        response = requests.get(f'{BASE_URL}/health')
        print(f'Health check: {response.status_code} - {response.json()}')
        return response.status_code == 200
    except Exception as e:
        print(f'Health check failed: {e}')
        return False

def test_login():
    """Test login endpoint"""
    try:
        # Test with default admin credentials
        login_data = {
            'email': 'admin@gmail.com',
            'password': 'Luc14c4$tr0'
        }
        
        response = requests.post(f'{BASE_URL}/login', json=login_data)
        print(f'Login test: {response.status_code}')
        print(f'Response: {response.json()}')
        
        if response.status_code == 200:
            token = response.json().get('token')
            return token
        else:
            print(f'Login failed: {response.json()}')
            return None
    except Exception as e:
        print(f'Login test failed: {e}')
        return None

def test_get_profile(token):
    """Test get profile endpoint"""
    try:
        headers = {
            'Content-Type': 'application/json',
            'x-access-token': token
        }
        
        response = requests.get(f'{BASE_URL}/user/profile', headers=headers)
        print(f'Get profile test: {response.status_code}')
        print(f'Response: {response.json()}')
        
        return response.status_code == 200
    except Exception as e:
        print(f'Get profile test failed: {e}')
        return False

if __name__ == '__main__':
    print('Testing Python API...')
    
    # Test health check
    if not test_health():
        print('API is not running. Please start the API server first.')
        exit(1)
    
    # Test login
    token = test_login()
    if token:
        print(f'Login successful. Token: {token[:20]}...')
        
        # Test get profile
        test_get_profile(token)
    else:
        print('Login failed.')