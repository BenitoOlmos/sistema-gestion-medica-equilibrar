'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Plus, Pencil, Trash2, Key, Shield } from 'lucide-react';
import UserModal from '@/components/UserModal';

export default function SettingsPage() {
    const { data, addUser, updateUser, deleteUser } = useApp();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    const users = data?.DB_USUARIOS || [];
    const specialists = data?.DB_CONFIG_EQUIPO || [];

    const handleCreate = (formData) => {
        addUser(formData);
        setModalOpen(false);
    };

    const handleUpdate = (formData) => {
        updateUser({ ...editingUser, ...formData });
        setEditingUser(null);
        setModalOpen(false);
    };

    const handleDelete = (email) => {
        if (confirm('¿Estás seguro de eliminar este usuario?')) {
            deleteUser(email);
        }
    };

    const openEdit = (u) => {
        setEditingUser(u);
        setModalOpen(true);
    };

    const openCreate = () => {
        setEditingUser(null);
        setModalOpen(true);
    };

    const getSpecialistName = (id) => {
        if (!id) return '';
        const s = specialists.find(sp => sp.ID_ESPECIALISTA === id);
        return s ? s.NOMBRE : id;
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Gestión de Usuarios</h1>
                    <p style={{ color: 'var(--slate-500)' }}>Control de acceso y roles del sistema</p>
                </div>
                <button onClick={openCreate} className="btn btn-primary">
                    <Plus size={20} /> Nuevo Usuario
                </button>
            </div>

            <div className="card" style={{ padding: 0 }}>
                {users.map(u => (
                    <div key={u.EMAIL} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--slate-100)' }}>
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                            <div style={{ width: '40px', height: '40px', background: 'var(--slate-800)', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                <Key size={20} />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '1rem' }}>{u.EMAIL}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span className={`badge badge-${u.ROL === 'ADMINISTRADOR' ? 'primary' : 'neutral'}`}>{u.ROL}</span>
                                    {u.ID_ESPECIALISTA_LINK && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary-600)' }}>
                                            <Shield size={12} /> Vinculado a: {getSpecialistName(u.ID_ESPECIALISTA_LINK)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div>
                            <button onClick={() => openEdit(u)} className="btn btn-secondary" style={{ padding: '0.3rem', marginRight: '0.5rem' }}><Pencil size={16} /></button>
                            <button onClick={() => handleDelete(u.EMAIL)} className="btn btn-danger" style={{ padding: '0.3rem', background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}
            </div>

            <UserModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={editingUser ? handleUpdate : handleCreate}
                initialData={editingUser}
                specialists={specialists}
            />
        </div>
    );
}
