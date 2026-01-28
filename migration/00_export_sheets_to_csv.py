"""
=====================================================
EXPORTADOR DE GOOGLE SHEETS A CSV
Sistema: Clínica Equilibrar ERP
=====================================================

Este script descarga los datos desde Google Sheets
y los exporta como archivos CSV para la migración.

PREREQUISITOS:
- Tener acceso a la URL de Google Sheets publicada
- O usar la Google Sheets API

USO:
    python 00_export_sheets_to_csv.py
"""

import requests
import csv
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =====================================================
# CONFIGURACIÓN
# =====================================================

# URL base de tu Google Sheet publicado (reemplazar con la tuya)
SHEET_URL_BASE = "https://docs.google.com/spreadsheets/d/TU_SHEET_ID/gviz/tq?tqx=out:csv&sheet="

# Hojas a exportar
SHEETS_TO_EXPORT = {
    'DB_CLIENTES': 'DB_CLIENTES.csv',
    'DB_ATENCIONES': 'DB_ATENCIONES.csv',
    'DB_CONFIG_EQUIPO': 'DB_CONFIG_EQUIPO.csv',
    'DB_SERVICIOS': 'DB_SERVICIOS.csv',
    'DB_USUARIOS': 'DB_USUARIOS.csv'
}

OUTPUT_DIR = Path('./csv_exports')

# =====================================================
# FUNCIÓN DE EXPORTACIÓN
# =====================================================

def export_sheet_to_csv(sheet_name, output_filename):
    """Exporta una hoja de Google Sheets a CSV"""
    try:
        logger.info(f"Exportando {sheet_name}...")
        
        # Construir URL
        url = f"{SHEET_URL_BASE}{sheet_name}"
        
        # Descargar
        response = requests.get(url)
        response.raise_for_status()
        
        # Guardar
        output_path = OUTPUT_DIR / output_filename
        with open(output_path, 'wb') as f:
            f.write(response.content)
        
        logger.info(f"  ✓ Guardado en {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"  ✗ Error exportando {sheet_name}: {e}")
        return False

# =====================================================
# MAIN
# =====================================================

if __name__ == "__main__":
    logger.info("=" * 60)
    logger.info("EXPORTANDO GOOGLE SHEETS A CSV")
    logger.info("=" * 60)
    
    # Crear directorio de salida
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    # Exportar cada hoja
    success_count = 0
    for sheet_name, filename in SHEETS_TO_EXPORT.items():
        if export_sheet_to_csv(sheet_name, filename):
            success_count += 1
    
    logger.info("=" * 60)
    logger.info(f"✓ Exportación completa: {success_count}/{len(SHEETS_TO_EXPORT)} hojas")
    logger.info("=" * 60)
    
    print("\n📝 INSTRUCCIONES:")
    print("1. Los archivos CSV están en: ./csv_exports/")
    print("2. Ahora ejecuta el schema SQL en MySQL:")
    print("   mysql -u root -p < migration/01_create_schema.sql")
    print("3. Luego ejecuta la migración ETL:")
    print("   python migration/02_etl_migration.py --csv-path ./csv_exports")
