#!/usr/bin/env python3
"""
Script para ejecutar la migración: agregar resend_count a invites
"""
import psycopg2
from config import Config

def run_migration():
    """Ejecutar migración SQL"""
    try:
        # Conectar a la base de datos
        conn = psycopg2.connect(Config.SQLALCHEMY_DATABASE_URI)
        cursor = conn.cursor()
        
        print("🔄 Ejecutando migración: add_resend_count_to_invites")
        print("=" * 60)
        
        # Leer archivo SQL
        with open('migrations/add_resend_count_to_invites.sql', 'r') as f:
            sql = f.read()
        
        # Ejecutar SQL
        cursor.execute(sql)
        conn.commit()
        
        print("✅ Migración ejecutada exitosamente")
        print("=" * 60)
        
        # Verificar cambios
        cursor.execute("""
            SELECT 
                column_name, 
                data_type, 
                column_default 
            FROM information_schema.columns 
            WHERE table_name = 'invites' 
            AND column_name IN ('resend_count', 'updated_at')
            ORDER BY column_name
        """)
        
        columns = cursor.fetchall()
        
        if columns:
            print("\n📋 Columnas agregadas:")
            for col in columns:
                print(f"  - {col[0]}: {col[1]} (default: {col[2]})")
        
        # Mostrar invitaciones existentes
        cursor.execute("""
            SELECT 
                id, 
                email, 
                status, 
                resend_count, 
                created_at 
            FROM invites 
            LIMIT 5
        """)
        
        invites = cursor.fetchall()
        
        if invites:
            print("\n📧 Invitaciones existentes (primeras 5):")
            for inv in invites:
                print(f"  - {inv[1]}: status={inv[2]}, resend_count={inv[3]}")
        else:
            print("\n📧 No hay invitaciones en la base de datos")
        
        cursor.close()
        conn.close()
        
        print("\n✅ Migración completada exitosamente")
        
    except Exception as e:
        print(f"\n❌ Error ejecutando migración: {e}")
        raise

if __name__ == '__main__':
    run_migration()
