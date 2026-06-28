// src/lib/medi.data.js
// All immutable constants for the MEDI world — copied verbatim from spec §6.1/6.2/§4.1

export const TARGET_EXAM = new Date("2027-10-15T00:00:00");

export const CATALOG = [
  ["U-01","Amboss - USMLE Step 1","USMLE",2745,"Intermediate","6-12 Months"],
  ["U-02","Amboss - USMLE Step 2 CK","USMLE",3338,"Advanced","4-9 Months"],
  ["U-03","Amboss - USMLE Step 3","USMLE",2095,"Advanced","2-4 Months"],
  ["U-04","Mehlman - Step 1 QBank - 2026","USMLE",7278,"Hard","2-4 Months"],
  ["U-05","Mehlman - Step 2 CK Qbank","USMLE",2450,"Hard","2-4 Months"],
  ["U-06","Mehlman - Step 3 Qbank","USMLE",1560,"Hard","2-3 Months"],
  ["U-07","PassMedicine - USMLE Step 1","USMLE",3846,"Moderate","2-4 Months"],
  ["U-08","USMLERx - USMLE Step 1","USMLE",2150,"Medium","3-6 Weeks"],
  ["U-09","USMLERx - USMLE Step 2","USMLE",2423,"Hard","1-2 Months"],
  ["U-10","uWorld - USMLE Step 1","USMLE",3659,"Advanced","6-8 Months"],
  ["U-11","uWorld - USMLE Step 2","USMLE",4085,"Advanced","4-9 Months"],
  ["U-12","uWorld - USMLE Step 3","USMLE",2136,"Advanced","2-4 Months"],
  ["HY-01","Amboss Study Plan - 200 Concepts Step 1","USMLE High Yield",200,"Hard","2-4 Days"],
  ["HY-02","Amboss Study Plan - 200 Concepts Step 2","USMLE High Yield",200,"Hard","2-4 Days"],
  ["HY-03","Amboss Study Plan - High Yield Biostatistics & Epidemiology","USMLE High Yield",155,"Hard","1-2 Days"],
  ["HY-04","Mehlman - HY Emergency Medicine","USMLE High Yield",481,"Hard","1-2 Weeks"],
  ["HY-05","Mehlman - HY Family Medicine","USMLE High Yield",580,"Hard","1-2 Weeks"],
  ["HY-06","Mehlman - HY Internal Medicine","USMLE High Yield",1003,"Hard","1-2 Weeks"],
  ["HY-07","Mehlman - HY Obgyn","USMLE High Yield",321,"Hard","1-2 Weeks"],
  ["HY-08","Mehlman - HY Pediatrics","USMLE High Yield",1001,"Hard","1-2 Weeks"],
  ["HY-09","Mehlman - HY Psychiatry","USMLE High Yield",776,"Hard","1-2 Weeks"],
  ["HY-10","Mehlman - HY Surgery","USMLE High Yield",595,"Hard","1-2 Weeks"],
  ["HY-11","uWorld - Step 1 Self Assessment Simulation 1","USMLE High Yield",160,"Advanced","4 Hours"],
  ["HY-12","uWorld - Step 1 Self Assessment Simulation 2","USMLE High Yield",159,"Advanced","4 Hours"],
  ["HY-13","uWorld - Step 1 Self Assessment Simulation 3","USMLE High Yield",158,"Very Hard","4 Hours"],
  ["HY-14","uWorld - Step 2 Self Assessment Simulation 1","USMLE High Yield",157,"Advanced","4 Hours"],
  ["HY-15","uWorld - Step 2 Self Assessment Simulation 2","USMLE High Yield",159,"Advanced","4 Hours"],
  ["HY-16","uWorld - Step 2 Self Assessment Simulation 3","USMLE High Yield",160,"Very Hard","4 Hours"],
  ["HY-17","uWorld - Step 3 Self Assessment Simulation 1","USMLE High Yield",160,"Advanced","4 Hours"],
  ["HY-18","uWorld - Step 3 Self Assessment Simulation 2","USMLE High Yield",160,"Advanced","4 Hours"],
  ["NBME-CMS-01","Clinical Neurology Self-Assessment - Form 5","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-02","Clinical Neurology Self-Assessment - Form 6","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-03","Clinical Neurology Self-Assessment - Form 7","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-04","Clinical Neurology Self-Assessment - Form 8","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-05","Clinical Neurology Self-Assessment - Form 9","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-06","Clinical Obstetrics Gynecology Self-Assessment - Form 10","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-07","Clinical Obstetrics Gynecology Self-Assessment - Form 5","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-08","Clinical Obstetrics Gynecology Self-Assessment - Form 6","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-09","Clinical Obstetrics Gynecology Self-Assessment - Form 7","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-10","Clinical Obstetrics Gynecology Self-Assessment - Form 8","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-11","Clinical Obstetrics Gynecology Self-Assessment - Form 9","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-12","Emergency Medicine Self-Assessment - Form 1","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-13","Emergency Medicine Self-Assessment - Form 2","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-14","Emergency Medicine Self-Assessment - Form 3","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-15","Family Medicine Self-Assessment - Form 2","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-16","Family Medicine Self-Assessment - Form 3","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-17","Family Medicine Self-Assessment - Form 4","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-18","Family Medicine Self-Assessment - Form 5","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-19","Medicine Self-Assessment - Form 10","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-20","Medicine Self-Assessment - Form 5","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-21","Medicine Self-Assessment - Form 6","NBME - Clinical Mastery",49,"Intermediate","1-2 Hours"],
  ["NBME-CMS-22","Medicine Self-Assessment - Form 7","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-23","Medicine Self-Assessment - Form 8","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-24","Medicine Self-Assessment - Form 9","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-25","Pediatrics Self-Assessment - Form 5","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-26","Pediatrics Self-Assessment - Form 6","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-27","Pediatrics Self-Assessment - Form 7","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-28","Pediatrics Self-Assessment - Form 8","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-29","Pediatrics Self-Assessment - Form 9","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-30","Psychiatry Self-Assessment - Form 5","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-31","Psychiatry Self-Assessment - Form 6","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-32","Psychiatry Self-Assessment - Form 7","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-33","Psychiatry Self-Assessment - Form 8","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-34","Surgery Self-Assessment - Form 5","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-35","Surgery Self-Assessment - Form 6","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-36","Surgery Self-Assessment - Form 7","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-CMS-37","Surgery Self-Assessment - Form 8","NBME - Clinical Mastery",50,"Intermediate","1-2 Hours"],
  ["NBME-COMP-01","Self-Assessment - Form 25","NBME - Comp. Basic Science (Step 1)",200,"Intermediate","1-2 Hours"],
  ["NBME-COMP-02","Self-Assessment - Form 26","NBME - Comp. Basic Science (Step 1)",200,"Intermediate","1-2 Hours"],
  ["NBME-COMP-03","Self-Assessment - Form 27","NBME - Comp. Basic Science (Step 1)",198,"Intermediate","1-2 Hours"],
  ["NBME-COMP-04","Self-Assessment - Form 28","NBME - Comp. Basic Science (Step 1)",200,"Intermediate","1-2 Hours"],
  ["NBME-COMP-05","Self-Assessment - Form 29","NBME - Comp. Basic Science (Step 1)",199,"Intermediate","1-2 Hours"],
  ["NBME-COMP-06","Self-Assessment - Form 30","NBME - Comp. Basic Science (Step 1)",200,"Intermediate","1-2 Hours"],
  ["NBME-COMP-07","Self-Assessment - Form 31","NBME - Comp. Basic Science (Step 1)",200,"Intermediate","1-2 Hours"],
  ["NBME-COMP-08","Self-Assessment - Form 32","NBME - Comp. Basic Science (Step 1)",200,"Intermediate","1-2 Hours"],
  ["NBME-COMP-09","Self-Assessment - Form 33","NBME - Comp. Basic Science (Step 1)",199,"Intermediate","1-2 Hours"],
  ["NBME-COMP-10","Self-Assessment - Form 10","NBME - Comp. Clinical Science (Step 2 CK)",200,"Intermediate","1-2 Hours"],
  ["NBME-COMP-11","Self-Assessment - Form 11","NBME - Comp. Clinical Science (Step 2 CK)",200,"Intermediate","1-2 Hours"],
  ["NBME-COMP-12","Self-Assessment - Form 12","NBME - Comp. Clinical Science (Step 2 CK)",200,"Intermediate","1-2 Hours"],
  ["NBME-COMP-13","Self-Assessment - Form 13","NBME - Comp. Clinical Science (Step 2 CK)",200,"Intermediate","1-2 Hours"],
  ["NBME-COMP-14","Self-Assessment - Form 14","NBME - Comp. Clinical Science (Step 2 CK)",200,"Intermediate","1-2 Hours"],
  ["NBME-COMP-15","Self-Assessment - Form 15","NBME - Comp. Clinical Science (Step 2 CK)",200,"Intermediate","1-2 Hours"],
  ["NBME-COMP-16","Self-Assessment - Form 16","NBME - Comp. Clinical Science (Step 2 CK)",200,"Intermediate","1-2 Hours"],
  ["NBME-COMP-17","Self-Assessment - Form 9","NBME - Comp. Clinical Science (Step 2 CK)",200,"Intermediate","1-2 Hours"],
  ["NBME-COMP-18","Self-Assessment - Form 6","NBME - Comp. Clinical Medicine (Step 3)",200,"Intermediate","1-2 Hours"],
  ["NBME-COMP-19","Self-Assessment - Form 7","NBME - Comp. Clinical Medicine (Step 3)",200,"Intermediate","1-2 Hours"],
  ["NBME-SUB-01","Clinical Emergency Medicine Self-Assessment - Form 3","NBME - Subjects Exam",49,"Intermediate","1-2 Hours"],
  ["NBME-SUB-02","Clinical Family Medicine Self-Assessment - Form 5","NBME - Subjects Exam",48,"Intermediate","1-2 Hours"],
  ["NBME-SUB-03","Clinical Medicine Self-Assessment - Form 8","NBME - Subjects Exam",49,"Intermediate","1-2 Hours"],
  ["NBME-SUB-04","Clinical Neurology Self-Assessment - Form 8","NBME - Subjects Exam",50,"Intermediate","1-2 Hours"],
  ["NBME-SUB-05","Clinical Ob-Gyn Self-Assessment - Form 8","NBME - Subjects Exam",49,"Intermediate","1-2 Hours"],
  ["NBME-SUB-06","Clinical Pediatrics Self-Assessment - Form 8","NBME - Subjects Exam",49,"Intermediate","1-2 Hours"]
].map(r => ({ id: r[0], name: r[1], category: r[2], totalQuestions: r[3], difficulty: r[4], estimatedDuration: r[5] }));

