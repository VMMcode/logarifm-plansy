'use client';
import { useRef, useEffect } from 'react';
import './ShapeGrid.css';

type Direction = 'up' | 'down' | 'left' | 'right' | 'diagonal';
type Shape = 'square' | 'hexagon' | 'circle' | 'triangle';

interface ShapeGridProps {
  direction?: Direction;
  speed?: number;
  borderColor?: string;
  squareSize?: number;
  hoverFillColor?: string;
  shape?: Shape;
  hoverTrailAmount?: number;
  randomFill?: boolean;
  randomInterval?: number;
  className?: string;
}

interface GridSquare {
  x: number;
  y: number;
}

interface RandomSquare extends GridSquare {
  born: number;
}

const ShapeGrid = ({
  direction = 'right',
  speed = 1,
  borderColor = '#999',
  squareSize = 40,
  hoverFillColor = '#222',
  shape = 'square',
  hoverTrailAmount = 0,
  randomFill = false,
  randomInterval = 450,
  className = ''
}: ShapeGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const requestRef = useRef<number | null>(null);
  const numSquaresX = useRef(0);
  const numSquaresY = useRef(0);
  const gridOffset = useRef({ x: 0, y: 0 });
  const hoveredSquareRef = useRef<GridSquare | null>(null);
  const trailRef = useRef<GridSquare[]>([]);
  const randomRef = useRef<RandomSquare[]>([]);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      numSquaresX.current = Math.ceil(canvas.width / squareSize) + 1;
      numSquaresY.current = Math.ceil(canvas.height / squareSize) + 1;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const drawShape = (px: number, py: number, fill: boolean) => {
      const s = squareSize;
      const cx = px + s / 2;
      const cy = py + s / 2;
      const r = s / 2;

      ctx.beginPath();
      switch (shape) {
        case 'circle':
          ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
          break;
        case 'triangle':
          ctx.moveTo(cx, py + s * 0.1);
          ctx.lineTo(px + s * 0.9, py + s * 0.9);
          ctx.lineTo(px + s * 0.1, py + s * 0.9);
          ctx.closePath();
          break;
        case 'hexagon': {
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const hx = cx + r * 0.9 * Math.cos(angle);
            const hy = cy + r * 0.9 * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          break;
        }
        case 'square':
        default:
          ctx.rect(px, py, s, s);
          break;
      }
      if (fill) ctx.fill();
      else ctx.stroke();
    };

    const RANDOM_LIFE = 1600; // мс жизни случайной подсветки

    const drawGrid = (now: number) => {
      if (!canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      ctx.lineWidth = 1;

      for (let x = startX; x < canvas.width + squareSize; x += squareSize) {
        for (let y = startY; y < canvas.height + squareSize; y += squareSize) {
          const squareX = x - (gridOffset.current.x % squareSize);
          const squareY = y - (gridOffset.current.y % squareSize);

          const gx = Math.floor((x - startX) / squareSize);
          const gy = Math.floor((y - startY) / squareSize);

          // Hover + trail fill
          const trailIndex = trailRef.current.findIndex(t => t.x === gx && t.y === gy);
          const isHovered =
            hoveredSquareRef.current && hoveredSquareRef.current.x === gx && hoveredSquareRef.current.y === gy;

          let fillAlpha = 0;
          if (isHovered || trailIndex !== -1) {
            const depth = isHovered ? 0 : trailIndex + 1;
            fillAlpha = Math.max(fillAlpha, 1 - depth / (hoverTrailAmount + 1));
          }

          // Случайная подсветка клеток
          const rnd = randomRef.current.find(r => r.x === gx && r.y === gy);
          if (rnd) {
            const age = now - rnd.born;
            const life = 1 - age / RANDOM_LIFE;
            // плавное появление и затухание
            const eased = Math.sin(Math.max(0, Math.min(1, life)) * Math.PI);
            fillAlpha = Math.max(fillAlpha, eased * 0.85);
          }

          if (fillAlpha > 0) {
            ctx.globalAlpha = fillAlpha;
            ctx.fillStyle = hoverFillColor;
            drawShape(squareX, squareY, true);
            ctx.globalAlpha = 1;
          }

          ctx.strokeStyle = borderColor;
          drawShape(squareX, squareY, false);
        }
      }
    };

    const updateAnimation = (now: number) => {
      // Спавн и очистка случайных подсветок
      if (randomFill) {
        randomRef.current = randomRef.current.filter(r => now - r.born < RANDOM_LIFE);
        if (now - lastSpawnRef.current > randomInterval) {
          lastSpawnRef.current = now;
          randomRef.current.push({
            x: Math.floor(Math.random() * numSquaresX.current),
            y: Math.floor(Math.random() * numSquaresY.current),
            born: now,
          });
        }
      }

      const effectiveSpeed = Math.max(speed, 0.1);
      switch (direction) {
        case 'right':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          break;
        case 'left':
          gridOffset.current.x = (gridOffset.current.x + effectiveSpeed + squareSize) % squareSize;
          break;
        case 'up':
          gridOffset.current.y = (gridOffset.current.y + effectiveSpeed + squareSize) % squareSize;
          break;
        case 'down':
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
        case 'diagonal':
          gridOffset.current.x = (gridOffset.current.x - effectiveSpeed + squareSize) % squareSize;
          gridOffset.current.y = (gridOffset.current.y - effectiveSpeed + squareSize) % squareSize;
          break;
        default:
          break;
      }

      drawGrid(now);
      requestRef.current = requestAnimationFrame(updateAnimation);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const startX = Math.floor(gridOffset.current.x / squareSize) * squareSize;
      const startY = Math.floor(gridOffset.current.y / squareSize) * squareSize;

      const hoveredSquareX = Math.floor((mouseX + gridOffset.current.x - startX) / squareSize);
      const hoveredSquareY = Math.floor((mouseY + gridOffset.current.y - startY) / squareSize);

      const prev = hoveredSquareRef.current;
      if (!prev || prev.x !== hoveredSquareX || prev.y !== hoveredSquareY) {
        if (prev && hoverTrailAmount > 0) {
          trailRef.current.unshift({ x: prev.x, y: prev.y });
          trailRef.current = trailRef.current.slice(0, hoverTrailAmount);
        }
        hoveredSquareRef.current = { x: hoveredSquareX, y: hoveredSquareY };
      }
    };

    const handleMouseLeave = () => {
      hoveredSquareRef.current = null;
      trailRef.current = [];
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    requestRef.current = requestAnimationFrame(updateAnimation);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [direction, speed, borderColor, hoverFillColor, squareSize, shape, hoverTrailAmount, randomFill, randomInterval]);

  return <canvas ref={canvasRef} className={`shapegrid-canvas ${className}`} />;
};

export default ShapeGrid;
