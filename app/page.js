'use client';
import { useState } from 'react';
import { useApp } from '@/lib/context';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, UserCog } from 'lucide-react';

// Wrapper to ensure provider exists
export default function LoginPage() {
    const { login, loading } = useApp();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();
    const [error, setError] = useState('');

    const executeLogin = async (emailToLogin, passToLogin) => {
        if (loading) return;
        setError('');
        const success = await login(emailToLogin, passToLogin);
        if (success) {
            router.push('/dashboard');
        } else {
            setError('Usuario o contraseña inválidos.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        await executeLogin(email, password);
    };

    const demoLogin = (demoEmail) => {
        setEmail(demoEmail);
        executeLogin(demoEmail);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at top right, #f0fdfa, #e0f2fe)',
            padding: '1.5rem'
        }}>
            <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '3rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '72px', height: '72px',
                        background: 'linear-gradient(135deg, var(--primary-500), var(--primary-700))',
                        borderRadius: '20px',
                        margin: '0 auto 1.25rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px -4px rgba(20, 184, 166, 0.4)'
                    }}>
                        <LayoutDashboard color="white" size={36} />
                    </div>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>Clinica Equilibrar</h1>
                    <p style={{ color: 'var(--slate-500)', fontWeight: 500 }}>Sistema de Gestión Médica</p>
                    {loading && (
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                            <div className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary-500)' }}></div>
                            <p style={{ color: 'var(--primary-600)', fontSize: '0.8rem', fontWeight: 600 }}>Sincronizando datos...</p>
                        </div>
                    )}
                </div>

                <form onSubmit={handleLogin} style={{ opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--slate-700)' }}>Correo Electrónico</label>
                        <input
                            type="email"
                            className="input"
                            placeholder="nombre@ejemplo.com"
                            style={{ padding: '0.75rem 1rem' }}
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                        />
                    </div>
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: 'var(--slate-700)' }}>Contraseña</label>
                        <input
                            type="password"
                            className="input"
                            placeholder="••••••••"
                            style={{ padding: '0.75rem 1rem' }}
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1.5rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', fontWeight: 600 }}>
                        Iniciar Sesión
                    </button>
                </form>

                <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--slate-100)', paddingTop: '2rem' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--slate-400)', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '1rem', textAlign: 'center', textTransform: 'uppercase' }}>Acceso Rápido Demo</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                        <button onClick={() => demoLogin('benito.olmos@gmail.com')} className="btn btn-secondary" style={{ justifyContent: 'center', padding: '0.6rem' }}>
                            <UserCog size={16} /> Administrador
                        </button>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <button onClick={() => demoLogin('corrdinador.ce@gmail.com')} className="btn btn-secondary" style={{ justifyContent: 'center', padding: '0.6rem' }}>
                                <Users size={16} /> Coordinador
                            </button>
                            <button onClick={() => demoLogin('claudio.ce@gmail.com')} className="btn btn-secondary" style={{ justifyContent: 'center', padding: '0.6rem' }}>
                                <LayoutDashboard size={16} /> Profesional
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
