"""
Script para listar todos los endpoints de la API
Genera un reporte completo de todas las rutas disponibles
"""

if __name__ == '__main__':
    # Importar después de verificar que estamos en __main__
    import sys
    import os
    
    # Agregar el directorio actual al path
    current_dir = os.path.dirname(os.path.abspath(__file__))
    sys.path.insert(0, current_dir)
    
    # Importar usando importlib para evitar conflictos
    import importlib.util
    spec = importlib.util.spec_from_file_location("app_module", os.path.join(current_dir, "app.py"))
    app_module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(app_module)
    app = app_module.app
    
    print("\n" + "="*100)
    print("ENDPOINTS DE LA API - ProGest Backend")
    print("="*100 + "\n")
    
    # Obtener todos los endpoints
    endpoints = []
    
    for rule in app.url_map.iter_rules():
        # Ignorar endpoints estáticos
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
    
    # Ordenar por blueprint y luego por path
    endpoints.sort(key=lambda x: (x['blueprint'], x['path']))
    
    # Agrupar por blueprint
    blueprints = {}
    for endpoint in endpoints:
        bp = endpoint['blueprint']
        if bp not in blueprints:
            blueprints[bp] = []
        blueprints[bp].append(endpoint)
    
    # Imprimir por blueprint
    for blueprint, bp_endpoints in blueprints.items():
        print(f"\n{'='*100}")
        print(f"BLUEPRINT: {blueprint.upper()}")
        print(f"{'='*100}")
        print(f"{'MÉTODO':<15} {'RUTA':<60} {'ENDPOINT':<25}")
        print("-"*100)
        
        for ep in bp_endpoints:
            print(f"{ep['methods']:<15} {ep['path']:<60} {ep['endpoint']:<25}")
    
    print(f"\n{'='*100}")
    print(f"TOTAL DE ENDPOINTS: {len(endpoints)}")
    print(f"{'='*100}\n")
    
    # Generar archivo Markdown
    markdown = "# API Endpoints - ProGest Backend\n\n"
    markdown += f"Total de endpoints: **{len(endpoints)}**\n\n"
    markdown += "---\n\n"
    
    for blueprint, bp_endpoints in blueprints.items():
        markdown += f"## {blueprint.upper()}\n\n"
        markdown += f"Total: {len(bp_endpoints)} endpoints\n\n"
        markdown += "| Método | Ruta | Endpoint |\n"
        markdown += "|--------|------|----------|\n"
        
        for ep in bp_endpoints:
            markdown += f"| {ep['methods']} | `{ep['path']}` | {ep['endpoint']} |\n"
        
        markdown += "\n---\n\n"
    
    # Guardar archivo
    with open('API_ENDPOINTS.md', 'w', encoding='utf-8') as f:
        f.write(markdown)
    
    print(f"\nReporte guardado en: API_ENDPOINTS.md")
    print("\nAnálisis completado!")
