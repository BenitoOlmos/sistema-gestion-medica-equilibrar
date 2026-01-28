'use client';
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ServiceModal({ isOpen, onClose, onSubmit, initialData }) {
    const [formData, setFormData] = useState({
        NOMBRE: '',
        PRECIO: ''
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ NOMBRE: '', PRECIO: '' });
        }
    }, [initialData, isOpen]);

    const formatTime = (val) => {
        if (!val) return '';
        return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const handlePriceChange = (e) => {
        const rawValue = e.target.value.replace(/\./g, '').replace(/[^0-9]/g, '');
        setFormData({ ...formData, PRECIO: rawValue });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            PRECIO: Number(formData.PRECIO)
        });
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
            <div style={{
                width: '100%',
                maxWidth: '400px',
                background: 'white',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h3>{initialData ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
                    <button onClick={onClose} style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Nombre del Servicio</label>
                        <input
                            type="text"
                            className="input"
                            value={formData.NOMBRE}
                            onChange={e => setFormData({ ...formData, NOMBRE: e.target.value })}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem', display: 'block' }}>Precio</label>
                        <div style={{ position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)', fontWeight: 500 }}>$</span>
                            <input
                                type="text"
                                className="input"
                                value={formatTime(formData.PRECIO)}
                                onChange={handlePriceChange}
                                style={{ paddingLeft: '25px' }}
                                placeholder="0"
                                required
                            />
                        </div>
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
