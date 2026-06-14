// src/components/kinetix/StrengthTab.jsx

const SESSIONS = [
  {
    id: 'A',
    title: 'Session A — Running Strength & Plyo',
    freq: '2×/week · 45–55 min · paired with easy or threshold days',
    desc: 'The primary durability session. Builds the posterior chain, hip stability, and calf resilience that hold form at km 35+. Plyo block activates fast-twitch fibres pre-long-run.',
    exercises: [
      { name: 'Single-leg Romanian Deadlift', sets: '3 × 8/side', cue: 'Hinge at hip, feel glute and hamstring, not back. Tempo 3–1–1.' },
      { name: 'Bulgarian Split Squat', sets: '3 × 8/side', cue: 'Rear foot elevated. Knee tracks toe. Pause 1 s at bottom.' },
      { name: 'Nordic Hamstring Curl', sets: '3 × 5', cue: 'Eccentric-priority. Control the descent for 4 s. Single biggest hamstring injury prevention exercise.' },
      { name: 'Single-leg Calf Raise (bent knee)', sets: '3 × 15/side', cue: 'Isolates soleus. Slow lower. Add weight as this becomes easy.' },
      { name: 'Hip Abduction (band)', sets: '3 × 15/side', cue: 'Lateral activation. Prevent hip drop at midstance.' },
      { name: 'Dead Bug', sets: '3 × 10/side', cue: 'Low-back pressed flat. Breathe out on extension. Pure anti-extension core.' },
      { name: 'PLYO BLOCK (add Wk 5+)', sets: '3 × 6', cue: 'Alternate: jump squat → pogo jump → single-leg hop. 2 min rest between sets. Skip if red-gate morning.' },
    ]
  },
  {
    id: 'B',
    title: 'Session B — Hip & Glute Drive',
    freq: '2×/week · 35–45 min · pairs with Session A in the same week',
    desc: 'Complements A by targeting glute max (propulsion) and hip flexor strength. Different movement patterns — never feel like a repeat of A.',
    exercises: [
      { name: 'Hip Thrust (barbell or heavy band)', sets: '4 × 10', cue: 'Full extension at top. Squeeze for 1 s. Glute, not lower back.' },
      { name: 'Step-up (weighted)', sets: '3 × 10/side', cue: 'Drive through the heel of the elevated foot. Do not push off the floor foot.' },
      { name: 'Lateral Band Walk', sets: '3 × 20 steps/direction', cue: 'Knee soft, never caves in. Burn in the upper glute is correct.' },
      { name: 'Reverse Lunge (deficit)', sets: '3 × 8/side', cue: 'Front foot on 5–10 cm plate. More ROM than floor-level. Maintain upright torso.' },
      { name: 'Copenhagen Plank', sets: '3 × 20 s/side', cue: 'Adductor + core. Top leg straight on bench. Essential for hip stability.' },
      { name: 'Pallof Press', sets: '3 × 10/side', cue: 'Anti-rotation core. Light band. Full extension, hold 2 s, controlled return.' },
      { name: 'Single-leg Calf Raise (straight knee)', sets: '3 × 12/side', cue: 'Targets gastrocnemius. Add load on a step for more ROM.' },
    ]
  },
  {
    id: 'C',
    title: 'Session C — Climbing Antagonist & Finger Health',
    freq: '2×/week · 30–40 min · Phase 8 onwards (Wk 25+)',
    desc: 'Corrects the pulling imbalance bouldering creates. Protects tendons and shoulders. Not a climbing session — train these separate from hard climbing days.',
    exercises: [
      { name: 'Wrist Roller (flexion + extension)', sets: '3 × full roll each direction', cue: 'Slow and controlled. Build wrist extensor endurance often neglected by climbers.' },
      { name: 'Reverse Wrist Curl', sets: '3 × 15', cue: 'Elbow on pad, light dumbbell. Forearm extensor strength. Primary tendon protection.' },
      { name: 'Finger Extension (theraband)', sets: '3 × 20/hand', cue: 'Spread all 5 fingers against band. The #1 pulley injury prevention exercise. Do this every day.' },
      { name: 'Prone Shoulder Rotation (YWT)', sets: '3 × 10 each position', cue: 'Face down on a bench, light weights. Full shoulder complex: rear delt, lower trap, external rotators.' },
      { name: 'Serratus Press', sets: '3 × 12', cue: 'Like a push-up but just the final 5 cm of scapular protraction. Fixes winging. Essential for overhang climbing.' },
      { name: 'Shoulder External Rotation (band)', sets: '3 × 15/side', cue: 'Elbow at 90°, band around wrist. Rotator cuff balance. Never skip this.' },
      { name: 'Hangboard Max Hangs (Wk 31+ only)', sets: '5 × 7 s · 3 min rest', cue: 'Full crimp or half crimp. Add weight via harness. STOP immediately at any finger tweak. One session per week, fully fresh.' },
    ]
  }
];

export default function StrengthTab() {
  return (
    <div className="static-section">
      <div className="callout">
        <p><strong>Protocol rule:</strong> Strength never follows climbing. Climbing sessions land ≥24 h before strength days, never after. On any red-gate morning, strength drops to mobility/stretching only.</p>
      </div>

      {SESSIONS.map(s => (
        <div key={s.id} className="static-card">
          <div className="static-card-title">Session {s.id}</div>
          <h3 style={{ marginBottom: 6, fontSize: '0.95rem', color: 'var(--text)' }}>{s.title}</h3>
          <p style={{ marginBottom: 4, color: 'var(--ez)', fontSize: '0.75rem' }}>{s.freq}</p>
          <p>{s.desc}</p>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {s.exercises.map((ex, i) => (
              <div key={i} style={{ padding: '8px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, borderLeft: '2px solid var(--str)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>{ex.name}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--str)', fontFamily: 'IBM Plex Mono, monospace', whiteSpace: 'nowrap' }}>{ex.sets}</span>
                </div>
                <div style={{ fontSize: '0.73rem', color: 'var(--mut)', lineHeight: 1.4 }}>{ex.cue}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
