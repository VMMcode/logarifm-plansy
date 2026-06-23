'use client';
import { useState, useEffect } from 'react';
import CustomSelect from '@/components/CustomSelect';
import DateTimePicker from '@/components/DateTimePicker';

type Employee = { id: number; name: string; username: string };
type EventType = { id: number; name: string; color: string };
type Event = { id: number; title: string; type_id: number; type_name: string; type_color: string; date: string; description: string; participants: Employee[] };

const GearIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const TrashIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const PencilIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [newEmp, setNewEmp] = useState({ name: '', username: '' });
  const [newType, setNewType] = useState({ name: '', color: '#1E3E92' });
  const [newEvent, setNewEvent] = useState({ title: '', type_id: '' as string | number, date: '', description: '', participant_ids: [] as number[] });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [eventFilter, setEventFilter] = useState<number | 'all'>('all');
  const [tab, setTab] = useState<'employees' | 'types' | 'events' | 'settings'>('events');
  const [motto, setMotto] = useState('');
  const [mottoInput, setMottoInput] = useState('');

  // Авто-вход по сохранённому паролю
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('admin_password') : null;
    if (saved) {
      fetch('/api/employees', { headers: { 'x-admin-password': saved } }).then(r => {
        if (r.ok) { setPassword(saved); setAuthed(true); loadWith(saved); }
        else localStorage.removeItem('admin_password');
      });
    }
  }, []);

  const headers = { 'Content-Type': 'application/json', 'x-admin-password': password };

  async function loadWith(pw: string) {
    const [e, et, ev, st] = await Promise.all([
      fetch('/api/employees', { headers: { 'x-admin-password': pw } }).then(r => r.json()),
      fetch('/api/event-types').then(r => r.json()),
      fetch('/api/events').then(r => r.json()),
      fetch('/api/settings').then(r => r.json()),
    ]);
    setEmployees(e);
    setEventTypes(et);
    setEvents(ev);
    setMotto(st.motto || '');
    setMottoInput(st.motto || '');
  }

  function load() { return loadWith(password); }

  async function checkAuth() {
    const r = await fetch('/api/employees', { headers: { 'x-admin-password': password } });
    if (r.ok) {
      setAuthed(true);
      localStorage.setItem('admin_password', password);
      load();
    } else alert('Неверный пароль');
  }

  async function addEmployee() {
    if (!newEmp.name || !newEmp.username) return;
    await fetch('/api/employees', { method: 'POST', headers, body: JSON.stringify(newEmp) });
    setNewEmp({ name: '', username: '' });
    load();
  }

  async function deleteEmployee(id: number) {
    await fetch('/api/employees', { method: 'DELETE', headers, body: JSON.stringify({ id }) });
    load();
  }

  async function addType() {
    if (!newType.name) return;
    await fetch('/api/event-types', { method: 'POST', headers, body: JSON.stringify(newType) });
    setNewType({ name: '', color: '#1E3E92' });
    load();
  }

  async function deleteType(id: number) {
    await fetch('/api/event-types', { method: 'DELETE', headers, body: JSON.stringify({ id }) });
    load();
  }

  function resetEventForm() {
    setNewEvent({ title: '', type_id: '', date: '', description: '', participant_ids: [] });
    setEditingId(null);
  }

  async function saveEvent() {
    if (!newEvent.title || !newEvent.type_id || !newEvent.date) return;
    const body = { ...newEvent, type_id: Number(newEvent.type_id) };
    if (editingId) {
      await fetch('/api/events', { method: 'PUT', headers, body: JSON.stringify({ ...body, id: editingId }) });
    } else {
      await fetch('/api/events', { method: 'POST', headers, body: JSON.stringify(body) });
    }
    resetEventForm();
    load();
  }

  function startEdit(event: Event) {
    setEditingId(event.id);
    setNewEvent({
      title: event.title,
      type_id: event.type_id,
      date: event.date,
      description: event.description || '',
      participant_ids: event.participants?.filter(p => p?.id).map(p => p.id) || [],
    });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deleteEvent(id: number) {
    await fetch('/api/events', { method: 'DELETE', headers, body: JSON.stringify({ id }) });
    if (editingId === id) resetEventForm();
    load();
  }

  async function saveMotto() {
    await fetch('/api/settings', { method: 'POST', headers, body: JSON.stringify({ key: 'motto', value: mottoInput }) });
    setMotto(mottoInput);
  }

  function toggleParticipant(id: number) {
    setNewEvent(prev => ({
      ...prev,
      participant_ids: prev.participant_ids.includes(id)
        ? prev.participant_ids.filter(p => p !== id)
        : [...prev.participant_ids, id]
    }));
  }

  function toggleAllParticipants() {
    setNewEvent(prev => ({
      ...prev,
      participant_ids: prev.participant_ids.length === employees.length ? [] : employees.map(e => e.id),
    }));
  }

  const s = {
    page: { minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', padding: '1rem' } as React.CSSProperties,
    card: { background: 'var(--bg-card)', borderRadius: '1rem', padding: '1.25rem' } as React.CSSProperties,
    input: { background: 'var(--bg-input)', color: 'var(--text-primary)', padding: '0.6rem 0.75rem', borderRadius: '0.5rem', border: 'none', outline: 'none', width: '100%', boxSizing: 'border-box', minHeight: '44px' } as React.CSSProperties,
    btn: { background: 'var(--accent)', color: '#ffffff', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: '44px' } as React.CSSProperties,
    btnGhost: { background: 'var(--bg-input)', color: 'var(--text-primary)', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: '44px' } as React.CSSProperties,
    row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-input)', padding: '0.5rem 1rem', borderRadius: '0.5rem' } as React.CSSProperties,
    label: { color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '0.35rem', display: 'block' } as React.CSSProperties,
    iconBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0.35rem' } as React.CSSProperties,
  };

  const typeOptions = eventTypes.map(t => ({ value: t.id, label: t.name, color: t.color }));
  const selectedType = typeOptions.find(o => o.value === Number(newEvent.type_id)) || null;
  const allSelected = employees.length > 0 && newEvent.participant_ids.length === employees.length;
  const filteredEvents = eventFilter === 'all' ? events : events.filter(e => e.type_id === eventFilter);

  if (!authed) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ ...s.card, width: '300px', maxWidth: '100%', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h1 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700 }}>Вход</h1>
        <input type="password" placeholder="Пароль" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && checkAuth()}
          style={s.input} />
        <button onClick={checkAuth} style={s.btn}>Войти</button>
      </div>
    </div>
  );

  return (
    <div style={s.page}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '0.5rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Управление</h1>
          <a href="/" style={{
            background: 'var(--bg-card)', color: 'var(--text-secondary)', fontSize: '0.875rem',
            textDecoration: 'none', padding: '0.5rem 1rem', borderRadius: '999px',
            display: 'inline-flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap',
            transition: 'background 0.15s, color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >← Календарь</a>
        </div>

        {/* Табы */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['events', 'types', 'employees', 'settings'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              style={{ ...(tab === t ? s.btn : s.btnGhost), flex: '1 1 0', minWidth: t === 'settings' ? '56px' : '90px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
              {t === 'events' ? 'События' : t === 'types' ? 'Типы' : t === 'employees' ? 'Сотрудники' : <GearIcon size={18} />}
            </button>
          ))}
        </div>

        {/* Сотрудники */}
        {tab === 'employees' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={s.card}>
              <p style={s.label}>Добавить сотрудника</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input placeholder="Имя" value={newEmp.name} onChange={e => setNewEmp(p => ({ ...p, name: e.target.value }))} style={s.input} />
                <input placeholder="@username" value={newEmp.username} onChange={e => setNewEmp(p => ({ ...p, username: e.target.value }))} style={s.input} />
                <button onClick={addEmployee} style={s.btn}>Добавить</button>
              </div>
            </div>
            <div style={s.card}>
              <p style={s.label}>Список</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {employees.map(emp => (
                  <div key={emp.id} style={s.row}>
                    <span>{emp.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>@{emp.username}</span></span>
                    <button onClick={() => deleteEmployee(emp.id)} style={{ ...s.iconBtn, color: 'var(--danger)' }} aria-label="Удалить"><TrashIcon /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Типы */}
        {tab === 'types' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={s.card}>
              <p style={s.label}>Новый тип</p>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input placeholder="Название" value={newType.name} onChange={e => setNewType(p => ({ ...p, name: e.target.value }))} style={s.input} />
                <input type="color" value={newType.color} onChange={e => setNewType(p => ({ ...p, color: e.target.value }))}
                  style={{ width: '44px', height: '44px', borderRadius: '0.5rem', border: 'none', background: 'var(--bg-input)', cursor: 'pointer', padding: '2px', flexShrink: 0 }} />
                <button onClick={addType} style={s.btn}>+</button>
              </div>
            </div>
            <div style={s.card}>
              <p style={s.label}>Список</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {eventTypes.map(t => (
                  <div key={t.id} style={s.row}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '14px', height: '14px', borderRadius: '3px', background: t.color, flexShrink: 0 }} />
                      <span>{t.name}</span>
                    </div>
                    <button onClick={() => deleteType(t.id)} style={{ ...s.iconBtn, color: 'var(--danger)' }} aria-label="Удалить"><TrashIcon /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* События */}
        {tab === 'events' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <p style={{ ...s.label, marginBottom: 0 }}>{editingId ? 'Редактировать событие' : 'Новое событие'}</p>
                {editingId && (
                  <button onClick={resetEventForm} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}>Отмена</button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input placeholder="Название" value={newEvent.title} onChange={e => setNewEvent(p => ({ ...p, title: e.target.value }))} style={s.input} />
                <CustomSelect
                  options={typeOptions}
                  value={selectedType}
                  onChange={val => setNewEvent(p => ({ ...p, type_id: val?.value ?? '' }))}
                  placeholder="Выбери тип"
                />
                <DateTimePicker
                  value={newEvent.date}
                  onChange={val => setNewEvent(p => ({ ...p, date: val }))}
                />
                <textarea placeholder="Описание (опционально)" value={newEvent.description}
                  onChange={e => setNewEvent(p => ({ ...p, description: e.target.value }))}
                  style={{ ...s.input, resize: 'none', height: '70px' }} />
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <p style={{ ...s.label, marginBottom: 0 }}>Участники:</p>
                    {employees.length > 0 && (
                      <button onClick={toggleAllParticipants}
                        style={{ background: 'var(--bg-input)', color: 'var(--text-secondary)', border: 'none', borderRadius: '999px', padding: '0.25rem 0.75rem', fontSize: '0.8rem', cursor: 'pointer' }}>
                        {allSelected ? 'Снять всех' : 'Добавить всех'}
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {employees.map(emp => (
                      <button key={emp.id} onClick={() => toggleParticipant(emp.id)}
                        style={{ background: newEvent.participant_ids.includes(emp.id) ? 'var(--accent)' : 'var(--bg-input)', color: newEvent.participant_ids.includes(emp.id) ? '#ffffff' : 'var(--text-primary)', padding: '0.4rem 0.75rem', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
                        {emp.name}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={saveEvent} style={s.btn}>{editingId ? 'Сохранить' : 'Добавить'}</button>
              </div>
            </div>

            <div style={s.card}>
              <p style={s.label}>Список</p>

              {/* Вкладки по типам */}
              <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '0.5rem', WebkitOverflowScrolling: 'touch' }}>
                <button onClick={() => setEventFilter('all')}
                  style={{
                    flexShrink: 0, padding: '0.35rem 0.85rem', borderRadius: '999px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap',
                    background: eventFilter === 'all' ? 'var(--accent)' : 'var(--bg-input)',
                    color: eventFilter === 'all' ? '#ffffff' : 'var(--text-secondary)',
                  }}>Все</button>
                {eventTypes.map(t => {
                  const active = eventFilter === t.id;
                  return (
                    <button key={t.id} onClick={() => setEventFilter(t.id)}
                      style={{
                        flexShrink: 0, padding: '0.35rem 0.85rem', borderRadius: '999px', border: active ? 'none' : `1px solid ${t.color}`, cursor: 'pointer', fontSize: '0.8rem', whiteSpace: 'nowrap',
                        background: active ? t.color : 'transparent',
                        color: active ? '#ffffff' : t.color,
                      }}>{t.name}</button>
                  );
                })}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {filteredEvents.map(event => (
                  <div key={event.id} style={{ ...s.row, alignItems: 'flex-start', borderLeft: `3px solid ${event.type_color || 'var(--accent)'}` }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontWeight: 500, fontSize: '0.9rem', margin: '0 0 0.2rem' }}>{event.title}
                        <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{event.type_name}</span>
                      </p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>{new Date(event.date).toLocaleString('ru-RU')}</p>
                      {event.description && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.2rem 0 0' }}>{event.description}</p>}
                      {event.participants?.filter(p => p?.id).length > 0 && (
                        <>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', margin: '0.25rem 0 0.1rem', fontWeight: 600 }}>Представители команды:</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
                            {event.participants.filter(p => p?.id).map(p => p.name).join(', ')}
                          </p>
                        </>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.1rem', marginLeft: '0.5rem', flexShrink: 0 }}>
                      <button onClick={() => startEdit(event)} style={{ ...s.iconBtn, color: 'var(--text-secondary)' }} aria-label="Редактировать"><PencilIcon /></button>
                      <button onClick={() => deleteEvent(event.id)} style={{ ...s.iconBtn, color: 'var(--danger)' }} aria-label="Удалить"><TrashIcon /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Настройки */}
        {tab === 'settings' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={s.card}>
              <p style={s.label}>Девиз команды</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  placeholder="Введи мотивирующую фразу..."
                  value={mottoInput}
                  onChange={e => setMottoInput(e.target.value)}
                  style={s.input}
                />
                <button onClick={saveMotto} style={s.btn}>Сохранить</button>
                {motto && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Текущий: {motto}</p>}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
