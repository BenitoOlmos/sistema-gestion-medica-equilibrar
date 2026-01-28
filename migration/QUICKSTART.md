# 🚀 INICIO RÁPIDO - MIGRACIÓN ETL

## Para ejecutar TODO de una vez

```powershell
# Windows PowerShell
cd c:/Users/benit/OneDrive/Escritorio/PROYECTOS/Calendario
./migration/run_migration.ps1
```

El script automático hará:
1. ✅ Validar pre-requisitos
2. ✅ Exportar Google Sheets (opcional)
3. ✅ Crear schema MySQL
4. ✅ Ejecutar migración ETL
5. ✅ Verificar datos
6. ✅ Crear backup

---

## Ejecución Paso a Paso (Manual)

### 1️⃣ Instalar Dependencias
```bash
pip install -r migration/requirements.txt
```

### 2️⃣ Validar Pre-requisitos
```bash
python migration/03_pre_migration_validator.py
```

### 3️⃣ Exportar CSVs (si usas Google Sheets)
```bash
# Edita primero 00_export_sheets_to_csv.py con tu SHEET_ID
python migration/00_export_sheets_to_csv.py
```

### 4️⃣ Crear Schema MySQL
```bash
mysql -u root -p < migration/01_create_schema.sql
```

### 5️⃣ Migrar Datos
```bash
python migration/02_etl_migration.py --csv-path ./csv_exports
```

### 6️⃣ Verificar Migración
```bash
python migration/04_post_migration_verification.py
```

---

## 🆘 Si algo sale mal

### Hacer Rollback
```bash
mysql -u root -p clinica_equilibrar_erp < migration/99_rollback.sql
```

### Ver Logs
```bash
# Windows
type migration.log | findstr ERROR
type migration.log | findstr WARNING

# Linux/Mac
tail -f migration.log
grep ERROR migration.log
```

---

## 📚 Documentación Completa
Lee: `migration/README.md`

---

## ✅ Checklist

- [ ] MySQL instalado y corriendo
- [ ] Python 3.8+ instalado
- [ ] Dependencias instaladas (`pip install -r requirements.txt`)
- [ ] CSVs exportados en `csv_exports/`
- [ ] Schema creado
- [ ] Migración ejecutada
- [ ] Verificación pasada
- [ ] Backup creado

---

¡Listo para migrar! 🎉
