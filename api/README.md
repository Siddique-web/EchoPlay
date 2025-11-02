# Python API for EchoPlay

This is a Python Flask API that provides authentication endpoints for the EchoPlay application.

## Endpoints

- `POST /api/login` - Handle login requests
- `POST /api/register` - Handle new user registration
- `GET /api/user/profile` - Get user profile data
- `PUT /api/user/profile` - Update user profile

## Setup

1. Install Python 3.7+
2. Install required packages:
   ```bash
   pip install -r requirements.txt
   ```

## Running the API

```bash
python app.py
```

The API will run on `http://localhost:5000`

## Default User

The API comes with a default admin user:
- Email: admin@gmail.com
- Password: Luc14c4$tr0

## Testing the API

You can test the API endpoints using the provided test script:
```bash
python test_api.py
```

## Integration with React Native App

The React Native app is configured to use this API for authentication. Make sure the API is running on the same machine as the app, or update the API_BASE_URL in `services/api.ts` to point to the correct server address.

## Troubleshooting

1. Make sure the Python API is running before trying to log in
2. Check that there are no firewall issues blocking port 5000
3. Verify the API is accessible by running the test script
4. Check the React Native app console logs for any error messages