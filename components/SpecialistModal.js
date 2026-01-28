'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function SpecialistModal({ isOpen, onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState({
        NOMBRE: '',
        ESPECIALIDAD: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ NOMBRE: '', ESPECIALIDAD: '' });
        }
    }, [initialData, isOpen]);

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
            <div className="card" style={{ width: '100%', maxWidth: '400px', animation: 'fadeIn 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3>{initialData ? 'Editar Especialista' : 'Nuevo Especialista'}</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Nombre Completo</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.NOMBRE}
                            onChange={e => setFormData({ ...formData, NOMBRE: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Especialidad</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.ESPECIALIDAD}
                            onChange={e => setFormData({ ...formData, ESPECIALIDAD: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Color Distintivo</label>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <input
                                type="color"
                                value={formData.COLOR || '#3b82f6'}
                                onChange={e => setFormData({ ...formData, COLOR: e.target.value })}
                                style={{ height: '40px', width: '60px', padding: 0, border: 'none', cursor: 'pointer' }}
                            />
                            <span style={{ fontSize: '0.9rem', color: 'var(--slate-500)' }}>Elige un color para la agenda</span>
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Estado del Profesional</label>
                        <select
                            className="input"
                            value={formData.ESTADO || 'ACTIVO'}
                            onChange={e => setFormData({ ...formData, ESTADO: e.target.value })}
                        >
                            <option value="ACTIVO">ACTIVO - Puede atender</option>
                            <option value="INACTIVO">INACTIVO - Bloquear acceso y agenda</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                        <button type="submit" className="btn btn-primary">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
