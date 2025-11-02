import sys
import os

# Add the current directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import after adding to path
from app import app, db, User  # type: ignore

# Create all tables (this will create the database if it doesn't exist)
with app.app_context():
    db.create_all()
    
    # Check if admin user already exists
    existing_admin = User.query.filter_by(email='admin@gmail.com').first()
    
    if not existing_admin:
        # Create default admin user
        admin_user = User()
        admin_user.email = 'admin@gmail.com'
        admin_user.name = 'Admin User'
        admin_user.is_admin = True
        admin_user.set_password('Luc14c4$tr0')
        
        db.session.add(admin_user)
        db.session.commit()
        
        print("Database initialized successfully!")
        print("Admin user created:")
        print(f"  Email: {admin_user.email}")
        print(f"  Password: Luc14c4$tr0")
        print(f"  Is Admin: {admin_user.is_admin}")
    else:
        print("Database already initialized!")
        print("Admin user already exists:")
        print(f"  Email: {existing_admin.email}")
        print(f"  Is Admin: {existing_admin.is_admin}")