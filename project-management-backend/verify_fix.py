import sys
import os
from run import app
from flask import current_app

def verify():
    with app.app_context():
        print(f"JWT_ACCESS_TOKEN_EXPIRES: {app.config.get('JWT_ACCESS_TOKEN_EXPIRES')}")
        print(f"FRONTEND_URL from Config: {app.config.get('FRONTEND_URL')}")
        
        # Check CORS manually from what we know is in run.py (it's not easily extractable from CORS extension without more introspection, but let's check environment)
        print(f"Environment FRONTEND_URL: {os.getenv('FRONTEND_URL')}")

if __name__ == '__main__':
    verify()
