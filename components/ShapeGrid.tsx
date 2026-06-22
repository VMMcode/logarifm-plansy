'use client';
import { useEffect, useRef } from 'react';

export default function ShapeGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 40;
    let mouse = { x: -999, y: -999 };

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      draw();
    }

    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cols = Math.ceil(canvas.width / size) + 1;
      const rows = Math.ceil(canvas.height / size) + 1;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * size;
          const y = r * size;
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 120;
          const isHover = dist < maxDist;

          ctx.strokeStyle = isHover ? '#1E3E92' : '#c8ccd8';
          ctx.lineWidth = isHover ? 1.5 : 0.8;
          ctx.globalAlpha = isHover ? 0.6 : 0.35;

          ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
        }
      }
      ctx.globalAlpha = 1;
    }

    function onMouseMove(e: MouseEvent) {
      mouse = { x: e.clientX, y: e.clientY };
      draw();
    }

    function onMouseLeave() {
      mouse = { x: -999, y: -999 };
      draw();
    }

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}