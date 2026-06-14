// src/components/kinetix/StatusTab.jsx
import { paces, fmtP, fmtT, predict } from '../../lib/kinetix.logic.js';
import { DEFAULT_BM } from '../../lib/kinetix.data.js';

const JUN14_SPLITS = [
  { dist: '5 km',  time: '0:33:22', pace: '6:40' },
  { dist: '10 km', time: '1:06:47', pace: '6:41' },
  { dist: '15 km', time: '1:44:11', pace: '7:29' },
  { dist: '21 km', time: '2:23:22', pace: '7:57' },
];

const BENCHMARKS_HISTORY = [
  { label: 'Jun 14 2026 — HM',    dist: 21.0975, t: 8602, note: '29 °C / 80 % RH · after internship night call. Current benchmark.' },
];

export default function StatusTab({ doc }) {
  const bm = doc.kinetix.bm || DEFAULT_BM;
  const heat = doc.kinetix.heat;
  const p = paces(bm);

  const metrics = [
    { label: 'Current BM distance', value: bm.d + ' km'    },
    { label: 'Current BM time',     value: fmtT(bm.t)      },
    { label: 'Marathon pace',       value: fmtP(p.mp, true, heat) + '/km' },
    { label: 'Threshold pace',      value: fmtP(p.thr, true, heat) + '/km' },
    { label: 'VO₂ pace',            value: fmtP(p.i, true, heat) + '/km'  },
    { label: 'Riegel marathon',     value: fmtT(predict(bm, 42.195))       },
    { label: 'Riegel 10 km',        value: fmtT(predict(bm, 10))           },
    { label: 'Riegel 5 km',         value: fmtT(predict(bm, 5))            },
    { label: 'Easy Z2 (low)',       value: fmtP(p.ezLo, true, heat) + '/km'},
    { label: 'Easy Z2 (high)',      value: fmtP(p.ezHi, true, heat) + '/km'},
    { label: 'Sub-4 GMP',           value: '5:41/km' },
    { label: 'Sub-3:45 GMP',        value: '5:19/km' },
  ];

  return (
    <div className="static-section">
      {/* Jun 14 callout */}
      <div className="callout">
        <p style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: 4 }}>
          Jun 14 HM: 2:23:22 · 29 °C / 80 % RH · 6:47/km avg
        </p>
        <p>
          Internship-era benchmark, post night call, in peak Philippines heat. Riegel predicts 4:55 marathon → sub-4 is achievable by Nov 8 with structured training. This is the foundation everything builds from.
        </p>
      </div>

      {/* Current metric grid */}
      <div className="static-card">
        <div className="static-card-title">Current Pace Engine</div>
        <p style={{ fontSize: '0.72rem', color: 'var(--mut)', marginBottom: 10 }}>
          All values computed from benchmark: {bm.label}
          {heat && <span style={{ color: 'var(--race)', marginLeft: 8 }}>· Heat +20 s/km active</span>}
        </p>
        <div className="metric-grid">
          {metrics.map(m => (
            <div key={m.label} className="metric-tile">
              <div className="metric-tile-label">{m.label}</div>
              <div className="metric-tile-value">{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Jun 14 splits */}
      <div className="static-card">
        <div className="static-card-title">Jun 14 HM — Split Detail</div>
        <p style={{ fontSize: '0.75rem', color: 'var(--mut)', marginBottom: 10 }}>
          Strong front half, heat slowed the back. The positive-split pattern is the exact thing the training plan corrects by Nov 8.
        </p>
        <table className="splits-table">
          <thead>
            <tr>
              <th>Distance</th>
              <th>Cumulative</th>
              <th>Pace /km</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>5 km</td>
              <td>0:33:22</td>
              <td>6:40</td>
              <td style={{ color: 'var(--mut)', fontSize: '0.72rem' }}>Fresh legs, morning heat building</td>
            </tr>
            <tr>
              <td>10 km</td>
              <td>1:06:47</td>
              <td>6:41</td>
              <td style={{ color: 'var(--mut)', fontSize: '0.72rem' }}>Even split — good control</td>
            </tr>
            <tr>
              <td>15 km</td>
              <td>1:44:11</td>
              <td>7:29</td>
              <td style={{ color: 'var(--warn)', fontSize: '0.72rem' }}>Heat hits, glycogen dip</td>
            </tr>
            <tr>
              <td>21 km</td>
              <td>2:23:22</td>
              <td>7:57</td>
              <td style={{ color: 'var(--warn)', fontSize: '0.72rem' }}>Fade — corrected by race fueling</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Goal timeline */}
      <div className="static-card">
        <div className="static-card-title">Goal Milestones</div>
        <table className="splits-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Event</th>
              <th>Goal</th>
              <th>Key qualifier</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sep 6 2026</td>
              <td>32 km long run</td>
              <td>last 16 km @ 5:42–5:50</td>
              <td style={{ color: 'var(--mut)', fontSize: '0.72rem' }}>Dress rehearsal for Nov 8</td>
            </tr>
            <tr>
              <td>Nov 8 2026</td>
              <td>Marathon</td>
              <td style={{ color: 'var(--ez)' }}>sub-4:00 · 5:41/km</td>
              <td style={{ color: 'var(--mut)', fontSize: '0.72rem' }}>Primary Cycle 1 goal</td>
            </tr>
            <tr>
              <td>Feb 2027</td>
              <td>Bouldering comp</td>
              <td>Intermediate grade · V4</td>
              <td style={{ color: 'var(--mut)', fontSize: '0.72rem' }}>Send before comp taper</td>
            </tr>
            <tr>
              <td>May 10 2027</td>
              <td>Proof long run</td>
              <td>32 km: last 16 km @ 5:19</td>
              <td style={{ color: 'var(--mut)', fontSize: '0.72rem' }}>Pfitzinger keystone</td>
            </tr>
            <tr>
              <td>Jun 2027</td>
              <td>Marathon</td>
              <td style={{ color: 'var(--race)' }}>sub-3:45 · 5:19/km</td>
              <td style={{ color: 'var(--mut)', fontSize: '0.72rem' }}>Primary Cycle 2 goal</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Body weight targets */}
      <div className="static-card">
        <div className="static-card-title">Body Composition Targets</div>
        <p>Running economy improves ~1% per kg lost (up to ~10% below current weight). These are checkpoints, not hard rules — performance is the north star.</p>
        <table className="splits-table" style={{ marginTop: 8 }}>
          <thead>
            <tr><th>Date</th><th>Target weight</th><th>Context</th></tr>
          </thead>
          <tbody>
            <tr><td>Aug 24 2026</td><td>≤71 kg</td><td style={{ color: 'var(--mut)', fontSize: '0.72rem' }}>Start of race-specific block</td></tr>
            <tr><td>Oct 12 2026</td><td>≤68 kg</td><td style={{ color: 'var(--mut)', fontSize: '0.72rem' }}>Nov 8 marathon final prep</td></tr>
            <tr><td>Apr 2027</td><td>~65 kg</td><td style={{ color: 'var(--mut)', fontSize: '0.72rem' }}>Cycle 2 base</td></tr>
            <tr><td>Jun 2027</td><td>~64 kg</td><td style={{ color: 'var(--mut)', fontSize: '0.72rem' }}>Peak race weight · 3:45 attempt</td></tr>
          </tbody>
        </table>
        <p style={{ marginTop: 8, fontSize: '0.72rem', color: 'var(--mut)' }}>
          Deficit strategy: −500 kcal on easy/off days only. Full fuel on quality sessions and long runs — performance cannot be sacrificed for weight loss.
        </p>
      </div>
    </div>
  );
}
