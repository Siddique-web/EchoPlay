import jwt
import datetime
# Import with type checking disabled to avoid linter warnings
from app import app, db, User, Video  # type: ignore

# Create a test token for the admin user
with app.app_context():
    admin = User.query.filter_by(email='admin@gmail.com').first()
    
    # Generate a token for the admin user
    token = jwt.encode({
        'user_id': admin.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    print(f"Admin token: {token}")
    
    # Test adding a video
    video = Video()
    video.title = "Test Video"
    video.description = "This is a test video"
    video.url = "https://example.com/test-video.mp4"
    video.thumbnail = "https://example.com/test-thumbnail.jpg"
    video.uploaded_by = admin.id
    
    db.session.add(video)
    db.session.commit()
    
    print(f"Video added successfully with ID: {video.id}")