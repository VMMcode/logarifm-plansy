'use client';
import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ShapeGrid from '@/components/ShapeGrid';

type Employee = { id: number; name: string; username: string };
type Event = { id: number; title: string; type_name: string; type_color: string; date: string; description: string; participants: Employee[] };

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [current, setCurrent] = useState(new Date());
  const [selected, setSelected] = useState<Event[] | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetch('/api/events').then(r => r.json()).then(setEvents);
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const cells = Array.from({ length: startOffset + daysInMonth }, (_, i) => {
    const day = i - startOffset + 1;
    return day > 0 ? day : null;
  });

  function getEventsForDay(day: number) {
    return events.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
    });
  }

  const today = new Date();
  const monthName = current.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

  const s = {
    btn: { background: 'var(--bg-card)', color: 'var(--text-primary)', padding: isMobile ? '0.4rem 0.7rem' : '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontSize: isMobile ? '0.85rem' : '1rem' } as React.CSSProperties,
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        <ShapeGrid
          speed={0.3}
          squareSize={40}
          direction="diagonal"
          borderColor="#c8ccd8"
          hoverFillColor="#1E3E92"
          shape="square"
          hoverTrailAmount={3}
        />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>
      <Header />
      <div style={{ padding: '1rem' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

          {/* Навигация по месяцу */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, textTransform: 'capitalize' }}>{monthName}</h1>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={() => setCurrent(new Date(year, month - 1))} style={s.btn}>←</button>
              <button onClick={() => setCurrent(new Date())} style={s.btn}>Сегодня</button>
              <button onClick={() => setCurrent(new Date(year, month + 1))} style={s.btn}>→</button>
              <a href="/admin" style={{ ...s.btn, background: 'var(--accent)', color: '#ffffff', textDecoration: 'none', display: 'inline-block' }}>Управление</a>
            </div>
          </div>

          {/* Дни недели */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.25rem' }}>
            {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
              <div key={d} style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', padding: '0.25rem' }}>{d}</div>
            ))}
          </div>

          {/* Сетка */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
            {cells.map((day, i) => {
              const dayEvents = day ? getEventsForDay(day) : [];
              const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

              return (
                <div key={i} onClick={() => day && dayEvents.length && setSelected(dayEvents)}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '0.5rem',
                    minHeight: isMobile ? '50px' : '70px',
                    padding: isMobile ? '0.25rem' : '0.375rem',
                    cursor: dayEvents.length ? 'pointer' : 'default',
                    border: isToday ? '1px solid var(--accent)' : '1px solid transparent',
                    opacity: day ? 1 : 0,
                  }}>
                  {day && (
                    <>
                      <span style={{ fontSize: '0.75rem', color: isToday ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: isToday ? 700 : 400 }}>{day}</span>
                      {isMobile ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.15rem', marginTop: '0.25rem' }}>
                          {dayEvents.map(e => (
                            <div key={e.id} style={{ width: '6px', height: '6px', borderRadius: '50%', background: e.type_color || 'var(--accent)' }} />
                          ))}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', marginTop: '0.2rem' }}>
                          {dayEvents.map(e => (
                            <div key={e.id} style={{ background: e.type_color || 'var(--accent)', borderRadius: '0.2rem', padding: '0.1rem 0.3rem', fontSize: '0.65rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#ffffff' }}>
                              {e.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Легенда */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1rem' }}>
            {[...new Map(events.filter(e => e.type_name).map(e => [e.type_name, e])).values()].map(e => (
              <div key={e.type_name} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: e.type_color }} />
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{e.type_name}</span>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Модалка */}
      {selected && (
        <div onClick={() => setSelected(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: isMobile ? 'stretch' : 'center', justifyContent: 'center', zIndex: 50, padding: isMobile ? 0 : '1rem' }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-card)', borderRadius: isMobile ? 0 : '1rem', padding: '1.5rem', width: '100%', maxWidth: isMobile ? '100%' : '360px', height: isMobile ? '100%' : 'auto', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 700, margin: 0 }}>События дня</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
            </div>
            {selected.map(e => (
              <div key={e.id} style={{ background: 'var(--bg-input)', borderRadius: '0.5rem', padding: '0.75rem', borderLeft: `3px solid ${e.type_color || 'var(--accent)'}` }}>
                <p style={{ fontWeight: 600, margin: '0 0 0.25rem' }}>{e.title}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0' }}>{new Date(e.date).toLocaleString('ru-RU')}</p>
                {e.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0' }}>{e.description}</p>}
                {e.participants?.filter(p => p?.id).length > 0 && (
                  <>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: '0.5rem 0 0.15rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Представители команды:</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
                      {e.participants.filter(p => p?.id).map(p => p.name).join(', ')}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
    </div>
  );
}