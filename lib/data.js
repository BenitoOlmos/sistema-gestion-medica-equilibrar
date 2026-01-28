// Mock Database to simulate Google Sheets connection
// In a production environment, this would be replaced by calls to valid Google Sheets API

export const INITIAL_DATA = {
    DB_ATENCIONES: [
        { ID_ATENCION: '1', ID_CLIENTE: '101', ID_ESPECIALISTA: 'SP01', FECHA_ATENCION: '2024-03-20', HORA_ATENCION: '09:00', ID_ESTADO: 1, TOTAL: 50000 },
        { ID_ATENCION: '2', ID_CLIENTE: '102', ID_ESPECIALISTA: 'SP02', FECHA_ATENCION: '2024-03-20', HORA_ATENCION: '10:00', ID_ESTADO: 1, TOTAL: 35000 },
        { ID_ATENCION: '3', ID_CLIENTE: '103', ID_ESPECIALISTA: 'SP01', FECHA_ATENCION: '2024-03-21', HORA_ATENCION: '11:00', ID_ESTADO: 2, TOTAL: 50000 },
        { ID_ATENCION: '4', ID_CLIENTE: '101', ID_ESPECIALISTA: 'SP01', FECHA_ATENCION: '2024-10-25', HORA_ATENCION: '15:00', ID_ESTADO: 3, TOTAL: 0 }, // Bloqueada
    ],
    DB_CLIENTES: [
        { ID_CLIENTE: '101', NOMBRE: 'Juan Pérez', EMAIL: 'juan@example.com', TELEFONO: '+56912345678' },
        { ID_CLIENTE: '102', NOMBRE: 'Maria Gonzalez', EMAIL: 'maria@example.com', TELEFONO: '+56987654321' },
        { ID_CLIENTE: '103', NOMBRE: 'Carlos Lopez', EMAIL: 'carlos@example.com', TELEFONO: '+56911223344' },
    ],
    DB_CONFIG_EQUIPO: [
        { ID_ESPECIALISTA: 'SP01', NOMBRE: 'Dr. Roberto Silva', ESPECIALIDAD: 'Kinesiología' },
        { ID_ESPECIALISTA: 'SP02', NOMBRE: 'Dra. Ana Torres', ESPECIALIDAD: 'Psicología' },
    ],
    DB_USUARIOS: [
        { EMAIL: 'admin@clinic.com', ROL: 'ADMINISTRADOR', ID_ESPECIALISTA_LINK: null },
        { EMAIL: 'coord@clinic.com', ROL: 'COORDINADOR', ID_ESPECIALISTA_LINK: null },
        { EMAIL: 'roberto@clinic.com', ROL: 'PROFESIONAL', ID_ESPECIALISTA_LINK: 'SP01' },
    ],
    DB_SERVICIOS: [
        { ID_SERVICIO: 'S01', NOMBRE: 'Consulta Kinesiología', PRECIO: 50000 },
        { ID_SERVICIO: 'S02', NOMBRE: 'Sesión Psicología', PRECIO: 35000 },
        { ID_SERVICIO: 'S03', NOMBRE: 'Evaluación Inicial', PRECIO: 60000 },
    ]
};

// Utilities to mimic async DB calls
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getStatusLabel = (id, dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    const isPast = dateStr <= today;

    const statusId = Number(id);

    switch (statusId) {
        case 1: // Agendada / Pendiente
            if (isPast) return { label: 'Realizada', color: 'success' };
            return { label: 'Pendiente', color: 'warning' };
        case 2: // Realizada (Forzada)
            return { label: 'Realizada', color: 'success' };
        case 3: // Bloqueada
            return { label: 'Bloqueada', color: 'neutral' };
        case 4: // Cancelada
            return { label: 'Cancelada', color: 'danger' };
        case 5: // No Asistió
            return { label: 'No Asistió', color: 'slate' };
        default:
            return { label: 'Pendiente', color: 'warning' };
    }
};
