// src/lib/kinetix.data.js
// All immutable constants for the KINETIX world — copied verbatim from spec §6.3

export const PH = [
  { n:'Post-HM recovery', c:'var(--ez)', d:'Jun 15 – 28 · adaptation happens now, not during the race' },
  { n:'Base rebuild — the phase that builds the sub-4', c:'var(--ez)', d:'Jun 29 – Jul 26 · HR-capped Z2, deficit running, strides return' },
  { n:'Volume build — quality returns', c:'var(--qual)', d:'Jul 27 – Aug 23 · threshold weekly, long runs grow MP segments' },
  { n:'Race-specific → Sep 6 · 32 km', c:'var(--race)', d:'Aug 24 – Sep 6 · marathon dress rehearsal' },
  { n:'Absorb & rebuild', c:'var(--ez)', d:'Sep 7 – 20 · recover the 32 km, reload' },
  { n:'Marathon peak block', c:'var(--race)', d:'Sep 21 – Oct 18 · two quality sessions, 32 km long run, the proof workouts' },
  { n:'Taper → Nov 8 marathon', c:'var(--swim)', d:'Oct 19 – Nov 8 · volume down, intensity touches stay' },
  { n:'Cycle 2 — post-marathon reset', c:'var(--ez)', d:'Nov 9 – 29 · walk, climb easy, zero structure' },
  { n:'Cross-build — 10 K speed + bouldering V4', c:'var(--bld)', d:'Nov 30 – Jan 10 · marathon legs + speedwork = fastest VO₂ gains of the year' },
  { n:'Bouldering peak → competition', c:'var(--bld)', d:'Jan 11 – Feb 28 · climbing priority, running maintains' },
  { n:'Marathon pivot — rebuild', c:'var(--qual)', d:'Mar 1 – Apr 25 · back to 60 km/wk, GMP 5:19 enters' },
  { n:'Race-specific → Jun 2027 sub-3:45', c:'var(--race)', d:'Apr 26 – Jun 6 · 72 km peak, the Pfitz proof long run' },
  { n:'Taper → race', c:'var(--swim)', d:'Jun 7 – race day' }
];

export const RACE_INDICES = [20, 11, 36, 51];

export const TAG = {
  q: ['t-q', 'Quality'],
  l: ['t-l', 'Long run'],
  e: ['t-e', 'Easy vol'],
  s: ['t-e', 'Strides'],
  g: ['t-g', 'Strength'],
  w: ['t-w', 'Swim opt'],
  b: ['t-b', 'Boulder'],
  p: ['t-p', 'Steps'],
  t: ['t-t', 'Key'],
  r: ['t-r', 'Recover']
};

export const DEFAULT_BM = { d: 21.0975, t: 8602, label: 'Jun 14 HM (2:23:22 · 29 °C / 80 % RH)' };

export function M(t, tx, sub) { return { t, tx, sub }; }
export const eFill = km => M('e', `Fill to the weekly target with easy Z2 runs @ [EZ], HR <145`, `3–5 separate runs · the 5th short run (30–40 min) is how ${km} km happens safely`);
export const stp = n => M('p', `Steps ≥ ${n}k/day average`, null);

