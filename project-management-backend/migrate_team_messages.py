from app import app, db
from sqlalchemy import text

if __name__ == '__main__':
    with app.app_context():
        try:
            db.session.execute(text("ALTER TABLE team_messages ADD COLUMN task_id VARCHAR(36) NULL REFERENCES tasks(id) ON DELETE SET NULL"))
            db.session.commit()
            print("Column task_id added successfully.")
        except Exception as e:
            print(f"Error: {e}")
            db.session.rollback()
