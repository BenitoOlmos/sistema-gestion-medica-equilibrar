/**
 * MODO DESARROLLO LOCAL - SIN BACKEND
 * Este archivo permite testing del frontend sin MySQL
 */

// Simular delay de red
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Usuario de prueba
const DEMO_USER = {
    id: 1,
    email: 'demo@equilibrar.com',
    role: 'ADMINISTRADOR',
    specialistId: null
};

// Token de prueba
const DEMO_TOKEN = 'demo_token_local_development';

// Datos de demostración
const DEMO_DATA = {
    DB_ATENCIONES: [
        {
            ID_CITA: 1,
            ID_CLIENTE: 1,
            ID_ESPECIALISTA: 1,
            FECHA_ATENCION: '2026-01-28',
            HORA_ATENCION: '10:00',
            ID_ESTADO: 1,
            TOTAL: 35000,
            PATIENT_NAME: 'María González',
            SERVICE_ID: 1,
        },
        {
            ID_CITA: 2,
            ID_CLIENTE: 2,
            ID_ESPECIALISTA: 1,
            FECHA_ATENCION: '2026-01-28',
            HORA_ATENCION: '11:00',
            ID_ESTADO: 1,
            TOTAL: 45000,
            PATIENT_NAME: 'Juan Pérez',
            SERVICE_ID: 2,
        }
    ],
    DB_CLIENTES: [
        {
            ID_CLIENTE: 1,
            RUT: '12345678-9',
            NOMBRE: 'María González',
            TELEFONO: '+56912345678',
            EMAIL: 'maria@example.com',
        },
        {
            ID_CLIENTE: 2,
            RUT: '98765432-1',
            NOMBRE: 'Juan Pérez',
            TELEFONO: '+56987654321',
            EMAIL: 'juan@example.com',
        }
    ],
    DB_CONFIG_EQUIPO: [
        {
            ID_ESPECIALISTA: 1,
            NOMBRE: 'Dr. Roberto Medina',
            COLOR: '#4CAF50',
            ESTADO: 'ACTIVO',
        }
    ],
    DB_SERVICIOS: [
        {
            ID_SERVICIO: 1,
            NOMBRE: 'Consulta Kinesiología',
            PRECIO: 35000,
        },
        {
            ID_SERVICIO: 2,
            NOMBRE: 'Terapia Física',
            PRECIO: 45000,
        }
    ],
};

// =====================================================
// FUNCIONES DE DEMOSTRACIÓN
// =====================================================

export async function login(email, password) {
    await delay(500); // Simular red

    // Aceptar cualquier credencial en demo
    if (email && password) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('demo_token', DEMO_TOKEN);
        }
        return DEMO_USER;
    }

    throw new Error('Credenciales inválidas');
}

export function logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('demo_token');
    }
}

export async function fetchGoogleSheetsData() {
    await delay(300); // Simular red
    return DEMO_DATA;
}

export async function fetchCitas(filters = {}) {
    await delay(200);
    return DEMO_DATA.DB_ATENCIONES;
}

export async function fetchPacientes(search = '') {
    await delay(200);
    let pacientes = DEMO_DATA.DB_CLIENTES;

    if (search) {
        pacientes = pacientes.filter(p =>
            p.NOMBRE.toLowerCase().includes(search.toLowerCase()) ||
            p.RUT.includes(search)
        );
    }

    return pacientes;
}

export async function fetchProfesionales() {
    await delay(200);
    return DEMO_DATA.DB_CONFIG_EQUIPO;
}

export async function fetchServicios() {
    await delay(200);
    return DEMO_DATA.DB_SERVICIOS;
}

export async function createCita(citaData) {
    await delay(300);
    const newCita = {
        ID_CITA: Date.now(),
        ...citaData
    };
    DEMO_DATA.DB_ATENCIONES.push(newCita);
    return { citaId: newCita.ID_CITA };
}

export async function updateCita(id, citaData) {
    await delay(300);
    const index = DEMO_DATA.DB_ATENCIONES.findIndex(c => c.ID_CITA === id);
    if (index !== -1) {
        DEMO_DATA.DB_ATENCIONES[index] = { ...DEMO_DATA.DB_ATENCIONES[index], ...citaData };
    }
    return { success: true };
}

export async function deleteCita(id) {
    await delay(300);
    DEMO_DATA.DB_ATENCIONES = DEMO_DATA.DB_ATENCIONES.filter(c => c.ID_CITA !== id);
    return { success: true };
}

export async function createPaciente(pacienteData) {
    await delay(300);
    const newPaciente = {
        ID_CLIENTE: Date.now(),
        ...pacienteData
    };
    DEMO_DATA.DB_CLIENTES.push(newPaciente);
    return { pacienteId: newPaciente.ID_CLIENTE };
}

export async function updatePaciente(id, pacienteData) {
    await delay(300);
    const index = DEMO_DATA.DB_CLIENTES.findIndex(p => p.ID_CLIENTE === id);
    if (index !== -1) {
        DEMO_DATA.DB_CLIENTES[index] = { ...DEMO_DATA.DB_CLIENTES[index], ...pacienteData };
    }
    return { success: true };
}
