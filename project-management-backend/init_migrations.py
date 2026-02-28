"""
Script para inicializar Flask-Migrate
"""
import os
import sys

# Agregar el directorio actual al path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Importar la aplicación
from app import app, db, migrate

if __name__ == '__main__':
    with app.app_context():
        # Inicializar Flask-Migrate
        from flask_migrate import init, migrate as migrate_cmd, upgrade
        
        print("Inicializando Flask-Migrate...")
        
        # Verificar si ya existe la carpeta migrations
        if os.path.exists('migrations'):
            print("✗ La carpeta 'migrations' ya existe")
            print("  Si deseas reinicializar, elimina la carpeta primero")
        else:
            # Inicializar
            os.system('backend-env\\Scripts\\flask.exe --app app:app db init')
            print("✓ Flask-Migrate inicializado correctamente")
            
            # Crear la primera migración
            print("\nCreando migración inicial...")
            os.system('backend-env\\Scripts\\flask.exe --app app:app db migrate -m "Initial migration"')
            print("✓ Migración inicial creada")
            
            # Aplicar la migración
            print("\nAplicando migración...")
            os.system('backend-env\\Scripts\\flask.exe --app app:app db upgrade')
            print("✓ Migración aplicada correctamente")
