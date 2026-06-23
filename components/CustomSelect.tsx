'use client';
import Select from 'react-select';

type Option = { value: string | number; label: string; color?: string };

type Props = {
  options: Option[];
  value: Option | null;
  onChange: (val: Option | null) => void;
  placeholder?: string;
};

const customStyles = {
  control: (base: any) => ({
    ...base,
    background: 'var(--bg-input)',
    borderColor: 'transparent',
    borderRadius: '0.5rem',
    boxShadow: 'none',
    minHeight: '38px',
    '&:hover': { borderColor: 'var(--accent)' },
  }),
  menu: (base: any) => ({
    ...base,
    background: 'var(--bg-card)',
    borderRadius: '0.5rem',
    border: '1px solid var(--bg-hover)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
  }),
  option: (base: any, state: any) => ({
    ...base,
    background: state.isSelected ? 'var(--accent)' : state.isFocused ? 'var(--bg-input)' : 'transparent',
    color: state.isSelected ? '#ffffff' : 'var(--text-primary)',
    cursor: 'pointer',
    borderRadius: '0.25rem',
    margin: '2px 4px',
    width: 'calc(100% - 8px)',
  }),
  singleValue: (base: any) => ({
    ...base,
    color: 'var(--text-primary)',
  }),
  placeholder: (base: any) => ({
    ...base,
    color: 'var(--text-muted)',
  }),
  input: (base: any) => ({
    ...base,
    color: 'var(--text-primary)',
  }),
  indicatorSeparator: () => ({ display: 'none' }),
  dropdownIndicator: (base: any) => ({
    ...base,
    color: 'var(--text-muted)',
    '&:hover': { color: 'var(--accent)' },
  }),
};

export default function CustomSelect({ options, value, onChange, placeholder }: Props) {
  return (
    <Select
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder || 'Выбери...'}
      styles={customStyles}
      isSearchable={false}
    />
  );
}