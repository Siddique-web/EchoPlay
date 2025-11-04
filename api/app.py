import os
import jwt
import datetime
import base64
from functools import wraps
from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename

def create_app():
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-this-in-production')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_PATH', 'sqlite:///echoplay_api.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Configure upload folder
    UPLOAD_FOLDER = 'uploads'
    app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
    
    # Create upload folder if it doesn't exist
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    
    # Allowed file extensions
    ALLOWED_EXTENSIONS = {
        # Image files
        'png', 'jpg', 'jpeg', 'gif', 'webp',
        # Video files
        'mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv', 'webm',
        # Audio files
        'mp3', 'wav', 'm4a', 'aac', 'flac', 'ogg', 'wma'
    }
    
    def allowed_file(filename):
        if not filename:
            return False
        if '.' not in filename:
            return False
        extension = filename.rsplit('.', 1)[1].lower()
        return extension in ALLOWED_EXTENSIONS
    
    # Initialize CORS with environment variable or default
    CORS(app, origins=os.environ.get("CORS_ORIGINS", "*").split(","))
    
    # Initialize database
    db = SQLAlchemy(app)
    
    # Models
    class User(db.Model):
        __tablename__ = 'user'
        id = db.Column(db.Integer, primary_key=True)
        email = db.Column(db.String(120), unique=True, nullable=False)
        password_hash = db.Column(db.String(255), nullable=False)
        name = db.Column(db.String(100), nullable=True)
        profile_image = db.Column(db.String(255), nullable=True)
        created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
        is_admin = db.Column(db.Boolean, default=False, nullable=False)
        videos = db.relationship('Video', backref='user', lazy=True)
        musics = db.relationship('Music', backref='user', lazy=True)

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

    class Video(db.Model):
        __tablename__ = 'video'
        id = db.Column(db.Integer, primary_key=True)
        title = db.Column(db.String(200), nullable=False)
        description = db.Column(db.Text, nullable=True)
        url = db.Column(db.String(500), nullable=False)
        thumbnail = db.Column(db.String(500), nullable=True)
        uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    class Music(db.Model):
        __tablename__ = 'music'
        id = db.Column(db.Integer, primary_key=True)
        title = db.Column(db.String(200), nullable=False)
        artist = db.Column(db.String(200), nullable=False)
        url = db.Column(db.String(500), nullable=False)
        uploaded_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
        created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    # Initialize database
    with app.app_context():
        db.create_all()
        
        # Create default admin user if not exists
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

    # Decorators
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
                if not current_user:
                    return jsonify({'message': 'Token is invalid!'}), 401
            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Token has expired!'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'message': 'Token is invalid!'}), 401
            except Exception:
                return jsonify({'message': 'Token is invalid!'}), 401
            
            return f(current_user, *args, **kwargs)
        
        return decorated

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
            except jwt.ExpiredSignatureError:
                return jsonify({'message': 'Token has expired!'}), 401
            except jwt.InvalidTokenError:
                return jsonify({'message': 'Token is invalid!'}), 401
            except Exception:
                return jsonify({'message': 'Token is invalid!'}), 401
            
            return f(current_user, *args, **kwargs)
        
        return decorated

    # Routes
    @app.route('/')
    def index():
        return {
            "message": "Bem-vindo à API EchoPlay!",
            "status": "online"
        }

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'API is running'}), 200

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

    @app.route('/api/user/profile', methods=['GET'])
    @token_required
    def get_profile(current_user):
        return jsonify(current_user.to_dict()), 200

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

    @app.route('/api/music', methods=['POST'])
    @admin_required
    def add_music(current_user):
        try:
            data = request.get_json()
            
            if not data or not data.get('title') or not data.get('artist') or not data.get('url'):
                return jsonify({'message': 'Title, artist, and URL are required'}), 400
            
            music = Music()
            music.title = data['title']
            music.artist = data['artist']
            music.url = data['url']
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

    @app.route('/api/videos', methods=['POST'])
    @admin_required
    def add_video(current_user):
        try:
            data = request.get_json()
            
            if not data or not data.get('title') or not data.get('url'):
                return jsonify({'message': 'Title and URL are required'}), 400
            
            video = Video()
            video.title = data['title']
            video.description = data.get('description', '')
            video.url = data['url']
            video.thumbnail = data.get('thumbnail', '')
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

    @app.route('/api/videos', methods=['GET'])
    @token_required
    def get_videos(current_user):
        try:
            videos = Video.query.all()
            video_list = []
            
            for video in videos:
                video_list.append({
                    'id': video.id,
                    'title': video.title,
                    'description': video.description,
                    'url': video.url,
                    'thumbnail': video.thumbnail,
                    'uploaded_by': video.user.email if video.user else 'Unknown',
                    'created_at': video.created_at.isoformat()
                })
            
            return jsonify(video_list), 200
        except Exception as e:
            return jsonify({'message': f'Error retrieving videos: {str(e)}'}), 500

    @app.route('/api/music', methods=['GET'])
    @token_required
    def get_music(current_user):
        try:
            musics = Music.query.all()
            music_list = []
            
            for music in musics:
                music_list.append({
                    'id': music.id,
                    'title': music.title,
                    'artist': music.artist,
                    'url': music.url,
                    'uploaded_by': music.user.email if music.user else 'Unknown',
                    'created_at': music.created_at.isoformat()
                })
            
            return jsonify(music_list), 200
        except Exception as e:
            return jsonify({'message': f'Error retrieving music: {str(e)}'}), 500

    @app.route('/api/music/<int:music_id>', methods=['DELETE'])
    @admin_required
    def delete_music(current_user, music_id):
        try:
            music = Music.query.get(music_id)
            if not music:
                return jsonify({'message': 'Music not found'}), 404
            
            # Delete from database
            db.session.delete(music)
            db.session.commit()
            
            return jsonify({'message': 'Music deleted successfully'}), 200
        except Exception as e:
            return jsonify({'message': f'Error deleting music: {str(e)}'}), 500

    @app.route('/api/videos/<int:video_id>', methods=['DELETE'])
    @admin_required
    def delete_video(current_user, video_id):
        try:
            video = Video.query.get(video_id)
            if not video:
                return jsonify({'message': 'Video not found'}), 404
            
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

    return app

# Create the app instance
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)