export const W = [
/*1*/  { d:'2026-06-15', ph:0, km:[12,18], mods:[M('r','Days 1–3: walking only. Then 3–4 × 20–30 min jogs, HR <135. Pace is irrelevant.'),M('w','Optional swim 20–30 min easy — best recovery tool this week'),M('g','1 × light mobility/core circuit (no loading)'),stp(15)], note:'You raced. 1 easy day per 3 km raced = quality returns ~Jul 1. Sleep is the program.' },
/*2*/  { d:'2026-06-22', ph:0, km:[20,25], mods:[M('e','All running easy Z2 @ [EZ], longest run 10 km'),M('s','1 × 4 × 20 s relaxed strides at the end of one run'),M('g','Strength A at 60 % loads — groove the movements'),M('w','Optional swim 30 min Z2'),stp(18),M('t','Enter your Jun 14 result in the Paces tab — every pace below recalibrates to it')], note:'' },
/*3*/  { d:'2026-06-29', ph:1, km:[30,32], mods:[M('l','Long run 14 km, HR <148, conversational'),eFill(32),M('s','2 × 6 × 20 s strides @ [REP] after easy runs','neuromuscular speed at zero aerobic cost — this is how you\'ll run 5:41 off 7:30 easy pace'),M('g','Strength A + B, full effort'),M('w','Optional swim 30–40 min (swap for one easy run)'),stp(24)], note:'Deficit starts: −500 kcal on easy days, full fuel on long-run day. Protein ≥1.8 g/kg.' },
/*4*/  { d:'2026-07-06', ph:1, km:[34,36], mods:[M('l','Long run 16 km, HR <148 · take 30 g carb/hr — gut training starts now'),eFill(36),M('s','2 × 6 × 20 s strides @ [REP]'),M('g','Strength A + B'),M('w','Optional swim 30–40 min'),stp(25)], note:'' },
/*5*/  { d:'2026-07-13', ph:1, km:[38,40], mods:[M('l','Long run 18 km — last 2 km at [MP] just to taste it'),eFill(40),M('s','2 × 6 × 20 s strides'),M('g','Strength A + B · add plyo block to A'),stp(25)], note:'' },
/*6*/  { d:'2026-07-20', ph:1, km:[28,30], mods:[M('t','BENCHMARK — 10 km tempo test @ [THR] effort. Target <58:00. Sub-56 ⇒ sub-2:00 HM shape is arriving.'),M('l','Long run 14 km easy'),eFill(30),M('g','Strength A only (test week)'),stp(22)], note:'Down-week (−25 %). Update the pace engine with the test result.' },
/*7*/  { d:'2026-07-27', ph:2, km:[42,44], mods:[M('q','Threshold: 3 × 10 min @ [THR] (2–3 min jog) · HR 161–172',null),M('l','Long run 20 km, HR <150'),eFill(44),M('s','1 × 6 × 20 s strides'),M('g','Strength A + B'),stp(25)], note:'From here every week has one named hard session. It is the week\'s anchor — schedule it first, ≥48 h from the long run.' },
/*8*/  { d:'2026-08-03', ph:2, km:[46,48], mods:[M('q','Threshold: 4 × 8 min @ [THR] (2 min jog)'),M('l','Long run 24 km — last 4 km @ 5:42 (sub-4 GMP)'),eFill(48),M('s','1 × strides'),M('g','Strength A + B'),M('w','Optional swim on the post-long-run day')], note:'' },
/*9*/  { d:'2026-08-10', ph:2, km:[50,52], mods:[M('q','Threshold: 5 × 2 km @ [THR] (90 s jog)'),M('l','Long run 26 km — last 6 km @ 5:42'),eFill(52),M('s','1 × strides'),M('g','Strength A + B'),stp(25)], note:'Biggest week of your life so far. Earned, not jumped to — ACWR stays ≤1.2.' },
/*10*/ { d:'2026-08-17', ph:2, km:[40,42], mods:[M('q','20 min continuous @ [THR]'),M('l','Long run 22 km all easy'),eFill(42),M('g','Strength A'),stp(22)], note:'Down-week. Weight check: ~71 kg target by Aug 24.' },
/*11*/ { d:'2026-08-24', ph:3, km:[46,48], mods:[M('q','Marathon-pace: 2 × 5 km @ 5:42 (1 km float between)'),M('l','Long run 28 km — last 8 km @ 5:42'),eFill(48),M('g','Strength A (maintenance loads from here)'),stp(22)], note:'' },
/*12*/ { d:'2026-08-31', ph:3, km:[26,28], mods:[M('e','Mini-taper: easy runs only + 1 × 3 km @ 5:42 mid-week'),M('t','SEP 6 — 32 KM: first 16 km easy, last 16 km @ 5:42–5:50. Full dress rehearsal: race shoes, race breakfast, 60 g carb/hr, 500 ml/hr.'),stp(15)], note:'This is an assessment, not a race. Holding 5:42–5:50 over the back 16 km while fueled = sub-4 is on. Enter the MP-segment pace into the engine after.' },
/*13*/ { d:'2026-09-07', ph:4, km:[20,24], mods:[M('r','Everything easy Z1–Z2. No watch-staring.'),M('w','Swim 2 × this week — best recovery window of the cycle'),M('g','Strength B only (upper — legs rest)'),stp(15)], note:'' },
/*14*/ { d:'2026-09-14', ph:4, km:[34,36], mods:[M('q','Re-entry tempo: 15–20 min @ [THR]'),M('l','Long run 18 km easy'),eFill(36),M('s','1 × strides'),M('g','Strength A + B'),stp(22)], note:'' },
/*15*/ { d:'2026-09-21', ph:5, km:[50,52], mods:[M('q','VO₂: 5 × 1 km @ [INT] (2:30 jog) · HR 175–184'),M('q','Medium-long 14 km, HR <150'),M('l','Long run 28 km — last 6 km @ 5:42'),eFill(52),M('g','Strength A maintenance'),stp(22)], note:'Peak block: two quality + the long run. Everything else genuinely easy or it collapses.' },
/*16*/ { d:'2026-09-28', ph:5, km:[56,58], mods:[M('q','Threshold: 2 × 15 min @ [THR] (3 min jog)'),M('q','Medium-long 16 km, last 5 km @ [MP]'),M('l','Long run 30 km — last 8 km @ 5:42, full race fueling'),eFill(58),M('g','Strength A maintenance'),stp(22)], note:'' },
/*17*/ { d:'2026-10-05', ph:5, km:[60,64], mods:[M('q','VO₂: 6 × 1 km @ [INT]'),M('q','Medium-long 16 km easy'),M('l','PROOF WORKOUT — 32 km: 22 km easy + last 10 km @ 5:42. Nail this and sub-4 is no longer a goal, it\'s a plan.'),eFill(64),M('g','Strength A light'),stp(20)], note:'Biggest week of Cycle 1.' },
/*18*/ { d:'2026-10-12', ph:5, km:[48,50], mods:[M('t','MP CHECK — 10 km continuous @ 5:42. Must feel Z3 (HR ≤168). HR >172 ⇒ re-aim 4:05–4:08 and own it on race day.'),M('l','Long run 26 km all easy'),eFill(50),M('g','Strength A light'),stp(20)], note:'Down-week + decision point. Weight check: ≤68 kg.' },
/*19*/ { d:'2026-10-19', ph:6, km:[42,44], mods:[M('q','3 × 3 km @ 5:42 (1 km jog)'),M('l','Long run 22 km — last 6 km @ 5:42'),eFill(44),M('g','One light Strength A (50 %)'),stp(15)], note:'Taper = volume drops, intensity touches remain. You will feel flat mid-taper; that is glycogen storage, not lost fitness.' },
/*20*/ { d:'2026-10-26', ph:6, km:[30,32], mods:[M('q','2 × 2 km @ 5:42'),M('l','Long run 16 km easy'),eFill(32),stp(13)], note:'' },
/*21*/ { d:'2026-11-02', ph:6, km:[14,18], mods:[M('e','Mon–Thu: 2–3 short jogs, one with 4 × 30 s strides. Fri rest. Sat 15 min shakeout.'),M('t','NOV 8 — MARATHON. Plan: 5:47/km through 30 km (HR <165), then race. Fuel from km 5, every 25–30 min. Sub-4 = 5:41 avg; your banked plan is even-to-negative split.'),stp(10)], note:'Carb-load 8–10 g/kg on Thu–Fri. Nothing new on race day.' },
/*22*/ { d:'2026-11-09', ph:7, km:[0,8], mods:[M('r','Week off running. Walk a lot. Eat. Celebrate properly.'),M('b','1–2 easy climbing sessions, juggy fun problems only — this is recovery, not training'),stp(12)], note:'' },
/*23*/ { d:'2026-11-16', ph:7, km:[10,15], mods:[M('r','3 × 20–30 min jogs if the legs ask for it'),M('b','2 × technique sessions — silent feet, flagging drills, V2–V3 volume'),M('g','Session C introduced — antagonist + finger extensors start NOW, before load ramps'),stp(15)], note:'' },
/*24*/ { d:'2026-11-23', ph:7, km:[18,22], mods:[M('e','Easy running @ [EZ]'),M('s','1 × strides'),M('b','2 × sessions, start touching V4s again'),M('g','Strength C'),stp(18)], note:'' },
/*25*/ { d:'2026-11-30', ph:8, km:[28,30], mods:[M('q','Speed: 10 × 400 m @ [REP] (90 s rest)','marathon-trained legs + speedwork = the fastest VO₂max gains you\'ll ever get'),M('l','Long run 12 km easy'),eFill(30),M('b','3 × climbing: 1 hard (limit V4), 1 technique, 1 volume'),M('g','Strength C'),stp(22)], note:'Dual-sport rules: climb ≥24 h before speed days, never after them. Hard climbing and hard running never share a day.' },
/*26*/ { d:'2026-12-07', ph:8, km:[30,32], mods:[M('q','Tempo: 6 km continuous @ [THR]'),M('l','Long run 14 km'),eFill(32),M('b','3 × climbing'),M('g','Strength C'),stp(22)], note:'' },
/*27*/ { d:'2026-12-14', ph:8, km:[33,35], mods:[M('q','8 × 600 m @ [INT] (2 min jog)'),M('l','Long run 14 km'),eFill(35),M('b','3 × climbing — projecting hard V4'),M('g','Strength C'),stp(22)], note:'' },
/*28*/ { d:'2026-12-21', ph:8, km:[24,28], mods:[M('e','Holiday down-week — all easy'),M('s','1 × strides'),M('b','2 × fun sessions'),stp(18)], note:'' },
/*29*/ { d:'2026-12-28', ph:8, km:[34,36], mods:[M('q','5 × 1 km @ [INT] (2:30 jog)'),M('l','Long run 16 km'),eFill(36),M('b','3 × climbing'),M('g','Strength C'),stp(22)], note:'' },
/*30*/ { d:'2027-01-04', ph:8, km:[30,32], mods:[M('t','BENCHMARK — 10 km TT. Target sub-50 (4:59/km). Sub-50 here ⇒ sub-47 in May ⇒ sub-3:45 on track. Enter it in the engine.'),M('l','Long run 12 km easy'),eFill(32),M('b','2 × climbing (TT week)'),stp(20)], note:'' },
/*31*/ { d:'2027-01-11', ph:9, km:[25,28], mods:[M('b','4 × climbing: limit boulders (V5 projecting) · power (campus-light/dynamic) · technique · volume'),M('b','Hangboard max hangs 1×/wk, fully fresh, 5 × 7 s — stop at ANY finger tweak'),M('q','1 × 6 × 400 m @ [REP] — keep the speed alive'),M('l','Long run 12 km easy'),M('g','Strength C ×2'),stp(20)], note:'Climbing is the priority sport now. Running is maintenance — protect it but never let it cost a climbing day.' },
/*32*/ { d:'2027-01-18', ph:9, km:[25,28], mods:[M('b','4 × climbing — first V5 send window opens'),M('q','1 × short tempo 4 km @ [THR]'),M('l','Long 12–14 km'),M('g','Strength C ×2'),stp(20)], note:'' },
/*33*/ { d:'2027-01-25', ph:9, km:[25,28], mods:[M('b','4 × climbing'),M('q','1 × 6 × 400 m @ [REP]'),M('l','Long 12–14 km'),M('g','Strength C ×2'),stp(20)], note:'' },
/*34*/ { d:'2027-02-01', ph:9, km:[25,28], mods:[M('b','4 × climbing — comp-format simulation: 4 problems × 4 min on/off'),M('q','1 × short tempo'),M('l','Long 12 km'),M('g','Strength C ×2'),stp(20)], note:'' },
/*35*/ { d:'2027-02-08', ph:9, km:[25,28], mods:[M('b','4 × climbing — second comp simulation, onsight focus (read, commit, execute)'),M('q','1 × strides only'),M('l','Long 12 km'),M('g','Strength C'),stp(20)], note:'' },
/*36*/ { d:'2027-02-15', ph:9, km:[18,22], mods:[M('b','2 × light sessions — skin care, easy volume, visualization. No limit attempts.'),M('e','Easy runs only'),stp(15)], note:'Comp taper. Fingers and skin arrive fresh or you climb a grade below yourself.' },
/*37*/ { d:'2027-02-22', ph:9, km:[15,20], mods:[M('t','COMPETITION WEEK — intermediate bouldering comp. Warm up long (30+ min), read every problem twice, first attempts matter most in scoring.'),M('e','2–3 easy jogs to stay loose'),stp(12)], note:'' },
/*38*/ { d:'2027-03-01', ph:10, km:[28,30], mods:[M('e','All easy — running volume rebuild begins'),M('s','2 × strides'),M('b','2 × climbing for joy (maintenance until June)'),M('g','Strength A returns + C'),stp(22)], note:'Marathon pivot. 14 weeks to sub-3:45. GMP is now 5:19/km — 22 s/km faster than November. Respect that number.' },
/*39*/ { d:'2027-03-08', ph:10, km:[36,38], mods:[M('l','Long run 18 km'),eFill(38),M('s','2 × strides'),M('b','2 × climbing'),M('g','Strength A + B'),stp(24)], note:'' },
/*40*/ { d:'2027-03-15', ph:10, km:[42,44], mods:[M('q','Tempo 20 min @ [THR]'),M('l','Long run 22 km'),eFill(44),M('b','2 × climbing'),M('g','Strength A + B, plyo on'),stp(24)], note:'' },
/*41*/ { d:'2027-03-22', ph:10, km:[48,50], mods:[M('q','Threshold 3 × 10 min @ [THR]'),M('l','Long run 24 km — last 4 km @ 5:19'),eFill(50),M('b','2 × climbing'),M('g','Strength A + B'),stp(24)], note:'' },
/*42*/ { d:'2027-03-29', ph:10, km:[40,42], mods:[M('q','20 min @ [THR]'),M('l','Long 20 km easy'),eFill(42),M('b','1–2 × climbing'),M('g','Strength A'),stp(22)], note:'Down-week. Weight check: trending toward 64–65 kg.' },
/*43*/ { d:'2027-04-05', ph:10, km:[52,54], mods:[M('q','4 × 2 km @ [THR] (90 s)'),M('l','Long run 26 km — last 6 km @ 5:19'),eFill(54),M('b','1 × climbing'),M('g','Strength A + B'),stp(24)], note:'' },
/*44*/ { d:'2027-04-12', ph:10, km:[56,58], mods:[M('q','VO₂ 5 × 1 km @ [INT]'),M('l','Long run 28 km — last 8 km @ 5:19'),eFill(58),M('b','1 × climbing'),M('g','Strength A'),stp(24)], note:'' },
/*45*/ { d:'2027-04-19', ph:10, km:[60,62], mods:[M('q','Threshold 2 × 15 min @ [THR]'),M('q','Medium-long 16 km, last 5 km @ [MP]'),M('l','Long run 30 km — last 8 km @ 5:19'),eFill(62),M('g','Strength A maintenance'),stp(22)], note:'' },
/*46*/ { d:'2027-04-26', ph:11, km:[62,64], mods:[M('q','GMP intervals: 3 × 4 km @ 5:19 (1 km float)'),M('q','Medium-long 16 km'),M('l','Long run 32 km — last 12 km @ 5:19'),eFill(64),M('g','Strength A maintenance'),stp(22)], note:'' },
/*47*/ { d:'2027-05-03', ph:11, km:[54,56], mods:[M('t','BENCHMARK — 10 km TT. Sub-47 (4:42/km) ⇒ Riegel says ~3:38–3:42 marathon. 47–50 ⇒ aim 3:45 flat with even pacing. ≥50 ⇒ re-aim 3:50–3:55 honestly.'),M('l','Long run 24 km easy'),eFill(56),M('g','Strength A light'),stp(20)], note:'Down-week + decision point. Update the engine.' },
/*48*/ { d:'2027-05-10', ph:11, km:[66,68], mods:[M('q','VO₂ 6 × 1 km @ [INT]'),M('q','Medium-long 18 km, last 6 km @ [MP]'),M('l','THE PROOF — 32 km: 16 km easy + 16 km @ 5:19 (Pfitzinger 18/70 keystone). Complete this and sub-3:45 is yours to execute.'),eFill(68),stp(20)], note:'' },
/*49*/ { d:'2027-05-17', ph:11, km:[70,72], mods:[M('q','Threshold 3 × 12 min @ [THR]'),M('q','Medium-long 18 km'),M('l','Long run 30 km — last 10 km @ 5:19'),eFill(72),M('g','Strength A light'),stp(20)], note:'Peak week of the entire year. Sleep 8+ h. Everything easy is EASY.' },
/*50*/ { d:'2027-05-24', ph:11, km:[56,58], mods:[M('q','3 × 3 km @ 5:19'),M('l','Long run 26 km — last 8 km @ 5:19'),eFill(58),stp(18)], note:'' },
/*51*/ { d:'2027-05-31', ph:12, km:[42,44], mods:[M('q','2 × 3 km @ 5:19'),M('l','Long run 20 km — last 5 km @ 5:19'),eFill(44),M('g','One light Strength A'),stp(14)], note:'Taper. Trust it — the hay is in the barn.' },
/*52*/ { d:'2027-06-07', ph:12, km:[26,30], mods:[M('q','Early week: 3 × 1 km @ 5:19'),M('e','Short jogs, one with strides, then race-week protocol'),M('t','RACE — Jun 2027 marathon. Sub-3:45 = 5:19 avg. Plan: 5:22–5:24 through 25 km (HR <165), then race the last 17. Fuel 75–90 g/hr — you trained the gut for a year for this.'),stp(10)], note:'' }
];