export const SYSTEMS = [
  "Cardiovascular","Respiratory","Renal","Gastrointestinal","Endocrine",
  "Reproductive","Musculoskeletal","Neurology","Hematology / Oncology","Immunology",
  "Psychiatry","Dermatology","Infectious Disease"
];

export const PIPELINE = [
  { n:"1. USMLE First Aid Anchor",   t:"Review high-yield pathophysiology checklist for this system.", src:"► First Aid USMLE (Step 1 / Step 2 CK)" },
  { n:"2. Core Specialty Textbooks", t:"Cross-reference deeper pathophysiology (Harrison's, Nelson's, etc.).", src:"► Standard Textbooks" },
  { n:"3. Local Board Adaptation",   t:"Integrate local board considerations — Dengue, Leptospirosis, TB.", src:"► Topnotch Reviewers / Platinum Manuals" },
  { n:"4. QBank Integration Loop",   t:"Complete active block assignments in the question repository.", src:"► QBank (uWorld ➔ Amboss)" },
  { n:"5. High-Yield Validation",    t:"Lock in mastery with subject forms + high-yield review.", src:"► NBME Subject Forms + Mehlman HY" }
];

export const PHASES = [
  { start:"2026-06-10", end:"2027-08-01", num:"PHASE 1", name:"Internship Survival", desc:"Passive accumulation. Low daily friction (20–40 Qs/day). Front-load high-volume QBanks alongside rotations." },
  { start:"2027-08-01", end:"2027-09-01", num:"PHASE 2", name:"Core Consolidation", desc:"Dedicated review mode. Bridge USMLE logic to local PLE patterns. Targets scale to 60–80 Qs/day." },
  { start:"2027-09-01", end:"2027-11-01", num:"PHASE 3", name:"Dedicated PLE Sprint", desc:"High-stakes mock testing. NBME Comprehensive Forms 25–33 + Clinical Mastery, timed simulators." },
  { start:"2027-11-01", end:"2099-01-01", num:"PHASE 4", name:"Residency Carryover", desc:"Clinical Quick-Reference mode. Archive Step 1 basic science; pin Step 3 + clinical HY for hospital calls." }
];

