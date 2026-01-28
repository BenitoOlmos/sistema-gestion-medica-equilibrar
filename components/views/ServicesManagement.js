'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Plus, Pencil, Trash2, Tag, DollarSign } from 'lucide-react';
import ServiceModal from '@/components/ServiceModal';

export default function ServicesManagement() {
    const { data, addService, updateService, deleteService, user } = useApp();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);

    if (!user) return null;

    const canEdit = user && ['ADMINISTRADOR', 'COORDINADOR', 'COORDINADORA'].includes(user.role?.toUpperCase().trim());

    const services = data?.DB_SERVICIOS || [];

    const handleCreate = (formData) => {
        addService(formData);
        setModalOpen(false);
    };

    const handleUpdate = (formData) => {
        updateService({ ...editingService, ...formData });
        setEditingService(null);
        setModalOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este servicio?')) {
            deleteService(id);
        }
    };

    const openEdit = (s) => {
        setEditingService(s);
        setModalOpen(true);
    };

    const openCreate = () => {
        setEditingService(null);
        setModalOpen(true);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Servicios y Precios</h1>
                    <p style={{ color: 'var(--slate-500)' }}>Catálogo de prestaciones médicas</p>
                </div>
                {canEdit && (
                    <button onClick={openCreate} className="btn btn-primary">
                        <Plus size={20} /> Nuevo Servicio
                    </button>
                )}
            </div>

            <div className="card" style={{ padding: 0 }}>
                {services.map(s => (
                    <div key={s.ID_SERVICIO} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--slate-100)' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--slate-100)', color: 'var(--slate-600)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Tag size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{s.NOMBRE}</div>
                                <div style={{ fontSize: '0.9rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    $ {Number(s.PRECIO).toLocaleString('es-ES')}
                                </div>
                            </div>
                        </div>
                        {canEdit && (
                            <div>
                                <button onClick={() => openEdit(s)} className="btn btn-secondary" style={{ padding: '0.3rem', marginRight: '0.5rem' }}><Pencil size={16} /></button>
                                <button onClick={() => handleDelete(s.ID_SERVICIO)} className="btn btn-danger" style={{ padding: '0.3rem', background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <ServiceModal
                key={editingService ? editingService.ID_SERVICIO : 'new-service'}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={editingService ? handleUpdate : handleCreate}
                initialData={editingService}
            />
        </div>
    );
}
