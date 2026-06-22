'use client';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ru } from 'date-fns/locale';
import CustomSelect from './CustomSelect';

type Props = {
  value: string;
  onChange: (val: string) => void;
};

export default function DateTimePicker({ value, onChange }: Props) {
  const date = value ? new Date(value) : null;

  const hours = date ? date.getHours() : null;
  const minutes = date ? date.getMinutes() : null;

  const hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0'),
  }));

  const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
    value: i,
    label: String(i).padStart(2, '0'),
  }));

  function handleDateChange(d: Date | null) {
    if (!d) return;
    const h = hours ?? 0;
    const m = minutes ?? 0;
    d.setHours(h, m);
    emit(d);
  }

  function handleHourChange(val: { value: string | number } | null) {
    const d = date ? new Date(date) : new Date();
    d.setHours(Number(val?.value ?? 0), minutes ?? 0);
    emit(d);
  }

  function handleMinuteChange(val: { value: string | number } | null) {
    const d = date ? new Date(date) : new Date();
    d.setHours(hours ?? 0, Number(val?.value ?? 0));
    emit(d);
  }

  function emit(d: Date) {
    const iso = d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0') + 'T' +
      String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0');
    onChange(iso);
  }

  return (
    <>
      <style>{`
        .custom-datepicker-wrapper { width: 100%; }
        .custom-datepicker-input {
          background: var(--bg-input);
          color: var(--text-primary);
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: none;
          outline: none;
          width: 100%;
          box-sizing: border-box;
          font-family: 'Comfortaa', sans-serif;
          font-size: 1rem;
          cursor: pointer;
        }
        .react-datepicker {
          font-family: 'Comfortaa', sans-serif !important;
          background: var(--bg-card) !important;
          border: 1px solid var(--bg-hover) !important;
          border-radius: 0.75rem !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
          overflow: hidden;
        }
        .react-datepicker__header {
          background: var(--bg-input) !important;
          border-bottom: 1px solid var(--bg-hover) !important;
          padding: 0.75rem 0 !important;
        }
        .react-datepicker__current-month {
          color: var(--text-primary) !important;
          font-weight: 600 !important;
        }
        .react-datepicker__day-name {
          color: var(--text-muted) !important;
        }
        .react-datepicker__day {
          color: var(--text-primary) !important;
          border-radius: 0.375rem !important;
        }
        .react-datepicker__day:hover {
          background: var(--bg-input) !important;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background: var(--accent) !important;
          color: #ffffff !important;
        }
        .react-datepicker__day--today {
          font-weight: 700 !important;
          color: var(--accent) !important;
        }
        .react-datepicker__day--today.react-datepicker__day--selected {
          color: #ffffff !important;
        }
        .react-datepicker__navigation-icon::before {
          border-color: var(--text-muted) !important;
        }
        .react-datepicker__triangle { display: none !important; }
      `}</style>

      <DatePicker
        selected={date}
        onChange={handleDateChange}
        dateFormat="dd.MM.yyyy"
        locale={ru}
        placeholderText="Выбери дату"
        wrapperClassName="custom-datepicker-wrapper"
        className="custom-datepicker-input"
        popperPlacement="bottom-start"
      />

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <CustomSelect
            options={hourOptions}
            value={hours !== null ? { value: hours, label: String(hours).padStart(2, '0') } : null}
            onChange={handleHourChange}
            placeholder="Час"
          />
        </div>
        <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>:</span>
        <div style={{ flex: 1 }}>
          <CustomSelect
            options={minuteOptions}
            value={minutes !== null ? { value: minutes, label: String(minutes).padStart(2, '0') } : null}
            onChange={handleMinuteChange}
            placeholder="Мин"
          />
        </div>
      </div>
    </>
  );
}