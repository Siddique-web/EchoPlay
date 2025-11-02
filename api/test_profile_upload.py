import requests
import json
import base64

# Test the profile image upload endpoint

BASE_URL = 'http://localhost:5000/api'

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
        
        if response.status_code == 200:
            token = response.json().get('token')
            print(f'Login successful. Token: {token[:20]}...')
            return token
        else:
            print(f'Login failed: {response.json()}')
            return None
    except Exception as e:
        print(f'Login test failed: {e}')
        return None

def test_profile_image_upload(token):
    """Test profile image upload endpoint"""
    try:
        # Create a simple base64 encoded image (1x1 pixel PNG)
        test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
        
        headers = {
            'Content-Type': 'application/json',
            'x-access-token': token
        }
        
        upload_data = {
            'image': test_image_base64
        }
        
        response = requests.post(f'{BASE_URL}/user/profile-image', 
                               headers=headers, 
                               json=upload_data)
        
        print(f'Profile image upload test: {response.status_code}')
        print(f'Response: {response.json()}')
        
        return response.status_code == 200
    except Exception as e:
        print(f'Profile image upload test failed: {e}')
        return False

if __name__ == '__main__':
    print('Testing profile image upload...')
    
    # Test login
    token = test_login()
    if token:
        # Test profile image upload
        test_profile_image_upload(token)
    else:
        print('Cannot test profile image upload without authentication token.')