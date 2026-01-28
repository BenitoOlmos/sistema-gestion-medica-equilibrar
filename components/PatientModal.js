'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function PatientModal({ isOpen, onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState({
        NOMBRE: '',
        EMAIL: '',
        TELEFONO: '',
        COMUNA: '',
        ISAPRE: '',
        RUT: '',
        FECHA_NACIMIENTO: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                NOMBRE: initialData.NOMBRE || '',
                EMAIL: initialData.EMAIL || '',
                TELEFONO: initialData.TELEFONO || '',
                COMUNA: initialData.COMUNA || '',
                ISAPRE: initialData.ISAPRE || '',
                RUT: initialData.RUT || '',
                FECHA_NACIMIENTO: initialData.FECHA_NACIMIENTO || ''
            });
        } else {
            setFormData({ NOMBRE: '', EMAIL: '', TELEFONO: '', COMUNA: '', ISAPRE: '', RUT: '', FECHA_NACIMIENTO: '' });
        }
    }, [initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            overflowY: 'auto'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '500px',
                padding: '2rem',
                maxHeight: '90vh',
                overflowY: 'auto',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', position: 'sticky', top: 0, background: 'white', zIndex: 1, paddingBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0 }}>{initialData ? 'Editar Paciente' : 'Nuevo Paciente'}</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--slate-400)' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Nombre Completo</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.NOMBRE}
                                onChange={e => setFormData({ ...formData, NOMBRE: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>RUT</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.RUT}
                                onChange={e => setFormData({ ...formData, RUT: e.target.value })}
                                placeholder="12.345.678-9"
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Email</label>
                            <input
                                type="email"
                                className="input"
                                value={formData.EMAIL}
                                onChange={e => setFormData({ ...formData, EMAIL: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Teléfono</label>
                            <input
                                type="tel"
                                className="input"
                                value={formData.TELEFONO}
                                onChange={e => setFormData({ ...formData, TELEFONO: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Fecha de Nacimiento</label>
                            <input
                                type="date"
                                className="input"
                                value={formData.FECHA_NACIMIENTO}
                                onChange={e => setFormData({ ...formData, FECHA_NACIMIENTO: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Comuna</label>
                            <input
                                type="text"
                                className="input"
                                value={formData.COMUNA}
                                onChange={e => setFormData({ ...formData, COMUNA: e.target.value })}
                                placeholder="Ej: Santiago"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>ISAPRE / Previsión</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.ISAPRE}
                            onChange={e => setFormData({ ...formData, ISAPRE: e.target.value })}
                            placeholder="Ej: Fonasa, Isapre Banmédica"
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--slate-100)', paddingTop: '1.5rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                        <button type="submit" className="btn btn-primary">Guardar Paciente</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
