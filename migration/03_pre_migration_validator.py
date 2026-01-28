"""
=====================================================
VALIDADOR PRE-MIGRACIÓN
Sistema: Clínica Equilibrar ERP
=====================================================

Valida que todos los requisitos estén cumplidos antes
de ejecutar la migración ETL.

USO:
    python 03_pre_migration_validator.py
"""

import sys
import subprocess
from pathlib import Path
import importlib
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

class PreMigrationValidator:
    def __init__(self):
        self.errors = []
        self.warnings = []
        
    def check_python_version(self):
        """Verifica versión de Python"""
        logger.info("✓ Verificando versión de Python...")
        version = sys.version_info
        
        if version.major < 3 or (version.major == 3 and version.minor < 8):
            self.errors.append(f"Python 3.8+ requerido. Actual: {version.major}.{version.minor}")
        else:
            logger.info(f"  ✓ Python {version.major}.{version.minor}.{version.micro} OK")
    
    def check_mysql_connection(self):
        """Verifica que MySQL esté instalado y accesible"""
        logger.info("✓ Verificando MySQL...")
        
        try:
            result = subprocess.run(
                ['mysql', '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode == 0:
                logger.info(f"  ✓ {result.stdout.strip()}")
            else:
                self.errors.append("MySQL no está instalado o no está en el PATH")
        except FileNotFoundError:
            self.errors.append("MySQL no encontrado. Instalar desde: https://dev.mysql.com/downloads/")
        except Exception as e:
            self.warnings.append(f"No se pudo verificar MySQL: {e}")
    
    def check_python_packages(self):
        """Verifica paquetes Python"""
        logger.info("✓ Verificando paquetes Python...")
        
        required_packages = {
            'pandas': 'pandas',
            'sqlalchemy': 'sqlalchemy',
            'pymysql': 'pymysql',
            'bcrypt': 'bcrypt',
            'dotenv': 'python-dotenv'
        }
        
        for module_name, package_name in required_packages.items():
            try:
                importlib.import_module(module_name)
                logger.info(f"  ✓ {package_name} instalado")
            except ImportError:
                self.errors.append(f"Paquete faltante: {package_name}")
    
    def check_csv_files(self):
        """Verifica que existan los archivos CSV"""
        logger.info("✓ Verificando archivos CSV...")
        
        csv_dir = Path('./csv_exports')
        required_csvs = [
            'DB_CLIENTES.csv',
            'DB_ATENCIONES.csv',
            'DB_CONFIG_EQUIPO.csv',
            'DB_SERVICIOS.csv'
        ]
        
        if not csv_dir.exists():
            self.warnings.append(f"Directorio {csv_dir} no existe. Se creará durante la migración.")
            return
        
        for csv_file in required_csvs:
            csv_path = csv_dir / csv_file
            if csv_path.exists():
                size_mb = csv_path.stat().st_size / (1024 * 1024)
                logger.info(f"  ✓ {csv_file} ({size_mb:.2f} MB)")
            else:
                self.warnings.append(f"Archivo faltante: {csv_file}")
    
    def check_migration_scripts(self):
        """Verifica que existan los scripts de migración"""
        logger.info("✓ Verificando scripts de migración...")
        
        scripts = [
            'migration/01_create_schema.sql',
            'migration/02_etl_migration.py',
            'migration/00_export_sheets_to_csv.py'
        ]
        
        for script in scripts:
            if Path(script).exists():
                logger.info(f"  ✓ {script}")
            else:
                self.errors.append(f"Script faltante: {script}")
    
    def check_disk_space(self):
        """Verifica espacio en disco"""
        logger.info("✓ Verificando espacio en disco...")
        
        try:
            import shutil
            total, used, free = shutil.disk_usage('.')
            free_gb = free / (1024 ** 3)
            
            if free_gb < 1:
                self.warnings.append(f"Poco espacio libre: {free_gb:.2f} GB")
            else:
                logger.info(f"  ✓ Espacio libre: {free_gb:.2f} GB")
        except Exception as e:
            self.warnings.append(f"No se pudo verificar espacio: {e}")
    
    def print_summary(self):
        """Imprime resumen de validación"""
        print("\n" + "="*60)
        print("RESUMEN DE VALIDACIÓN PRE-MIGRACIÓN")
        print("="*60)
        
        if self.errors:
            print(f"\n❌ ERRORES CRÍTICOS ({len(self.errors)}):")
            for i, error in enumerate(self.errors, 1):
                print(f"  {i}. {error}")
        
        if self.warnings:
            print(f"\n⚠️  ADVERTENCIAS ({len(self.warnings)}):")
            for i, warning in enumerate(self.warnings, 1):
                print(f"  {i}. {warning}")
        
        if not self.errors and not self.warnings:
            print("\n✅ TODAS LAS VALIDACIONES PASARON")
            print("\n📋 PRÓXIMOS PASOS:")
            print("  1. Exportar Google Sheets a CSV (si no lo has hecho):")
            print("     python migration/00_export_sheets_to_csv.py")
            print("\n  2. Crear schema en MySQL:")
            print("     mysql -u root -p < migration/01_create_schema.sql")
            print("\n  3. Ejecutar migración ETL:")
            print("     python migration/02_etl_migration.py --csv-path ./csv_exports")
            
        elif not self.errors:
            print("\n⚠️  HAY ADVERTENCIAS PERO PUEDES CONTINUAR")
            print("\n📋 PRÓXIMOS PASOS:")
            print("  - Revisa las advertencias arriba")
            print("  - Si estás de acuerdo, procede con la migración")
        else:
            print("\n❌ CORRIJE LOS ERRORES ANTES DE CONTINUAR")
            print("\n📋 SOLUCIONES RÁPIDAS:")
            print("  - Instalar paquetes: pip install -r migration/requirements.txt")
            print("  - Instalar MySQL: https://dev.mysql.com/downloads/")
            
        print("\n" + "="*60)
        
        return len(self.errors) == 0
    
    def run_all_checks(self):
        """Ejecuta todas las validaciones"""
        print("\n🔍 INICIANDO VALIDACIÓN PRE-MIGRACIÓN...\n")
        
        self.check_python_version()
        self.check_mysql_connection()
        self.check_python_packages()
        self.check_csv_files()
        self.check_migration_scripts()
        self.check_disk_space()
        
        return self.print_summary()

if __name__ == "__main__":
    validator = PreMigrationValidator()
    success = validator.run_all_checks()
    sys.exit(0 if success else 1)
