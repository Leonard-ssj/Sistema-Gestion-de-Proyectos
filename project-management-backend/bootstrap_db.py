import sys
from sqlalchemy import text


def main():
    from wsgi import app, db, ensure_project_schema

    with app.app_context():
        db.session.execute(text("SELECT 1"))
        db.create_all()
        if callable(ensure_project_schema):
            ensure_project_schema()


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"DB bootstrap failed: {e}", file=sys.stderr)
        raise