export const CATEGORIES = ["All Questions", ...Array.from(new Set(CATALOG.map(m => m.category)))];

export const CAT_TO_SUBJECT = {
  "USMLE": "USMLE Core",
  "USMLE High Yield": "HY / Simulation",
  "NBME - Clinical Mastery": "Clinical Mastery",
  "NBME - Comp. Basic Science (Step 1)": "Basic Science",
  "NBME - Comp. Clinical Science (Step 2 CK)": "Clinical Science",
  "NBME - Comp. Clinical Medicine (Step 3)": "Clinical Medicine",
  "NBME - Subjects Exam": "Subject Exams"
};

export const SUBJECT_ORDER = [
  "USMLE Core","HY / Simulation","Basic Science","Clinical Science",
  "Clinical Medicine","Clinical Mastery","Subject Exams"
];

// ── The 12 official PLE subjects (PRC Physician Licensure Exam) ──────────────
// Equal weight — each is one 100-item block ≈ 8.33% of the exam.
// Day 1–2 = Basic Medical Sciences, Day 3–4 = Clinical Sciences.
const PLE_EQUAL_WEIGHT = 100 / 12; // 8.333…

export const PLE_WEIGHTS = [
  // Day 1 — Basic Medical Sciences
  { subject:"Biochemistry",                    day:1, group:"Basic", weight:PLE_EQUAL_WEIGHT },
  { subject:"Legal Med, Jurisprudence & Ethics", day:1, group:"Basic", weight:PLE_EQUAL_WEIGHT },
  { subject:"Pathology",                       day:1, group:"Basic", weight:PLE_EQUAL_WEIGHT },
  // Day 2 — Basic Medical Sciences
  { subject:"Physiology",                      day:2, group:"Basic", weight:PLE_EQUAL_WEIGHT },
  { subject:"Anatomy & Histology",             day:2, group:"Basic", weight:PLE_EQUAL_WEIGHT },
  { subject:"Microbiology & Parasitology",     day:2, group:"Basic", weight:PLE_EQUAL_WEIGHT },
  // Day 3 — Clinical Sciences
  { subject:"Obstetrics & Gynecology",         day:3, group:"Clinical", weight:PLE_EQUAL_WEIGHT },
  { subject:"Pediatrics & Nutrition",          day:3, group:"Clinical", weight:PLE_EQUAL_WEIGHT },
  { subject:"Preventive Med & Public Health",  day:3, group:"Clinical", weight:PLE_EQUAL_WEIGHT },
  // Day 4 — Clinical Sciences
  { subject:"Pharmacology & Therapeutics",     day:4, group:"Clinical", weight:PLE_EQUAL_WEIGHT },
  { subject:"Surgery, Ophtha, ENT",            day:4, group:"Clinical", weight:PLE_EQUAL_WEIGHT },
  { subject:"Internal Medicine",               day:4, group:"Clinical", weight:PLE_EQUAL_WEIGHT },
];

