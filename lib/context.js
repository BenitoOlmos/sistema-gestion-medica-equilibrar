'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_DATA } from './data';
import { fetchGoogleSheetsData, apiRequest } from './googleSheets';
import { useRouter } from 'next/navigation';

const AppContext = createContext();

export function AppProvider({ children }) {
    const [data, setData] = useState(INITIAL_DATA);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null); // { email, role, specialistId }
    const router = useRouter();

    // Load user session from localStorage on mount
    useEffect(() => {
        try {
            const savedUser = localStorage.getItem('equilibrar_user_session');
            if (savedUser) {
                setUser(JSON.parse(savedUser));
            }
        } catch (error) {
            console.error('Error loading session from localStorage:', error);
        }
    }, []);

    // Save user session to localStorage whenever it changes
    useEffect(() => {
        try {
            if (user) {
                localStorage.setItem('equilibrar_user_session', JSON.stringify(user));
            } else {
                localStorage.removeItem('equilibrar_user_session');
            }
        } catch (error) {
            console.error('Error saving session to localStorage:', error);
        }
    }, [user]);

    useEffect(() => {
        const loadData = async () => {
            const sheetData = await fetchGoogleSheetsData();
            if (sheetData) {
                console.log('Datas loaded from Sheet:', sheetData);
                setData(sheetData);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    const login = async (email, password) => {
        console.log('Intento de login con:', email);
        const foundUser = data.DB_USUARIOS.find(u => u.EMAIL.toLowerCase().trim() === email.toLowerCase().trim());

        if (foundUser) {
            // Check Password
            const sheetPass = foundUser.PASS ? foundUser.PASS.toString().trim() : '';
            if (sheetPass && sheetPass !== password) {
                alert('Contraseña incorrecta.');
                return false;
            }
            // Check if linked specialist is Active
            if (foundUser.ID_ESPECIALISTA_LINK) {
                const spec = data.DB_CONFIG_EQUIPO.find(s => s.ID_ESPECIALISTA === foundUser.ID_ESPECIALISTA_LINK);
                if (spec && spec.ESTADO === 'INACTIVO') {
                    alert('Acceso Denegado: Su perfil de especialista está inactivo.');
                    return false;
                }
            }

            setUser({
                email: foundUser.EMAIL,
                role: foundUser.ROL,
                specialistId: foundUser.ID_ESPECIALISTA_LINK
            });
            return true;
        }
        return false;
    };

    const logout = () => {
        setUser(null);
        router.push('/');
    };

    // Wrapper to update state locally AND send to API
    const syncWithSheet = async (action, table, payload) => {
        // Optimistic UI Update happens in specific functions below
        // Send to API in background
        apiRequest(action, { table, data: payload }).then(res => {
            if (res.status === 'success') console.log('Synced with Sheet:', action);
            else console.error('Sheet Sync Error:', res);
        });
    };

    const addAppointment = (appointment) => {
        const newAppt = { ...appointment, ID_ATENCION: Date.now().toString() };
        setData(prev => ({ ...prev, DB_ATENCIONES: [...prev.DB_ATENCIONES, newAppt] }));

        // Map to Sheet Column Names
        const svcName = data.DB_SERVICIOS.find(s => s.ID_SERVICIO === (newAppt.serviceId || appointment.SERVICE_ID))?.NOMBRE || '';

        const sheetRow = {
            'ID_ATENCION': newAppt.ID_ATENCION,
            'CODIGO CLIENTE': newAppt.ID_CLIENTE,
            'ID_ESPECIALISTA': newAppt.ID_ESPECIALISTA,
            'FECHA DE ATENCION': newAppt.FECHA_ATENCION,
            'HORA DE ATENCION': newAppt.HORA_ATENCION,
            'ID_ESTADO': newAppt.ID_ESTADO,
            'INGRESO': newAppt.TOTAL,
            'METODO_PAGO': newAppt.METODO_PAGO,
            'OBSERVACIONES': newAppt.OBSERVACIONES,
            'SERVICIO': svcName
        };
        syncWithSheet('add', 'DB_ATENCIONES', sheetRow);
    };

    const updateAppointment = (appointment) => {
        setData(prev => ({
            ...prev,
            DB_ATENCIONES: prev.DB_ATENCIONES.map(appt =>
                appt.ID_ATENCION === appointment.ID_ATENCION ? appointment : appt
            )
        }));

        apiRequest('update', {
            table: 'DB_ATENCIONES',
            idColumn: 'ID_ATENCION',
            idValue: appointment.ID_ATENCION,
            data: {
                'CODIGO CLIENTE': appointment.ID_CLIENTE,
                'ID_ESPECIALISTA': appointment.ID_ESPECIALISTA,
                'FECHA DE ATENCION': appointment.FECHA_ATENCION,
                'HORA DE ATENCION': appointment.HORA_ATENCION,
                'ID_ESTADO': appointment.ID_ESTADO,
                'INGRESO': appointment.TOTAL,
                'METODO_PAGO': appointment.METODO_PAGO,
                'OBSERVACIONES': appointment.OBSERVACIONES,
                'SERVICIO': data.DB_SERVICIOS.find(s => s.ID_SERVICIO === appointment.SERVICE_ID)?.NOMBRE || ''
            }
        });
    };

    const deleteAppointment = (id) => {
        setData(prev => ({
            ...prev,
            DB_ATENCIONES: prev.DB_ATENCIONES.filter(appt => appt.ID_ATENCION !== id)
        }));

        apiRequest('delete', {
            table: 'DB_ATENCIONES',
            idColumn: 'ID_ATENCION',
            idValue: id
        });
    };

    const addClient = (client) => {
        const newClient = { ...client, ID_CLIENTE: `CLI-${Date.now()}` };
        setData(prev => ({ ...prev, DB_CLIENTES: [...prev.DB_CLIENTES, newClient] }));

        const nameParts = newClient.NOMBRE.trim().split(/\s+/);
        const nombres = nameParts[0] || '';
        const paterno = nameParts[1] || '';
        const materno = nameParts.slice(2).join(' ') || '';

        const sheetRow = {
            'COD': newClient.ID_CLIENTE,
            'NOMBRES': nombres,
            'PATERNO': paterno,
            'MATERNO': materno,
            'CORREO': newClient.EMAIL,
            'TELEFONO': newClient.TELEFONO,
            'COMUNA': newClient.COMUNA || '',
            'ISAPRE': newClient.ISAPRE || '',
            'RUT': newClient.RUT || '',
            'FECHA_NACIMIENTO': newClient.FECHA_NACIMIENTO || ''
        };
        syncWithSheet('add', 'DB_CLIENTES', sheetRow);
    };

    const updateClient = (client) => {
        setData(prev => ({
            ...prev,
            DB_CLIENTES: prev.DB_CLIENTES.map(c => c.ID_CLIENTE === client.ID_CLIENTE ? client : c)
        }));

        // Split name for Sheets compatibility
        const nameParts = client.NOMBRE.trim().split(/\s+/);
        const nombres = nameParts[0] || '';
        const paterno = nameParts[1] || '';
        const materno = nameParts.slice(2).join(' ') || '';

        apiRequest('update', {
            table: 'DB_CLIENTES',
            idColumn: 'COD',
            idValue: client.ID_CLIENTE,
            data: {
                'NOMBRES': nombres,
                'PATERNO': paterno,
                'MATERNO': materno,
                'CORREO': client.EMAIL,
                'TELEFONO': client.TELEFONO,
                'COMUNA': client.COMUNA || '',
                'ISAPRE': client.ISAPRE || '',
                'RUT': client.RUT || '',
                'FECHA_NACIMIENTO': client.FECHA_NACIMIENTO || ''
            }
        });
    };

    const deleteClient = (id) => {
        // Sheet API doesn't have delete row in this simple version, solely local + status update maybe?
        // We will just remove locally for MVP.
        setData(prev => ({ ...prev, DB_CLIENTES: prev.DB_CLIENTES.filter(c => c.ID_CLIENTE !== id) }));
        alert("Nota: La eliminación es solo local en esta demo. Implementar 'delete' en Apps Script para persistencia.");
    };

    const addSpecialist = (specialist) => {
        const newSpec = { ...specialist, ID_ESPECIALISTA: `SP-${Date.now()}` };
        setData(prev => ({ ...prev, DB_CONFIG_EQUIPO: [...prev.DB_CONFIG_EQUIPO, newSpec] }));

        const sheetRow = {
            'ID_ESPECIALISTA': newSpec.ID_ESPECIALISTA,
            'ESPECIALISTA': newSpec.NOMBRE,
            'ESPECIALIDAD': newSpec.ESPECIALIDAD,
            'COLOR_PROFESIONAL': newSpec.COLOR,
            'ESTADO': newSpec.ESTADO
        };
        syncWithSheet('add', 'DB_CONFIG_EQUIPO', sheetRow);
    };

    const updateSpecialist = (specialist) => {
        setData(prev => ({
            ...prev,
            DB_CONFIG_EQUIPO: prev.DB_CONFIG_EQUIPO.map(s => s.ID_ESPECIALISTA === specialist.ID_ESPECIALISTA ? specialist : s)
        }));

        apiRequest('update', {
            table: 'DB_CONFIG_EQUIPO',
            idColumn: 'ID_ESPECIALISTA',
            idValue: specialist.ID_ESPECIALISTA,
            data: {
                'ESPECIALISTA': specialist.NOMBRE,
                'ESPECIALIDAD': specialist.ESPECIALIDAD,
                'COLOR_PROFESIONAL': specialist.COLOR,
                'ESTADO': specialist.ESTADO
            }
        });
    };

    const deleteSpecialist = (id) => {
        setData(prev => ({ ...prev, DB_CONFIG_EQUIPO: prev.DB_CONFIG_EQUIPO.filter(s => s.ID_ESPECIALISTA !== id) }));
        alert("Nota: Eliminación solo local.");
    };

    const addService = (service) => {
        const newService = { ...service, ID_SERVICIO: `SRV-${Date.now()}` };
        setData(prev => ({ ...prev, DB_SERVICIOS: [...prev.DB_SERVICIOS, newService] }));

        const sheetRow = {
            'ID_SERVICIO': newService.ID_SERVICIO,
            'NOMBRE_SERVICIO': newService.NOMBRE,
            'PRECIO_LISTA': newService.PRECIO
        };
        syncWithSheet('add', 'DB_SERVICIOS', sheetRow);
    };

    const updateService = (service) => {
        setData(prev => ({
            ...prev,
            DB_SERVICIOS: prev.DB_SERVICIOS.map(s => s.ID_SERVICIO === service.ID_SERVICIO ? service : s)
        }));

        apiRequest('update', {
            table: 'DB_SERVICIOS',
            idColumn: 'ID_SERVICIO',
            idValue: service.ID_SERVICIO,
            data: {
                'NOMBRE_SERVICIO': service.NOMBRE,
                'PRECIO_LISTA': service.PRECIO
            }
        });
    };

    const deleteService = (id) => {
        setData(prev => ({ ...prev, DB_SERVICIOS: prev.DB_SERVICIOS.filter(s => s.ID_SERVICIO !== id) }));
        alert("Nota: Eliminación solo local.");
    };

    const addUser = (userData) => {
        setData(prev => ({ ...prev, DB_USUARIOS: [...prev.DB_USUARIOS, userData] }));

        const sheetRow = {
            'ID_USUARIO': userData.EMAIL,
            'ROL': userData.ROL,
            'ID_ESPECIALISTA': userData.ID_ESPECIALISTA_LINK || '',
            'PASS': userData.PASS || '1234' // Default pass if not provided
        };
        syncWithSheet('add', 'DB_USUARIOS', sheetRow);
    };

    const updateUser = (userData) => {
        setData(prev => ({
            ...prev,
            DB_USUARIOS: prev.DB_USUARIOS.map(u => u.EMAIL === userData.EMAIL ? userData : u)
        }));

        apiRequest('update', {
            table: 'DB_USUARIOS',
            idColumn: 'ID_USUARIO',
            idValue: userData.EMAIL,
            data: {
                'ROL': userData.ROL,
                'ID_ESPECIALISTA': userData.ID_ESPECIALISTA_LINK || '',
                'PASS': userData.PASS || '1234'
            }
        });
    };

    const deleteUser = (email) => {
        setData(prev => ({ ...prev, DB_USUARIOS: prev.DB_USUARIOS.filter(u => u.EMAIL !== email) }));
        alert("Nota: Eliminación solo local.");
    };

    const value = {
        data,
        loading,
        user,
        login,
        logout,
        addAppointment,
        updateAppointment,
        deleteAppointment,
        addClient, updateClient, deleteClient,
        addSpecialist, updateSpecialist, deleteSpecialist,
        addService, updateService, deleteService,
        addUser, updateUser, deleteUser
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
