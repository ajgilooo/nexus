// src/components/medi/VelocityChart.jsx
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';
import { dailyHistorySeries } from '../../lib/medi.logic.js';

function VeloTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="velo-tooltip">
      <div className="velo-tt-label">{label}</div>
      <div style={{ color: '#10B981' }}>{payload[0]?.value ?? 0} Q</div>
      <div style={{ color: '#A78BFA' }}>{Number(payload[1]?.value ?? 0).toFixed(1)} 7d avg</div>
    </div>
  );
}

export default function VelocityChart({ state }) {
  const data = dailyHistorySeries(state, 30);
  if (data.every(d => d.count === 0)) {
    return (
      <div className="an-panel velo-panel">
        <div className="an-panel-title">Study Velocity — 30 days</div>
        <div className="velo-empty">No questions logged yet. Start a session to see velocity.</div>
      </div>
    );
  }
  return (
    <div className="an-panel velo-panel">
      <div className="an-panel-title">Study Velocity — 30 days</div>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="vFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}
            axisLine={{ stroke: '#283648' }}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={28}
          />
          <YAxis
            tick={{ fill: '#94A3B8', fontSize: 10, fontFamily: 'IBM Plex Mono, monospace' }}
            axisLine={false}
            tickLine={false}
            width={32}
          />
          <Tooltip content={<VeloTooltip />} cursor={{ stroke: '#283648' }} />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#vFill)"
            dot={false}
            activeDot={{ r: 4, fill: '#10B981' }}
          />
          <Area
            type="monotone"
            dataKey="avg7"
            stroke="#A78BFA"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            fill="none"
            dot={false}
            activeDot={{ r: 3, fill: '#A78BFA' }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="velo-legend">
        <span className="velo-legend-item velo-q">Daily Q count</span>
        <span className="velo-legend-item velo-avg">7-day avg</span>
      </div>
    </div>
  );
}