// Explicit module-ID sets per PLE subject, mapped to the closest catalog modules.
// Basic-science subjects (Biochem, Physio, Anatomy, etc.) have no dedicated NBME
// clinical forms, so they map to the Comprehensive Basic Science (Step 1) bank,
// which is where that content lives. Empty arrays → getSubjectCoverage returns
// null → shown as "no tracked modules" / 0% (never falls back to global %).
export const SUBJ_MODULE_IDS = {
  // ── Day 1 ──
  "Biochemistry": [
    // Step 1 basic-science content; no isolated biochem form → comp basic science
    "NBME-COMP-01","NBME-COMP-02","NBME-COMP-03","NBME-COMP-04","NBME-COMP-05"
  ],
  "Legal Med, Jurisprudence & Ethics": [
    // Ethics/jurisprudence appears in HY biostats/ethics + Step 3 comp
    "HY-03","NBME-COMP-18","NBME-COMP-19"
  ],
  "Pathology": [
    // Pathophysiology is heaviest in the Step 1 comp basic-science bank
    "NBME-COMP-06","NBME-COMP-07","NBME-COMP-08","NBME-COMP-09"
  ],
  // ── Day 2 ──
  "Physiology": [
    "NBME-COMP-01","NBME-COMP-02","NBME-COMP-03"
  ],
  "Anatomy & Histology": [
    "NBME-COMP-04","NBME-COMP-05","NBME-COMP-06"
  ],
  "Microbiology & Parasitology": [
    // Micro/ID — Mehlman HY EM/FM touch infection; comp basic science covers micro
    "HY-04","NBME-COMP-07","NBME-COMP-08"
  ],
  // ── Day 3 ──
  "Obstetrics & Gynecology": [
    "HY-07",
    "NBME-CMS-06","NBME-CMS-07","NBME-CMS-08","NBME-CMS-09","NBME-CMS-10","NBME-CMS-11",
    "NBME-SUB-05"
  ],
  "Pediatrics & Nutrition": [
    "HY-08",
    "NBME-CMS-25","NBME-CMS-26","NBME-CMS-27","NBME-CMS-28","NBME-CMS-29",
    "NBME-SUB-06"
  ],
  "Preventive Med & Public Health": [
    // Biostats/epi + family/community medicine forms
    "HY-03","HY-05",
    "NBME-CMS-15","NBME-CMS-16","NBME-CMS-17","NBME-CMS-18",
    "NBME-SUB-02"
  ],
  // ── Day 4 ──
  "Pharmacology & Therapeutics": [
    // No dedicated pharm form; pharm is integrated in Step 2 CK comp + clinical medicine
    "NBME-COMP-10","NBME-COMP-11","NBME-COMP-12","NBME-COMP-13"
  ],
  "Surgery, Ophtha, ENT": [
    "HY-10",
    "NBME-CMS-34","NBME-CMS-35","NBME-CMS-36","NBME-CMS-37"
  ],
  "Internal Medicine": [
    "HY-06",
    "NBME-CMS-19","NBME-CMS-20","NBME-CMS-21","NBME-CMS-22","NBME-CMS-23","NBME-CMS-24",
    "NBME-SUB-03"
  ],
};

