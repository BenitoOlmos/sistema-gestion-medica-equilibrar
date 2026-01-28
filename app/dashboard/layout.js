'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Menu } from 'lucide-react';

export default function DashboardLayout({ children }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="layout-wrapper">
            {/* Mobile Header */}
            <header className="mobile-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ color: 'white', fontWeight: 'bold' }}>CE</span>
                    </div>
                    <span style={{ fontWeight: 600 }}>Equilibrar</span>
                </div>
                <button
                    onClick={() => setSidebarOpen(true)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--slate-600)' }}
                >
                    <Menu size={24} />
                </button>
            </header>

            {/* Overlay for mobile */}
            <div
                className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />

            <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />

            <main className="main-content">
                <div className="container animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
