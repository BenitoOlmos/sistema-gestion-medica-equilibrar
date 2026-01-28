'use client';
import { useApp } from '@/lib/context';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, Users, CalendarCheck, Activity } from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, color }) => (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ padding: '0.75rem', borderRadius: '50%', background: `${color}20`, color: color }}>
            <Icon size={24} />
        </div>
        <div>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.875rem' }}>{title}</p>
            <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{value}</h3>
        </div>
    </div>
);

export default function AdminDashboard() {
    const { data, user } = useApp();

    if (!user) return null;

    // Mock Aggregations
    const totalSales = data.DB_ATENCIONES.reduce((acc, curr) => acc + curr.TOTAL, 0);
    const totalAppointments = data.DB_ATENCIONES.length;
    const activeClients = data.DB_CLIENTES.length;

    const chartData = [
        { name: 'Lun', ventas: 150000 },
        { name: 'Mar', ventas: 230000 },
        { name: 'Mié', ventas: 180000 },
        { name: 'Jue', ventas: 290000 },
        { name: 'Vie', ventas: 200000 },
    ];

    const pieData = [
        { name: 'Realizadas', value: 4 },
        { name: 'Canceladas', value: 1 },
        { name: 'No Show', value: 1 },
    ];
    const COLORS = ['#14b8a6', '#ef4444', '#cbd5e1'];

    return (
        <div className="animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>Panel Financiero</h1>
                <p style={{ color: 'var(--slate-500)' }}>Resumen general de la clínica</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <KPICard title="Ventas Totales" value={`$${totalSales.toLocaleString()}`} icon={DollarSign} color="#14b8a6" />
                <KPICard title="Citas Totales" value={totalAppointments} icon={CalendarCheck} color="#3b82f6" />
                <KPICard title="Pacientes Activos" value={activeClients} icon={Users} color="#8b5cf6" />
                <KPICard title="Tasa Ocupación" value="85%" icon={Activity} color="#f59e0b" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                <div className="card" style={{ height: '400px', minWidth: '0' }}>
                    <h3>Ingresos por Día</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="ventas" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="card" style={{ height: '400px', minWidth: '0' }}>
                    <h3>Estado de Citas</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
