'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import Calendar from '@/components/Calendar';
import AppointmentModal from '@/components/AppointmentModal';
import { Plus } from 'lucide-react';

import EventDetailsModal from '@/components/EventDetailsModal';

// Generate consistent colors for specialists
const generateColor = (id) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

export default function CoordinatorDashboard() {
    const { data, addAppointment, updateAppointment, deleteAppointment, user } = useApp();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [filterSpecialist, setFilterSpecialist] = useState('');

    if (!user) return null;

    const specialistColors = (data?.DB_CONFIG_EQUIPO || []).reduce((acc, curr) => {
        if (curr.ID_ESPECIALISTA) {
            acc[curr.ID_ESPECIALISTA] = curr.COLOR || generateColor(curr.ID_ESPECIALISTA);
        }
        return acc;
    }, {});

    const filteredEvents = (filterSpecialist
        ? (data?.DB_ATENCIONES || []).filter(e => e.ID_ESPECIALISTA === filterSpecialist)
        : (data?.DB_ATENCIONES || [])).map(e => {
            const client = (data?.DB_CLIENTES || []).find(c => c.ID_CLIENTE === e.ID_CLIENTE);
            return {
                ...e,
                PATIENT_NAME: client ? client.NOMBRE : (e.ID_CLIENTE === 'SYSTEM' ? 'Horario Bloqueado' : `Paciente #${e.ID_CLIENTE}`)
            };
        });

    const handleSlotClick = (dateObj, hour) => {
        const dateStr = dateObj.toISOString().split('T')[0];
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;

        setSelectedEvent(null);
        setSelectedSlot({ FECHA_ATENCION: dateStr, HORA_ATENCION: timeStr });
        setModalOpen(true);
    };

    const handleEventClick = (event) => {
        setSelectedSlot(null);
        setSelectedEvent(event);
        setModalOpen(true);
    };

    const handleUpsertAppointment = (formData) => {
        const appointmentData = {
            ID_CLIENTE: formData.clientId || 'SYSTEM',
            ID_ESPECIALISTA: formData.specialistId,
            FECHA_ATENCION: formData.date,
            HORA_ATENCION: formData.time,
            ID_ESTADO: formData.clientId === 'SYSTEM' ? 3 : (formData.status || 1),
            TOTAL: formData.price || 0,
            METODO_PAGO: formData.paymentMethod,
            OBSERVACIONES: formData.observations,
            SERVICE_ID: formData.serviceId // For name lookup in context
        };

        if (selectedEvent) {
            updateAppointment({ ...selectedEvent, ...appointmentData });
        } else {
            addAppointment(appointmentData);
        }
        setModalOpen(false);
    };

    const handleDeleteAppointment = (id) => {
        deleteAppointment(id);
        setModalOpen(false);
    };

    if (!data) return <div className="p-4">Cargando datos...</div>;

    return (
        <div className="animate-fade-in" style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1>Calendario {filterSpecialist ? `(${data.DB_CONFIG_EQUIPO?.find(s => s.ID_ESPECIALISTA === filterSpecialist)?.NOMBRE})` : ''}</h1>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.5rem' }}>
                        <p style={{ color: 'var(--slate-500)', margin: 0 }}>Gestiona y coordina todas las citas</p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {(data.DB_CONFIG_EQUIPO || []).filter(s => s.ESTADO !== 'INACTIVO').map(s => (
                                <div key={s.ID_ESPECIALISTA} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', background: 'white', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--slate-200)' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: specialistColors[s.ID_ESPECIALISTA] }}></div>
                                    {s.NOMBRE ? s.NOMBRE.split(' ')[0] : 'S/N'}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <select
                        className="input"
                        style={{ width: '200px' }}
                        value={filterSpecialist}
                        onChange={(e) => setFilterSpecialist(e.target.value)}
                    >
                        <option value="">Todos los Especialistas</option>
                        {(data.DB_CONFIG_EQUIPO || []).filter(s => s.ESTADO !== 'INACTIVO').map(s => (
                            <option key={s.ID_ESPECIALISTA} value={s.ID_ESPECIALISTA}>{s.NOMBRE}</option>
                        ))}
                    </select>

                    <button onClick={() => { setSelectedEvent(null); setSelectedSlot({}); setModalOpen(true); }} className="btn btn-primary">
                        <Plus size={20} />
                        Nueva Cita
                    </button>
                </div>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Calendar
                    events={filteredEvents}
                    onSlotClick={handleSlotClick}
                    onEventClick={handleEventClick}
                    specialistColors={specialistColors}
                />
            </div>

            <AppointmentModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleUpsertAppointment}
                onDelete={handleDeleteAppointment}
                initialData={selectedEvent || selectedSlot}
                clients={data.DB_CLIENTES}
                specialists={data.DB_CONFIG_EQUIPO}
                services={data.DB_SERVICIOS}
            />
        </div>
    );
}
