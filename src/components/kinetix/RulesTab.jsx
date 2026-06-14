// src/components/kinetix/RulesTab.jsx
import { paces, fmtP, fmtT, predict } from '../../lib/kinetix.logic.js';
import { DEFAULT_BM } from '../../lib/kinetix.data.js';

export default function RulesTab({ doc }) {
  const bm = doc.kinetix.bm || DEFAULT_BM;
  const heat = doc.kinetix.heat;
  const p = paces(bm);

  const hrZones = [
    { z: 'Z1 Recovery', bpm: '< 130', color: 'var(--ez)', use: 'Active recovery, warm-up, cool-down only. Never a "training" zone.' },
    { z: 'Z2 Easy', bpm: '130–148', color: 'var(--ez)', use: 'All easy runs, long runs until surge. The aerobic base zone. 75–80% of all volume.' },
    { z: 'Z3 Marathon', bpm: '148–165', color: 'var(--qual)', use: 'GMP surges in long runs, MP segments. Sustainable for 3–4 h at fitness.' },
    { z: 'Z4 Threshold', bpm: '161–172', color: 'var(--qual)', use: 'Threshold intervals. Comfortably hard — can speak 3–5 words. 20–40 min max.' },
    { z: 'Z5 VO₂', bpm: '175–184', color: 'var(--race)', use: 'Intervals 1–5 min. Hard but controlled. Cap reps when form goes.' },
    { z: 'Z6 Anaerobic', bpm: '> 185', color: 'var(--race)', use: 'Strides, repetitions. Fully recovered between — 2+ min rest. Not a marathon zone.' },
  ];

  return (
    <div className="static-section">
      {/* HR Zones */}
      <div className="static-card">
        <div className="static-card-title">Heart Rate Zones</div>
        <p style={{ marginBottom: 10, fontSize: '0.75rem', color: 'var(--mut)' }}>
          Based on LT2 (~172 bpm) and MHR estimate (~190 bpm). Recalibrate if lab-tested. All zones shift +5 bpm in heavy heat (&gt;30 °C).
        </p>
        <table className="hr-table">
          <thead>
            <tr>
              <th>Zone</th>
              <th>HR (bpm)</th>
              <th>Application</th>
            </tr>
          </thead>
          <tbody>
            {hrZones.map(z => (
              <tr key={z.z}>
                <td style={{ color: z.color }}>{z.z}</td>
                <td>{z.bpm}</td>
                <td style={{ color: 'var(--mut)' }}>{z.use}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Load management */}
      <div className="static-card">
        <div className="static-card-title">Load Management Rules</div>
        <h3>Acute:Chronic Workload Ratio (ACWR)</h3>
        <p>Keep ACWR ≤ 1.2. Never increase weekly volume &gt;10% for 2 consecutive weeks. Down-weeks every 4th week at 70–75% of peak. Never combine a new distance PR and a new pace PR in the same week.</p>
        <h3>Absolute stop signals</h3>
        <ul>
          <li>Sharp pain anywhere — not soreness, actual pain. Stop immediately.</li>
          <li>Shin pain &gt; 3/10 that changes gait. Rest 48 h minimum.</li>
          <li>HR 10+ bpm above normal at easy pace for 3+ days. Drop volume 30%.</li>
          <li>Two consecutive red-gate mornings. Cut week volume 30% and skip quality sessions.</li>
        </ul>
        <h3>The one rule that matters most</h3>
        <p>The easy runs are too fast. If you can't hold a full conversation, it's not easy. 80% of training is genuinely Z2 or the quality sessions don't work.</p>
      </div>

      {/* Fueling */}
      <div className="static-card">
        <div className="static-card-title">Fueling & Race Nutrition</div>
        <h3>Daily targets</h3>
        <p>Carbohydrate: 5–7 g/kg on training days, 8–10 g/kg the 2 days before a race or long run &gt;24 km. Protein: ≥1.8 g/kg daily, prioritize within 30 min post-session. Deficit running: −500 kcal on easy days only, never on quality or long-run days.</p>
        <h3>Long run fueling (≥18 km)</h3>
        <p>Start fueling at km 5. 30 g carb/30 min, build to 60 g/hr by Month 3, 75–90 g/hr by peak block. 500 ml/hr fluid minimum in any temperature, add 150–200 ml/hr per 5 °C above 25 °C. Train your gut on every long run — race nutrition is not the day to try something new.</p>
        <h3>Race-day protocol</h3>
        <ul>
          <li>Pre-race: 3 g/kg carbs 3–4 h before. Coffee if used in training. Nothing new.</li>
          <li>First gel: km 5, not later. Never skip an aid station after km 20.</li>
          <li>Post-race: 1 g/kg carb + 40 g protein within 30 min. Walk and eat; the race ends at the finish line.</li>
        </ul>
      </div>

      {/* Heat protocol */}
      <div className="static-card">
        <div className="static-card-title">Heat Protocol (Philippines)</div>
        <div className="callout-race">
          <p><strong>Jun 14 HM baseline was run at 29 °C / 80% RH.</strong> Your paces are already calibrated to a hot benchmark. The heat correction toggle (+20 s/km) is for race days hotter than 30 °C or RH &gt;85%.</p>
        </div>
        <h3>Daily heat rules</h3>
        <ul>
          <li>Run before 6:30 AM or after 5:30 PM when temp &gt;28 °C.</li>
          <li>Add 20 s/km to all zones when wet-bulb &gt;24 °C (typical PH noon).</li>
          <li>Fluid: 750 ml–1 L/hr on runs &gt;60 min in heat. Electrolytes mandatory.</li>
          <li>Pre-cool: cold shower or ice vest 15 min pre-run when temp &gt;32 °C.</li>
          <li>Do not sacrifice quality sessions to hit the exact pace — effort (HR) matters more than the number on the watch.</li>
        </ul>
        <h3>Acclimatization math</h3>
        <p>Heat adaptation: 10–14 days of training in target conditions. Plasma volume expands first (days 3–5), then heart rate drops (days 7–10), then sweat rate improves (days 10–14). Full adaptation: ~3 weeks. You live and train in PH heat — you are permanently adapted. This is a competitive advantage in hot races.</p>
      </div>

      {/* Dual-sport rules */}
      <div className="static-card">
        <div className="static-card-title">Dual-Sport Rules (Running + Climbing)</div>
        <ul>
          <li><strong>Hard climbing and hard running never share a day.</strong> Pick one priority; the other is easy or rest.</li>
          <li><strong>Climbing ≥24 h before speed sessions.</strong> Not after. Grip fatigue affects arm swing and arm swing affects running economy.</li>
          <li><strong>Fingers over freshness.</strong> If fingers feel tweaky, climbing drops to easy slabs regardless of what the plan says. Tendons heal in weeks; missing one session costs nothing.</li>
          <li><strong>Phase 9 priority stack:</strong> climbing &gt; running during Jan–Feb bouldering peak. Running is maintenance mode. Never sacrifice a limit boulder session for a tempo run.</li>
          <li><strong>Hangboard protocol:</strong> max hangs 1×/week, session starts fully fresh (not same day as climbing or quality run). 5 × 7 s at bodyweight + X, 3 min rest between. Stop if any finger makes a sound or produces a sharp sensation.</li>
        </ul>
      </div>
    </div>
  );
}
