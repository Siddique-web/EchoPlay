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
        subprocess.run(['git', 'commit', '-m', 'Update API with root route and proper configuration'], check=True)
        
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

if __name__ == "__main__":
    print("EchoPlay API Deployment Script")
    print("=" * 40)
    
    # Check if git is available
    try:
        subprocess.run(['git', '--version'], check=True, capture_output=True)
    except subprocess.CalledProcessError:
        print("Error: Git is not installed or not in PATH")
        sys.exit(1)
    
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