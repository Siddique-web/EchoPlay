#!/usr/bin/env python3
"""
Deployment script for EchoPlay API to Render
"""

import os
import subprocess
import sys

def deploy_to_render():
    """
    Deploy the API to Render by pushing changes to GitHub
    """
    try:
        print("Starting deployment process...")
        
        # Check if we're in the correct directory
        if not os.path.exists('api/app.py'):
            print("Error: app.py not found. Please run this script from the project root directory.")
            return False
            
        # Add all changes
        print("Adding changes to git...")
        subprocess.run(['git', 'add', '.'], check=True)
        
        # Commit changes
        print("Committing changes...")
        subprocess.run(['git', 'commit', '-m', 'Fix database configuration and improve Render deployment'], check=True)
        
        # Push to Render (assuming the Render app is connected to the GitHub repository)
        print("Pushing to GitHub (Render will auto-deploy)...")
        subprocess.run(['git', 'push', 'origin', 'main'], check=True)
        
        print("Deployment completed successfully!")
        print("Render should automatically deploy the new version.")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"Error during deployment: {e}")
        return False
    except Exception as e:
        print(f"Unexpected error: {e}")
        return False

def check_render_config():
    """
    Check if Render configuration files exist and are correct
    """
    print("Checking Render configuration...")
    
    # Check Procfile
    procfile_path = 'api/Procfile'
    if os.path.exists(procfile_path):
        with open(procfile_path, 'r') as f:
            content = f.read().strip()
            if content == 'web: gunicorn app:app -b 0.0.0.0:$PORT --workers 2':
                print("✓ Procfile is correctly configured")
            else:
                print("✗ Procfile has incorrect configuration")
                print(f"  Current: {content}")
                print("  Expected: web: gunicorn app:app -b 0.0.0.0:$PORT --workers 2")
    else:
        print("✗ Procfile not found")
    
    # Check runtime.txt
    runtime_path = 'api/runtime.txt'
    if os.path.exists(runtime_path):
        with open(runtime_path, 'r') as f:
            content = f.read().strip()
            if content == 'python-3.13':
                print("✓ runtime.txt is correctly configured")
            else:
                print("✗ runtime.txt has incorrect configuration")
                print(f"  Current: {content}")
                print("  Expected: python-3.13")
    else:
        print("✗ runtime.txt not found")
    
    print("Render configuration check completed.")

if __name__ == "__main__":
    print("EchoPlay API Deployment Script")
    print("=" * 40)
    
    # Check if git is available
    try:
        subprocess.run(['git', '--version'], check=True, capture_output=True)
    except subprocess.CalledProcessError:
        print("Error: Git is not installed or not in PATH")
        sys.exit(1)
    
    # Check Render configuration
    check_render_config()
    print()
    
    # Ask user if they want to deploy
    response = input("Do you want to deploy to Render? (y/N): ")
    if response.lower() in ['y', 'yes']:
        # Deploy
        success = deploy_to_render()
        
        if success:
            print("\nNext steps:")
            print("1. Wait for Render to complete the deployment (check Render dashboard)")
            print("2. Test the API endpoints:")
            print("   - GET https://echoplay-apii.onrender.com/")
            print("   - GET https://echoplay-apii.onrender.com/api/health")
            print("   - POST https://echoplay-apii.onrender.com/api/login")
            print("   - POST https://echoplay-apii.onrender.com/api/register")
        else:
            print("\nDeployment failed. Please check the errors above.")
            sys.exit(1)
    else:
        print("Deployment cancelled.")