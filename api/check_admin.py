import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import with type checking disabled to avoid linter warnings
from app import app, db, User  # type: ignore

with app.app_context():
    admin = User.query.filter_by(email='admin@gmail.com').first()
    print(f"Admin user exists: {admin is not None}")
    if admin:
        print(f"Email: {admin.email}")
        print(f"Is admin: {admin.is_admin}")
        print(f"Name: {admin.name}")
    else:
        print("Admin user not found")