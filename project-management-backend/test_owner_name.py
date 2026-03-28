import sys
import os

# Set up environment path to use app context
sys.path.insert(0, os.path.abspath('.'))

import app as main_app
db = main_app.db
app = main_app.app

from app.models import User, Task, Project

with app.app_context():
    # 1. Find an owner
    owner = User.query.filter_by(role='OWNER').first()
    if not owner:
        print("No owner found")
        sys.exit(0)
    
    print(f"[*] Found OWNER: id={owner.id}, name={owner.name}")
    
    # 2. Find a task in their project
    if not owner.owned_project:
        print("Owner has no project")
        sys.exit(0)
        
    project = owner.owned_project
    print(f"[*] Project ID: {project.id}")
    
    task = Task.query.filter_by(project_id=project.id).first()
    if not task:
        print("No task found in this project")
        sys.exit(0)
    
    print(f"[*] Found Task: id={task.id}, title={task.title}, assigned_to={task.assigned_to}")
    original_assigned_to = task.assigned_to
    
    # Check original employee
    if original_assigned_to:
        emp = User.query.get(original_assigned_to)
        print(f"[*] Original Employee: id={emp.id}, role={emp.role}, active={emp.status}")
    
    # 3. Change owner's name
    new_name = owner.name + ' TRABAJADOR_TEST'
    owner.name = new_name
    db.session.commit()
    print(f"[*] Changed OWNER name to {new_name}")
    
    # 4. Check task again
    db.session.expire_all()
    task_after = Task.query.get(task.id)
    print(f"[*] Task after name change: assigned_to={task_after.assigned_to}")
    
    if task_after.assigned_to != original_assigned_to:
        print("[!] BUG REPRODUCED: assigned_to changed!")
    else:
        print("[*] No change in assigned_to. The issue is NOT in the database cascade.")
    
    # Revert name
    owner = User.query.get(owner.id)
    owner.name = owner.name.replace(' TRABAJADOR_TEST', '')
    db.session.commit()
    print("[*] Reverted owner name")

