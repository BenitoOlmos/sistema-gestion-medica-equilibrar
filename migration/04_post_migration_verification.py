"""
=====================================================
VERIFICADOR POST-MIGRACIÓN
Sistema: Clínica Equilibrar ERP
=====================================================

Verifica la integridad y consistencia de los datos
después de la migración ETL.

USO:
    python 04_post_migration_verification.py
"""

from sqlalchemy import create_engine, text
import logging
import sys

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)

# =====================================================
# CONFIGURACIÓN
# =====================================================

DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': '',  # Cambiar
    'database': 'clinica_equilibrar_erp',
    'charset': 'utf8mb4'
}

class PostMigrationVerificator:
    def __init__(self, db_config):
        connection_string = f"mysql+pymysql://{db_config['user']}:{db_config['password']}@{db_config['host']}:{db_config['port']}/{db_config['database']}?charset=utf8mb4"
        self.engine = create_engine(connection_string, echo=False)
        self.issues = []
        
    def execute_query(self, query, description):
        """Ejecuta una query y retorna resultados"""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(text(query))
                return result.fetchall()
        except Exception as e:
            logger.error(f"Error en {description}: {e}")
            self.issues.append(f"{description}: {e}")
            return []
    
    def check_table_counts(self):
        """Verifica conteos de registros en tablas"""
        logger.info("\n✓ Verificando conteo de registros...")
        
        tables = [
            'pacientes', 'profesionales', 'usuarios', 'servicios',
            'citas', 'detalle_financiero_cita', 'pagos', 'ficha_clinica',
            'roles', 'especialidades', 'estados_cita', 'previsiones', 
            'comunas', 'metodos_pago', 'ubicaciones'
        ]
        
        for table in tables:
            query = f"SELECT COUNT(*) FROM {table}"
            result = self.execute_query(query, f"Contar {table}")
            
            if result:
                count = result[0][0]
                if count > 0:
                    logger.info(f"  ✓ {table}: {count:,} registros")
                else:
                    logger.warning(f"  ⚠ {table}: 0 registros (¿esperado?)")
    
    def check_foreign_keys(self):
        """Verifica integridad de foreign keys"""
        logger.info("\n✓ Verificando integridad de Foreign Keys...")
        
        checks = [
            {
                'name': 'Citas sin paciente',
                'query': '''
                    SELECT COUNT(*) FROM citas c
                    LEFT JOIN pacientes p ON c.id_paciente = p.id_paciente
                    WHERE p.id_paciente IS NULL
                '''
            },
            {
                'name': 'Citas sin profesional',
                'query': '''
                    SELECT COUNT(*) FROM citas c
                    LEFT JOIN profesionales p ON c.id_profesional = p.id_profesional
                    WHERE p.id_profesional IS NULL
                '''
            },
            {
                'name': 'Detalles financieros huérfanos',
                'query': '''
                    SELECT COUNT(*) FROM detalle_financiero_cita df
                    LEFT JOIN citas c ON df.id_cita = c.id_cita
                    WHERE c.id_cita IS NULL
                '''
            },
            {
                'name': 'Pagos sin cita',
                'query': '''
                    SELECT COUNT(*) FROM pagos pg
                    LEFT JOIN citas c ON pg.id_cita = c.id_cita
                    WHERE c.id_cita IS NULL
                '''
            }
        ]
        
        for check in checks:
            result = self.execute_query(check['query'], check['name'])
            if result and result[0][0] > 0:
                logger.error(f"  ✗ {check['name']}: {result[0][0]} registros problemáticos")
                self.issues.append(check['name'])
            else:
                logger.info(f"  ✓ {check['name']}: OK")
    
    def check_data_quality(self):
        """Verifica calidad de datos"""
        logger.info("\n✓ Verificando calidad de datos...")
        
        checks = [
            {
                'name': 'Pacientes sin nombre',
                'query': 'SELECT COUNT(*) FROM pacientes WHERE nombres IS NULL OR nombres = ""'
            },
            {
                'name': 'Pacientes con RUT duplicado',
                'query': '''
                    SELECT rut, COUNT(*) as cnt FROM pacientes 
                    WHERE rut IS NOT NULL 
                    GROUP BY rut HAVING cnt > 1
                '''
            },
            {
                'name': 'Citas con fecha inválida',
                'query': 'SELECT COUNT(*) FROM citas WHERE fecha_inicio IS NULL'
            },
            {
                'name': 'Precios negativos en detalle financiero',
                'query': 'SELECT COUNT(*) FROM detalle_financiero_cita WHERE precio_cobrado < 0'
            },
            {
                'name': 'Profesionales sin especialidad',
                'query': 'SELECT COUNT(*) FROM profesionales WHERE id_especialidad IS NULL'
            }
        ]
        
        for check in checks:
            result = self.execute_query(check['query'], check['name'])
            
            if result:
                # Para queries de conteo
                if 'COUNT(*)' in check['query']:
                    count = result[0][0]
                    if count > 0:
                        logger.warning(f"  ⚠ {check['name']}: {count} registros")
                        self.issues.append(f"{check['name']}: {count}")
                    else:
                        logger.info(f"  ✓ {check['name']}: OK")
                # Para queries de GROUP BY (duplicados)
                else:
                    if len(result) > 0:
                        logger.warning(f"  ⚠ {check['name']}: {len(result)} casos")
                        for row in result[:5]:  # Mostrar primeros 5
                            logger.warning(f"     - {row}")
                        self.issues.append(f"{check['name']}: {len(result)}")
                    else:
                        logger.info(f"  ✓ {check['name']}: OK")
    
    def check_financial_consistency(self):
        """Verifica consistencia financiera"""
        logger.info("\n✓ Verificando consistencia financiera...")
        
        # Verificar que precio_cobrado = monto_prof + monto_clinica + impuesto (aprox)
        query = '''
            SELECT 
                COUNT(*) as total,
                SUM(CASE 
                    WHEN ABS(precio_cobrado - (monto_profesional + monto_clinica + impuesto_retenido)) > 100 
                    THEN 1 ELSE 0 
                END) as inconsistentes
            FROM detalle_financiero_cita
            WHERE precio_cobrado > 0
        '''
        
        result = self.execute_query(query, "Consistencia financiera")
        
        if result and len(result) > 0:
            total, inconsistentes = result[0]
            if inconsistentes > 0:
                pct = (inconsistentes / total * 100) if total > 0 else 0
                logger.warning(f"  ⚠ {inconsistentes}/{total} ({pct:.1f}%) registros con descuadre > $100")
                logger.warning(f"     (Esto puede ser normal por descuentos o datos históricos)")
            else:
                logger.info(f"  ✓ Todas las finanzas cuadran correctamente")
    
    def check_date_ranges(self):
        """Verifica rangos de fechas razonables"""
        logger.info("\n✓ Verificando rangos de fechas...")
        
        query = '''
            SELECT 
                MIN(fecha_inicio) as primera_cita,
                MAX(fecha_inicio) as ultima_cita,
                COUNT(*) as total_citas
            FROM citas
        '''
        
        result = self.execute_query(query, "Rango de fechas de citas")
        
        if result and result[0]:
            primera, ultima, total = result[0]
            logger.info(f"  ✓ Primera cita: {primera}")
            logger.info(f"  ✓ Última cita: {ultima}")
            logger.info(f"  ✓ Total citas: {total:,}")
    
    def generate_summary_report(self):
        """Genera reporte resumen"""
        logger.info("\n" + "="*60)
        logger.info("REPORTE RESUMEN POST-MIGRACIÓN")
        logger.info("="*60)
        
        # Estadísticas generales
        query = '''
            SELECT 
                (SELECT COUNT(*) FROM pacientes) as pacientes,
                (SELECT COUNT(*) FROM profesionales) as profesionales,
                (SELECT COUNT(*) FROM citas) as citas,
                (SELECT SUM(precio_cobrado) FROM detalle_financiero_cita) as ingresos_total,
                (SELECT COUNT(*) FROM pagos) as pagos_registrados
        '''
        
        result = self.execute_query(query, "Estadísticas generales")
        
        if result and result[0]:
            pacientes, profesionales, citas, ingresos, pagos = result[0]
            
            print(f"\n📊 ESTADÍSTICAS GENERALES:")
            print(f"  • Pacientes migrados: {pacientes:,}")
            print(f"  • Profesionales migrados: {profesionales:,}")
            print(f"  • Citas registradas: {citas:,}")
            print(f"  • Ingresos totales: ${ingresos:,}" if ingresos else "  • Ingresos totales: $0")
            print(f"  • Pagos registrados: {pagos:,}")
        
        # Resumen de problemas
        if self.issues:
            print(f"\n⚠️  PROBLEMAS DETECTADOS ({len(self.issues)}):")
            for i, issue in enumerate(self.issues, 1):
                print(f"  {i}. {issue}")
            print("\n💡 RECOMENDACIÓN: Revisar estos casos manualmente")
        else:
            print("\n✅ NO SE DETECTARON PROBLEMAS")
            print("   La migración parece exitosa")
        
        logger.info("="*60)
    
    def run_all_checks(self):
        """Ejecuta todas las verificaciones"""
        print("\n🔍 INICIANDO VERIFICACIÓN POST-MIGRACIÓN...\n")
        
        try:
            self.check_table_counts()
            self.check_foreign_keys()
            self.check_data_quality()
            self.check_financial_consistency()
            self.check_date_ranges()
            self.generate_summary_report()
            
            return len(self.issues) == 0
            
        except Exception as e:
            logger.error(f"Error durante verificación: {e}")
            return False

if __name__ == "__main__":
    print("="*60)
    print("VERIFICADOR POST-MIGRACIÓN - Clínica Equilibrar ERP")
    print("="*60)
    
    # Solicitar password de forma segura
    import getpass
    print(f"\nConectando a: {DB_CONFIG['user']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")
    
    password = getpass.getpass("Ingresa password de MySQL: ")
    DB_CONFIG['password'] = password
    
    verificator = PostMigrationVerificator(DB_CONFIG)
    success = verificator.run_all_checks()
    
    sys.exit(0 if success else 1)
