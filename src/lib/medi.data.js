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
