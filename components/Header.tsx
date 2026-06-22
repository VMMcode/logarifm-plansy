'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export default function Header() {
  const [motto, setMotto] = useState('');

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(d => setMotto(d.motto || ''));
  }, []);

  return (
    <header style={{
      width: '100%',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      background: 'rgba(255,255,255,0.6)',
      borderBottom: '1px solid rgba(30,62,146,0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      padding: '0.75rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Image src="/logo.png" alt="Логотип" height={40} width={120} style={{ objectFit: 'contain', objectPosition: 'left' }} />
      {motto && (
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.875rem',
          fontStyle: 'italic',
          margin: 0,
          textAlign: 'right',
          maxWidth: '60%',
        }}>
          {motto}
        </p>
      )}
    </header>
  );
}