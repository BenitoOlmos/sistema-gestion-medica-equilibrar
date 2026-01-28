'use client';
import { X, Phone, User, Calendar as CalIcon, Clock, Stethoscope } from 'lucide-react';

export default function EventDetailsModal({ isOpen, onClose, event, client, specialist }) {
    if (!isOpen || !event) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            overflowY: 'auto'
        }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px', animation: 'fadeIn 0.2s', padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '1.5rem', background: 'var(--primary-600)', color: 'white' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <h3 style={{ color: 'white', margin: 0 }}>Detalle de Cita</h3>
                        <button onClick={onClose} style={{ color: 'white', background: 'transparent', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.2)', borderRadius: '12px' }}>
                            <CalIcon size={24} color="white" />
                        </div>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>{event.FECHA_ATENCION}</div>
                            <div style={{ opacity: 0.9 }}>{event.HORA_ATENCION} hrs</div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '1.5rem' }}>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-500)', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Paciente</label>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <User size={18} color="var(--primary-500)" />
                            <span style={{ fontWeight: 500, fontSize: '1rem' }}>{client ? client.NOMBRE : 'Paciente Desconocido'}</span>
                            {client && <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{client.ID_CLIENTE}</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <Phone size={18} color="var(--slate-400)" />
                            <span style={{ color: 'var(--slate-600)' }}>{client ? client.TELEFONO : 'Sin teléfono'}</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--slate-100)' }}>
                        <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--slate-500)', fontWeight: 600, marginBottom: '0.5rem', display: 'block' }}>Especialista</label>
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                            <Stethoscope size={18} color="var(--primary-500)" />
                            <div>
                                <div style={{ fontWeight: 500 }}>{specialist ? specialist.NOMBRE : 'No asignado'}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{specialist ? specialist.ESPECIALIDAD : ''}</div>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className={`badge badge-${event.ID_ESTADO === 1 ? 'success' : event.ID_ESTADO === 2 ? 'danger' : 'neutral'}`}>
                            {event.ID_ESTADO === 1 ? 'Realizada' : event.ID_ESTADO === 2 ? 'Cancelada' : 'Bloqueada/Pendiente'}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--slate-700)' }}>
                            ${event.TOTAL.toLocaleString()}
                        </span>
                    </div>
                </div>

                <div style={{ padding: '1rem', background: 'var(--slate-50)', textAlign: 'right' }}>
                    <button onClick={onClose} className="btn btn-secondary">Cerrar</button>
                </div>
            </div>
        </div>
    );
}
