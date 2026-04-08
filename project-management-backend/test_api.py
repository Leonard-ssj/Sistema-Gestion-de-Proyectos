import sys
import os
from flask import Flask
from app import create_app, db
from app.models import User
from flask_jwt_extended import create_access_token

app = create_app()

def test_api():
    with app.app_context():
        joel = User.query.filter_by(email='joeladrielperez122504@outlook.com').first()
        owner = User.query.filter_by(email='prueba01@outlook.com').first()
        
        # Test my-tasks as Joel
        joel_token = create_access_token(identity=joel.id, additional_claims={'role': joel.role})
        
        with app.test_client() as c:
            res = c.get('/api/tasks/my-tasks', headers={'Authorization': f'Bearer {joel_token}'})
            print("\n--- JOEL MY-TASKS ---")
            print(res.status_code)
            print(res.json)
            
            owner_token = create_access_token(identity=owner.id, additional_claims={'role': owner.role})
            
            res2 = c.get('/api/tasks', headers={'Authorization': f'Bearer {owner_token}'})
            print("\n--- OWNER ALL TASKS ---")
            print(res2.status_code)
            print(res2.json)

if __name__ == '__main__':
    test_api()