// ── Internship rotation → PLE subject mapping ─────────────────────────────────
export const ROTATION_SUBJECTS = {
  'MED 260':           ['Internal Medicine', 'Pharmacology & Therapeutics'],
  'PEDIA 260':         ['Pediatrics & Nutrition'],
  'SURG 260':          ['Surgery, Ophtha, ENT'],
  'FCH 260':           ['Preventive Med & Public Health'],
  'FCH 260.1':         ['Preventive Med & Public Health'],
  'OB-GYN 260':        ['Obstetrics & Gynecology'],
  '[E] MED 292':       ['Internal Medicine'],
  '[E] MED 291':       ['Internal Medicine'],
  '[E] Neurosc 291.1': [],
};

const _C = ['Obstetrics & Gynecology','Pediatrics & Nutrition','Preventive Med & Public Health',
            'Pharmacology & Therapeutics','Surgery, Ophtha, ENT','Internal Medicine'];
const _B = ['Biochemistry','Legal Med, Jurisprudence & Ethics','Pathology',
            'Physiology','Anatomy & Histology','Microbiology & Parasitology'];
const _ALL = [..._B, ..._C];

// ── Internship + blitz schedule ───────────────────────────────────────────────
// type: 'clinical' | 'elective' | 'sprint' | 'blitz'
// basicSubject: string | null  (null + sprint/blitz = all 6 basics shown)
// dailyTarget / studyHours: only on blitz blocks
export const INTERNSHIP_SCHEDULE = [
  // ── INTERNSHIP YEAR Jul 2026 – Jun 2027 ──────────────────────────────────
  { id:'BLK-01', start:'2026-07-01', end:'2026-07-12', label:'MED 260',           type:'clinical', primarySubjects:['Internal Medicine','Pharmacology & Therapeutics'], basicSubject:'Pathology' },
  { id:'BLK-02', start:'2026-07-13', end:'2026-07-26', label:'PEDIA 260',         type:'clinical', primarySubjects:['Pediatrics & Nutrition'],                          basicSubject:'Physiology' },
  { id:'BLK-03', start:'2026-07-27', end:'2026-08-09', label:'PEDIA 260',         type:'clinical', primarySubjects:['Pediatrics & Nutrition'],                          basicSubject:'Biochemistry' },
  { id:'BLK-04', start:'2026-08-10', end:'2026-08-23', label:'SURG 260',          type:'clinical', primarySubjects:['Surgery, Ophtha, ENT'],                            basicSubject:'Anatomy & Histology' },
  { id:'BLK-05', start:'2026-08-24', end:'2026-09-06', label:'SURG 260',          type:'clinical', primarySubjects:['Surgery, Ophtha, ENT'],                            basicSubject:'Microbiology & Parasitology' },
  { id:'BLK-06', start:'2026-09-07', end:'2026-09-20', label:'SURG 260',          type:'clinical', primarySubjects:['Surgery, Ophtha, ENT'],                            basicSubject:'Legal Med, Jurisprudence & Ethics' },
  { id:'BLK-07', start:'2026-09-21', end:'2026-10-04', label:'SURG 260',          type:'clinical', primarySubjects:['Surgery, Ophtha, ENT'],                            basicSubject:'Pathology' },
  { id:'BLK-08', start:'2026-10-05', end:'2026-10-18', label:'FCH 260.1',         type:'clinical', primarySubjects:['Preventive Med & Public Health'],                  basicSubject:'Biochemistry' },
  { id:'BLK-09', start:'2026-10-20', end:'2026-11-01', label:'[E] MED 292',       type:'elective', primarySubjects:['Internal Medicine'],                               basicSubject:'Physiology',                note:'IC · GI' },
  { id:'BLK-10', start:'2026-11-02', end:'2026-11-15', label:'[E] MED 292',       type:'elective', primarySubjects:['Internal Medicine'],                               basicSubject:'Anatomy & Histology',       note:'IC · GI' },
  { id:'BLK-11', start:'2026-11-16', end:'2026-11-29', label:'PEDIA 260',         type:'clinical', primarySubjects:['Pediatrics & Nutrition'],                          basicSubject:'Microbiology & Parasitology' },
  { id:'BLK-12', start:'2026-11-30', end:'2026-12-13', label:'PEDIA 260',         type:'clinical', primarySubjects:['Pediatrics & Nutrition'],                          basicSubject:'Pathology' },
  { id:'BLK-13', start:'2026-12-14', end:'2026-12-27', label:'[E] MED 291',       type:'elective', primarySubjects:['Internal Medicine'],                               basicSubject:'Biochemistry',              note:'GI/Cardio Research' },
  { id:'BLK-14', start:'2026-12-28', end:'2027-01-10', label:'[E] MED 291',       type:'elective', primarySubjects:['Internal Medicine'],                               basicSubject:'Legal Med, Jurisprudence & Ethics', note:'GI/Cardio Research' },
  { id:'BLK-15', start:'2027-01-11', end:'2027-01-24', label:'FCH 260',           type:'clinical', primarySubjects:['Preventive Med & Public Health'],                  basicSubject:'Physiology' },
  { id:'BLK-16', start:'2027-01-25', end:'2027-02-07', label:'FCH 260',           type:'clinical', primarySubjects:['Preventive Med & Public Health'],                  basicSubject:'Anatomy & Histology' },
  { id:'BLK-17', start:'2027-02-08', end:'2027-02-21', label:'FCH 260',           type:'clinical', primarySubjects:['Preventive Med & Public Health'],                  basicSubject:'Microbiology & Parasitology' },
  { id:'BLK-18', start:'2027-02-22', end:'2027-03-07', label:'OB-GYN 260',        type:'clinical', primarySubjects:['Obstetrics & Gynecology'],                         basicSubject:'Physiology' },
  { id:'BLK-19', start:'2027-03-08', end:'2027-03-21', label:'OB-GYN 260',        type:'clinical', primarySubjects:['Obstetrics & Gynecology'],                         basicSubject:'Biochemistry' },
  { id:'BLK-20', start:'2027-03-22', end:'2027-04-04', label:'OB-GYN 260',        type:'clinical', primarySubjects:['Obstetrics & Gynecology'],                         basicSubject:'Anatomy & Histology' },
  { id:'BLK-21', start:'2027-04-05', end:'2027-04-18', label:'OB-GYN 260',        type:'clinical', primarySubjects:['Obstetrics & Gynecology'],                         basicSubject:'Microbiology & Parasitology' },
  { id:'BLK-22', start:'2027-04-19', end:'2027-05-02', label:'MED 260',           type:'clinical', primarySubjects:['Internal Medicine','Pharmacology & Therapeutics'], basicSubject:'Pathology' },
  { id:'BLK-23', start:'2027-05-03', end:'2027-05-16', label:'MED 260',           type:'clinical', primarySubjects:['Internal Medicine','Pharmacology & Therapeutics'], basicSubject:'Legal Med, Jurisprudence & Ethics' },
  { id:'BLK-24', start:'2027-05-17', end:'2027-05-30', label:'MED 260',           type:'clinical', primarySubjects:['Internal Medicine','Pharmacology & Therapeutics'], basicSubject:'Biochemistry' },
  { id:'BLK-25', start:'2027-05-31', end:'2027-06-13', label:'[E] Neurosc 291.1', type:'sprint',   primarySubjects:[],                                                   basicSubject:null,                        note:'NSS Research — full basic science sprint' },
  { id:'BLK-26', start:'2027-06-14', end:'2027-06-30', label:'[E] Neurosc 291.1', type:'sprint',   primarySubjects:[],                                                   basicSubject:null,                        note:'NSS Research — full basic science sprint' },
  // ── BLITZ PERIOD Jul 2027 – Oct 2027 ─────────────────────────────────────
  { id:'BLK-27', start:'2027-07-02', end:'2027-07-31', label:'Core Consolidation Blitz', type:'blitz', primarySubjects:_ALL, basicSubject:null, dailyTarget:200, studyHours:8, note:'Phase 2: Bridge USMLE logic to PLE patterns. Close coverage gaps across all 12 subjects.' },
  { id:'BLK-28', start:'2027-08-01', end:'2027-08-31', label:'Dedicated PLE Sprint I',   type:'blitz', primarySubjects:_ALL, basicSubject:null, dailyTarget:225, studyHours:8, note:'Phase 3: High-stakes simulation mode. NBME Comp Forms 25–33 + Clinical Mastery.' },
  { id:'BLK-29', start:'2027-09-01', end:'2027-09-30', label:'Dedicated PLE Sprint II',  type:'blitz', primarySubjects:_ALL, basicSubject:null, dailyTarget:250, studyHours:8, note:'Phase 3: Weak zone elimination. Timed mocks + targeted review only.' },
  { id:'BLK-30', start:'2027-10-01', end:'2027-10-14', label:'Final Pre-Exam Sprint',    type:'blitz', primarySubjects:_ALL, basicSubject:null, dailyTarget:250, studyHours:8, note:'Final 2 weeks: simulation review, no new material. Protect sleep.' },
];

