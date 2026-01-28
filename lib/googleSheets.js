export const SHEET_ID = '1GXOKTuUHLF0HGLTrBdDkx37OpDYQ7kt9I2BKzIUZf6E';

const CSV_URL = (sheetName) => `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;

// Simple CSV Parser that handles quoted fields
const parseCSV = (text) => {
    const customSplit = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.replace(/^"|"$/g, '').trim()); // Remove surrounding quotes
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.replace(/^"|"$/g, '').trim());
        return result;
    };

    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const headers = customSplit(lines[0]);

    return lines.slice(1).map(line => {
        const values = customSplit(line);
        return headers.reduce((obj, header, i) => {
            obj[header] = values[i] || '';
            return obj;
        }, {});
    });
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    // Handle DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY -> YYYY-MM-DD
    const parts = dateStr.split(/[\/\-\.]/);
    if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return dateStr;
};

// Google Apps Script Web App URL (Replace with your own deployed URL)
export const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbxU5_Yy6wxwy7oNL11sI2WIZQQi1_JL0sQbeFtFgwetWaDznm4fLKW-W_qlhumOttAQ_g/exec';
export const GAS_API_KEY = 'CLAVE_SECRETA_EQUILIBRAR';

// Helper to interact with the GAS API
export const apiRequest = async (action, payload) => {
    if (!GAS_API_URL) {
        console.warn("Google Apps Script URL not configured. Operation simulating success in local state only.");
        return { status: 'mock_success' };
    }

    try {
        const response = await fetch(GAS_API_URL, {
            method: 'POST',
            body: JSON.stringify({
                action,
                auth: GAS_API_KEY,
                ...payload
            })
        });
        return await response.json();
    } catch (error) {
        console.error("API Request Failed:", error);
        return { status: 'error', message: error.toString() };
    }
};

export const fetchGoogleSheetsData = async () => {
    // ... (existing fetch logic remains the same for initial load, or we can switch to API read if preferred)
    // For now, let's keep CSV fetch for speed on bulk read, and use API only for writes

    try {
        const [atencionesRaw, clientesRaw, equipoRaw, usuariosRaw, serviciosRaw] = await Promise.all([
            fetch(CSV_URL('DB_ATENCIONES')).then(r => r.text()),
            fetch(CSV_URL('DB_CLIENTES')).then(r => r.text()),
            fetch(CSV_URL('DB_CONFIG_EQUIPO')).then(r => r.text()),
            fetch(CSV_URL('DB_USUARIOS')).then(r => r.text()),
            fetch(CSV_URL('DB_SERVICIOS')).then(r => r.text()),
        ]);

        const atenciones = parseCSV(atencionesRaw).map(a => ({
            ID_ATENCION: a['ID_ATENCION'],
            ID_CLIENTE: a['CODIGO CLIENTE'],
            ID_ESPECIALISTA: a['ID_ESPECIALISTA'],
            FECHA_ATENCION: formatDate(a['FECHA DE ATENCION']),
            HORA_ATENCION: a['HORA DE ATENCION'],
            ID_ESTADO: Number(a['ID_ESTADO']),
            TOTAL: Number(a['INGRESO'] || 0)
        }));

        const clientes = parseCSV(clientesRaw).map(c => ({
            ID_CLIENTE: c['COD'],
            NOMBRE: `${c['NOMBRES']} ${c['PATERNO']} ${c['MATERNO']}`.trim(),
            EMAIL: c['CORREO'],
            TELEFONO: c['TELEFONO'],
            COMUNA: c['COMUNA'] || '',
            ISAPRE: c['ISAPRE'] || '',
            RUT: c['RUT'] || '',
            FECHA_NACIMIENTO: formatDate(c['FECHA_NACIMIENTO'])
        }));

        const equipo = parseCSV(equipoRaw).map(e => ({
            ID_ESPECIALISTA: e['ID_ESPECIALISTA'],
            NOMBRE: e['ESPECIALISTA'],
            ESPECIALIDAD: e['ESPECIALIDAD'],
            COLOR: e['COLOR_PROFESIONAL'],
            ESTADO: e['ESTADO'] || 'ACTIVO'
        }));

        const usuarios = parseCSV(usuariosRaw).map(u => {
            let role = u['ROL'].toUpperCase().trim();
            if (role === 'ADMIN') role = 'ADMINISTRADOR';

            return {
                EMAIL: u['ID_USUARIO'],
                ROL: role,
                ID_ESPECIALISTA_LINK: u['ID_ESPECIALISTA'],
                PASS: u['PASS']
            };
        });

        const servicios = parseCSV(serviciosRaw).map(s => ({
            ID_SERVICIO: s['ID_SERVICIO'],
            NOMBRE: s['NOMBRE_SERVICIO'],
            PRECIO: Number(s['PRECIO_LISTA'] || 0)
        }));

        return {
            DB_ATENCIONES: atenciones,
            DB_CLIENTES: clientes,
            DB_CONFIG_EQUIPO: equipo,
            DB_USUARIOS: usuarios,
            DB_SERVICIOS: servicios
        };

    } catch (error) {
        console.error("Error fetching Google Sheets:", error);
        return null;
    }
};
