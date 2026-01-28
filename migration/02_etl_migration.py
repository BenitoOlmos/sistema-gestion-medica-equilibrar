"""
=====================================================
ETL MIGRATION SCRIPT: CSV → MySQL
Sistema: Clínica Equilibrar ERP
Autor: Migration Team
Fecha: 2026-01-28
=====================================================

Este script migra datos desde archivos CSV planos (legacy)
a un esquema MySQL relacional normalizado (3NF).

PREREQUISITOS:
- MySQL Server 8.0+
- Python 3.8+
- Paquetes: pandas, sqlalchemy, pymysql, python-dotenv

INSTALACIÓN:
    pip install pandas sqlalchemy pymysql python-dotenv bcrypt

USO:
    python 02_etl_migration.py --csv-path ./csv_exports
"""

import pandas as pd
import pymysql
from sqlalchemy import create_engine, text
import logging
from datetime import datetime, timedelta
import re
from pathlib import Path
import sys
import argparse
import bcrypt

# =====================================================
# CONFIGURACIÓN DE LOGGING
# =====================================================

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('migration.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# =====================================================
# CONFIGURACIÓN DE BASE DE DATOS
# =====================================================

DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',  # Cambiar según tu configuración
    'password': '',  # Cambiar según tu configuración
    'database': 'clinica_equilibrar_erp',
    'charset': 'utf8mb4'
}

# Crear string de conexión
connection_string = f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}?charset=utf8mb4"

# =====================================================
# UTILIDADES DE LIMPIEZA
# =====================================================

def clean_text(text):
    """Limpia y normaliza texto"""
    if pd.isna(text) or text == '':
        return None
    text = str(text).strip()
    return text if text else None

def title_case(text):
    """Convierte a Title Case"""
    if not text:
        return None
    return text.strip().title()

def clean_rut(rut):
    """Limpia y valida RUT chileno"""
    if pd.isna(rut) or rut == '':
        return None
    return clean_text(str(rut).replace('.', '').replace('-', '').upper())

def parse_date(date_str):
    """Parsea fechas en múltiples formatos"""
    if pd.isna(date_str) or date_str == '':
        return None
    
    try:
        # Intentar formato DD/MM/YYYY
        if '/' in str(date_str):
            parts = str(date_str).split('/')
            if len(parts) == 3 and len(parts[2]) == 4:
                return f"{parts[2]}-{parts[1].zfill(2)}-{parts[0].zfill(2)}"
        
        # Intentar formato DD-MM-YYYY
        if '-' in str(date_str) and len(str(date_str).split('-')[0]) <= 2:
            parts = str(date_str).split('-')
            if len(parts) == 3 and len(parts[2]) == 4:
                return f"{parts[2]}-{parts[1].zfill(2)}-{parts[0].zfill(2)}"
        
        # Si ya está en formato YYYY-MM-DD
        if len(str(date_str)) == 10 and str(date_str)[4] == '-':
            return str(date_str)
            
        return None
    except:
        logger.warning(f"No se pudo parsear fecha: {date_str}")
        return None

def parse_datetime(date_str, time_str):
    """Combina fecha y hora"""
    date = parse_date(date_str)
    if not date:
        return None
    
    time = clean_text(time_str) or '00:00'
    if ':' not in time:
        time = '00:00'
    
    return f"{date} {time}:00"

def clean_number(value):
    """Limpia y convierte a número"""
    if pd.isna(value) or value == '':
        return 0
    try:
        return int(float(str(value).replace(',', '').replace('$', '').strip()))
    except:
        return 0

# =====================================================
# CLASE PRINCIPAL DE MIGRACIÓN
# =====================================================

