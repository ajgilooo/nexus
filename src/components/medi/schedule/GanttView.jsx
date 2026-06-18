// src/components/medi/schedule/GanttView.jsx
import { useRef, useState } from 'react';
import { INTERNSHIP_SCHEDULE } from '../../../lib/medi.data.js';
import {
  SCHEDULE_START, SCHEDULE_END, TOTAL_DAYS,
  dayDiff, parseDay, blockColorHex, phaseZones, monthsBetween
} from './scheduleHelpers.js';

const SVG_W  = 960;
const PAD_L  = 112;
const PAD_T  = 58;
const PAD_R  = 16;
const PLOT_W = SVG_W - PAD_L - PAD_R;
const LANE_H = 26;
const LANE_GAP = 22;
const SVG_H  = PAD_T + 2 * (LANE_H + LANE_GAP) + 28;

function xFor(dateStr) {
  const d = dayDiff(SCHEDULE_START, dateStr);
  return PAD_L + (d / TOTAL_DAYS) * PLOT_W;
}

function todayX() {
  const today = new Date();
  const iso = today.getFullYear() + '-'
    + String(today.getMonth() + 1).padStart(2, '0') + '-'
    + String(today.getDate()).padStart(2, '0');
  const d = dayDiff(SCHEDULE_START, iso);
  const x = PAD_L + (d / TOTAL_DAYS) * PLOT_W;
  return Math.max(PAD_L, Math.min(SVG_W - PAD_R, x));
}

const MONTHS = monthsBetween(SCHEDULE_START, SCHEDULE_END);
const ZONES  = phaseZones();

const PHASE_TINTS = {
  'PHASE 1': 'rgba(16,185,129,0.04)',
  'PHASE 2': 'rgba(59,130,246,0.04)',
  'PHASE 3': 'rgba(245,158,11,0.04)',
};

export default function GanttView() {
  const wrapRef = useRef(null);
  const [tip, setTip] = useState(null);
  const tx = todayX();

  function handleEnter(e, block) {
    const r = wrapRef.current.getBoundingClientRect();
    setTip({ left: e.clientX - r.left, top: e.clientY - r.top, block });
  }

  return (
    <div className="gantt-wrap" ref={wrapRef}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', display: 'block' }}
      >
        {/* Phase zone bands */}
        {ZONES.map(z => {
          const zx = xFor(z.start.toISOString().slice(0, 10));
          const zw = xFor(z.end.toISOString().slice(0, 10)) - zx;
          const tint = PHASE_TINTS[z.num] || 'rgba(255,255,255,0.02)';
          return (
            <g key={z.num}>
              <rect x={zx} y={PAD_T - 8} width={zw} height={SVG_H - PAD_T + 4}
                fill={tint} />
              <text x={zx + 6} y={PAD_T - 12} fontSize="8"
                fill="rgba(255,255,255,0.2)" fontFamily="monospace">{z.num}</text>
            </g>
          );
        })}

        {/* Month axis — year labels */}
        {(() => {
          const years = {};
          MONTHS.forEach(mo => {
            if (!years[mo.year]) years[mo.year] = xFor(`${mo.year}-${String(mo.month + 1).padStart(2, '0')}-01`);
          });
          return Object.entries(years).map(([y, x]) => (
            <text key={y} x={x} y={12} fontSize="10" fontWeight="800"
              fill="rgba(255,255,255,0.5)" fontFamily="monospace">{y}</text>
          ));
        })()}

        {/* Month ticks + labels */}
        {MONTHS.map((mo, i) => {
          const moStr = `${mo.year}-${String(mo.month + 1).padStart(2, '0')}-01`;
          const mx = xFor(moStr);
          return (
            <g key={i}>
              <line x1={mx} y1={PAD_T - 8} x2={mx} y2={SVG_H - 8}
                stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
              <text x={mx + 3} y={24} fontSize="8.5"
                fill="rgba(255,255,255,0.35)" fontFamily="monospace">{mo.shortLabel}</text>
            </g>
          );
        })}

        {/* Lane labels */}
        {[
          { label: 'Internship', y: PAD_T + LANE_H / 2 + 5 },
          { label: 'Blitz',      y: PAD_T + LANE_H + LANE_GAP + LANE_H / 2 + 5 },
        ].map(({ label, y }) => (
          <text key={label} x={PAD_L - 8} y={y} textAnchor="end" fontSize="9"
            fill="rgba(255,255,255,0.4)" fontFamily="monospace" fontWeight="700">{label}</text>
        ))}

        {/* Block bars */}
        {INTERNSHIP_SCHEDULE.map(block => {
          const bx = xFor(block.start);
          const bw = Math.max(4, xFor(block.end) - bx);
          const lane = block.type === 'blitz' ? 1 : 0;
          const by = PAD_T + lane * (LANE_H + LANE_GAP);
          const col = blockColorHex(block.type);
          const showLabel = bw >= 36;

          return (
            <g key={block.id}
              onMouseEnter={e => handleEnter(e, block)}
              onMouseLeave={() => setTip(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect x={bx} y={by} width={bw} height={LANE_H} rx="5"
                fill={col} opacity="0.85" />
              {showLabel && (
                <text x={bx + 5} y={by + LANE_H / 2 + 4} fontSize="8"
                  fill="#fff" fontFamily="monospace" fontWeight="700"
                  clipPath={`url(#clip-${block.id})`}>
                  {block.label}
                </text>
              )}
              {showLabel && (
                <clipPath id={`clip-${block.id}`}>
                  <rect x={bx} y={by} width={bw - 4} height={LANE_H} />
                </clipPath>
              )}
            </g>
          );
        })}

        {/* Today line */}
        {tx >= PAD_L && tx <= SVG_W - PAD_R && (
          <g>
            <line x1={tx} y1={PAD_T - 10} x2={tx} y2={SVG_H - 8}
              stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx={tx} cy={PAD_T - 10} r="3.5" fill="#10B981" />
            <text x={tx + 5} y={PAD_T - 13} fontSize="8.5"
              fill="#10B981" fontFamily="monospace" fontWeight="700">Today</text>
          </g>
        )}
      </svg>

      {/* Hover tooltip */}
      {tip && (
        <div className="gantt-tooltip" style={{ left: tip.left + 12, top: tip.top - 8 }}>
          <div className="gantt-tt-label">{tip.block.label}</div>
          <div className="gantt-tt-dates">{tip.block.start} – {tip.block.end}</div>
          <div className={`gantt-tt-type gantt-type--${tip.block.type}`}>{tip.block.type}</div>
          {(tip.block.primarySubjects || []).slice(0, 3).map(s => (
            <div key={s} className="gantt-tt-subj">{s}</div>
          ))}
          {tip.block.type === 'blitz' && (
            <div className="gantt-tt-blitz">{tip.block.dailyTarget}+ Q/day · {tip.block.studyHours} hrs</div>
          )}
          {tip.block.note && (
            <div className="gantt-tt-note">{tip.block.note}</div>
          )}
        </div>
      )}
    </div>
  );
}
