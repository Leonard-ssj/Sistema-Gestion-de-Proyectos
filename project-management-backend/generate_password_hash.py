"""
Script para generar el hash de una contraseña
"""

from werkzeug.security import generate_password_hash

password = "admin123"
password_hash = generate_password_hash(password)

print(f"Password: {password}")
print(f"Hash: {password_hash}")
print("")
print("Copia este hash y úsalo en el SQL:")
print(f"'{password_hash}'")
