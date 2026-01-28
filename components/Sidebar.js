'use client';
import { useApp } from '@/lib/context';
import {
    LayoutDashboard,
    Users,
    CalendarDays,
    Settings,
    LogOut,
    Stethoscope,
    BarChart3,
    Briefcase,
    X
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar({ isOpen, onClose }) {
    const { user, logout } = useApp();
    const pathname = usePathname();

    if (!user) return null;

    const NavItem = ({ icon: Icon, label, href }) => {
        const isActive = pathname === href;
        return (
            <Link href={href} style={{ textDecoration: 'none' }} onClick={onClose}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    marginBottom: '0.25rem',
                    backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: isActive ? 'var(--primary-300)' : 'var(--slate-400)',
                    transition: 'all 0.2s',
                }}
                    onMouseEnter={e => {
                        if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                            e.currentTarget.style.color = 'white';
                        }
                    }}
                    onMouseLeave={e => {
                        if (!isActive) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = 'var(--slate-400)';
                        }
                    }}
                >
                    <Icon size={20} />
                    <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{label}</span>
                </div>
            </Link>
        );
    };

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', padding: '0 0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Stethoscope size={18} color="white" />
                    </div>
                    <div>
                        <h2 style={{ color: 'white', fontSize: '1.125rem', lineHeight: 1.2 }}>Clinica Equilibrar</h2>
                        <p style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>Gestión de horas</p>
                    </div>
                </div>
                <button onClick={onClose} className="btn-mobile-only" style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                    <X size={20} />
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <p style={{ padding: '0 0.75rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Principal</p>

                    {user?.role === 'ADMINISTRADOR' && <NavItem icon={LayoutDashboard} label="Dashboard" href="/dashboard" />}

                    {user?.role === 'ADMINISTRADOR' && (
                        <>
                            <NavItem icon={BarChart3} label="Reportes" href="/dashboard/reportes" />
                        </>
                    )}

                    {['ADMINISTRADOR', 'COORDINADOR', 'COORDINADORA'].includes(user?.role?.toUpperCase().trim()) && (
                        <>
                            <NavItem icon={Users} label="Clientes" href="/dashboard/pacientes" />
                            <NavItem icon={CalendarDays} label="Calendario" href="/dashboard/agenda" />
                            <NavItem icon={Stethoscope} label="Equipo" href="/dashboard/equipo" />
                            <NavItem icon={Briefcase} label="Servicios" href="/dashboard/servicios" />
                        </>
                    )}

                    {user?.role === 'ADMINISTRADOR' && (
                        <NavItem icon={Settings} label="Configuración" href="/dashboard/config" />
                    )}

                    {user?.role === 'PROFESIONAL' && (
                        <>
                            <NavItem icon={CalendarDays} label="Mi Agenda" href="/dashboard/mi-agenda" />
                        </>
                    )}
                </div>
            </div>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0 0.75rem', marginBottom: '1rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--slate-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>
                        {user.email[0].toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontSize: '0.875rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>{user.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', color: 'var(--slate-400)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '0.875rem', borderRadius: '0.5rem' }}
                    onMouseEnter={e => {
                        e.currentTarget.style.color = '#f87171'; // red-400
                        e.currentTarget.style.background = 'rgba(127, 29, 29, 0.1)'; // red-900/10
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.color = 'var(--slate-400)';
                        e.currentTarget.style.background = 'transparent';
                    }}
                >
                    <LogOut size={18} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
}
