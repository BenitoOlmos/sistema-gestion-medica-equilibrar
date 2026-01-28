/**
 * =====================================================
 * API CLIENT - REEMPLAZO DE GOOGLE SHEETS
 * Sistema: Clínica Equilibrar Frontend
 * =====================================================
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

// Obtener token de localStorage
function getToken() {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('auth_token');
    }
    return null;
}

// Headers comunes
function getHeaders() {
    const headers = {
        'Content-Type': 'application/json',
    };

    const token = getToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
}

// Wrapper para fetch con manejo de errores
async function apiRequest(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getHeaders(),
                ...options.headers,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// =====================================================
// AUTENTICACIÓN
// =====================================================

export async function login(email, password) {
    const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    // Guardar token
    if (typeof window !== 'undefined' && data.data.token) {
        localStorage.setItem('auth_token', data.data.token);
    }

    return data.data.user;
}

export function logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('equilibrar_user_session');
    }
}

// =====================================================
// CITAS
// =====================================================

export async function fetchCitas(filters = {}) {
    const params = new URLSearchParams();

    if (filters.profesionalId) params.append('profesionalId', filters.profesionalId);
    if (filters.pacienteId) params.append('pacienteId', filters.pacienteId);
    if (filters.fechaInicio) params.append('fechaInicio', filters.fechaInicio);
    if (filters.fechaFin) params.append('fechaFin', filters.fechaFin);
    if (filters.estado) params.append('estado', filters.estado);

    const queryString = params.toString();
    const endpoint = `/citas${queryString ? `?${queryString}` : ''}`;

    const data = await apiRequest(endpoint);
    return data.data;
}

export async function getCita(id) {
    const data = await apiRequest(`/citas/${id}`);
    return data.data;
}

export async function createCita(citaData) {
    const data = await apiRequest('/citas', {
        method: 'POST',
        body: JSON.stringify({
            pacienteId: citaData.ID_CLIENTE,
            profesionalId: citaData.ID_ESPECIALISTA,
            servicioId: citaData.SERVICE_ID,
            estadoId: citaData.ID_ESTADO,
            ubicacionId: citaData.ID_UBICACION || 1,
            fechaInicio: `${citaData.FECHA_ATENCION} ${citaData.HORA_ATENCION}`,
            fechaFin: citaData.FECHA_FIN,
            observaciones: citaData.OBSERVACIONES,
            precioCobrado: citaData.TOTAL,
            metodoPagoId: citaData.METODO_PAGO,
        }),
    });

    return data.data;
}

export async function updateCita(id, citaData) {
    const data = await apiRequest(`/citas/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            pacienteId: citaData.ID_CLIENTE,
            profesionalId: citaData.ID_ESPECIALISTA,
            servicioId: citaData.SERVICE_ID,
            estadoId: citaData.ID_ESTADO,
            fechaInicio: `${citaData.FECHA_ATENCION} ${citaData.HORA_ATENCION}`,
            observaciones: citaData.OBSERVACIONES,
        }),
    });

    return data.data;
}

export async function deleteCita(id) {
    const data = await apiRequest(`/citas/${id}`, {
        method: 'DELETE',
    });

    return data.data;
}

// =====================================================
// PACIENTES
// =====================================================

export async function fetchPacientes(search = '') {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    const data = await apiRequest(`/pacientes${params}`);
    return data.data;
}

export async function getPaciente(id) {
    const data = await apiRequest(`/pacientes/${id}`);
    return data.data;
}

export async function createPaciente(pacienteData) {
    const data = await apiRequest('/pacientes', {
        method: 'POST',
        body: JSON.stringify({
            rut: pacienteData.RUT,
            nombres: pacienteData.NOMBRES,
            apellidos: pacienteData.APELLIDOS || '',
            email: pacienteData.EMAIL,
            telefono: pacienteData.TELEFONO,
            direccion: pacienteData.DIRECCION,
            idPrevision: pacienteData.ID_PREVISION,
            idComuna: pacienteData.ID_COMUNA,
            fechaNacimiento: pacienteData.FECHA_NACIMIENTO,
        }),
    });

    return data.data;
}

export async function updatePaciente(id, pacienteData) {
    const data = await apiRequest(`/pacientes/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            nombres: pacienteData.NOMBRES,
            apellidos: pacienteData.APELLIDOS,
            email: pacienteData.EMAIL,
            telefono: pacienteData.TELEFONO,
            direccion: pacienteData.DIRECCION,
        }),
    });

    return data.data;
}

// =====================================================
// PROFESIONALES
// =====================================================

export async function fetchProfesionales() {
    const data = await apiRequest('/profesionales');
    return data.data;
}

// =====================================================
// SERVICIOS
// =====================================================

export async function fetchServicios() {
    const data = await apiRequest('/servicios');
    return data.data;
}

// =====================================================
// REPORTES
// =====================================================

export async function fetchIngresosMensuales(year) {
    const params = year ? `?year=${year}` : '';
    const data = await apiRequest(`/reportes/ingresos-mensuales${params}`);
    return data.data;
}

// =====================================================
// FUNCIÓN LEGACY PARA COMPATIBILIDAD
// =====================================================

export async function fetchGoogleSheetsData() {
    // Esta función mantiene la misma firma que googleSheets.js
    // pero ahora obtiene datos de MySQL vía API

    try {
        const [citas, pacientes, profesionales, servicios] = await Promise.all([
            fetchCitas(),
            fetchPacientes(),
            fetchProfesionales(),
            fetchServicios(),
        ]);

        // Transformar a formato legacy (compatible con código existente)
        return {
            DB_ATENCIONES: citas.map(c => ({
                ID_CITA: c.id_cita,
                ID_CLIENTE: c.id_paciente,
                ID_ESPECIALISTA: c.id_profesional,
                FECHA_ATENCION: c.fecha_inicio?.split(' ')[0],
                HORA_ATENCION: c.fecha_inicio?.split(' ')[1]?.substring(0, 5),
                ID_ESTADO: c.id_estado,
                TOTAL: c.precio_cobrado || 0,
                PATIENT_NAME: c.paciente_nombre,
                SERVICE_ID: c.id_servicio,
            })),
            DB_CLIENTES: pacientes.map(p => ({
                ID_CLIENTE: p.id_paciente,
                RUT: p.rut,
                NOMBRE: `${p.nombres} ${p.apellidos || ''}`.trim(),
                TELEFONO: p.telefono,
                EMAIL: p.email,
            })),
            DB_CONFIG_EQUIPO: profesionales.map(pr => ({
                ID_ESPECIALISTA: pr.id_profesional,
                NOMBRE: pr.nombres,
                COLOR: pr.color_calendario,
                ESTADO: pr.activo ? 'ACTIVO' : 'INACTIVO',
            })),
            DB_SERVICIOS: servicios.map(s => ({
                ID_SERVICIO: s.id_servicio,
                NOMBRE: s.nombre,
                PRECIO: s.precio_lista,
            })),
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}
