'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import Calendar from '@/components/Calendar';
import AppointmentModal from '@/components/AppointmentModal';
import { Lock } from 'lucide-react';

export default function ProfessionalDashboard() {
    const { data, user, addAppointment, updateAppointment, deleteAppointment } = useApp();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [selectedEvent, setSelectedEvent] = useState(null);

    if (!user) return null;

    // Filter events for this professional and enrich with patient names
    const myEvents = (data?.DB_ATENCIONES || [])
        .filter(e => e.ID_ESPECIALISTA === (user.specialistId || user.ID_ESPECIALISTA_LINK))
        .map(e => {
            const client = (data?.DB_CLIENTES || []).find(c => c.ID_CLIENTE === e.ID_CLIENTE);
            return {
                ...e,
                PATIENT_NAME: client ? client.NOMBRE : (e.ID_CLIENTE === 'SYSTEM' ? 'Horario Bloqueado' : `Paciente #${e.ID_CLIENTE}`)
            };
        });

    const handleBlockTime = () => {
        setSelectedEvent(null);
        setSelectedSlot({
            ID_ESPECIALISTA: user.specialistId || user.ID_ESPECIALISTA_LINK,
            ID_CLIENTE: 'SYSTEM',
            ID_ESTADO: 3
        });
        setModalOpen(true);
    };

    const handleSlotClick = (dateObj, hour) => {
        const dateStr = dateObj.toISOString().split('T')[0];
        const timeStr = `${hour.toString().padStart(2, '0')}:00`;

        setSelectedEvent(null);
        setSelectedSlot({
            FECHA_ATENCION: dateStr,
            HORA_ATENCION: timeStr,
            ID_ESPECIALISTA: user.specialistId || user.ID_ESPECIALISTA_LINK,
            ID_CLIENTE: 'SYSTEM',
            ID_ESTADO: 3
        });
        setModalOpen(true);
    };

    const handleEventClick = (event) => {
        setSelectedSlot(null);
        setSelectedEvent(event);
        setModalOpen(true);
    };

    const handleUpsertAppointment = (formData) => {
        // Validation: If editing existing and it's not a block, prevent (modal should handle UI, but logic here for safety)
        if (selectedEvent && selectedEvent.ID_CLIENTE !== 'SYSTEM') {
            alert('No tienes permisos para modificar citas existentes.');
            return;
        }

        const appointmentData = {
            ID_CLIENTE: formData.clientId || 'SYSTEM',
            ID_ESPECIALISTA: user.specialistId || user.ID_ESPECIALISTA_LINK,
            FECHA_ATENCION: formData.date,
            HORA_ATENCION: formData.time,
            ID_ESTADO: formData.clientId === 'SYSTEM' ? 3 : (formData.status || 1),
            TOTAL: formData.price || 0,
            METODO_PAGO: formData.paymentMethod,
            OBSERVACIONES: formData.observations,
            SERVICE_ID: formData.serviceId
        };

        if (selectedEvent) {
            updateAppointment({ ...selectedEvent, ...appointmentData });
        } else {
            addAppointment(appointmentData);
        }
        setModalOpen(false);
    };

    const handleDelete = (id) => {
        // Only allow deleting blocks
        if (selectedEvent && selectedEvent.ID_CLIENTE !== 'SYSTEM') {
            alert('No tienes permisos para eliminar citas de pacientes.');
            return;
        }
        deleteAppointment(id);
        setModalOpen(false);
    };

    return (
        <div className="animate-fade-in" style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1>Mi Agenda</h1>
                    <p style={{ color: 'var(--slate-500)' }}>Visualiza tus atenciones y bloquea horarios</p>
                </div>
                <button onClick={handleBlockTime} className="btn btn-danger">
                    <Lock size={18} />
                    Bloquear Horario
                </button>
            </div>

            <div style={{ flex: 1, overflow: 'hidden' }}>
                <Calendar
                    events={myEvents}
                    title="Mi Disponibilidad"
                    onSlotClick={handleSlotClick}
                    onEventClick={handleEventClick}
                    userRole={user.role}
                />
            </div>

            <AppointmentModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={handleUpsertAppointment}
                onDelete={handleDelete}
                initialData={selectedEvent || selectedSlot}
                clients={data.DB_CLIENTES}
                specialists={data.DB_CONFIG_EQUIPO}
                services={data.DB_SERVICIOS}
                readOnly={true}
                userRole={user.role}
            />
        </div>
    );
}
