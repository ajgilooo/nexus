// src/components/Hexagon.jsx
// 6-axis radar (hexagon) reusing the geometry from AnalyticsView's Radar (§4.9, n=6).
// angle(i) = 2π/6·i − π/2, clockwise from top.

import { computeAxes, AXIS_ORDER } from '../lib/rpg.logic.js';

export default function Hexagon({ doc, size = 240 }) {
  const axes = computeAxes(doc);
  const n = 6;
  const cx = size / 2, cy = size / 2, R = size * 0.36;

  function pt(i, v) {
    const angle = (2 * Math.PI / n) * i - Math.PI / 2;
    return [cx + R * v * Math.cos(angle), cy + R * v * Math.sin(angle)];
  }

  const vals = AXIS_ORDER.map(name => axes[name] / 100);
  const polyPoints = vals.map((v, i) => pt(i, v).join(',')).join(' ');

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ overflow: 'visible' }}>
        {/* Grid rings */}
        {[0.25, 0.5, 0.75, 1].map(r => {
          const ring = AXIS_ORDER.map((_, i) => pt(i, r).join(',')).join(' ');
          return <polygon key={r} points={ring} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1" />;
        })}
        {/* Axis lines */}
        {AXIS_ORDER.map((_, i) => {
          const [x, y] = pt(i, 1);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />;
        })}
        {/* Data polygon */}
        <polygon points={polyPoints} fill="rgba(45,212,167,.18)" stroke="var(--accent)" strokeWidth="1.8" />
        {/* Dots */}
        {vals.map((v, i) => {
          const [x, y] = pt(i, v);
          return <circle key={i} cx={x} cy={y} r="3.5" fill="var(--accent)" />;
        })}
        {/* Labels */}
        {AXIS_ORDER.map((name, i) => {
          const [lx, ly] = pt(i, 1.38);
          const val = axes[name];
          return (
            <text key={name} x={lx} y={ly} textAnchor="middle" dy="4"
              fill="rgba(255,255,255,0.65)" fontSize={size < 200 ? 8 : 10}
              fontFamily="var(--font-sans)" fontWeight="700">
              {name} {val.toFixed(0)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
