"""
Script de gestión de migraciones con Flask-Migrate
Uso:
    python manage_migrations.py init       - Inicializar migraciones (solo primera vez)
    python manage_migrations.py migrate    - Crear nueva migración
    python manage_migrations.py upgrade    - Aplicar migraciones pendientes
    python manage_migrations.py downgrade  - Revertir última migración
    python manage_migrations.py current    - Ver versión actual
    python manage_migrations.py history    - Ver historial de migraciones
    python manage_migrations.py stamp      - Marcar base de datos con versión actual
"""
import sys
import os

def print_usage():
    print(__doc__)

def run_command(command):
    """Ejecutar comando de Flask-Migrate"""
    flask_cmd = 'backend-env\\Scripts\\flask.exe --app wsgi:app db'
    full_cmd = f'{flask_cmd} {command}'
    print(f'\nEjecutando: {full_cmd}\n')
    os.system(full_cmd)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print_usage()
        sys.exit(1)
    
    action = sys.argv[1].lower()
    
    if action == 'init':
        print("Inicializando Flask-Migrate...")
        if os.path.exists('migrations'):
            print("✗ Error: La carpeta 'migrations' ya existe")
            print("  Si deseas reinicializar, elimina la carpeta primero")
            sys.exit(1)
        run_command('init')
        print("\n✓ Flask-Migrate inicializado correctamente")
        
    elif action == 'migrate':
        message = ' '.join(sys.argv[2:]) if len(sys.argv) > 2 else 'Auto-generated migration'
        print(f"Creando nueva migración: {message}")
        run_command(f'migrate -m "{message}"')
        print("\n✓ Migración creada correctamente")
        print("  Revisa el archivo en migrations/versions/ antes de aplicar")
        
    elif action == 'upgrade':
        print("Aplicando migraciones pendientes...")
        run_command('upgrade')
        print("\n✓ Migraciones aplicadas correctamente")
        
    elif action == 'downgrade':
        print("Revirtiendo última migración...")
        run_command('downgrade')
        print("\n✓ Migración revertida correctamente")
        
    elif action == 'current':
        print("Versión actual de la base de datos:")
        run_command('current')
        
    elif action == 'history':
        print("Historial de migraciones:")
        run_command('history')
        
    elif action == 'stamp':
        revision = sys.argv[2] if len(sys.argv) > 2 else 'head'
        print(f"Marcando base de datos con versión: {revision}")
        run_command(f'stamp {revision}')
        print("\n✓ Base de datos marcada correctamente")
        
    else:
        print(f"✗ Error: Acción '{action}' no reconocida")
        print_usage()
        sys.exit(1)