class ETLMigration:
    def __init__(self, csv_path, db_connection_string):
        self.csv_path = Path(csv_path)
        self.engine = create_engine(db_connection_string, echo=False)
        self.maps = {}  # Almacena mapeos ID legacy → ID nuevo
        
    def load_csv(self, filename):
        """Carga un archivo CSV"""
        filepath = self.csv_path / filename
        if not filepath.exists():
            logger.error(f"Archivo no encontrado: {filepath}")
            return None
        
        logger.info(f"Cargando {filename}...")
        df = pd.read_csv(filepath, encoding='utf-8-sig')
        logger.info(f"  Registros cargados: {len(df)}")
        return df
    
    # =================================================
    # FASE 1: MAESTROS DINÁMICOS
    # =================================================
    
    def migrate_dynamic_masters(self, df_clientes, df_equipo):
        """Migra catálogos dinámicos extraídos de los CSVs"""
        logger.info("=== FASE 1: MIGRANDO MAESTROS DINÁMICOS ===")
        
        # 1. Comunas
        logger.info("Migrando comunas...")
        comunas_unique = df_clientes['COMUNA'].dropna().unique()
        comunas_data = [{'nombre': clean_text(c)} for c in comunas_unique if clean_text(c)]
        
        if comunas_data:
            pd.DataFrame(comunas_data).to_sql('comunas', self.engine, if_exists='append', index=False)
            logger.info(f"  ✓ {len(comunas_data)} comunas insertadas")
        
        # Crear mapa comuna nombre → id
        with self.engine.connect() as conn:
            result = conn.execute(text("SELECT id_comuna, nombre FROM comunas"))
            self.maps['comunas'] = {row[1]: row[0] for row in result}
        
        # 2. Previsiones (adicionales a las ya insertadas)
        logger.info("Migrando previsiones adicionales...")
        previsiones_unique = df_clientes['ISAPRE'].dropna().unique()  # Asumiendo que ISAPRE contiene la previsión
        
        with self.engine.connect() as conn:
            existing = conn.execute(text("SELECT LOWER(nombre) FROM previsiones"))
            existing_names = [row[0] for row in existing]
        
        new_previsiones = []
        for prev in previsiones_unique:
            prev_clean = clean_text(prev)
            if prev_clean and prev_clean.lower() not in existing_names:
                new_previsiones.append({'nombre': prev_clean, 'tipo': 'ISAPRE'})
        
        if new_previsiones:
            pd.DataFrame(new_previsiones).to_sql('previsiones', self.engine, if_exists='append', index=False)
            logger.info(f"  ✓ {len(new_previsiones)} previsiones insertadas")
        
        # Crear mapa previsión nombre → id
        with self.engine.connect() as conn:
            result = conn.execute(text("SELECT id_prevision, nombre FROM previsiones"))
            self.maps['previsiones'] = {row[1].lower(): row[0] for row in result}
        
        # 3. Especialidades
        logger.info("Migrando especialidades...")
        especialidades_unique = df_equipo['ESPECIALIDAD'].dropna().unique()
        especialidades_data = [{'nombre': clean_text(e)} for e in especialidades_unique if clean_text(e)]
        
        if especialidades_data:
            pd.DataFrame(especialidades_data).to_sql('especialidades', self.engine, if_exists='append', index=False)
            logger.info(f"  ✓ {len(especialidades_data)} especialidades insertadas")
        
        # Crear mapa especialidad nombre → id
        with self.engine.connect() as conn:
            result = conn.execute(text("SELECT id_especialidad, nombre FROM especialidades"))
            self.maps['especialidades'] = {row[1]: row[0] for row in result}
    
    # =================================================
    # FASE 2: PACIENTES
    # =================================================
    
    def migrate_patients(self, df_clientes):
        """Migra tabla DB_CLIENTES.csv → pacientes"""
        logger.info("=== FASE 2: MIGRANDO PACIENTES ===")
        
        pacientes = []
        ruts_vistos = set()
        
        for idx, row in df_clientes.iterrows():
            rut = clean_rut(row.get('RUT'))
            
            # Validar RUT único
            if rut and rut in ruts_vistos:
                logger.warning(f"  ⚠ RUT duplicado en fila {idx+2}: {rut}. Omitiendo...")
                continue
            
            if rut:
                ruts_vistos.add(rut)
            
            # Construir registro
            apellidos = f"{clean_text(row.get('PATERNO', ''))} {clean_text(row.get('MATERNO', ''))}".strip()
            
            paciente = {
                'rut': rut,
                'nombres': title_case(row.get('NOMBRES')),
                'apellidos': title_case(apellidos) if apellidos else None,
                'email': clean_text(row.get('CORREO')),
                'telefono': clean_text(row.get('TELEFONO')),
                'direccion': clean_text(row.get('DIRECCION')),
                'fecha_nacimiento': parse_date(row.get('FECHA_NACIMIENTO')),
                'id_prevision': self.maps['previsiones'].get(clean_text(row.get('ISAPRE', '')).lower()) if clean_text(row.get('ISAPRE')) else None,
                'id_comuna': self.maps['comunas'].get(clean_text(row.get('COMUNA'))) if clean_text(row.get('COMUNA')) else None
            }
            
            pacientes.append(paciente)
        
        # Insertar en lote
        if pacientes:
            df_pacientes = pd.DataFrame(pacientes)
            df_pacientes.to_sql('pacientes', self.engine, if_exists='append', index=False)
            logger.info(f"  ✓ {len(pacientes)} pacientes insertados")
        
        # Crear mapa RUT → id_paciente
        with self.engine.connect() as conn:
            result = conn.execute(text("SELECT id_paciente, rut FROM pacientes WHERE rut IS NOT NULL"))
            self.maps['pacientes_rut'] = {row[1]: row[0] for row in result}
            
            # También por Código Cliente (COD)
            result2 = conn.execute(text("SELECT id_paciente, rut FROM pacientes"))
            self.maps['pacientes_cod'] = {}  # Tendrás que mapear COD si existe en CSV
    
    # =================================================
    # FASE 3: PROFESIONALES Y USUARIOS
    # =================================================
    
    def migrate_staff(self, df_equipo):
        """Migra DB_CONFIG_EQUIPO.csv → usuarios + profesionales"""
        logger.info("=== FASE 3: MIGRANDO STAFF ===")
        
        # Obtener ID del rol PROFESIONAL
        with self.engine.connect() as conn:
            role_result = conn.execute(text("SELECT id_rol FROM roles WHERE nombre = 'PROFESIONAL'"))
            id_rol_prof = role_result.fetchone()[0]
        
        for idx, row in df_equipo.iterrows():
            nombres = title_case(row.get('ESPECIALISTA'))
            if not nombres:
                continue
            
            # Crear email dummy si no existe
            email = clean_text(row.get('EMAIL'))
            if not email:
                email = f"{nombres.lower().replace(' ', '.')}@clinica.com"
            
            # Insertar usuario
            password_hash = bcrypt.hashpw(b'temp1234', bcrypt.gensalt()).decode('utf-8')
            
            usuario = {
                'email': email,
                'password_hash': password_hash,
                'id_rol': id_rol_prof
            }
            
            try:
                df_user = pd.DataFrame([usuario])
                df_user.to_sql('usuarios', self.engine, if_exists='append', index=False)
                
                # Obtener ID recién insertado
                with self.engine.connect() as conn:
                    user_result = conn.execute(text(f"SELECT id_usuario FROM usuarios WHERE email = '{email}'"))
                    id_usuario = user_result.fetchone()[0]
                
                # Insertar profesional
                profesional = {
                    'id_usuario': id_usuario,
                    'nombres': nombres,
                    'id_especialidad': self.maps['especialidades'].get(clean_text(row.get('ESPECIALIDAD'))),
                    'color_calendario': clean_text(row.get('COLOR_PROFESIONAL')) or '#3B82F6',
                    'comision_base': float(clean_text(row.get('COMISION_%', 0)) or 0),
                    'retencion_impuesto': float(clean_text(row.get('RETENCION_%', 0)) or 0),
                    'activo': 1 if clean_text(row.get('ESTADO', 'ACTIVO')).upper() == 'ACTIVO' else 0
                }
                
                df_prof = pd.DataFrame([profesional])
                df_prof.to_sql('profesionales', self.engine, if_exists='append', index=False)
                
                logger.info(f"  ✓ Profesional: {nombres}")
                
            except Exception as e:
                logger.error(f"  ✗ Error insertando {nombres}: {e}")
        
        # Crear mapa nombre profesional → id_profesional
        with self.engine.connect() as conn:
            result = conn.execute(text("SELECT id_profesional, nombres FROM profesionales"))
            self.maps['profesionales'] = {row[1]: row[0] for row in result}
    
    # =================================================
    # FASE 4: SERVICIOS
    # =================================================
    
    def migrate_services(self, df_servicios):
        """Migra DB_SERVICIOS.csv → servicios"""
        logger.info("=== FASE 4: MIGRANDO SERVICIOS ===")
        
        servicios = []
        for idx, row in df_servicios.iterrows():
            servicio = {
                'codigo': clean_text(row.get('ID_SERVICIO')),
                'nombre': clean_text(row.get('NOMBRE_SERVICIO')),
                'precio_lista': clean_number(row.get('PRECIO_LISTA')),
                'modalidad': 'PRESENCIAL',  # Valor por defecto
                'duracion_minutos': 60  # Valor por defecto
            }
            servicios.append(servicio)
        
        if servicios:
            df_servicios_clean = pd.DataFrame(servicios)
            df_servicios_clean.to_sql('servicios', self.engine, if_exists='append', index=False)
            logger.info(f"  ✓ {len(servicios)} servicios insertados")
        
        # Crear mapa código servicio → id_servicio
        with self.engine.connect() as conn:
            result = conn.execute(text("SELECT id_servicio, codigo FROM servicios WHERE codigo IS NOT NULL"))
            self.maps['servicios'] = {row[1]: row[0] for row in result}
    
    # =================================================
    # FASE 5: TRANSACCIONES (CRÍTICO)
    # =================================================
    
    def migrate_appointments(self, df_atenciones):
        """Migra DB_ATENCIONES.csv → citas + detalle_financiero + pagos"""
        logger.info("=== FASE 5: MIGRANDO CITAS Y FINANZAS ===")
        
        citas = []
        detalles_financieros = []
        pagos_list = []
        fichas_clinicas = []
        
        # Obtener ID del estado por defecto (REALIZADA)
        with self.engine.connect() as conn:
            estado_result = conn.execute(text("SELECT id_estado FROM estados_cita WHERE codigo = 'REALIZADA'"))
            id_estado_default = estado_result.fetchone()[0]
        
        for idx, row in df_atenciones.iterrows():
            try:
                # A) CITAS
                codigo_cliente = clean_text(row.get('CODIGO CLIENTE'))
                id_paciente = self.maps['pacientes_rut'].get(codigo_cliente)  # Ajustar según mapeo
                
                if not id_paciente:
                    logger.warning(f"  ⚠ Paciente no encontrado para {codigo_cliente} (fila {idx+2})")
                    continue
                
                nombre_prof = clean_text(row.get('ESPECIALISTA'))
                id_profesional = self.maps['profesionales'].get(nombre_prof)
                
                if not id_profesional:
                    logger.warning(f"  ⚠ Profesional no encontrado: {nombre_prof} (fila {idx+2})")
                    continue
                
                fecha_inicio = parse_datetime(row.get('FECHA DE ATENCION'), row.get('HORA DE ATENCION'))
                if not fecha_inicio:
                    logger.warning(f"  ⚠ Fecha inválida en fila {idx+2}")
                    continue
                
                # Calcular fecha_fin (default +60 min)
                try:
                    dt_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d %H:%M:%S')
                    dt_fin = dt_inicio + timedelta(minutes=60)
                    fecha_fin = dt_fin.strftime('%Y-%m-%d %H:%M:%S')
                except:
                    fecha_fin = None
                
                cita = {
                    'codigo_cita': clean_text(row.get('ID_ATENCION')),
                    'id_paciente': id_paciente,
                    'id_profesional': id_profesional,
                    'id_servicio': self.maps['servicios'].get(clean_text(row.get('ID_SERVICIO'))) if clean_text(row.get('ID_SERVICIO')) else None,
                    'id_estado': int(row.get('ID_ESTADO', id_estado_default)),
                    'id_ubicacion': 1,  # Por defecto presencial
                    'fecha_inicio': fecha_inicio,
                    'fecha_fin': fecha_fin,
                    'observaciones': clean_text(row.get('OBSERVACION')),
                    'observacion_migrada': clean_text(row.get('OBSERVACION'))
                }
                
                citas.append(cita)
                
                # B) DETALLE FINANCIERO
                detalle_fin = {
                    'precio_cobrado': clean_number(row.get('INGRESO')),
                    'monto_profesional': clean_number(row.get('PAGO ESPECIALISTA (LIQUIDO)')),
                    'monto_clinica': clean_number(row.get('UTILIDAD')),
                    'impuesto_retenido': clean_number(row.get('IMPUESTO'))
                }
                detalles_financieros.append(detalle_fin)
                
                # C) PAGOS (si existe fecha de pago)
                fecha_pago = parse_date(row.get('FECHA DE PAGO'))
                if fecha_pago:
                    pago = {
                        'fecha_pago': fecha_pago,
                        'monto': clean_number(row.get('INGRESO')),
                        'estado_pago': 'CONFIRMADO'
                    }
                    pagos_list.append(pago)
                else:
                    pagos_list.append(None)  # Mantener índice sincronizado
                
                # D) FICHA CLÍNICA (si observación tiene contenido médico)
                obs = clean_text(row.get('OBSERVACION'))
                if obs and len(obs) > 20:  # Filtro básico
                    ficha = {
                        'id_paciente': id_paciente,
                        'observacion_historica': obs
                    }
                    fichas_clinicas.append(ficha)
                else:
                    fichas_clinicas.append(None)
                
            except Exception as e:
                logger.error(f"  ✗ Error procesando fila {idx+2}: {e}")
                continue
        
        # INSERTAR CITAS
        if citas:
            df_citas = pd.DataFrame(citas)
            df_citas.to_sql('citas', self.engine, if_exists='append', index=False)
            logger.info(f"  ✓ {len(citas)} citas insertadas")
            
            # Obtener IDs de citas recién insertadas
            with self.engine.connect() as conn:
                result = conn.execute(text("SELECT id_cita, codigo_cita FROM citas WHERE codigo_cita IS NOT NULL ORDER BY id_cita"))
                citas_ids = {row[1]: row[0] for row in result}
            
            # INSERTAR DETALLES FINANCIEROS
            detalles_con_id = []
            for i, detalle in enumerate(detalles_financieros):
                codigo = citas[i]['codigo_cita']
                id_cita = citas_ids.get(codigo)
                if id_cita and detalle:
                    detalle['id_cita'] = id_cita
                    detalles_con_id.append(detalle)
            
            if detalles_con_id:
                df_detalles = pd.DataFrame(detalles_con_id)
                df_detalles.to_sql('detalle_financiero_cita', self.engine, if_exists='append', index=False)
                logger.info(f"  ✓ {len(detalles_con_id)} detalles financieros insertados")
            
            # INSERTAR PAGOS
            pagos_con_id = []
            for i, pago in enumerate(pagos_list):
                if pago:
                    codigo = citas[i]['codigo_cita']
                    id_cita = citas_ids.get(codigo)
                    if id_cita:
                        pago['id_cita'] = id_cita
                        pago['id_metodo_pago'] = 1  # Default: Efectivo
                        pagos_con_id.append(pago)
            
            if pagos_con_id:
                df_pagos = pd.DataFrame(pagos_con_id)
                df_pagos.to_sql('pagos', self.engine, if_exists='append', index=False)
                logger.info(f"  ✓ {len(pagos_con_id)} pagos insertados")
            
            # INSERTAR FICHAS CLÍNICAS
            fichas_con_id = []
            for i, ficha in enumerate(fichas_clinicas):
                if ficha:
                    codigo = citas[i]['codigo_cita']
                    id_cita = citas_ids.get(codigo)
                    if id_cita:
                        ficha['id_cita'] = id_cita
                        fichas_con_id.append(ficha)
            
            if fichas_con_id:
                df_fichas = pd.DataFrame(fichas_con_id)
                df_fichas.to_sql('ficha_clinica', self.engine, if_exists='append', index=False)
                logger.info(f"  ✓ {len(fichas_con_id)} fichas clínicas insertadas")
    
    # =================================================
    # EJECUTOR PRINCIPAL
    # =================================================
    
    def run_migration(self):
        """Ejecuta todo el proceso ETL"""
        logger.info("=" * 60)
        logger.info("INICIANDO MIGRACIÓN ETL: CSV → MySQL")
        logger.info("=" * 60)
        
        try:
            # Cargar CSVs
            df_clientes = self.load_csv('DB_CLIENTES.csv')
            df_equipo = self.load_csv('DB_CONFIG_EQUIPO.csv')
            df_servicios = self.load_csv('DB_SERVICIOS.csv')
            df_atenciones = self.load_csv('DB_ATENCIONES.csv')
            
            if df_clientes is None or df_equipo is None:
                logger.error("No se pudieron cargar los CSVs necesarios")
                return False
            
            # Ejecutar fases
            self.migrate_dynamic_masters(df_clientes, df_equipo)
            self.migrate_patients(df_clientes)
            self.migrate_staff(df_equipo)
            
            if df_servicios is not None:
                self.migrate_services(df_servicios)
            
            if df_atenciones is not None:
                self.migrate_appointments(df_atenciones)
            
            logger.info("=" * 60)
            logger.info("✓ MIGRACIÓN COMPLETADA EXITOSAMENTE")
            logger.info("=" * 60)
            return True
            
        except Exception as e:
            logger.error(f"✗ ERROR CRÍTICO EN MIGRACIÓN: {e}")
            return False

# =====================================================
# MAIN
# =====================================================

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Migración ETL CSV → MySQL')
    parser.add_argument('--csv-path', default='./csv_exports', help='Ruta a los archivos CSV')
    parser.add_argument('--db-host', default='localhost', help='Host de MySQL')
    parser.add_argument('--db-user', default='root', help='Usuario de MySQL')
    parser.add_argument('--db-password', default='', help='Password de MySQL')
    
    args = parser.parse_args()
    
    # Actualizar configuración
    DB_CONFIG['host'] = args.db_host
    DB_CONFIG['user'] = args.db_user
    DB_CONFIG['password'] = args.db_password
    
    connection_string = f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}?charset=utf8mb4"
    
    # Ejecutar migración
    migration = ETLMigration(args.csv_path, connection_string)
    success = migration.run_migration()
    
    sys.exit(0 if success else 1)
