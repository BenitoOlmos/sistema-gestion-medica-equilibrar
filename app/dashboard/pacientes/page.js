'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import PatientModal from '@/components/PatientModal';

export default function PatientsPage() {
    const { data, addClient, updateClient, deleteClient, user } = useApp();
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);

    if (!user) return null;

    // Allow CRUD only for Admin and Coordinator
    const canEdit = user && (['ADMINISTRADOR', 'COORDINADOR', 'COORDINADORA'].includes(user.role?.toUpperCase().trim()));

    const patients = (data?.DB_CLIENTES || []).filter(p =>
        p.NOMBRE.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.EMAIL.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = (formData) => {
        addClient(formData);
        setModalOpen(false);
    };

    const handleUpdate = (formData) => {
        updateClient({ ...editingPatient, ...formData });
        setEditingPatient(null);
        setModalOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm('¿Estás seguro de eliminar este paciente?')) {
            deleteClient(id);
        }
    };

    const openEdit = (patient) => {
        setEditingPatient(patient);
        setModalOpen(true);
    };

    const openCreate = () => {
        setEditingPatient(null);
        setModalOpen(true);
    };

    return (
        <div className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Base de Pacientes</h1>
                    <p style={{ color: 'var(--slate-500)' }}>Listado completo de clientes registrados</p>
                </div>
                {canEdit && (
                    <button onClick={openCreate} className="btn btn-primary">
                        <Plus size={20} /> Nuevo Paciente
                    </button>
                )}
            </div>

            <div className="card" style={{ padding: '1rem', display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <Search size={20} color="var(--slate-400)" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    style={{ border: 'none', width: '100%', outline: 'none' }}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="card scrollable-table" style={{ padding: 0 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem', minWidth: '800px' }}>
                    <thead style={{ background: 'var(--slate-50)', borderBottom: '1px solid var(--slate-200)' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--slate-500)', fontWeight: 600 }}>ID</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--slate-500)', fontWeight: 600 }}>Nombre</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--slate-500)', fontWeight: 600 }}>Email</th>
                            <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--slate-500)', fontWeight: 600 }}>Teléfono</th>
                            {canEdit && <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--slate-500)', fontWeight: 600 }}>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {patients.map(p => (
                            <tr key={p.ID_CLIENTE} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                                <td style={{ padding: '1rem' }}><span className="badge badge-neutral">{p.ID_CLIENTE}</span></td>
                                <td style={{ padding: '1rem', fontWeight: 500 }}>{p.NOMBRE}</td>
                                <td style={{ padding: '1rem', color: 'var(--slate-600)' }}>{p.EMAIL}</td>
                                <td style={{ padding: '1rem', color: 'var(--slate-600)' }}>{p.TELEFONO}</td>
                                {canEdit && (
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button onClick={() => openEdit(p)} className="btn btn-secondary" style={{ padding: '0.3rem', marginRight: '0.5rem' }}><Pencil size={16} /></button>
                                        <button onClick={() => handleDelete(p.ID_CLIENTE)} className="btn btn-danger" style={{ padding: '0.3rem', background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <PatientModal
                key={editingPatient ? editingPatient.ID_CLIENTE : 'new-patient'}
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onSubmit={editingPatient ? handleUpdate : handleCreate}
                initialData={editingPatient}
            />
        </div >
    );
}
