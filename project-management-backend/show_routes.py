"""
Script simple para mostrar todas las rutas de la API
"""
import sys
sys.dont_write_bytecode = True

# Importar directamente desde el archivo app.py
import importlib.util
spec = importlib.util.spec_from_file_location("app_module", "app.py")
app_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app_module)

app = app_module.app

print("\n" + "="*120)
print("ENDPOINTS DE LA API - ProGest Backend")
print("="*120 + "\n")

# Obtener todos los endpoints
endpoints = []

for rule in app.url_map.iter_rules():
    if rule.endpoint == 'static':
        continue
        
    methods = ', '.join(sorted(rule.methods - {'HEAD', 'OPTIONS'}))
    
    endpoint_info = {
        'path': str(rule),
        'methods': methods,
        'endpoint': rule.endpoint,
        'blueprint': rule.endpoint.split('.')[0] if '.' in rule.endpoint else 'main'
    }
    
    endpoints.append(endpoint_info)

# Ordenar
endpoints.sort(key=lambda x: (x['blueprint'], x['path']))

# Agrupar por blueprint
blueprints = {}
for endpoint in endpoints:
    bp = endpoint['blueprint']
    if bp not in blueprints:
        blueprints[bp] = []
    blueprints[bp].append(endpoint)

# Imprimir
for blueprint, bp_endpoints in blueprints.items():
    print(f"\n{'='*120}")
    print(f"BLUEPRINT: {blueprint.upper()}")
    print(f"{'='*120}")
    print(f"{'MÉTODO':<20} {'RUTA':<70} {'ENDPOINT':<30}")
    print("-"*120)
    
    for ep in bp_endpoints:
        print(f"{ep['methods']:<20} {ep['path']:<70} {ep['endpoint']:<30}")

print(f"\n{'='*120}")
print(f"TOTAL DE ENDPOINTS: {len(endpoints)}")
print(f"{'='*120}\n")

# Generar Markdown
markdown = "# API Endpoints - ProGest Backend\n\n"
markdown += f"**Total de endpoints:** {len(endpoints)}\n\n"
markdown += "---\n\n"

for blueprint, bp_endpoints in blueprints.items():
    markdown += f"## {blueprint.upper()}\n\n"
    markdown += f"**Total:** {len(bp_endpoints)} endpoints\n\n"
    markdown += "| Método | Ruta | Endpoint |\n"
    markdown += "|--------|------|----------|\n"
    
    for ep in bp_endpoints:
        markdown += f"| {ep['methods']} | `{ep['path']}` | `{ep['endpoint']}` |\n"
    
    markdown += "\n---\n\n"

with open('API_ENDPOINTS.md', 'w', encoding='utf-8') as f:
    f.write(markdown)

print("Reporte guardado en: API_ENDPOINTS.md\n")
