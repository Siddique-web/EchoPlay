from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from functools import wraps
import os
import base64
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-change-this-in-production'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///echoplay_api.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {
    # Image files
    'png', 'jpg', 'jpeg', 'gif', 'webp',
    # Video files
    'mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm',
    # Audio files
    'mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'wma'
}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Create upload folder if it doesn't exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

db = SQLAlchemy(app)

def allowed_file(filename):
    if not filename:
        return False
    if '.' not in filename:
        return False
    extension = filename.rsplit('.', 1)[1].lower()
    return extension in ALLOWED_EXTENSIONS

# User model
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    name = db.Column(db.String(100), nullable=True)
    profile_image = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    is_admin = db.Column(db.Boolean, default=False, nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'profile_image': self.profile_image,
            'created_at': self.created_at.isoformat(),
            'is_admin': self.is_admin
        }

# Video model
class Video(db.Model):
    __tablename__ = 'video'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    url = db.Column(db.String(500), nullable=False)
    thumbnail = db.Column(db.String(500), nullable=True)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('videos', lazy=True))

# Music model
class Music(db.Model):
    __tablename__ = 'music'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    artist = db.Column(db.String(200), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    
    user = db.relationship('User', backref=db.backref('musics', lazy=True))

# Initialize database
def init_db():
    with app.app_context():
        # Create all tables
        db.create_all()
        
        # Check if is_admin column exists, if not add it
        try:
            # Try to query the is_admin column
            db.session.execute(db.text("SELECT is_admin FROM user LIMIT 1"))
        except Exception as e:
            # Column doesn't exist, add it
            try:
                db.session.execute(db.text("ALTER TABLE user ADD COLUMN is_admin BOOLEAN DEFAULT 0"))
                db.session.commit()
                print("Added is_admin column to user table")
            except Exception as alter_error:
                print(f"Error adding is_admin column: {alter_error}")
        
        # Create default admin user if not exists
        try:
            admin_user = User.query.filter_by(email='admin@gmail.com').first()
            if not admin_user:
                admin_user = User()
                admin_user.email = 'admin@gmail.com'
                admin_user.name = 'Admin User'
                admin_user.is_admin = True
                admin_user.set_password('Luc14c4$tr0')
                db.session.add(admin_user)
                db.session.commit()
                print("Admin user created successfully!")
            elif not admin_user.is_admin:
                # Make sure existing admin user has admin privileges
                admin_user.is_admin = True
                db.session.commit()
                print("Admin user updated successfully!")
        except Exception as e:
            print(f"Error creating admin user: {e}")

# Initialize the database when the module is imported
init_db()

# Token required decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# Admin required decorator
def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user or not current_user.is_admin:
                return jsonify({'message': 'Admin access required!'}), 403
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# POST /api/login - Handle login requests from the current form
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
        }, app.config['SECRET_KEY'], algorithm='HS256')
        
        return jsonify({
            'token': token,
            'user': user.to_dict()
        }), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401

# POST /api/register - Handle new user registration
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Email and password are required'}), 400
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'User already exists'}), 409
    
    user = User()
    user.email = data['email']
    user.name = data.get('name', data['email'].split('@')[0])
    user.set_password(data['password'])
    # New users are not admins by default
    user.is_admin = False
    
    db.session.add(user)
    db.session.commit()
    
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=30)
    }, app.config['SECRET_KEY'], algorithm='HS256')
    
    return jsonify({
        'token': token,
        'user': user.to_dict()
    }), 201