// Maps rotation block label → pre-assessment / qbank-daily / post-assessment study resources.
// Used by DutyRosterView (protocol reference) and TrackerView (today's brief).
export const BLOCK_PROTOCOL = {
  'MED 260':                { pre:'Amboss 200 Concepts S1 (cardio/pulm/renal)',            bank:'UWorld S2 IM + Mehlman HY Internal Medicine',               post:'Medicine SA Forms 5–10' },
  'PEDIA 260':              { pre:'PassMedicine S1 (peds/genetics)',                       bank:'UWorld S2 Peds + Mehlman HY Pediatrics',                    post:'Pediatrics SA Forms 5–9' },
  'SURG 260':               { pre:'USMLERx S1 (trauma/GI anatomy)',                        bank:'UWorld S2 Surgery + Mehlman HY Surgery + HY Emergency Med', post:'Surgery SA Forms 5–8' },
  'FCH 260.1':              { pre:'Amboss HY Biostatistics & Epidemiology',                bank:'UWorld S1 biostat + Mehlman HY Family Med + PH-LOCAL',      post:'Family Medicine SA Forms 2–4' },
  'FCH 260':                { pre:'Amboss S3 (ethics/QI/patient safety)',                  bank:'Amboss S3 + Legal Med Local + leftover UWorld S1/S2',        post:'Emergency Med SA Forms 1–3' },
  'OB-GYN 260':             { pre:'USMLERx S1 (repro/endo)',                               bank:'UWorld S2 OB-Gyn + Mehlman HY ObGyn',                       post:'Clinical OB-Gyn SA Forms 5–10' },
  '[E] MED 292':            { pre:'Amboss 200 Concepts S2 (GI/cardio)',                    bank:'UWorld S2 IM + Mehlman HY IM (GI/cardio focus)',             post:'Medicine SA Forms 7–9' },
  '[E] MED 291':            { pre:'Amboss 200 Concepts S2 (GI)',                           bank:'UWorld S2 GI + Mehlman HY IM (GI focus)',                    post:'Medicine SA Form 7' },
  '[E] Neurosc 291.1':      { pre:'All 6 basic sciences (full sprint)',                    bank:'UWorld S1 reset + Amboss S1 basic science',                  post:'NBME Comp Basic Science Forms 25–33' },
  'Core Consolidation Blitz': { pre:'Amboss 200 Concepts (mixed — all subjects)',          bank:'UWorld S2 + Amboss S3 (mixed — bridge to PLE)',              post:'NBME Comp + Clinical Mastery forms' },
  'Dedicated PLE Sprint I':   { pre:'NBME Comp Forms 25–29 (timed simulation)',            bank:'UWorld S2 incorrects reset + Amboss S3',                    post:'NBME Comp Forms 30–33 + Subject Exams' },
  'Dedicated PLE Sprint II':  { pre:'Weak zone targeted review (Analytics → Radar)',       bank:'Local Q-banks + Mehlman HY (all subjects)',                  post:'Clinical Mastery forms + Subject Exams' },
  'Final Pre-Exam Sprint':    { pre:'Mehlman HY (all subjects) — review only',             bank:'Timed mocks — no new material, pure recall',                post:'uWorld + NBME Self-Assessments' },
};
