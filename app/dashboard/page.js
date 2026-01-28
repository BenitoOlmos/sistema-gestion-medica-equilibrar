'use client';
import { useApp } from '@/lib/context';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/views/AdminDashboard';
import CoordinatorDashboard from '@/components/views/CoordinatorDashboard';
import ProfessionalDashboard from '@/components/views/ProfessionalDashboard';

export default function DashboardPage() {
    const { user } = useApp();
    const router = useRouter();

    useEffect(() => {
        if (!user) {
            router.push('/');
            return;
        }

        const role = user.role?.toUpperCase().trim();
        if (role === 'COORDINADOR' || role === 'COORDINADORA') {
            router.push('/dashboard/agenda');
        } else if (role === 'PROFESIONAL') {
            router.push('/dashboard/mi-agenda');
        }
    }, [user, router]);

    if (!user) return <div className="p-8 text-center text-slate-500">Cargando perfil...</div>;

    const currentRole = user.role?.toUpperCase().trim();

    return (
        <>
            {currentRole === 'ADMINISTRADOR' && <AdminDashboard />}
            {(currentRole === 'COORDINADOR' || currentRole === 'COORDINADORA') && <CoordinatorDashboard />}
            {currentRole === 'PROFESIONAL' && <ProfessionalDashboard />}

            {/* Fallback for unknown roles */}
            {!['ADMINISTRADOR', 'COORDINADOR', 'COORDINADORA', 'PROFESIONAL'].includes(currentRole) && (
                <div className="card p-8 text-center">
                    <h2>Rol no reconocido</h2>
                    <p>Contacte al administrador del sistema.</p>
                </div>
            )}
        </>
    );
}