# GET /api/user/profile - Get user profile data
@app.route('/api/user/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    return jsonify(current_user.to_dict()), 200

# PUT /api/user/profile - Update user profile
@app.route('/api/user/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'No data provided'}), 400
    
    # Update allowed fields
    if 'name' in data:
        current_user.name = data['name']
    
    if 'profile_image' in data:
        current_user.profile_image = data['profile_image']
    
    db.session.commit()
    
    return jsonify(current_user.to_dict()), 200

# POST /api/user/profile-image - Upload profile image
@app.route('/api/user/profile-image', methods=['POST'])
@token_required
def upload_profile_image(current_user):
    try:
        # Check if the post request has the file part
        if 'file' not in request.files:
            # Check if file is sent as base64 in JSON
            json_data = request.get_json()
            if not json_data or 'image' not in json_data:
                return jsonify({'message': 'No file provided'}), 400
            
            # Handle base64 image
            try:
                image_data = json_data['image']
                # Remove data URL prefix if present
                if image_data.startswith('data:image'):
                    image_data = image_data.split(',')[1]
                
                # Decode base64 image
                image_binary = base64.b64decode(image_data)
                
                # Generate filename
                filename = f"profile_{current_user.id}.jpg"
                filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                
                # Save file
                with open(filepath, 'wb') as f:
                    f.write(image_binary)
                
                # Update user profile image
                current_user.profile_image = f"/{UPLOAD_FOLDER}/{filename}"
                db.session.commit()
                
                return jsonify({
                    'message': 'Profile image uploaded successfully',
                    'profile_image': current_user.profile_image
                }), 200
            except Exception as e:
                return jsonify({'message': f'Error processing image: {str(e)}'}), 400
        
        # Handle file upload
        file = request.files['file']
        
        # If the user does not select a file, the browser submits an
        # empty file without a filename.
        if file.filename == '':
            return jsonify({'message': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            # Extract file extension safely
            file_extension = 'jpg'  # default extension
            if file.filename and '.' in file.filename:
                file_extension = file.filename.rsplit('.', 1)[1].lower()
            
            filename = secure_filename(f"profile_{current_user.id}.{file_extension}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            # Update user profile image
            current_user.profile_image = f"/{UPLOAD_FOLDER}/{filename}"
            db.session.commit()
            
            return jsonify({
                'message': 'Profile image uploaded successfully',
                'profile_image': current_user.profile_image
            }), 200
        else:
            return jsonify({'message': 'Invalid file type'}), 400
    except Exception as e:
        return jsonify({'message': f'Error uploading file: {str(e)}'}), 500

# POST /api/music - Add new music (admin only)
@app.route('/api/music', methods=['POST'])
@admin_required
def add_music(current_user):
    try:
        # Handle file upload for music
        music_file = None
        title = ''
        artist = ''
        url = ''  # Initialize url variable
        
        # Check if request contains files
        if 'music' in request.files:
            music_file = request.files['music']
        
        # Get form data
        title = request.form.get('title', '')
        artist = request.form.get('artist', '')
        
        # If no form data, try JSON
        if not title and request.is_json:
            data = request.get_json()
            title = data.get('title', '')
            artist = data.get('artist', '')
            # For JSON, URL would be provided directly
            url = data.get('url', '')
        
        if not title or not artist:
            return jsonify({'message': 'Title and artist are required'}), 400
        
        # Handle music file upload
        music_url = ''
        if music_file and music_file.filename and music_file.filename != '' and allowed_file(music_file.filename):
            # Generate unique filename for music
            file_extension = 'mp3'  # default extension
            if '.' in music_file.filename:
                file_extension = music_file.filename.rsplit('.', 1)[1].lower()
                # Validate file extension is audio
                if file_extension not in ['mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg']:
                    file_extension = 'mp3'  # fallback to mp3
            
            filename = secure_filename(f"music_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{current_user.id}.{file_extension}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            music_file.save(filepath)
            # Use full URL instead of relative path
            music_url = f"http://192.168.18.93:5000/{UPLOAD_FOLDER}/{filename}"
        elif request.is_json:
            # Use provided URL for JSON requests
            music_url = url
        
        if not music_url:
            return jsonify({'message': 'Music file is required'}), 400
        
        music = Music()
        music.title = title
        music.artist = artist
        music.url = music_url
        music.uploaded_by = current_user.id
        
        db.session.add(music)
        db.session.commit()
        
        return jsonify({
            'message': 'Music added successfully',
            'music': {
                'id': music.id,
                'title': music.title,
                'artist': music.artist,
                'url': music.url,
                'created_at': music.created_at.isoformat()
            }
        }), 201
    except Exception as e:
        return jsonify({'message': f'Error adding music: {str(e)}'}), 500

# POST /api/videos - Add new video (admin only)
@app.route('/api/videos', methods=['POST'])
@admin_required
def add_video(current_user):
    try:
        # Handle file upload for video
        video_file = None
        thumbnail_file = None
        title = ''
        description = ''
        url = ''  # Initialize url variable
        
        # Check if request contains files
        if 'video' in request.files:
            video_file = request.files['video']
        
        if 'thumbnail' in request.files:
            thumbnail_file = request.files['thumbnail']
        
        # Get form data
        title = request.form.get('title', '')
        description = request.form.get('description', '')
        
        # If no form data, try JSON
        if not title and request.is_json:
            data = request.get_json()
            title = data.get('title', '')
            description = data.get('description', '')
            # For JSON, URL would be provided directly
            url = data.get('url', '')
        
        if not title:
            return jsonify({'message': 'Title is required'}), 400
        
        # Handle video file upload
        video_url = ''
        if video_file and video_file.filename and video_file.filename != '' and allowed_file(video_file.filename):
            # Generate unique filename for video
            file_extension = 'mp4'  # default extension
            if '.' in video_file.filename:
                file_extension = video_file.filename.rsplit('.', 1)[1].lower()
                # Validate file extension is video
                if file_extension not in ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv']:
                    file_extension = 'mp4'  # fallback to mp4
            
            filename = secure_filename(f"video_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{current_user.id}.{file_extension}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            video_file.save(filepath)
            # Use full URL instead of relative path
            video_url = f"http://192.168.18.93:5000/{UPLOAD_FOLDER}/{filename}"
        elif request.is_json:
            # Use provided URL for JSON requests
            video_url = url
        
        # Handle thumbnail file upload
        thumbnail_url = ''
        if thumbnail_file and thumbnail_file.filename and thumbnail_file.filename != '' and allowed_file(thumbnail_file.filename):
            # Generate unique filename for thumbnail
            file_extension = 'jpg'
            if '.' in thumbnail_file.filename:
                file_extension = thumbnail_file.filename.rsplit('.', 1)[1].lower()
                # Validate file extension is image
                if file_extension not in ['jpg', 'jpeg', 'png', 'gif']:
                    file_extension = 'jpg'  # fallback to jpg
            
            filename = secure_filename(f"thumb_{datetime.datetime.now().strftime('%Y%m%d_%H%M%S')}_{current_user.id}.{file_extension}")
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            thumbnail_file.save(filepath)
            # Use full URL instead of relative path
            thumbnail_url = f"http://192.168.18.93:5000/{UPLOAD_FOLDER}/{filename}"
        
        if not video_url:
            return jsonify({'message': 'Video file is required'}), 400
        
        video = Video()
        video.title = title
        video.description = description
        video.url = video_url
        video.thumbnail = thumbnail_url
        video.uploaded_by = current_user.id
        
        db.session.add(video)
        db.session.commit()
        
        return jsonify({
            'message': 'Video added successfully',
            'video': {
                'id': video.id,
                'title': video.title,
                'description': video.description,
                'url': video.url,
                'thumbnail': video.thumbnail,
                'created_at': video.created_at.isoformat()
            }
        }), 201
    except Exception as e:
        return jsonify({'message': f'Error adding video: {str(e)}'}), 500

# GET /api/videos - Get all videos
@app.route('/api/videos', methods=['GET'])
@token_required
def get_videos(current_user):
    try:
        videos = Video.query.all()
        video_list = []
        
        for video in videos:
            # Ensure we have full URLs
            video_url = video.url
            if video_url and video_url.startswith('/'):
                video_url = f"http://192.168.18.93:5000{video_url}"
            
            thumbnail_url = video.thumbnail
            if thumbnail_url and thumbnail_url.startswith('/'):
                thumbnail_url = f"http://192.168.18.93:5000{thumbnail_url}"
            
            video_list.append({
                'id': video.id,
                'title': video.title,
                'description': video.description,
                'url': video_url,
                'thumbnail': thumbnail_url,
                'uploaded_by': video.user.email if video.user else 'Unknown',
                'created_at': video.created_at.isoformat()
            })
        
        return jsonify(video_list), 200
    except Exception as e:
        return jsonify({'message': f'Error retrieving videos: {str(e)}'}), 500

# GET /api/music - Get all music
@app.route('/api/music', methods=['GET'])
@token_required
def get_music(current_user):
    try:
        musics = Music.query.all()
        music_list = []
        
        for music in musics:
            # Ensure we have full URLs
            music_url = music.url
            if music_url and music_url.startswith('/'):
                music_url = f"http://192.168.18.93:5000{music_url}"
            
            music_list.append({
                'id': music.id,
                'title': music.title,
                'artist': music.artist,
                'url': music_url,
                'uploaded_by': music.user.email if music.user else 'Unknown',
                'created_at': music.created_at.isoformat()
            })
        
        return jsonify(music_list), 200
    except Exception as e:
        return jsonify({'message': f'Error retrieving music: {str(e)}'}), 500

# DELETE /api/music/<id> - Delete a music (admin only)
@app.route('/api/music/<int:music_id>', methods=['DELETE'])
@admin_required
def delete_music(current_user, music_id):
    try:
        music = Music.query.get(music_id)
        if not music:
            return jsonify({'message': 'Music not found'}), 404
        
        # Delete the file from the filesystem if it exists
        if music.url and 'uploads/' in music.url:
            # Extract filename from URL
            filename = music.url.split('/')[-1]
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if os.path.exists(filepath):
                os.remove(filepath)
        
        # Delete from database
        db.session.delete(music)
        db.session.commit()
        
        return jsonify({'message': 'Music deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': f'Error deleting music: {str(e)}'}), 500

# DELETE /api/videos/<id> - Delete a video (admin only)
@app.route('/api/videos/<int:video_id>', methods=['DELETE'])
@admin_required
def delete_video(current_user, video_id):
    try:
        video = Video.query.get(video_id)
        if not video:
            return jsonify({'message': 'Video not found'}), 404
        
        # Delete the files from the filesystem if they exist
        if video.url and 'uploads/' in video.url:
            # Extract filename from URL
            filename = video.url.split('/')[-1]
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if os.path.exists(filepath):
                os.remove(filepath)
        
        if video.thumbnail and 'uploads/' in video.thumbnail:
            # Extract filename from URL
            filename = video.thumbnail.split('/')[-1]
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            if os.path.exists(filepath):
                os.remove(filepath)
        
        # Delete from database
        db.session.delete(video)
        db.session.commit()
        
        return jsonify({'message': 'Video deleted successfully'}), 200
    except Exception as e:
        return jsonify({'message': f'Error deleting video: {str(e)}'}), 500

# Serve uploaded files
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'API is running'}), 200

if __name__ == '__main__':
    # Get the host IP address dynamically
    import socket
    try:
        # Try to get the local IP address
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        host_ip = s.getsockname()[0]
        s.close()
    except:
        # Fallback to localhost if can't determine IP
        host_ip = '0.0.0.0'
    
    print(f"Starting server on {host_ip}:5000")
    app.run(debug=True, host=host_ip, port=5000)
