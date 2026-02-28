"""
WSGI entry point para Flask
Resuelve el conflicto de nombres entre app.py y el módulo app/
"""
import sys
import os
import importlib.util

# Agregar el directorio actual al path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Importar usando importlib para evitar conflictos
spec = importlib.util.spec_from_file_location("app_module", os.path.join(current_dir, "app.py"))
app_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app_module)

# Exportar la aplicación
app = app_module.app
db = app_module.db
migrate = app_module.migrate

if __name__ == '__main__':
    app.run(debug=True, port=5000)
