'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function UserModal({ isOpen, onClose, onSubmit, initialData, specialists }) {
    const [formData, setFormData] = useState({
        EMAIL: '',
        ROL: 'PROFESIONAL', // Default
        ID_ESPECIALISTA_LINK: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ EMAIL: '', ROL: 'PROFESIONAL', ID_ESPECIALISTA_LINK: '' });
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
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)'
        }}>
            <div className="card" style={{
                width: '100%',
                maxWidth: '450px',
                padding: '2.5rem',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                    <h3 style={{ margin: 0 }}>{initialData ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--slate-400)' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--slate-700)' }}>Email de Acceso</label>
                        <input
                            type="email"
                            className="input"
                            value={formData.EMAIL}
                            onChange={e => setFormData({ ...formData, EMAIL: e.target.value })}
                            required
                            disabled={!!initialData}
                            placeholder="usuario@ejemplo.com"
                        />
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--slate-700)' }}>Rol en Sistema</label>
                        <select
                            className="input"
                            value={formData.ROL}
                            onChange={e => setFormData({ ...formData, ROL: e.target.value })}
                        >
                            <option value="ADMINISTRADOR">ADMINISTRADOR</option>
                            <option value="COORDINADOR">COORDINADOR</option>
                            <option value="PROFESIONAL">PROFESIONAL</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--slate-700)' }}>Contraseña</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.PASS || ''}
                            onChange={e => setFormData({ ...formData, PASS: e.target.value })}
                            placeholder="Mínimo 4 caracteres"
                        />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', display: 'block', color: 'var(--slate-700)' }}>Vincular a Especialista</label>
                        <select
                            className="input"
                            value={formData.ID_ESPECIALISTA_LINK || ''}
                            onChange={e => setFormData({ ...formData, ID_ESPECIALISTA_LINK: e.target.value })}
                        >
                            <option value="">Sin Vinculación (Acceso Total)</option>
                            {specialists.map(s => (
                                <option key={s.ID_ESPECIALISTA} value={s.ID_ESPECIALISTA}>{s.NOMBRE}</option>
                            ))}
                        </select>
                        <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)', marginTop: '0.75rem', lineHeight: 1.4 }}>
                            Asigne un especialista para restringir el acceso del usuario únicamente a su propia agenda y pacientes.
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', borderTop: '1px solid var(--slate-100)', paddingTop: '1.5rem' }}>
                        <button type="button" onClick={onClose} className="btn btn-secondary">Cancelar</button>
                        <button type="submit" className="btn btn-primary">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
