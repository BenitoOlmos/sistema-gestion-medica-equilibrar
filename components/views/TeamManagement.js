'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Plus, Pencil, Trash2, ShieldCheck, Stethoscope } from 'lucide-react';
import SpecialistModal from '@/components/SpecialistModal';

export default function TeamManagement() {
    const { data, addSpecialist, updateSpecialist, deleteSpecialist, user } = useApp();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingSpecialist, setEditingSpecialist] = useState(null);

    if (!user) return null;

    // Allow CRUD only for Admin and Coordinator
    const canEdit = user && ['ADMINISTRADOR', 'COORDINADOR', 'COORDINADORA'].includes(user.role?.toUpperCase().trim());

    const specialists = data?.DB_CONFIG_EQUIPO || [];

    const handleCreate = (formData) => {
        addSpecialist(formData);
        setModalOpen(false);
    };

    const handleUpdate = (formData) => {
        updateSpecialist({ ...editingSpecialist, ...formData });
        setEditingSpecialist(null);
        setModalOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este especialista?')) {
            deleteSpecialist(id);
        }
    };

    const openEdit = (s) => {
        setEditingSpecialist(s);
        setModalOpen(true);
    };

    const openCreate = () => {
        setEditingSpecialist(null);
        setModalOpen(true);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Gestión de Equipo</h1>
                    <p style={{ color: 'var(--slate-500)' }}>Profesionales y Especialistas del centro</p>
                </div>
                {canEdit && (
                    <button onClick={openCreate} className="btn btn-primary">
                        <Plus size={20} /> Nuevo Especialista
                    </button>
                )}
            </div>

            <div className="card" style={{ padding: 0 }}>
                {specialists.map(e => (
                    <div key={e.ID_ESPECIALISTA} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--slate-100)' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', background: e.COLOR || 'var(--primary-100)', color: e.COLOR ? 'white' : 'var(--primary-700)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                <Stethoscope size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{e.NOMBRE}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {e.ESPECIALIDAD}
                                    {e.ESTADO === 'INACTIVO' && <span className="badge badge-danger">Inactivo</span>}
                                </div>
                            </div>
                        </div>
                        {canEdit && (
                            <div>
                                <button onClick={() => openEdit(e)} className="btn btn-secondary" style={{ padding: '0.3rem', marginRight: '0.5rem' }}><Pencil size={16} /></button>
                                <button onClick={() => handleDelete(e.ID_ESPECIALISTA)} className="btn btn-danger" style={{ padding: '0.3rem', background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <SpecialistModal
                key={editingSpecialist ? editingSpecialist.ID_ESPECIALISTA : 'new-specialist'}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={editingSpecialist ? handleUpdate : handleCreate}
                initialData={editingSpecialist}
            />
        </div>
    );
}
