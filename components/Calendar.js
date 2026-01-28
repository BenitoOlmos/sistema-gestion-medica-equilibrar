'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { getStatusLabel } from '@/lib/data';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 to 20:00
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export default function Calendar({ events, onSlotClick, onEventClick, title, specialistColors }) {
    const [currentDate, setCurrentDate] = useState(new Date()); // Defaults to today (2026-01-27)

    // Helper to get start of the week (Monday)
    const getStartOfWeek = (d) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    };

    const startOfWeek = getStartOfWeek(currentDate);

    // Generate Week Days
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(d.getDate() + i);
        return d;
    });

    const changeWeek = (offset) => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + offset * 7);
        setCurrentDate(newDate);
    };

    const formatTime = (h) => `${h}:00`;
    const formatDate = (date) => date.toISOString().split('T')[0];

    const getEventsForSlot = (dateObj, hour) => {
        const slotDate = formatDate(dateObj);

        return events.filter(e => {
            if (!e.FECHA_ATENCION) return false;
            const eventDate = e.FECHA_ATENCION;
            const eventHour = parseInt(e.HORA_ATENCION.split(':')[0]);
            return eventDate === slotDate && eventHour === hour;
        });
    };

    const monthLabel = startOfWeek.toLocaleString('es-ES', { month: 'long', year: 'numeric' });

    return (
        <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
            <div className="calendar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', borderBottom: '1px solid var(--slate-200)', padding: '1.25rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.25rem', margin: 0, textTransform: 'capitalize' }}>{title || 'Agenda Semanal'}</h2>
                    <span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{monthLabel}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={() => changeWeek(-1)} className="btn btn-secondary" style={{ padding: '0.5rem' }}><ChevronLeft size={18} /></button>
                    <button onClick={() => setCurrentDate(new Date())} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Hoy</button>
                    <button onClick={() => changeWeek(1)} className="btn btn-secondary" style={{ padding: '0.5rem' }}><ChevronRight size={18} /></button>
                </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto' }} className="scrollable-table">
                <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', minWidth: '1000px' }}>
                    {/* Header Row */}
                    <div style={{
                        padding: '1rem',
                        background: 'var(--slate-50)',
                        borderBottom: '1px solid var(--slate-200)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 10
                    }}></div>
                    {weekDays.map((day, i) => (
                        <div key={i} style={{
                            padding: '1rem',
                            background: day.toDateString() === new Date().toDateString() ? '#f0fdfa' : 'var(--slate-50)',
                            borderBottom: '1px solid var(--slate-200)',
                            textAlign: 'center',
                            borderLeft: '1px solid var(--slate-200)',
                            position: 'sticky',
                            top: 0,
                            zIndex: 10
                        }}>
                            <div style={{ fontWeight: 600, color: 'var(--slate-600)', textTransform: 'capitalize' }}>
                                {day.toLocaleString('es-ES', { weekday: 'long' })}
                            </div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--slate-800)' }}>
                                {day.getDate()}
                            </div>
                        </div>
                    ))}

                    {/* Time Rows */}
                    {HOURS.map(hour => (
                        <>
                            <div key={`time-${hour}`} style={{ padding: '0.5rem', textAlign: 'right', color: 'var(--slate-400)', fontSize: '0.75rem', transform: 'translateY(-10px)' }}>
                                {formatTime(hour)}
                            </div>
                            {weekDays.map((dayDate, dayIndex) => {
                                const slotEvents = getEventsForSlot(dayDate, hour);

                                return (
                                    <div
                                        key={`slot-${dayIndex}-${hour}`}
                                        onClick={() => {
                                            onSlotClick && onSlotClick(dayDate, hour);
                                        }}
                                        style={{
                                            minHeight: '100px',
                                            borderLeft: '1px solid var(--slate-100)',
                                            borderBottom: '1px solid var(--slate-100)',
                                            position: 'relative',
                                            cursor: 'pointer',
                                            padding: '4px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '4px',
                                            transition: 'background 0.2s',
                                            backgroundColor: dayDate.toDateString() === new Date().toDateString() ? '#fafafa' : 'white'
                                        }}
                                        onMouseEnter={(e) => slotEvents.length === 0 && (e.currentTarget.style.backgroundColor = 'var(--primary-50)')}
                                        onMouseLeave={(e) => slotEvents.length === 0 && (e.currentTarget.style.backgroundColor = dayDate.toDateString() === new Date().toDateString() ? '#fafafa' : 'white')}
                                    >
                                        {slotEvents.map(event => {
                                            const status = getStatusLabel(event.ID_ESTADO, event.FECHA_ATENCION);

                                            // Determine Color
                                            let bgColor = 'var(--primary-100)';
                                            let borderColor = 'var(--primary-500)';
                                            let textColor = 'var(--slate-800)';

                                            if (event.ID_ESTADO === 3 || event.ID_CLIENTE === 'SYSTEM') {
                                                bgColor = 'var(--slate-100)';
                                                borderColor = 'var(--slate-400)';
                                            } else if (specialistColors && specialistColors[event.ID_ESPECIALISTA]) {
                                                bgColor = specialistColors[event.ID_ESPECIALISTA] + '30';
                                                borderColor = specialistColors[event.ID_ESPECIALISTA];
                                            }

                                            return (
                                                <div
                                                    key={event.ID_ATENCION}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onEventClick && onEventClick(event);
                                                    }}
                                                    style={{
                                                        background: bgColor,
                                                        borderLeft: `4px solid ${borderColor}`,
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '4px',
                                                        overflow: 'hidden',
                                                        fontSize: '0.75rem',
                                                        flexShrink: 0,
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: textColor }}>
                                                        <div style={{
                                                            width: '6px', height: '6px', borderRadius: '50%',
                                                            backgroundColor: `var(--${status.color || 'slate-400'})`,
                                                            flexShrink: 0
                                                        }}></div>
                                                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {event.ID_ESTADO === 3 || event.ID_CLIENTE === 'SYSTEM' ? 'Bloqueo' : event.PATIENT_NAME}
                                                        </span>
                                                    </div>
                                                    {event.ID_ESTADO !== 3 && event.ID_CLIENTE !== 'SYSTEM' && (
                                                        <div style={{ color: 'var(--slate-600)', fontSize: '0.65rem', marginLeft: '10px' }}>
                                                            {status.label} • ${Number(event.TOTAL).toLocaleString('es-ES')}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {slotEvents.length === 0 && (
                                            <div style={{ opacity: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover-trigger">
                                                <Plus size={16} color="var(--primary-400)" />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    ))}
                </div>
            </div>
        </div>
    );
}
