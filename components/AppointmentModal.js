'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AppointmentModal({ isOpen, onClose, onSubmit, onDelete, initialData, clients, specialists, services, readOnly, userRole }) {
    const [formData, setFormData] = useState({
        clientId: '',
        specialistId: '',
        serviceId: '',
        FECHA_ATENCION: '',
        HORA_ATENCION: '',
        status: 1,
        paymentMethod: 'Presencial',
        observations: ''
    });

    const [price, setPrice] = useState(0);

    useEffect(() => {
        if (initialData) {
            setFormData({
                clientId: initialData.ID_CLIENTE || '',
                specialistId: initialData.ID_ESPECIALISTA || '',
                serviceId: '',
                FECHA_ATENCION: initialData.FECHA_ATENCION || '',
                HORA_ATENCION: initialData.HORA_ATENCION || '',
                status: initialData.ID_ESTADO || 1,
                paymentMethod: initialData.METODO_PAGO || 'Presencial',
                observations: initialData.OBSERVACIONES || ''
            });
            if (initialData.TOTAL) setPrice(initialData.TOTAL);
        } else {
            setFormData({
                clientId: '',
                specialistId: '',
                serviceId: '',
                FECHA_ATENCION: '',
                HORA_ATENCION: '',
                status: 1,
                paymentMethod: 'Presencial',
                observations: ''
            });
            setPrice(0);
        }
    }, [initialData, isOpen]);

    useEffect(() => {
        if (formData.serviceId) {
            const svc = services.find(s => s.ID_SERVICIO === formData.serviceId);
            if (svc) setPrice(svc.PRECIO);
        }
    }, [formData.serviceId, services]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (readOnly && initialData?.ID_ATENCION) return; // double check
        onSubmit({ ...formData, price });
    };

    // Professionals can only edit if they are creating a NEW BLOCK (SYSTEM)
    // or if they are NOT in readOnly mode (Admin/Coord)
    const isLocked = readOnly && initialData?.ID_ATENCION;

    // Check if user can see financial information (Admin/Coordinator only)
    const canSeeFinancials = userRole && ['ADMINISTRADOR', 'COORDINADOR', 'COORDINADORA'].includes(userRole.toUpperCase().trim());

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            overflowY: 'auto'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '550px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '2rem',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', position: 'sticky', top: 0, background: 'white', zIndex: 1, paddingBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>{isLocked ? 'Detalles de la Cita' : (initialData?.ID_ATENCION ? 'Editar Cita' : 'Nueva Cita')}</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--slate-400)' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Fecha</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.FECHA_ATENCION}
                                onChange={e => setFormData({ ...formData, FECHA_ATENCION: e.target.value })}
                                required
                                disabled={isLocked}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Hora</label>
                            <input
                                type="time"
                                className="input"
                                value={formData.HORA_ATENCION}
                                onChange={e => setFormData({ ...formData, HORA_ATENCION: e.target.value })}
                                required
                                disabled={isLocked}
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Paciente</label>
                        <select
                            className="input"
                            value={formData.clientId}
                            onChange={e => setFormData({ ...formData, clientId: e.target.value })}
                            required
                            disabled={isLocked}
                        >
                            <option value="">Seleccionar Paciente...</option>
                            <option value="SYSTEM">BLOQUEAR HORARIO (Sin Paciente)</option>
                            {clients.map(c => (
                                <option key={c.ID_CLIENTE} value={c.ID_CLIENTE}>{c.NOMBRE}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Especialista</label>
                        <select
                            className="input"
                            value={formData.specialistId}
                            onChange={e => setFormData({ ...formData, specialistId: e.target.value })}
                            required
                            disabled={isLocked || readOnly} // Professionals can only book for themselves anyway
                        >
                            <option value="">Seleccionar Especialista...</option>
                            {specialists.filter(s => s.ESTADO !== 'INACTIVO' || (initialData && initialData.ID_ESPECIALISTA === s.ID_ESPECIALISTA)).map(s => (
                                <option key={s.ID_ESPECIALISTA} value={s.ID_ESPECIALISTA}>{s.NOMBRE} ({s.ESPECIALIDAD})</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Servicio</label>
                        <select
                            className="input"
                            value={formData.serviceId}
                            onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                            required={!initialData}
                            disabled={isLocked}
                        >
                            <option value="">{initialData?.ID_ATENCION ? 'Mantener anterior' : 'Seleccionar Servicio...'}</option>
                            {services.map(s => (
                                <option key={s.ID_SERVICIO} value={s.ID_SERVICIO}>
                                    {s.NOMBRE}{canSeeFinancials ? ` - $ ${Number(s.PRECIO).toLocaleString('es-ES')}` : ''}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: canSeeFinancials ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        {canSeeFinancials && (
                            <div>
                                <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Método de Pago</label>
                                <select
                                    className="input"
                                    value={formData.paymentMethod}
                                    onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                                    disabled={isLocked}
                                >
                                    <option value="Presencial">Presencial</option>
                                    <option value="Online">Online / Transferencia</option>
                                </select>
                            </div>
                        )}
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Estado</label>
                            <select
                                className="input"
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: Number(e.target.value) })}
                                disabled={isLocked}
                            >
                                <option value={1}>Agendada (Automático)</option>
                                <option value={2}>Marchar como Realizada</option>
                                <option value={3}>Bloquear Horario</option>
                                <option value={4}>Anular / Cancelar</option>
                                <option value={5}>Paciente No Asistió</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Observaciones</label>
                        <textarea
                            className="input"
                            style={{ height: '80px', resize: 'none' }}
                            placeholder="Notas clínicas, requerimientos especiales..."
                            value={formData.observations}
                            onChange={e => setFormData({ ...formData, observations: e.target.value })}
                            disabled={isLocked}
                        />
                    </div>

                    {canSeeFinancials && price > 0 && (
                        <div style={{ padding: '1rem', background: 'var(--slate-50)', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 600, color: 'var(--slate-600)' }}>Total</span>
                            <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--primary-600)' }}>$ {price.toLocaleString('es-ES')}</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--slate-100)', paddingTop: '1.5rem' }}>
                        {initialData?.ID_ATENCION && !readOnly && (
                            <button
                                type="button"
                                onClick={() => { if (confirm('¿Eliminar esta cita permanentemente?')) onDelete(initialData.ID_ATENCION); }}
                                className="btn btn-danger"
                                style={{ marginRight: 'auto' }}
                            >
                                Eliminar
                            </button>
                        )}
                        <button type="button" onClick={onClose} className="btn btn-secondary">{isLocked ? 'Cerrar' : 'Cancelar'}</button>
                        {!isLocked && (
                            <button type="submit" className="btn btn-primary">{initialData?.ID_ATENCION ? 'Guardar Cambios' : 'Agendar / Bloquear'}</button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
