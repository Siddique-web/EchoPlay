import sqlite3
import os

# Connect to the database
db_path = 'instance/echoplay_api.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Add is_admin column to user table if it doesn't exist
try:
    cursor.execute("ALTER TABLE user ADD COLUMN is_admin BOOLEAN DEFAULT 0")
    print("Added is_admin column to user table")
except sqlite3.OperationalError as e:
    if "duplicate column name" in str(e):
        print("is_admin column already exists")
    else:
        print(f"Error adding is_admin column: {e}")

# Commit changes and close connection
conn.commit()

# Verify the schema
cursor.execute("PRAGMA table_info(user)")
columns = cursor.fetchall()
print("User table schema:")
for column in columns:
    print(column)

# Check if admin user exists, if not create it
cursor.execute("SELECT * FROM user WHERE email = 'admin@gmail.com'")
admin_user = cursor.fetchone()

if not admin_user:
    # Create admin user
    cursor.execute("""
        INSERT INTO user (email, password_hash, name, is_admin) 
        VALUES ('admin@gmail.com', ?, 'Admin User', 1)
    """, ('pbkdf2:sha256:260000$randomsalt$hashedpassword',))  # This is a placeholder hash
    print("Created admin user")
else:
    # Update existing admin user to ensure is_admin = 1
    cursor.execute("UPDATE user SET is_admin = 1 WHERE email = 'admin@gmail.com'")
    print("Updated admin user")

conn.commit()
conn.close()
print("Database update completed")