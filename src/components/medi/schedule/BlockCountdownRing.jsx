// src/components/medi/schedule/BlockCountdownRing.jsx
// mode='countdown' → D-N days left arc
// mode='coverage'  → percentage arc (used in 12-subject coverage grid)

export default function BlockCountdownRing({
  // countdown mode
  daysRemaining = 0,
  blockDuration = 1,
  isUpcoming = false,
  // coverage mode
  pct = 0,
  avgScore = null,
  // shared
  size = 120,
  mode = 'countdown',
}) {
  const stroke = size * 0.083;
  const cx = size / 2, cy = size / 2;
  const r  = cx - stroke;
  const circ = 2 * Math.PI * r;

  let frac, color, centerTop, centerBottom;

  if (mode === 'coverage') {
    frac        = Math.min(1, Math.max(0, pct / 100));
    color       = pct >= 70 ? '#10B981' : pct >= 40 ? '#F59E0B' : '#EF4444';
    centerTop   = Math.round(pct) + '%';
    centerBottom = avgScore !== null ? `${Math.round(avgScore)}% sc` : null;
  } else {
    frac        = blockDuration > 0
      ? Math.min(1, Math.max(0, (blockDuration - daysRemaining) / blockDuration))
      : 0;
    color       = isUpcoming ? '#94A3B8'
                : daysRemaining <= 2 ? '#EF4444'
                : daysRemaining <= 5 ? '#F59E0B'
                : '#10B981';
    centerTop   = isUpcoming ? `+${daysRemaining}` : `D-${daysRemaining}`;
    centerBottom = isUpcoming ? 'days away' : 'days left';
  }

  const dash = circ * frac;
  const fs1  = size * 0.185;
  const fs2  = size * 0.085;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="block-ring"
      style={{ flexShrink: 0 }}
    >
      {/* Track */}
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      {/* Arc */}
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }}
      />
      {/* Center top label */}
      <text x={cx} y={cy - (centerBottom ? size * 0.04 : 0)}
        textAnchor="middle" dy="0.35em"
        fill={color} fontSize={fs1} fontWeight="800"
        fontFamily="'IBM Plex Mono', monospace">
        {centerTop}
      </text>
      {/* Center bottom label */}
      {centerBottom && (
        <text x={cx} y={cy + size * 0.17}
          textAnchor="middle"
          fill="rgba(255,255,255,0.35)" fontSize={fs2}
          fontFamily="'IBM Plex Mono', monospace">
          {centerBottom}
        </text>
      )}
    </svg>
  );
}
