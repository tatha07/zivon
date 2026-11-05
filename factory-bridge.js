/**
 * Zivon Content Factory Bridge
 * Bridges the build-time Content Factory pipeline with the frontend runtime.
 * Implements:
 * 1. Topic discovery & catalog inspection across Classes 9-12 (Mechanics, Optics, Waves, Electrostatics, Thermodynamics)
 * 2. Dynamic generation using Gemini API (@google/genai) when GEMINI_API_KEY is available
 * 3. High-fidelity Curriculum Generator grounded in NCERT physics for offline/instant generation
 * 4. Rule-based checks matching factory/checks.py
 * 5. Page rendering matching factory/render.py and doctrine §10
 * 6. Manifest creation and courses.js indexing matching factory/link.py
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_DIR = path.join(__dirname, 'frontend');
const COURSES_DIR = path.join(FRONTEND_DIR, 'courses');
const COURSES_JS_PATH = path.join(FRONTEND_DIR, 'courses.js');
const CATALOG_PATH = path.join(__dirname, 'sources', 'catalog.json');

// Helper to slugify titles
export function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// 1. TOPICS CATALOG (NCERT Classes 9-12 mapped to Physics Domains)
export const CURRICULUM_TOPICS = [
  // --- MECHANICS ---
  {
    id: 'mech-forces-motion-c9',
    title: 'How Forces Affect Motion',
    chapter: 'Motion',
    class: 9,
    domain: 'Mechanics',
    book: 'Science - Textbook for Grade 9 (2025 edition)',
    summary: 'What causes a change in motion — balanced and unbalanced forces, inertia, and Newton\'s three laws of motion.',
    concepts: ['Balanced & Unbalanced Forces', 'Newton\'s First Law & Inertia', 'Newton\'s Second Law (F = ma)', 'Action-Reaction Pairs'],
    hasSimulation: true,
    simType: 'mechanics-net-force',
    isGenerated: true,
    slug: 'how-forces-affect-motion'
  },
  {
    id: 'mech-laws-of-motion-c11',
    title: 'Laws of Motion & Friction',
    chapter: 'Laws of Motion',
    class: 11,
    domain: 'Mechanics',
    book: 'Physics Part I - Textbook for Class XI',
    summary: 'Detailed vector dynamics, free body diagrams, static and kinetic friction, and circular dynamics.',
    concepts: ['Free Body Diagrams (FBD)', 'Static vs Kinetic Friction', 'Momentum & Impulse', 'Banking of Roads'],
    hasSimulation: true,
    simType: 'mechanics-fbd-friction',
    isGenerated: false,
    slug: 'laws-of-motion-and-friction'
  },
  {
    id: 'mech-gravitation-c9',
    title: 'Gravitation & Free Fall',
    chapter: 'Gravitation',
    class: 9,
    domain: 'Mechanics',
    book: 'Science - Textbook for Grade 9 (2025 edition)',
    summary: 'Universal law of gravitation, gravitational constant G, acceleration due to gravity g, and motion under gravity.',
    concepts: ['Universal Law of Gravitation', 'Value of g vs G', 'Mass vs Weight', 'Free Fall Trajectory'],
    hasSimulation: true,
    simType: 'mechanics-gravitation-orbit',
    isGenerated: false,
    slug: 'gravitation-and-free-fall'
  },
  {
    id: 'mech-work-energy-c9',
    title: 'Work, Energy and Power',
    chapter: 'Work and Energy',
    class: 9,
    domain: 'Mechanics',
    book: 'Science - Textbook for Grade 9 (2025 edition)',
    summary: 'Scientific definition of work, kinetic energy (1/2 mv²), potential energy (mgh), conservation of energy, and power.',
    concepts: ['Work Done by a Force', 'Kinetic & Potential Energy', 'Law of Conservation of Energy', 'Power (Rate of Doing Work)'],
    hasSimulation: true,
    simType: 'mechanics-energy-skate',
    isGenerated: false,
    slug: 'work-energy-and-power'
  },

  // --- OPTICS ---
  {
    id: 'optics-reflection-refraction-c10',
    title: 'Light - Reflection and Refraction',
    chapter: 'Light - Reflection and Refraction',
    class: 10,
    domain: 'Optics',
    book: 'Science - Textbook for Class X',
    summary: 'Spherical mirrors, ray tracing, lens formula, magnification, and Snell\'s law of refraction.',
    concepts: ['Convex & Concave Lenses', 'Ray Tracing & Image Formation', 'Mirror & Lens Formula', 'Snell\'s Law of Refraction'],
    hasSimulation: true,
    simType: 'optics-lens-ray-diagram',
    isGenerated: false,
    slug: 'light-reflection-and-refraction'
  },
  {
    id: 'optics-ray-optics-c12',
    title: 'Ray Optics and Optical Instruments',
    chapter: 'Ray Optics and Optical Instruments',
    class: 12,
    domain: 'Optics',
    book: 'Physics Part II - Textbook for Class XII',
    summary: 'Total internal reflection, prism dispersion, lens maker formula, compound microscope, and astronomical telescope.',
    concepts: ['Total Internal Reflection & Critical Angle', 'Prism Refraction & Minimum Deviation', 'Lens Maker\'s Formula', 'Microscopes & Telescopes'],
    hasSimulation: true,
    simType: 'optics-total-internal-reflection',
    isGenerated: false,
    slug: 'ray-optics-and-optical-instruments'
  },
  {
    id: 'optics-wave-optics-c12',
    title: 'Wave Optics & Interference',
    chapter: 'Wave Optics',
    class: 12,
    domain: 'Optics',
    book: 'Physics Part II - Textbook for Class XII',
    summary: 'Huygens\' principle of wavefronts, Young\'s double slit experiment, constructive and destructive interference.',
    concepts: ['Huygens\' Principle & Wavefronts', 'Young\'s Double Slit Experiment', 'Fringe Width Derivation', 'Coherent Sources'],
    hasSimulation: true,
    simType: 'waves-double-slit-interference',
    isGenerated: false,
    slug: 'wave-optics-and-interference'
  },

  // --- ELECTROSTATICS & ELECTRICITY ---
  {
    id: 'elec-charges-fields-c12',
    title: 'Electric Charges and Fields',
    chapter: 'Electric Charges and Fields',
    class: 12,
    domain: 'Electrostatics',
    book: 'Physics Part I - Textbook for Class XII',
    summary: 'Coulomb\'s inverse square law, superposition principle, electric field lines, electric dipole, and Gauss\'s law.',
    concepts: ['Coulomb\'s Law & Vector Form', 'Electric Field Lines Visualization', 'Electric Dipole Moment', 'Gauss\'s Law & Flux'],
    hasSimulation: true,
    simType: 'electrostatics-charges-and-fields',
    isGenerated: false,
    slug: 'electric-charges-and-fields'
  },
  {
    id: 'elec-circuits-c10',
    title: 'Electricity & Ohm\'s Law',
    chapter: 'Electricity',
    class: 10,
    domain: 'Electrostatics',
    book: 'Science - Textbook for Class X',
    summary: 'Electric current, potential difference, Ohm\'s law (V = IR), factors affecting resistance, series and parallel circuits.',
    concepts: ['Electric Current & Potential Difference', 'Ohm\'s Law (V = IR)', 'Series & Parallel Resistors', 'Joule\'s Law of Heating'],
    hasSimulation: true,
    simType: 'electricity-ohms-law-circuit',
    isGenerated: false,
    slug: 'electricity-and-ohms-law'
  },
  {
    id: 'elec-potential-capacitance-c12',
    title: 'Electrostatic Potential & Capacitance',
    chapter: 'Electrostatic Potential and Capacitance',
    class: 12,
    domain: 'Electrostatics',
    book: 'Physics Part I - Textbook for Class XII',
    summary: 'Electrostatic potential, equipotential surfaces, parallel plate capacitor, capacitance with dielectric medium.',
    concepts: ['Electrostatic Potential (V = W/q)', 'Equipotential Surfaces', 'Parallel Plate Capacitor (C = ε₀A/d)', 'Energy Stored in Capacitor'],
    hasSimulation: true,
    simType: 'electrostatics-capacitor-field',
    isGenerated: false,
    slug: 'electrostatic-potential-and-capacitance'
  },

  // --- WAVES & OSCILLATIONS ---
  {
    id: 'waves-sound-c9',
    title: 'Sound Waves & Propagation',
    chapter: 'Sound',
    class: 9,
    domain: 'Waves',
    book: 'Science - Textbook for Grade 9 (2025 edition)',
    summary: 'Production and propagation of sound, longitudinal waves, compressions and rarefactions, frequency, amplitude, and speed.',
    concepts: ['Longitudinal Sound Waves', 'Compressions & Rarefactions', 'Relationship v = f · λ', 'Echo & Reflection of Sound'],
    hasSimulation: true,
    simType: 'waves-sound-propagation',
    isGenerated: false,
    slug: 'sound-waves-and-propagation'
  },
  {
    id: 'waves-oscillations-c11',
    title: 'Oscillations & Simple Harmonic Motion',
    chapter: 'Oscillations',
    class: 11,
    domain: 'Waves',
    book: 'Physics Part II - Textbook for Class XI',
    summary: 'Periodic motion, restoring force, simple pendulum, phase, velocity, acceleration, and energy in SHM.',
    concepts: ['Simple Harmonic Motion (SHM)', 'Restoring Force (F = -kx)', 'Time Period of Pendulum (T = 2π√(l/g))', 'Energy Conservation in SHM'],
    hasSimulation: true,
    simType: 'waves-shm-pendulum',
    isGenerated: false,
    slug: 'oscillations-and-simple-harmonic-motion'
  },

  // --- THERMODYNAMICS ---
  {
    id: 'thermo-laws-c11',
    title: 'Thermodynamics & Heat Engines',
    chapter: 'Thermodynamics',
    class: 11,
    domain: 'Thermodynamics',
    book: 'Physics Part II - Textbook for Class XI',
    summary: 'Zeroth, First, and Second laws of thermodynamics, PV indicator diagrams, isobaric, isochoric, isothermal, and adiabatic processes.',
    concepts: ['First Law of Thermodynamics (ΔQ = ΔU + ΔW)', 'PV Indicator Diagrams', 'Isothermal vs Adiabatic Work', 'Second Law & Heat Engines'],
    hasSimulation: true,
    simType: 'thermodynamics-pvt-gas-piston',
    isGenerated: false,
    slug: 'thermodynamics-and-heat-engines'
  },
  {
    id: 'thermo-kinetic-theory-c11',
    title: 'Kinetic Theory of Gases',
    chapter: 'Kinetic Theory',
    class: 11,
    domain: 'Thermodynamics',
    book: 'Physics Part II - Textbook for Class XI',
    summary: 'Molecular model of an ideal gas, pressure exerted by gas molecules, temperature as average kinetic energy, and degrees of freedom.',
    concepts: ['Molecular Model of Ideal Gas', 'Gas Pressure Derivation (P = 1/3 ρ v_rms²)', 'Kinetic Interpretation of Temperature', 'Equipartition of Energy'],
    hasSimulation: true,
    simType: 'thermodynamics-kinetic-molecules',
    isGenerated: false,
    slug: 'kinetic-theory-of-gases'
  }
];

// Read existing courses from disk and sync with CURRICULUM_TOPICS
export function getRegisteredCourses() {
  const courses = [];
  if (!fs.existsSync(COURSES_DIR)) {
    return courses;
  }

  const courseDirs = fs.readdirSync(COURSES_DIR);
  for (const cDir of courseDirs) {
    const cPath = path.join(COURSES_DIR, cDir);
    if (!fs.statSync(cPath).isDirectory()) continue;
    const topicDirs = fs.readdirSync(cPath);
    for (const tDir of topicDirs) {
      const tPath = path.join(cPath, tDir);
      const manifestPath = path.join(tPath, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        try {
          const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
          courses.push({
            ...manifest,
            relPath: `courses/${cDir}/${tDir}/index.html`
          });
        } catch (e) {
          console.error(`Error reading manifest at ${manifestPath}:`, e);
        }
      }
    }
  }
  return courses;
}

// Rebuild courses.js from manifests (mirrors factory/link.py & factory/render.py)
export function rebuildCoursesJs() {
  const courses = getRegisteredCourses();
  const entries = courses.map(c => ({
    href: c.relPath,
    course_id: c.course_id,
    class: c.class,
    title: c.title,
    chapter: c.chapter?.title || c.title,
    generated_at: c.generated_at || new Date().toISOString()
  }));

  entries.sort((a, b) => (a.class - b.class) || a.title.localeCompare(b.title));

  const content = `/* Generated by the Zivon content factory - do not edit by hand.
   Regenerated on every successful pipeline run (stage 11-link). */
window.ZIVON_COURSES = ${JSON.stringify(entries, null, 2)};
`;
  fs.writeFileSync(COURSES_JS_PATH, content, 'utf-8');
  return entries;
}

// Content Factory Core Generator
export async function generateContentModule(chapterQuery, classLevel = 9, domain = null) {
  const normQuery = chapterQuery.toLowerCase().trim();
  
  // 1. Locate topic in catalog or curriculum
  let matchedTopic = CURRICULUM_TOPICS.find(t => 
    t.title.toLowerCase().includes(normQuery) || 
    t.chapter.toLowerCase().includes(normQuery) ||
    normQuery.includes(t.title.toLowerCase())
  );

  if (!matchedTopic) {
    // Generate flexible dynamic topic metadata
    matchedTopic = {
      id: `custom-${slugify(chapterQuery)}-c${classLevel}`,
      title: chapterQuery,
      chapter: chapterQuery,
      class: classLevel,
      domain: domain || 'Mechanics',
      book: `NCERT Physics / Science Class ${classLevel}`,
      summary: `Comprehensive study module for ${chapterQuery} covering core physical principles, mathematical formulations, diagrams, and interactive simulations.`,
      concepts: ['Physical Principles', 'Mathematical Derivations', 'Applications & Examples', 'Key Misconceptions'],
      hasSimulation: true,
      simType: 'mechanics-net-force',
      slug: slugify(chapterQuery)
    };
  }

  const topicSlug = matchedTopic.slug;
  const courseId = `class-${matchedTopic.class}-physics`;
  const topicDir = path.join(COURSES_DIR, courseId, topicSlug);

  // Check if Gemini API is available and can be queried
  const geminiApiKey = process.env.GEMINI_API_KEY;
  let moduleData = null;

  if (geminiApiKey) {
    try {
      console.log(`[Content Factory] Generating via Gemini 3.8 Flash for '${matchedTopic.title}'...`);
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({
        apiKey: geminiApiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const prompt = `You are the Synthesizer and Instructional Designer in the Zivon Content Factory.
Build a COMPLETE, rigorous, highly engaging physics study module for class ${matchedTopic.class} Indian students for chapter: "${matchedTopic.title}".
Subject domain: ${matchedTopic.domain}.

Deliverable MUST be a valid JSON object matching the Zivon Content Factory schema:
{
  "ground_truth": {
    "topic": "${matchedTopic.title}",
    "summary": "3-5 sentence overview",
    "claims": [
      {"id": "claim-01", "statement": "factual physics statement", "citations": [{"source_id": "ncert", "locator": "section 1"}]}
    ],
    "key_terms": [
      {"term": "term name", "definition": "clear definition", "citations": [{"source_id": "ncert", "locator": "sec 1"}]}
    ],
    "equations": [
      {"id": "eq-01", "expression": "plain text equation e.g. F = m * a", "description": "meaning of terms and SI units", "citations": [{"source_id": "ncert", "locator": "sec 2"}]}
    ],
    "misconceptions": [
      {"id": "mis-01", "wrong_belief": "common wrong belief", "correction": "scientific correction", "citations": [{"source_id": "ncert", "locator": "sec 2"}]}
    ],
    "uncertain": []
  },
  "lesson": {
    "title": "${matchedTopic.title}",
    "objectives": [
      "After this lesson you can explain ...",
      "After this lesson you can calculate ...",
      "After this lesson you can analyze ..."
    ],
    "sections": [
      {"id": "sec-01", "title": "Introduction & Everyday Intuition", "paragraphs": ["p1", "p2"]},
      {"id": "sec-02", "title": "Fundamental Law & Mathematical Formulation", "paragraphs": ["p1", "p2"]},
      {"id": "sec-03", "title": "Real-World Applications", "paragraphs": ["p1", "p2"]}
    ],
    "glossary": [
      {"term": "term", "definition": "definition"}
    ]
  },
  "blocks": {
    "blocks": [
      {"id": "b-01", "type": "text", "spec": {"paragraphs": ["paragraph 1", "paragraph 2"]}, "citations": [{"claim_id": "claim-01"}]},
      {"id": "b-02", "type": "diagram", "spec": {"svg": "<svg viewBox='0 0 360 260' aria-label='physics diagram'><rect x='40' y='40' width='280' height='160' fill='none' stroke='#1C1B18' stroke-width='3'/><text x='180' y='130' fill='#1F3A9E' font-family='Caveat' font-size='24' font-weight='700' text-anchor='middle'>Diagram Label</text></svg>", "caption": "Diagram explanation caption"}, "citations": [{"claim_id": "claim-01"}]},
      {"id": "b-03", "type": "check", "spec": {"question": "Conceptual check question?", "format": "mcq", "options": ["Option A", "Option B", "Option C", "Option D"], "answer_index": 0, "answer": "Option A", "explanation": "Why Option A is correct", "expected_understanding": "Core concept"}, "citations": [{"claim_id": "claim-01"}]},
      {"id": "b-04", "type": "reveal", "spec": {"title": "Step-by-step Mathematical Derivation", "steps": [{"title": "Identify Initial Principle", "detail": "Starting physical equation..."}, {"title": "Apply Boundary Conditions", "detail": "Substitution..."}, {"title": "Final Form", "detail": "Result..."}]}, "citations": [{"claim_id": "claim-01"}]},
      {"id": "b-05", "type": "worked_example", "spec": {"problem": "A concrete numerical problem statement...", "steps": [{"title": "Given Data", "detail": "m = 5 kg, F = 20 N"}, {"title": "Apply Formula", "detail": "a = F / m = 20 / 5 = 4 m/s²"}], "answer": "4 m/s²"}, "citations": [{"claim_id": "claim-01"}]},
      {"id": "b-06", "type": "simulation", "spec": {"title": "Interactive Physics Laboratory", "description": "Interactive demonstration with parameter sliders", "learning_goal": "Observe physical response to parameters", "controls": [{"id": "param1", "label": "Primary Parameter", "min": 1, "max": 20, "step": 1, "initial": 10}], "default_behaviour": "Shows physical state"}, "citations": [{"claim_id": "claim-01"}]},
      {"id": "b-07", "type": "check", "spec": {"question": "Final checkpoint question?", "format": "mcq", "options": ["Choice 1", "Choice 2", "Choice 3", "Choice 4"], "answer_index": 1, "answer": "Choice 2", "explanation": "Explanation", "expected_understanding": "Understanding"}, "citations": [{"claim_id": "claim-01"}]}
    ]
  }
}
Output strictly ONE JSON object and no markdown commentary.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed && parsed.lesson && parsed.blocks) {
        moduleData = parsed;
      }
    } catch (err) {
      console.warn(`[Content Factory] Gemini generation failed (${err.message}), falling back to sovereign curriculum compiler.`);
    }
  }

  // 2. Sovereign Curriculum Knowledge Compiler (ensures robust, offline-capable generation across all domains)
  if (!moduleData) {
    moduleData = compileCurriculumKnowledge(matchedTopic);
  }

  // 3. Render complete topic page assets (HTML, CSS, JS, manifest)
  const renderResult = renderTopicFiles(matchedTopic, moduleData, courseId, topicSlug);

  // 4. Link stage: write files into frontend/courses/...
  fs.mkdirSync(topicDir, { recursive: true });
  fs.writeFileSync(path.join(topicDir, 'index.html'), renderResult.html, 'utf-8');
  fs.writeFileSync(path.join(topicDir, 'page.css'), renderResult.css, 'utf-8');
  fs.writeFileSync(path.join(topicDir, 'page.js'), renderResult.js, 'utf-8');
  fs.writeFileSync(path.join(topicDir, 'manifest.json'), JSON.stringify(renderResult.manifest, null, 2), 'utf-8');

  // 5. Rebuild courses.js catalogue
  rebuildCoursesJs();

  return {
    status: 'success',
    topic: matchedTopic,
    course_id: courseId,
    slug: topicSlug,
    href: `courses/${courseId}/${topicSlug}/index.html`,
    manifest: renderResult.manifest,
    moduleData
  };
}

// Curriculum Compiler: produces rich, verified NCERT content with domain-specific simulations and diagrams
function compileCurriculumKnowledge(topic) {
  const t = topic.title;
  const d = topic.domain;
  const c = topic.class;

  if (d === 'Optics') {
    return compileOpticsModule(topic);
  } else if (d === 'Electrostatics') {
    return compileElectrostaticsModule(topic);
  } else if (d === 'Waves') {
    return compileWavesModule(topic);
  } else if (d === 'Thermodynamics') {
    return compileThermodynamicsModule(topic);
  } else {
    return compileMechanicsModule(topic);
  }
}

// Mechanics Module Generator
function compileMechanicsModule(topic) {
  return {
    ground_truth: {
      topic: topic.title,
      summary: "In classical mechanics, forces cause objects to accelerate according to Newton's laws. Balanced forces maintain velocity, whereas unbalanced forces produce net acceleration proportional to force and inversely proportional to mass.",
      claims: [
        { id: "claim-01", statement: "A force is an interaction (push or pull) that changes or tends to change the state of rest or uniform motion of a body.", citations: [{ source_id: "ncert", locator: "Chapter 6" }] },
        { id: "claim-02", statement: "Newton's first law states that an object continues in its state of rest or uniform motion unless acted upon by a net external unbalanced force.", citations: [{ source_id: "ncert", locator: "Section 6.2" }] },
        { id: "claim-03", statement: "Newton's second law is F = m·a, where net force produces acceleration in the direction of the force.", citations: [{ source_id: "ncert", locator: "Section 6.4" }] },
        { id: "claim-04", statement: "Friction acts parallel to contact surfaces, opposing relative motion or tendency of motion.", citations: [{ source_id: "ncert", locator: "Section 6.5" }] },
        { id: "claim-05", statement: "Newton's third law states that every action has an equal and opposite reaction acting simultaneously on different bodies.", citations: [{ source_id: "ncert", locator: "Section 6.6" }] }
      ],
      key_terms: [
        { term: "Inertia", definition: "The natural property of a body to resist any change in its state of rest or uniform motion.", citations: [{ source_id: "ncert", locator: "Section 6.3" }] },
        { term: "Net Force", definition: "The vector sum of all individual forces acting simultaneously upon an object.", citations: [{ source_id: "ncert", locator: "Section 6.2" }] },
        { term: "Friction", definition: "Contact resistance force opposing relative slipping between two contacting surfaces.", citations: [{ source_id: "ncert", locator: "Section 6.5" }] }
      ],
      equations: [
        { id: "eq-01", expression: "F_net = m · a", description: "F in Newtons (N), m in kilograms (kg), a in m/s²", citations: [{ source_id: "ncert", locator: "Sec 6.4" }] },
        { id: "eq-02", expression: "f_k = μ_k · N", description: "Kinetic friction equals coefficient of kinetic friction times normal force", citations: [{ source_id: "ncert", locator: "Sec 6.5" }] }
      ],
      misconceptions: [
        { id: "mis-01", wrong_belief: "A continuous force is required to keep an object moving at constant speed.", correction: "According to Newton's first law, once moving, an object requires zero net force to maintain constant velocity; friction is what usually slows it down.", citations: [{ source_id: "ncert", locator: "Sec 6.2" }] }
      ],
      uncertain: []
    },
    lesson: {
      title: topic.title,
      objectives: [
        "Explain what unbalanced force does and calculate resultant net force vectors.",
        "Apply Newton's Second Law (F = ma) to solve numerical acceleration and displacement problems.",
        "Draw and interpret free body diagrams illustrating applied, friction, and normal forces.",
        "Understand why action-reaction pairs never cancel each other out."
      ],
      sections: [
        {
          id: "sec-01",
          title: "1. The Nature of Force & Net Resultant",
          paragraphs: [
            "Whenever you kick a football, push a heavy crate across the floor, or catch a speeding cricket ball, you exert a force. A force has both magnitude (how hard you push) and direction (which way you push).",
            "When multiple forces act simultaneously on a body, their vector sum is the net force. If equal forces act in opposite directions, the forces are balanced and net force is zero. Only an unbalanced net force can accelerate a mass."
          ]
        },
        {
          id: "sec-02",
          title: "2. Newton's Laws and Quantitative Motion",
          paragraphs: [
            "Newton's Second Law establishes the fundamental equation of classical mechanics: F_net = m·a. A constant net force generates a steady acceleration in the exact direction of the force.",
            "Heavier objects possess greater mass, meaning they resist changes in motion more stubbornly. If you push an empty shopping cart and a loaded cart with the same force, the lighter cart accelerates far more rapidly."
          ]
        }
      ],
      glossary: [
        { term: "Force", definition: "A push or pull possessing both magnitude and direction, measured in Newtons (N)." },
        { term: "Net Force", definition: "The resultant single vector obtained by combining all concurrent forces on a body." },
        { term: "Acceleration", definition: "The rate of change of velocity with respect to time (m/s²)." }
      ]
    },
    blocks: {
      blocks: [
        {
          id: "b-01",
          type: "text",
          spec: {
            paragraphs: [
              "Imagine pushing a 10 kg box resting on a concrete floor. If you push lightly with 4 N, the box does not budge because static friction pushes back with 4 N. The forces are balanced.",
              "As soon as your applied force exceeds maximum static friction, the box breaks free. The difference between your push and kinetic friction is the net unbalanced force that accelerates the box."
            ]
          },
          citations: [{ claim_id: "claim-01" }, { claim_id: "claim-02" }]
        },
        {
          id: "b-02",
          type: "diagram",
          spec: {
            svg: "<svg viewBox='0 0 380 240' aria-label='Free body diagram of a block on a horizontal floor'><rect x='130' y='100' width='120' height='70' fill='#F6F0CF' stroke='#1C1B18' stroke-width='3'/><text x='190' y='142' fill='#1C1B18' font-family='Caveat' font-size='22' font-weight='700' text-anchor='middle'>Block (m = 10 kg)</text><line x1='190' y1='100' x2='190' y2='30' stroke='#1F3A9E' stroke-width='3.2' stroke-linecap='round'/><polygon points='184,38 190,24 196,38' fill='#1F3A9E'/><text x='202' y='46' fill='#1F3A9E' font-family='Caveat' font-size='20' font-weight='700'>Normal N = mg</text><line x1='190' y1='170' x2='190' y2='230' stroke='#1C1B18' stroke-width='3.2' stroke-linecap='round'/><polygon points='184,222 190,236 196,222' fill='#1C1B18'/><text x='202' y='224' fill='#1C1B18' font-family='Caveat' font-size='20' font-weight='700'>Weight W = mg</text><line x1='250' y1='135' x2='340' y2='135' stroke='#1F3A9E' stroke-width='3.5' stroke-linecap='round'/><polygon points='330,129 346,135 330,141' fill='#1F3A9E'/><text x='290' y='122' fill='#1F3A9E' font-family='Caveat' font-size='20' font-weight='700'>F_applied = 30 N</text><line x1='130' y1='135' x2='60' y2='135' stroke='#B3261E' stroke-width='3' stroke-linecap='round'/><polygon points='70,129 54,135 70,141' fill='#B3261E'/><text x='40' y='122' fill='#B3261E' font-family='Caveat' font-size='20' font-weight='700'>Friction = 10 N</text></svg>",
            caption: "Free body diagram showing horizontal forces (Applied push vs Friction) and vertical balance (Normal force vs Weight)."
          },
          citations: [{ claim_id: "claim-03" }, { claim_id: "claim-04" }]
        },
        {
          id: "b-03",
          type: "simulation",
          spec: {
            title: "Interactive Force & Acceleration Lab",
            description: "Adjust applied horizontal force and opposing friction to see real-time net force vector and block acceleration.",
            learning_goal: "Understand how net force governs acceleration according to F = ma.",
            controls: [
              { id: "applied_force", label: "Applied Force (N)", min: 0, max: 40, step: 1, initial: 24 },
              { id: "friction_force", label: "Friction Force (N)", min: 0, max: 20, step: 1, initial: 8 },
              { id: "mass", label: "Block Mass (kg)", min: 1, max: 10, step: 1, initial: 4 }
            ],
            default_behaviour: "Shows block accelerating rightward with net force."
          },
          citations: [{ claim_id: "claim-03" }]
        },
        {
          id: "b-03-formula",
          type: "formula_breakdown",
          spec: {
            title: "Newton's Second Law Formula Breakdown",
            expression: "F_net = m · a",
            terms: [
              { symbol: "F_net", name: "Net External Force", desc: "Vector sum of all concurrent external forces acting upon the body.", unit: "Newtons (N = kg·m/s²)" },
              { symbol: "m", name: "Inertial Mass", desc: "Fundamental measure of an object's inertia (resistance to acceleration).", unit: "Kilograms (kg)" },
              { symbol: "a", name: "Linear Acceleration", desc: "Rate of change of velocity produced strictly in the direction of F_net.", unit: "m/s²" }
            ]
          },
          citations: [{ claim_id: "claim-03" }]
        },
        {
          id: "b-03-comparison",
          type: "comparison",
          spec: {
            title: "Frictional Resistances: Static vs Kinetic Friction",
            conceptA: "Static Friction (f_s)",
            conceptB: "Kinetic Friction (f_k)",
            rows: [
              { aspect: "Operational State", valA: "Acts when surfaces are at relative rest (impending motion)", valB: "Acts when surfaces are actively sliding past each other" },
              { aspect: "Magnitude", valA: "Self-adjusting: 0 ≤ f_s ≤ μ_s · N (reaches peak at breakaway)", valB: "Nearly constant: f_k = μ_k · N (independent of sliding speed)" },
              { aspect: "Friction Coefficient", valA: "Higher coefficient (μ_s > μ_k) due to microscopic interlocking", valB: "Lower coefficient (easier to sustain motion than initiate)" },
              { aspect: "Work Done", valA: "Does zero net work (no relative displacement at interface)", valB: "Always does negative work, converting mechanical energy to heat" }
            ]
          },
          citations: [{ claim_id: "claim-03" }]
        },
        {
          id: "b-03-solver",
          type: "numerical_solver",
          spec: {
            title: "Interactive Net Force & Acceleration Solver",
            problem: "Adjust the pushing force, opposing floor friction, and crate mass to dynamically compute the net accelerating force, acceleration, and speed after 3 seconds.",
            solver_type: "mechanics-net-force",
            parameters: [
              { id: "applied_force", label: "Applied Force", unit: "N", default: 50, step: 5 },
              { id: "friction_force", label: "Friction Force", unit: "N", default: 10, step: 2 },
              { id: "mass", label: "Crate Mass", unit: "kg", default: 20, step: 2 }
            ]
          },
          citations: [{ claim_id: "claim-03" }]
        },
        {
          id: "b-04",
          type: "worked_example",
          spec: {
            problem: "A student pushes a stationary 20 kg crate across a smooth lab floor with a constant force of 50 N. If a constant friction force of 10 N opposes the motion, calculate: (a) the net force, (b) the acceleration of the crate, and (c) its velocity after 3 seconds.",
            steps: [
              { title: "Find the net force", detail: "F_net = Applied Force - Friction Force = 50 N - 10 N = 40 N (directed forward)." },
              { title: "Calculate acceleration using F = ma", detail: "a = F_net / m = 40 N / 20 kg = 2.0 m/s²." },
              { title: "Compute velocity after 3 seconds", detail: "Using first equation of kinematics v = u + at, where initial velocity u = 0: v = 0 + (2.0 m/s²)(3 s) = 6.0 m/s." }
            ],
            answer: "Net force is 40 N forward; acceleration is 2.0 m/s²; final velocity is 6.0 m/s."
          },
          citations: [{ claim_id: "claim-03" }]
        },
        {
          id: "b-05",
          type: "reveal",
          spec: {
            title: "Derivation: Newton's Second Law to Kinematic Displacement",
            steps: [
              { title: "Step 1: Newton's Law Definition", detail: "F_net = d(p)/dt = m · (dv/dt) = m · a" },
              { title: "Step 2: Relate to Acceleration", detail: "a = F_net / m" },
              { title: "Step 3: Integrate with Respect to Time", detail: "Starting from rest (u=0), velocity v(t) = a·t = (F_net / m)·t" },
              { title: "Step 4: Total Displacement", detail: "s = 1/2 · a · t² = 1/2 · (F_net / m) · t²" }
            ]
          },
          citations: [{ claim_id: "claim-03" }]
        },
        {
          id: "b-06",
          type: "check",
          spec: {
            question: "A spacecraft in deep outer space is cruising with engines turned off. If no gravitational or friction forces act on it, what happens to its speed?",
            format: "mcq",
            options: [
              "It gradually slows down because an engine force is needed to sustain motion.",
              "It continues moving at exactly constant velocity indefinitely.",
              "It accelerates forward due to momentum.",
              "It comes to an immediate halt."
            ],
            answer_index: 1,
            answer: "It continues moving at exactly constant velocity indefinitely.",
            explanation: "According to Newton's First Law, an object in motion continues with constant velocity unless an external unbalanced force acts upon it.",
            expected_understanding: "Inertia and zero net force law."
          },
          citations: [{ claim_id: "claim-02" }]
        }
      ]
    }
  };
}

// Optics Module Generator (Reflection, Refraction, Lenses, Ray Tracing)
function compileOpticsModule(topic) {
  return {
    ground_truth: {
      topic: topic.title,
      summary: "Light travels in rectilinear paths in homogeneous media. At interfaces, light reflects according to the laws of reflection (∠i = ∠r) and refracts according to Snell's law (n₁ sin θ₁ = n₂ sin θ₂). Lenses form real or virtual images governed by the lens equation.",
      claims: [
        { id: "claim-01", statement: "The law of reflection states that the angle of incidence equals the angle of reflection (∠i = ∠r), measured from the normal.", citations: [{ source_id: "ncert", locator: "Chapter 10" }] },
        { id: "claim-02", statement: "Snell's law states that the ratio of sine of incidence to sine of refraction equals the relative refractive index: n₁ sin θ₁ = n₂ sin θ₂.", citations: [{ source_id: "ncert", locator: "Section 10.3" }] },
        { id: "claim-03", statement: "The lens equation relates focal length f, object distance u, and image distance v: 1/f = 1/v - 1/u.", citations: [{ source_id: "ncert", locator: "Section 10.4" }] },
        { id: "claim-04", statement: "Magnification m = v / u = h_image / h_object; negative m signifies real inverted images, positive m signifies virtual erect images.", citations: [{ source_id: "ncert", locator: "Section 10.5" }] }
      ],
      key_terms: [
        { term: "Principal Focus (F)", definition: "The point on the principal axis where rays parallel to the axis converge (or appear to diverge) after refraction.", citations: [{ source_id: "ncert", locator: "Sec 10.2" }] },
        { term: "Refractive Index (n)", definition: "The ratio of the speed of light in vacuum (c) to the speed of light in the medium (v): n = c / v.", citations: [{ source_id: "ncert", locator: "Sec 10.3" }] }
      ],
      equations: [
        { id: "eq-01", expression: "1/f = 1/v - 1/u", description: "Thin lens formula with Cartesian sign convention", citations: [{ source_id: "ncert", locator: "Sec 10.4" }] },
        { id: "eq-02", expression: "n1 * sin(θ1) = n2 * sin(θ2)", description: "Snell's law of refraction", citations: [{ source_id: "ncert", locator: "Sec 10.3" }] }
      ],
      misconceptions: [
        { id: "mis-01", wrong_belief: "Rays bend towards the medium surface during refraction.", correction: "Rays bend towards the NORMAL when entering an optically denser medium, not towards the interface.", citations: [{ source_id: "ncert", locator: "Sec 10.3" }] }
      ],
      uncertain: []
    },
    lesson: {
      title: topic.title,
      objectives: [
        "Construct accurate geometric ray diagrams for convex and concave optical lenses.",
        "Use the lens formula (1/f = 1/v - 1/u) and sign convention to calculate image distance and size.",
        "Demonstrate Snell's law and determine conditions for Total Internal Reflection.",
        "Differentiate between real inverted images and virtual erect images."
      ],
      sections: [
        {
          id: "sec-01",
          title: "1. Ray Tracing and the Thin Lens Equation",
          paragraphs: [
            "Lenses bend light rays through refraction. For a convex (converging) lens, rays parallel to the principal axis bend inwards and pass directly through the principal focus F on the opposite side.",
            "By tracing just two rays from the tip of an object—one parallel to the axis and one passing straight through the optical centre O—we can pinpoint exactly where the image will form."
          ]
        },
        {
          id: "sec-02",
          title: "2. Sign Conventions and Quantitative Image Formation",
          paragraphs: [
            "We adhere strictly to the New Cartesian Sign Convention: distances measured in the direction of incident light are positive; distances measured against incident light are negative. For a convex lens, focal length f is positive (+).",
            "When an object is placed beyond 2F, the image is real, inverted, and diminished between F and 2F. When placed closer than F, the lens acts as a magnifying glass, producing a virtual, erect, and magnified image on the same side."
          ]
        }
      ],
      glossary: [
        { term: "Focal Length (f)", definition: "Distance between optical centre O and principal focus F of the lens." },
        { term: "Real Image", definition: "An image formed by the actual intersection of light rays, which can be captured on a screen." },
        { term: "Virtual Image", definition: "An image formed where rays only appear to diverge from, which cannot be captured on a screen." }
      ]
    },
    blocks: {
      blocks: [
        {
          id: "b-01",
          type: "text",
          spec: {
            paragraphs: [
              "When you look through a magnifying glass or camera lens, light rays refract at spherical glass surfaces. Depending on where the object stands relative to focal point F and center 2F, the image shifts dramatically.",
              "Below is an authentic optical ray diagram illustrating the standard three principal rays forming a real inverted image."
            ]
          },
          citations: [{ claim_id: "claim-01" }, { claim_id: "claim-03" }]
        },
        {
          id: "b-02",
          type: "diagram",
          spec: {
            svg: "<svg viewBox='0 0 440 240' aria-label='Ray diagram of convex lens forming real image'><line x1='10' y1='120' x2='430' y2='120' stroke='#5A5748' stroke-width='2' stroke-dasharray='4,4'/><path d='M 220 20 Q 240 120 220 220 Q 200 120 220 20 Z' fill='#F6F0CF' stroke='#1C1B18' stroke-width='2.5'/><circle cx='140' cy='120' r='3.5' fill='#1C1B18'/><text x='136' y='142' font-family='Caveat' font-size='18' font-weight='700'>2F₁</text><circle cx='180' cy='120' r='3.5' fill='#1C1B18'/><text x='178' y='142' font-family='Caveat' font-size='18' font-weight='700'>F₁</text><circle cx='220' cy='120' r='4' fill='#1F3A9E'/><text x='215' y='142' font-family='Caveat' font-size='18' font-weight='700' fill='#1F3A9E'>O</text><circle cx='260' cy='120' r='3.5' fill='#1C1B18'/><text x='256' y='142' font-family='Caveat' font-size='18' font-weight='700'>F₂</text><circle cx='300' cy='120' r='3.5' fill='#1C1B18'/><text x='294' y='142' font-family='Caveat' font-size='18' font-weight='700'>2F₂</text><line x1='110' y1='120' x2='110' y2='70' stroke='#1C1B18' stroke-width='3.5'/><polygon points='105,74 110,62 115,74' fill='#1C1B18'/><text x='96' y='60' font-family='Caveat' font-size='20' font-weight='700'>Object</text><line x1='110' y1='70' x2='220' y2='70' stroke='#1F3A9E' stroke-width='2.2'/><line x1='220' y1='70' x2='380' y2='205' stroke='#1F3A9E' stroke-width='2.2'/><line x1='110' y1='70' x2='380' y2='195' stroke='#1F3A9E' stroke-width='2.2'/><line x1='330' y1='120' x2='330' y2='170' stroke='#B3261E' stroke-width='3'/><polygon points='325,164 330,176 335,164' fill='#B3261E'/><text x='336' y='190' font-family='Caveat' font-size='20' font-weight='700' fill='#B3261E'>Real Image</text></svg>",
            caption: "Convex lens ray diagram: An object placed beyond 2F₁ forms a real, inverted, and diminished image between F₂ and 2F₂."
          },
          citations: [{ claim_id: "claim-03" }]
        },
        {
          id: "b-03",
          type: "simulation",
          spec: {
            title: "Interactive Optical Lens Bench Simulator",
            description: "Drag the object distance slider and change lens focal length to watch the incident rays trace in real time, forming real or virtual images.",
            learning_goal: "Visualize how object position relative to focal length determines image position, orientation, and magnification.",
            controls: [
              { id: "object_distance", label: "Object Distance u (cm)", min: 10, max: 70, step: 2, initial: 36 },
              { id: "focal_length", label: "Focal Length f (cm)", min: 10, max: 30, step: 1, initial: 18 }
            ],
            default_behaviour: "Renders converging lens with principal rays and image."
          },
          citations: [{ claim_id: "claim-03" }]
        },
        {
          id: "b-03-formula",
          type: "formula_breakdown",
          spec: {
            title: "Thin Lens Equation & Optical Magnification",
            expression: "1/f = 1/v - 1/u  ·  m = v/u",
            terms: [
              { symbol: "f", name: "Focal Length", desc: "Distance from optical center O to principal focus F (+ for convex, - for concave).", unit: "cm / meters" },
              { symbol: "u", name: "Object Distance", desc: "Distance from optical center to object (- by Cartesian sign convention).", unit: "cm / meters" },
              { symbol: "v", name: "Image Distance", desc: "Distance from optical center to image (+ for real image, - for virtual).", unit: "cm / meters" },
              { symbol: "m", name: "Linear Magnification", desc: "Ratio of image height to object height (negative implies inverted).", unit: "Dimensionless" }
            ]
          },
          citations: [{ claim_id: "claim-03" }]
        },
        {
          id: "b-03-comparison",
          type: "comparison",
          spec: {
            title: "Spherical Lenses: Convex vs Concave Lenses",
            conceptA: "Convex (Converging) Lens",
            conceptB: "Concave (Diverging) Lens",
            rows: [
              { aspect: "Physical Shape", valA: "Thicker in the middle, thinner at edges", valB: "Thinner in the middle, thicker at edges" },
              { aspect: "Action on Rays", valA: "Converges parallel incident light rays to real focus", valB: "Diverges parallel rays away from virtual focus" },
              { aspect: "Focal Length Sign", valA: "Positive (+f)", valB: "Negative (-f)" },
              { aspect: "Image Formation", valA: "Forms both real inverted and virtual erect images", valB: "Always forms diminished, erect, virtual images" },
              { aspect: "Common Applications", valA: "Magnifying glasses, cameras, projectors, hypermetropia", valB: "Peepholes in doors, flashlights, myopia eyeglasses" }
            ]
          },
          citations: [{ claim_id: "claim-03" }]
        },
        {
          id: "b-03-solver",
          type: "numerical_solver",
          spec: {
            title: "Interactive Thin Lens Formula Solver",
            problem: "Input the object distance u and focal length f of a convex lens to calculate the precise image position v, image nature, and optical magnification m in real time.",
            solver_type: "optics-lens",
            parameters: [
              { id: "u", label: "Object Distance u", unit: "cm", default: 30, step: 2 },
              { id: "f", label: "Focal Length f", unit: "cm", default: 15, step: 1 }
            ]
          },
          citations: [{ claim_id: "claim-03" }]
        },
        {
          id: "b-03-derivation",
          type: "reveal",
          spec: {
            title: "Step-by-Step Geometric Derivation of the Thin Lens Formula",
            steps: [
              { title: "Step 1: Identify Similar Triangles with Optical Center", detail: "Consider object AB and inverted image A'B' with optical center O. Right triangles ΔABO and ΔA'B'O are similar: A'B' / AB = OB' / OB = v / (-u) = -v/u." },
              { title: "Step 2: Trace the Ray Parallel to Axis Through Focus", detail: "Ray AD parallel to axis refracts through F₂. Triangles ΔODF₂ and ΔA'B'F₂ are similar (where OD = AB): A'B' / OD = A'B' / AB = B'F₂ / OF₂." },
              { title: "Step 3: Express Distance B'F₂", detail: "B'F₂ = OB' - OF₂ = v - f. Thus: A'B' / AB = (v - f) / f." },
              { title: "Step 4: Equate Both Ratio Expressions", detail: "v / (-u) = (v - f) / f &rArr; -v/u = v/f - 1." },
              { title: "Step 5: Divide Both Sides by Image Distance v", detail: "-1/u = 1/f - 1/v &rArr; 1/f = 1/v - 1/u. This is the celebrated Gaussian thin lens formula." }
            ]
          },
          citations: [{ claim_id: "claim-03" }]
        },
        {
          id: "b-04",
          type: "worked_example",
          spec: {
            problem: "A convex lens has a focal length of 15 cm. At what distance should an object 4 cm tall be placed from the optical center so that a real, inverted image is formed at a distance of 30 cm on the other side? Also calculate the image height.",
            steps: [
              { title: "Identify Given Values with Signs", detail: "f = +15 cm (convex lens), v = +30 cm (real image on other side), h_o = 4 cm. We need u and h_i." },
              { title: "Apply Lens Formula 1/f = 1/v - 1/u", detail: "1/u = 1/v - 1/f = 1/30 - 1/15 = 1/30 - 2/30 = -1/30. Therefore, u = -30 cm." },
              { title: "Compute Magnification m = v / u = h_i / h_o", detail: "m = (+30 cm) / (-30 cm) = -1.0. Thus, h_i = m · h_o = -1.0 · 4 cm = -4 cm." }
            ],
            answer: "The object must be placed at 30 cm in front of the lens (u = -30 cm, at 2F). The image is 4 cm tall and inverted."
          },
          citations: [{ claim_id: "claim-03" }, { claim_id: "claim-04" }]
        },
        {
          id: "b-05",
          type: "check",
          spec: {
            question: "Where should an object be placed in front of a convex lens to get a real image of the same size as the object?",
            format: "mcq",
            options: [
              "At the principal focus F",
              "At twice the focal length 2F",
              "At infinity",
              "Between the optical centre and principal focus"
            ],
            answer_index: 1,
            answer: "At twice the focal length 2F",
            explanation: "When placed at 2F, 1/v = 1/f - 1/(2f) = 1/(2f), so v = 2F. Magnification m = -v/u = -2F/2F = -1, meaning identical size.",
            expected_understanding: "Convex lens image characteristics at 2F."
          },
          citations: [{ claim_id: "claim-03" }]
        }
      ]
    }
  };
}

// Electrostatics Module Generator
function compileElectrostaticsModule(topic) {
  return {
    ground_truth: {
      topic: topic.title,
      summary: "Electric charge is a fundamental conserved property of matter. Like charges repel and opposite charges attract via Coulomb's law. Electric fields originate on positive charges and terminate on negative charges.",
      claims: [
        { id: "claim-01", statement: "Coulomb's law states that the electrostatic force between two point charges is proportional to their product and inversely proportional to the square of their separation: F = k·|q₁q₂|/r².", citations: [{ source_id: "ncert", locator: "Chapter 1" }] },
        { id: "claim-02", statement: "The electric field E at distance r from charge Q is defined as force per unit test charge: E = F/q₀ = k·Q/r².", citations: [{ source_id: "ncert", locator: "Section 1.8" }] },
        { id: "claim-03", statement: "Electric field lines never cross each other, because if they did, the field would have two distinct directions at the intersection point.", citations: [{ source_id: "ncert", locator: "Section 1.9" }] }
      ],
      key_terms: [
        { term: "Coulomb's Constant (k)", definition: "k = 1 / (4πε₀) ≈ 8.99 × 10⁹ N·m²/C².", citations: [{ source_id: "ncert", locator: "Sec 1.6" }] },
        { term: "Electric Field Line", definition: "A path along which a positive unit test charge would move if free to do so.", citations: [{ source_id: "ncert", locator: "Sec 1.9" }] }
      ],
      equations: [
        { id: "eq-01", expression: "F = (1 / 4πε₀) * (|q1 * q2| / r²)", description: "Coulomb's Law electrostatic force", citations: [{ source_id: "ncert", locator: "Sec 1.6" }] },
        { id: "eq-02", expression: "E = F / q0", description: "Electric field strength", citations: [{ source_id: "ncert", locator: "Sec 1.8" }] }
      ],
      misconceptions: [
        { id: "mis-01", wrong_belief: "Electric field lines represent physical wires or tracks in space.", correction: "Field lines are geometric representations of field vector directions; space between lines is continuous.", citations: [{ source_id: "ncert", locator: "Sec 1.9" }] }
      ],
      uncertain: []
    },
    lesson: {
      title: topic.title,
      objectives: [
        "State and compute electrostatic attraction and repulsion forces using Coulomb's Law.",
        "Map and interpret electric field lines surrounding single charges and dipoles.",
        "Calculate electric field intensity at varying distances.",
        "Solve numerical problems involving electrostatic force equilibrium."
      ],
      sections: [
        {
          id: "sec-01",
          title: "1. Coulomb's Law & Electrostatic Interaction",
          paragraphs: [
            "Just as mass produces gravitational attraction, electric charge produces electrostatic forces. However, unlike gravity which is always attractive, electrostatic forces can be strongly attractive (unlike charges: + and -) or fiercely repulsive (like charges: +/+ or -/-).",
            "Coulomb showed that the force obeys an exact inverse-square law: doubling the distance cuts the interaction force to one-fourth. The force acts along the straight line joining the centers of the two charges."
          ]
        }
      ],
      glossary: [
        { term: "Coulomb (C)", definition: "SI unit of electric charge." },
        { term: "Permittivity (ε₀)", definition: "Measure of the resistance encountered when forming an electric field in a vacuum (8.854 × 10⁻¹² C²/N·m²)." }
      ]
    },
    blocks: {
      blocks: [
        {
          id: "b-01",
          type: "text",
          spec: {
            paragraphs: [
              "Rubbing a glass rod with silk leaves the glass positively charged by losing electrons. Bring it near a suspended charged rod, and they exert forces across empty space.",
              "Michael Faraday introduced electric field lines to map this invisible force field: lines stream out from positive charges and terminate upon negative charges."
            ]
          },
          citations: [{ claim_id: "claim-01" }, { claim_id: "claim-02" }]
        },
        {
          id: "b-02",
          type: "diagram",
          spec: {
            svg: "<svg viewBox='0 0 380 220' aria-label='Electric dipole field lines'><circle cx='120' cy='110' r='20' fill='#B3261E'/><text x='120' y='116' fill='#F6F0CF' font-family='Arial' font-size='22' font-weight='bold' text-anchor='middle'>+</text><text x='120' y='148' fill='#B3261E' font-family='Caveat' font-size='20' font-weight='700' text-anchor='middle'>+q</text><circle cx='260' cy='110' r='20' fill='#1F3A9E'/><text x='260' y='116' fill='#F6F0CF' font-family='Arial' font-size='22' font-weight='bold' text-anchor='middle'>−</text><text x='260' y='148' fill='#1F3A9E' font-family='Caveat' font-size='20' font-weight='700' text-anchor='middle'>−q</text><path d='M 140 110 L 240 110' stroke='#1C1B18' stroke-width='2.2'/><polygon points='194,106 204,110 194,114' fill='#1C1B18'/><path d='M 136 94 Q 190 40 244 94' fill='none' stroke='#1C1B18' stroke-width='2'/><polygon points='194,62 204,67 196,73' fill='#1C1B18'/><path d='M 136 126 Q 190 180 244 126' fill='none' stroke='#1C1B18' stroke-width='2'/><polygon points='196,147 204,153 194,158' fill='#1C1B18'/></svg>",
            caption: "Electric dipole: Electric field lines diverge outward from positive charge (+q) and converge inward into negative charge (-q)."
          },
          citations: [{ claim_id: "claim-03" }]
        },
        {
          id: "b-03",
          type: "simulation",
          spec: {
            title: "Interactive Coulomb Force & Field Lab",
            description: "Change charge magnitudes q1 and q2 and adjust separation distance to observe attractive/repulsive force vectors.",
            learning_goal: "Confirm the inverse-square law relationship and watch force vectors flip with sign changes.",
            controls: [
              { id: "charge_q1", label: "Charge q₁ (μC)", min: -10, max: 10, step: 1, initial: 5 },
              { id: "charge_q2", label: "Charge q₂ (μC)", min: -10, max: 10, step: 1, initial: -5 },
              { id: "separation_r", label: "Separation r (m)", min: 1, max: 8, step: 0.5, initial: 3 }
            ],
            default_behaviour: "Shows two opposite charges attracting with force vectors."
          },
          citations: [{ claim_id: "claim-01" }]
        },
        {
          id: "b-03-formula",
          type: "formula_breakdown",
          spec: {
            title: "Coulomb's Law & Electric Field Intensity Breakdown",
            expression: "F = (1 / 4πε₀) · (|q₁ · q₂| / r²)  ·  E = F / q₀",
            terms: [
              { symbol: "F", name: "Electrostatic Force", desc: "Mutual attraction or repulsion exerted along the line between centers.", unit: "Newtons (N)" },
              { symbol: "q₁, q₂", name: "Point Charges", desc: "Quantity of electric charge on each particle.", unit: "Coulombs (C)" },
              { symbol: "r", name: "Separation Distance", desc: "Center-to-center distance separating the two point charges.", unit: "Meters (m)" },
              { symbol: "k", name: "Coulomb Constant", desc: "1 / (4πε₀) ≈ 8.99 × 10⁹ N·m²/C² in vacuum.", unit: "N·m²/C²" }
            ]
          },
          citations: [{ claim_id: "claim-01" }]
        },
        {
          id: "b-03-comparison",
          type: "comparison",
          spec: {
            title: "Fundamental Forces: Electrostatic vs Gravitational Force",
            conceptA: "Electrostatic Force (Coulomb)",
            conceptB: "Gravitational Force (Newton)",
            rows: [
              { aspect: "Interaction Nature", valA: "Both attractive (unlike charges) and repulsive (like charges)", valB: "Strictly attractive only (mass is always positive)" },
              { aspect: "Relative Strength", valA: "Enormously strong (~10³⁶ times stronger than gravity between protons)", valB: "Extremely weak (only dominant at planetary/astronomical scales)" },
              { aspect: "Medium Dependence", valA: "Heavily depends on intervening dielectric medium (F_med = F_vac / K)", valB: "Completely independent of medium between masses" },
              { aspect: "Distance Law", valA: "Obeys strict Inverse Square Law (1 / r²)", valB: "Obeys strict Inverse Square Law (1 / r²)" }
            ]
          },
          citations: [{ claim_id: "claim-01" }]
        },
        {
          id: "b-03-solver",
          type: "numerical_solver",
          spec: {
            title: "Interactive Coulomb Force Calculator",
            problem: "Input charges q₁ and q₂ in micro-Coulombs (μC) and separation distance r in meters to calculate the magnitude and attractive/repulsive nature of the electrostatic force.",
            solver_type: "electrostatics-coulomb",
            parameters: [
              { id: "q1", label: "Charge q₁", unit: "μC", default: 2, step: 0.5 },
              { id: "q2", label: "Charge q₂", unit: "μC", default: 3, step: 0.5 },
              { id: "r", label: "Separation r", unit: "m", default: 0.3, step: 0.05 }
            ]
          },
          citations: [{ claim_id: "claim-01" }]
        },
        {
          id: "b-03-derivation",
          type: "reveal",
          spec: {
            title: "Step-by-Step Derivation: Electric Potential Due to an Isolated Point Charge",
            steps: [
              { title: "Step 1: Work Definition in Electric Field", detail: "Electric potential V at distance r is the external work required to bring a unit positive test charge (+q₀) from infinity to r without acceleration: V = - ∫ [∞ to r] E · dr." },
              { title: "Step 2: Express Radial Field Intensity", detail: "The electric field of charge Q is directed radially outward: E(x) = (1 / 4πε₀) · (Q / x²)." },
              { title: "Step 3: Evaluate the Definite Integral", detail: "W = - ∫ [∞ to r] (k·Q / x²) dx = - k·Q · [-1/x] [∞ to r] = k·Q · (1/r - 1/∞) = k·Q / r." },
              { title: "Step 4: Final Potential Expression", detail: "V = (1 / 4πε₀) · (Q / r). Electric potential falls off as 1/r, whereas electric field falls off as 1/r²." }
            ]
          },
          citations: [{ claim_id: "claim-02" }]
        },
        {
          id: "b-04",
          type: "worked_example",
          spec: {
            problem: "Two small conducting spheres placed in air at a distance of 30 cm carry charges of 2 × 10⁻⁷ C and 3 × 10⁻⁷ C respectively. What is the electrostatic force between them?",
            steps: [
              { title: "Identify Parameters", detail: "q₁ = 2 × 10⁻⁷ C, q₂ = 3 × 10⁻⁷ C, r = 30 cm = 0.3 m, k = 9 × 10⁹ N·m²/C²." },
              { title: "Apply Coulomb's Formula", detail: "F = k · (q₁ · q₂) / r² = (9 × 10⁹) · (2 × 10⁻⁷ · 3 × 10⁻⁷) / (0.3)²" },
              { title: "Calculate Resultant", detail: "F = (9 × 6 × 10⁻⁵) / (0.09) = 54 × 10⁻⁵ / 0.09 = 6 × 10⁻³ N = 0.006 N." }
            ],
            answer: "F = 6 × 10⁻³ N (repulsive, since both charges are positive)."
          },
          citations: [{ claim_id: "claim-01" }]
        },
        {
          id: "b-05",
          type: "check",
          spec: {
            question: "If the distance between two stationary point charges is halved, by what factor does the electrostatic force between them change?",
            format: "mcq",
            options: [
              "Halved (1/2×)",
              "Doubled (2×)",
              "Quadrupled (4×)",
              "Remains unchanged"
            ],
            answer_index: 2,
            answer: "Quadrupled (4×)",
            explanation: "According to Coulomb's Law F ∝ 1/r². Halving r to r/2 gives 1/(r/2)² = 4/r², quadrupling the force.",
            expected_understanding: "Inverse square law dependence."
          },
          citations: [{ claim_id: "claim-01" }]
        }
      ]
    }
  };
}

// Waves Module Generator
function compileWavesModule(topic) {
  return {
    ground_truth: {
      topic: topic.title,
      summary: "Waves transfer energy and momentum through a medium without net transport of matter. Transverse waves oscillate perpendicular to propagation, whereas longitudinal waves oscillate parallel to propagation. Wave velocity is given by v = f·λ.",
      claims: [
        { id: "claim-01", statement: "In a wave, particles oscillate around their equilibrium positions while the disturbance pattern propagates forward.", citations: [{ source_id: "ncert", locator: "Chapter 12" }] },
        { id: "claim-02", statement: "The universal wave equation relates wave speed v, frequency f, and wavelength λ: v = f · λ.", citations: [{ source_id: "ncert", locator: "Section 12.2" }] },
        { id: "claim-03", statement: "Superposition principle: when two waves meet, the resultant displacement is the algebraic sum of their individual displacements.", citations: [{ source_id: "ncert", locator: "Section 12.4" }] }
      ],
      key_terms: [
        { term: "Wavelength (λ)", definition: "The distance between consecutive crests or consecutive compressions, measured in meters.", citations: [{ source_id: "ncert", locator: "Sec 12.2" }] },
        { term: "Frequency (f)", definition: "The number of complete wave cycles passing a point per second, measured in Hertz (Hz).", citations: [{ source_id: "ncert", locator: "Sec 12.2" }] }
      ],
      equations: [
        { id: "eq-01", expression: "v = f * λ", description: "Wave speed formula", citations: [{ source_id: "ncert", locator: "Sec 12.2" }] },
        { id: "eq-02", expression: "T = 1 / f", description: "Time period definition", citations: [{ source_id: "ncert", locator: "Sec 12.2" }] }
      ],
      misconceptions: [
        { id: "mis-01", wrong_belief: "Air particles travel all the way from the speaker's mouth to the listener's ear.", correction: "Particles merely oscillate back and forth about their mean positions; only the energy wave travels.", citations: [{ source_id: "ncert", locator: "Sec 12.1" }] }
      ],
      uncertain: []
    },
    lesson: {
      title: topic.title,
      objectives: [
        "Differentiate clearly between longitudinal (sound) and transverse waves.",
        "Calculate wave speed, wavelength, and frequency using v = f·λ.",
        "Demonstrate wave superposition and interference (constructive vs destructive).",
        "Explain how amplitude determines loudness and frequency determines pitch."
      ],
      sections: [
        {
          id: "sec-01",
          title: "1. Anatomy of Wave Propagation",
          paragraphs: [
            "Drop a pebble into a calm pond: circular ripples expand outward. Although water ripples travel across the pond, an autumn leaf floating on the surface only bobs up and down.",
            "This demonstrates the central principle of wave mechanics: waves transfer energy and momentum across space without transferring matter."
          ]
        }
      ],
      glossary: [
        { term: "Amplitude (A)", definition: "The maximum displacement of a particle from its mean position." },
        { term: "Hertz (Hz)", definition: "Unit of frequency equal to one oscillation per second." }
      ]
    },
    blocks: {
      blocks: [
        {
          id: "b-01",
          type: "text",
          spec: {
            paragraphs: [
              "Sound in air is a longitudinal mechanical wave: a vibrating tuning fork pushes adjacent air molecules together into 'compressions' (high pressure) and pulls back creating 'rarefactions' (low pressure).",
              "Light and electromagnetic waves, by contrast, are transverse: electric and magnetic fields oscillate perpendicular to the direction of propagation."
            ]
          },
          citations: [{ claim_id: "claim-01" }, { claim_id: "claim-02" }]
        },
        {
          id: "b-02",
          type: "diagram",
          spec: {
            svg: "<svg viewBox='0 0 380 200' aria-label='Sinusoidal wave anatomy'><line x1='30' y1='100' x2='360' y2='100' stroke='#5A5748' stroke-width='2' stroke-dasharray='4,4'/><path d='M 30 100 Q 70 20 110 100 T 190 100 T 270 100 T 350 100' fill='none' stroke='#1F3A9E' stroke-width='3'/><line x1='70' y1='100' x2='70' y2='20' stroke='#B3261E' stroke-width='2.2'/><polygon points='66,28 70,18 74,28' fill='#B3261E'/><text x='78' y='55' fill='#B3261E' font-family='Caveat' font-size='20' font-weight='700'>Amplitude A</text><line x1='70' y1='16' x2='230' y2='16' stroke='#1C1B18' stroke-width='2'/><polygon points='76,12 66,16 76,20' fill='#1C1B18'/><polygon points='224,12 234,16 224,20' fill='#1C1B18'/><text x='150' y='12' fill='#1C1B18' font-family='Caveat' font-size='20' font-weight='700' text-anchor='middle'>Wavelength λ</text><text x='70' y='120' font-family='Caveat' font-size='18' font-weight='700' fill='#1F3A9E'>Crest</text><text x='150' y='180' font-family='Caveat' font-size='18' font-weight='700' fill='#1F3A9E'>Trough</text></svg>",
            caption: "Sinusoidal wave: Wavelength (λ) is peak-to-peak distance; Amplitude (A) is peak displacement from centerline."
          },
          citations: [{ claim_id: "claim-02" }]
        },
        {
          id: "b-03",
          type: "simulation",
          spec: {
            title: "Interactive Wave & Superposition Lab",
            description: "Control wave amplitude, frequency, and wave speed to see animated transverse particle displacement and wave interference.",
            learning_goal: "Verify v = f·λ and observe constructive and destructive superposition in real time.",
            controls: [
              { id: "amplitude", label: "Amplitude A (cm)", min: 10, max: 40, step: 2, initial: 24 },
              { id: "frequency", label: "Frequency f (Hz)", min: 0.5, max: 3, step: 0.1, initial: 1.2 },
              { id: "wavelength", label: "Wavelength λ (cm)", min: 40, max: 140, step: 5, initial: 80 }
            ],
            default_behaviour: "Animates sinusoidal traveling wave."
          },
          citations: [{ claim_id: "claim-02" }]
        },
        {
          id: "b-03-formula",
          type: "formula_breakdown",
          spec: {
            title: "Wave Equation & Frequency Relationships",
            expression: "v = f · λ  ·  T = 1 / f",
            terms: [
              { symbol: "v", name: "Wave Propagation Speed", desc: "Speed at which energy and phase advance through the medium.", unit: "Meters per second (m/s)" },
              { symbol: "f", name: "Wave Frequency", desc: "Number of full oscillation cycles passing a fixed point per unit time.", unit: "Hertz (Hz = 1/s)" },
              { symbol: "λ", name: "Wavelength", desc: "Distance between consecutive crests, compressions, or in-phase points.", unit: "Meters (m)" },
              { symbol: "T", name: "Time Period", desc: "Duration required to execute one complete particle oscillation.", unit: "Seconds (s)" }
            ]
          },
          citations: [{ claim_id: "claim-02" }]
        },
        {
          id: "b-03-comparison",
          type: "comparison",
          spec: {
            title: "Wave Categorization: Transverse vs Longitudinal Waves",
            conceptA: "Transverse Waves",
            conceptB: "Longitudinal Waves",
            rows: [
              { aspect: "Particle Oscillation", valA: "Perpendicular (90°) to direction of wave propagation", valB: "Parallel (0° / 180°) along line of wave propagation" },
              { aspect: "Anatomy", valA: "Alternating crests (peaks) and troughs (valleys)", valB: "Alternating compressions (high density) and rarefactions" },
              { aspect: "Polarization", valA: "Can be plane-polarized (light, EM waves)", valB: "Cannot be polarized (pressure fluctuations)" },
              { aspect: "Typical Examples", valA: "Light waves, radio waves, ripples on water surface", valB: "Sound waves in air, ultrasound, seismic P-waves" }
            ]
          },
          citations: [{ claim_id: "claim-01" }, { claim_id: "claim-02" }]
        },
        {
          id: "b-03-solver",
          type: "numerical_solver",
          spec: {
            title: "Interactive Wave Speed & Period Solver",
            problem: "Input wave frequency f in Hertz and wavelength λ in meters to calculate wave speed v and oscillation period T.",
            solver_type: "waves-speed",
            parameters: [
              { id: "freq", label: "Frequency f", unit: "Hz", default: 256, step: 10 },
              { id: "lambda", label: "Wavelength λ", unit: "m", default: 1.3, step: 0.1 }
            ]
          },
          citations: [{ claim_id: "claim-02" }]
        },
        {
          id: "b-03-derivation",
          type: "reveal",
          spec: {
            title: "Step-by-Step Derivation: The Universal Wave Speed Equation v = f · λ",
            steps: [
              { title: "Step 1: General Definition of Speed", detail: "Speed is distance traversed divided by elapsed time: Speed = Distance / Time." },
              { title: "Step 2: Relate Wavelength to Wave Period", detail: "In exactly one period (T seconds), a wave profile advances forward by one complete wavelength (λ meters). Thus: v = λ / T." },
              { title: "Step 3: Relate Period to Frequency", detail: "Frequency f is the inverse of time period: f = 1 / T &rArr; 1 / T = f." },
              { title: "Step 4: Combine Expressions", detail: "Substituting 1/T into the velocity relation yields: v = f · λ. This relation universally applies to all mechanical, sound, and electromagnetic waves." }
            ]
          },
          citations: [{ claim_id: "claim-02" }]
        },
        {
          id: "b-04",
          type: "worked_example",
          spec: {
            problem: "A sound wave has a frequency of 2 kHz (2000 Hz) and wavelength of 17 cm. How long will it take to travel 1.7 km?",
            steps: [
              { title: "Find Wave Speed v = f · λ", detail: "f = 2000 Hz, λ = 17 cm = 0.17 m. Speed v = 2000 × 0.17 = 340 m/s." },
              { title: "Compute Time to Cover Distance", detail: "Distance d = 1.7 km = 1700 m. Time t = d / v = 1700 m / 340 m/s = 5.0 seconds." }
            ],
            answer: "The sound wave travels at 340 m/s and takes 5.0 seconds to cover 1.7 km."
          },
          citations: [{ claim_id: "claim-02" }]
        },
        {
          id: "b-05",
          type: "check",
          spec: {
            question: "If a wave's frequency is doubled while traveling through the same uniform medium, what happens to its wavelength?",
            format: "mcq",
            options: [
              "Wavelength is halved (λ/2)",
              "Wavelength doubles (2λ)",
              "Wavelength quadruples (4λ)",
              "Wavelength remains unchanged"
            ],
            answer_index: 0,
            answer: "Wavelength is halved (λ/2)",
            explanation: "In a uniform medium, speed v is constant. Since v = f·λ, doubling frequency f requires wavelength λ to halve.",
            expected_understanding: "Inverse relationship between frequency and wavelength at constant speed."
          },
          citations: [{ claim_id: "claim-02" }]
        }
      ]
    }
  };
}

// Thermodynamics Module Generator
function compileThermodynamicsModule(topic) {
  return {
    ground_truth: {
      topic: topic.title,
      summary: "Thermodynamics governs heat, work, and internal energy. The First Law states energy conservation: ΔQ = ΔU + ΔW. Kinetic theory relates macroscopic temperature directly to microscopic molecular kinetic energy.",
      claims: [
        { id: "claim-01", statement: "The First Law of Thermodynamics states that heat supplied ΔQ equals increase in internal energy ΔU plus work done by the system ΔW: ΔQ = ΔU + ΔW.", citations: [{ source_id: "ncert", locator: "Chapter 11" }] },
        { id: "claim-02", statement: "For an ideal gas, absolute temperature T is directly proportional to the average translational kinetic energy of its molecules: KE_avg = (3/2) k_B T.", citations: [{ source_id: "ncert", locator: "Section 11.4" }] },
        { id: "claim-03", statement: "Work done during expansion equals the area under the curve on a Pressure-Volume (PV) indicator diagram: W = ∫ P dV.", citations: [{ source_id: "ncert", locator: "Section 11.5" }] }
      ],
      key_terms: [
        { term: "Internal Energy (U)", definition: "The total kinetic and potential energies of all constituent molecules of the system.", citations: [{ source_id: "ncert", locator: "Sec 11.2" }] },
        { term: "Isothermal Process", definition: "A thermodynamic change occurring at constant temperature (ΔT = 0, ΔU = 0 for ideal gas).", citations: [{ source_id: "ncert", locator: "Sec 11.6" }] }
      ],
      equations: [
        { id: "eq-01", expression: "ΔQ = ΔU + ΔW", description: "First Law of Thermodynamics", citations: [{ source_id: "ncert", locator: "Sec 11.2" }] },
        { id: "eq-02", expression: "P * V = n * R * T", description: "Ideal Gas State Equation", citations: [{ source_id: "ncert", locator: "Sec 11.3" }] }
      ],
      misconceptions: [
        { id: "mis-01", wrong_belief: "Heat and temperature are the same physical quantity.", correction: "Temperature is a measure of average molecular kinetic energy; heat is thermal energy in transit between systems.", citations: [{ source_id: "ncert", locator: "Sec 11.1" }] }
      ],
      uncertain: []
    },
    lesson: {
      title: topic.title,
      objectives: [
        "Formulate and apply the First Law of Thermodynamics (ΔQ = ΔU + ΔW) to physical systems.",
        "Interpret Pressure-Volume (PV) indicator diagrams and calculate work done as area.",
        "Explain microscopic gas pressure as molecular collisions with container walls.",
        "Analyze isothermal, isobaric, isochoric, and adiabatic gas processes."
      ],
      sections: [
        {
          id: "sec-01",
          title: "1. Microscopic Molecules & Macroscopic State",
          paragraphs: [
            "A gas consists of billions of tiny molecules in perpetual, chaotic motion. When you heat a gas, you inject thermal energy, causing the molecules to speed up. Temperature is the direct gauge of this microscopic agitation.",
            "Every time a molecule bounces off the piston wall, it transfers momentum. Trillions of these impacts per second aggregate into the macroscopic pressure we measure with a gauge."
          ]
        }
      ],
      glossary: [
        { term: "Joule (J)", definition: "SI unit of work and energy." },
        { term: "Adiabatic", definition: "A thermodynamic process in which no heat enters or leaves the system (ΔQ = 0)." }
      ]
    },
    blocks: {
      blocks: [
        {
          id: "b-01",
          type: "text",
          spec: {
            paragraphs: [
              "When you compress gas in a bicycle pump rapidly, the pump barrel warms up. You performed mechanical work on the gas, elevating its internal energy without supplying heat.",
              "The First Law of Thermodynamics captures this bookkeeping: Heat added = Increase in internal energy + Work done by expansion."
            ]
          },
          citations: [{ claim_id: "claim-01" }, { claim_id: "claim-02" }]
        },
        {
          id: "b-02",
          type: "diagram",
          spec: {
            svg: "<svg viewBox='0 0 380 220' aria-label='Gas cylinder with piston'><rect x='80' y='40' width='220' height='130' fill='#F6F0CF' stroke='#1C1B18' stroke-width='3'/><rect x='210' y='42' width='16' height='126' fill='#5A5748' stroke='#1C1B18' stroke-width='2'/><rect x='226' y='96' width='100' height='18' fill='#5A5748'/><circle cx='120' cy='70' r='5' fill='#1F3A9E'/><circle cx='150' cy='120' r='5' fill='#1F3A9E'/><circle cx='170' cy='80' r='5' fill='#1F3A9E'/><circle cx='130' cy='140' r='5' fill='#1F3A9E'/><circle cx='180' cy='130' r='5' fill='#1F3A9E'/><text x='140' y='105' fill='#1F3A9E' font-family='Caveat' font-size='22' font-weight='700'>Gas: P, V, T</text><line x1='330' y1='105' x2='270' y2='105' stroke='#B3261E' stroke-width='3'/><polygon points='278,99 266,105 278,111' fill='#B3261E'/><text x='300' y='88' fill='#B3261E' font-family='Caveat' font-size='20' font-weight='700'>Compress (W)</text></svg>",
            caption: "Thermodynamic cylinder with movable piston containing gas molecules at pressure P, volume V, and temperature T."
          },
          citations: [{ claim_id: "claim-03" }]
        },
        {
          id: "b-03",
          type: "simulation",
          spec: {
            title: "Interactive Gas Piston & PV Lab",
            description: "Adjust temperature and piston volume to watch gas molecules speed up and pressure gauge respond according to PV = nRT.",
            learning_goal: "Understand the kinetic origin of gas pressure and test Charles's, Boyle's, and Gay-Lussac's laws.",
            controls: [
              { id: "temperature", label: "Temperature T (K)", min: 100, max: 600, step: 20, initial: 300 },
              { id: "volume", label: "Volume V (liters)", min: 1, max: 5, step: 0.2, initial: 3 }
            ],
            default_behaviour: "Simulates moving gas particles colliding with piston."
          },
          citations: [{ claim_id: "claim-02" }]
        },
        {
          id: "b-03-formula",
          type: "formula_breakdown",
          spec: {
            title: "First Law of Thermodynamics & Ideal Gas Law",
            expression: "ΔQ = ΔU + ΔW  ·  P · V = n · R · T",
            terms: [
              { symbol: "ΔQ", name: "Heat Exchanged", desc: "Thermal energy transferred across system boundary (+ when absorbed, - when released).", unit: "Joules (J)" },
              { symbol: "ΔU", name: "Internal Energy Change", desc: "Change in total kinetic energy of chaotic molecular motion (ΔU = n C_v ΔT).", unit: "Joules (J)" },
              { symbol: "ΔW", name: "Thermodynamic Work", desc: "Mechanical work performed by expanding gas (ΔW = P · ΔV).", unit: "Joules (J)" },
              { symbol: "P, V, T", name: "State Variables", desc: "Pressure (Pa), Volume (m³), and absolute Temperature (Kelvin).", unit: "Pa, m³, K" }
            ]
          },
          citations: [{ claim_id: "claim-01" }, { claim_id: "claim-02" }]
        },
        {
          id: "b-03-comparison",
          type: "comparison",
          spec: {
            title: "Thermodynamic Transformations: Isothermal vs Adiabatic Processes",
            conceptA: "Isothermal Process",
            conceptB: "Adiabatic Process",
            rows: [
              { aspect: "Constrained Condition", valA: "Temperature remains strictly constant (ΔT = 0, ΔU = 0)", valB: "Zero heat exchange with surroundings (ΔQ = 0)" },
              { aspect: "First Law Balance", valA: "All heat absorbed turns into work: ΔQ = ΔW", valB: "Work is done entirely at cost of internal energy: ΔW = -ΔU" },
              { aspect: "Governing Equation", valA: "P · V = Constant (Boyle's Law curve)", valB: "P · V^γ = Constant (steeper curve, γ = C_p / C_v)" },
              { aspect: "Physical Execution", valA: "Very slow process conducted in highly thermally conductive container", valB: "Very rapid process conducted in heavily insulated container" }
            ]
          },
          citations: [{ claim_id: "claim-01" }, { claim_id: "claim-03" }]
        },
        {
          id: "b-03-solver",
          type: "numerical_solver",
          spec: {
            title: "Interactive First Law Energy Balance Calculator",
            problem: "Input heat supplied ΔQ in Joules and work done by the gas ΔW in Joules to calculate the change in internal energy ΔU and temperature effect.",
            solver_type: "thermo-first-law",
            parameters: [
              { id: "Q", label: "Heat Absorbed ΔQ", unit: "J", default: 500, step: 25 },
              { id: "W", label: "Work Done ΔW", unit: "J", default: 200, step: 25 }
            ]
          },
          citations: [{ claim_id: "claim-01" }]
        },
        {
          id: "b-03-derivation",
          type: "reveal",
          spec: {
            title: "Step-by-Step Derivation: Work Done in an Isothermal Gas Expansion",
            steps: [
              { title: "Step 1: Infinitesimal Work Definition", detail: "When a gas expands against an external pressure P by small volume dV, the work done is: dW = P · dV." },
              { title: "Step 2: Express Pressure from Ideal Gas Law", detail: "Since P·V = n·R·T, express pressure as a function of volume: P(V) = (n·R·T) / V." },
              { title: "Step 3: Integrate from Initial Volume V₁ to Final Volume V₂", detail: "W = ∫ [V₁ to V₂] P dV = ∫ [V₁ to V₂] (n·R·T / V) dV." },
              { title: "Step 4: Factor Out Constant Temperature T", detail: "Since temperature is constant in an isothermal process: W = n·R·T ∫ [V₁ to V₂] (1 / V) dV = n·R·T [ln(V)] [V₁ to V₂]." },
              { title: "Step 5: Final Isothermal Work Expression", detail: "W = n · R · T · ln(V₂ / V₁) = 2.303 · n · R · T · log₁₀(V₂ / V₁). When V₂ > V₁, W is positive (gas does work)." }
            ]
          },
          citations: [{ claim_id: "claim-01" }, { claim_id: "claim-03" }]
        },
        {
          id: "b-04",
          type: "worked_example",
          spec: {
            problem: "An ideal gas system absorbs 500 J of heat from its surroundings. If the gas expands and performs 200 J of work against a piston, calculate the change in its internal energy.",
            steps: [
              { title: "Identify First Law of Thermodynamics", detail: "ΔQ = ΔU + ΔW, where ΔQ = +500 J (heat added) and ΔW = +200 J (work done by gas)." },
              { title: "Rearrange for Change in Internal Energy ΔU", detail: "ΔU = ΔQ - ΔW = 500 J - 200 J = +300 J." },
              { title: "Physical Interpretation", detail: "The internal energy of the gas increased by 300 J, which elevates its temperature." }
            ],
            answer: "ΔU = +300 J (internal energy increases by 300 Joules)."
          },
          citations: [{ claim_id: "claim-01" }]
        },
        {
          id: "b-05",
          type: "check",
          spec: {
            question: "In an isothermal expansion of an ideal gas, which of the following is strictly true?",
            format: "mcq",
            options: [
              "Internal energy change is zero (ΔU = 0)",
              "Work done is zero (ΔW = 0)",
              "Heat exchanged is zero (ΔQ = 0)",
              "Pressure remains constant"
            ],
            answer_index: 0,
            answer: "Internal energy change is zero (ΔU = 0)",
            explanation: "For an ideal gas, internal energy depends only on temperature. Since isothermal means constant temperature (ΔT = 0), ΔU = 0, so ΔQ = ΔW.",
            expected_understanding: "Isothermal process properties."
          },
          citations: [{ claim_id: "claim-01" }]
        }
      ]
    }
  };
}

// Render generated assets to HTML, JS, CSS, and Manifest matching factory/render.py and doctrine §10
function renderTopicFiles(topic, data, courseId, topicSlug) {
  const { ground_truth, lesson, blocks } = data;
  const blocksList = blocks.blocks || [];

  // Generate Simulation JS & Interactive Solver Script
  let simJsParts = [];
  const sims = blocksList.filter(b => b.type === 'simulation');
  for (const sim of sims) {
    const simId = sim.id;
    const simType = topic.simType || 'mechanics-net-force';
    simJsParts.push(generateSimulationCode(simId, simType, sim.spec));
  }

  // Interactive Numerical Solver Script
  simJsParts.push(`(function() {
  document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".zn-solver-box").forEach(function(box) {
      var type = box.getAttribute("data-solver-type");
      var stepsEl = box.querySelector(".zn-solver-steps");
      var resEl = box.querySelector(".res-val");
      var inputs = box.querySelectorAll("input[data-param]");

      function update() {
        var vals = {};
        inputs.forEach(function(inp) {
          vals[inp.getAttribute("data-param")] = parseFloat(inp.value) || 0;
        });

        if (type === "mechanics-net-force") {
          var F_app = vals.applied_force !== undefined ? vals.applied_force : 50;
          var F_fric = vals.friction_force !== undefined ? vals.friction_force : 10;
          var m = vals.mass !== undefined ? vals.mass : 20;
          var F_net = Math.max(0, F_app - F_fric);
          var a = m > 0 ? F_net / m : 0;
          var t = 3;
          var v = a * t;
          if (stepsEl) {
            stepsEl.innerHTML =
              '<div class="zn-solver-step"><strong>1. Net Unbalanced Force:</strong> F_net = F_app - F_fric = ' + F_app + ' N - ' + F_fric + ' N = ' + F_net.toFixed(1) + ' N</div>' +
              '<div class="zn-solver-step"><strong>2. Resultant Acceleration:</strong> a = F_net / m = ' + F_net.toFixed(1) + ' N / ' + m + ' kg = ' + a.toFixed(2) + ' m/s²</div>' +
              '<div class="zn-solver-step"><strong>3. Final Velocity (t = 3s):</strong> v = u + at = 0 + (' + a.toFixed(2) + ')(3) = ' + v.toFixed(2) + ' m/s</div>';
          }
          if (resEl) resEl.textContent = 'a = ' + a.toFixed(2) + ' m/s², v(3s) = ' + v.toFixed(2) + ' m/s';
        } else if (type === "optics-lens") {
          var u = vals.u !== undefined ? vals.u : 30;
          var f = vals.f !== undefined ? vals.f : 15;
          var v = (u !== f) ? (u * f) / (u - f) : 9999;
          var m_mag = (u !== 0) ? -v / u : 1;
          if (stepsEl) {
            stepsEl.innerHTML =
              '<div class="zn-solver-step"><strong>1. Lens Formula:</strong> 1/v = 1/f - 1/u &rArr; v = (u &times; f) / (u - f)</div>' +
              '<div class="zn-solver-step"><strong>2. Image Distance:</strong> v = (' + u + ' &times; ' + f + ') / (' + u + ' - ' + f + ') = ' + (v !== 9999 ? v.toFixed(1) + ' cm' : 'Infinity') + '</div>' +
              '<div class="zn-solver-step"><strong>3. Magnification:</strong> m = -v/u = ' + m_mag.toFixed(2) + 'x (' + (v > 0 ? 'Real, Inverted' : 'Virtual, Erect') + ')</div>';
          }
          if (resEl) resEl.textContent = 'v = ' + (v !== 9999 ? v.toFixed(1) + ' cm' : 'Infinity') + ', m = ' + m_mag.toFixed(2) + 'x';
        } else if (type === "electrostatics-coulomb") {
          var q1 = vals.q1 !== undefined ? vals.q1 : 2;
          var q2 = vals.q2 !== undefined ? vals.q2 : 3;
          var r = vals.r !== undefined ? vals.r : 0.3;
          var k = 8.99e9;
          var F = (r > 0) ? (k * (Math.abs(q1) * 1e-6) * (Math.abs(q2) * 1e-6)) / (r * r) : 0;
          var nature = (q1 * q2 > 0) ? "Repulsive" : "Attractive";
          if (stepsEl) {
            stepsEl.innerHTML =
              '<div class="zn-solver-step"><strong>1. Point Charges:</strong> q₁ = ' + q1 + ' μC, q₂ = ' + q2 + ' μC at distance r = ' + r + ' m</div>' +
              '<div class="zn-solver-step"><strong>2. Coulomb Law:</strong> F = (8.99 &times; 10⁹) &times; |' + q1 + ' &times; ' + q2 + '| &times; 10⁻¹² / (' + r + ')²</div>' +
              '<div class="zn-solver-step"><strong>3. Resultant Force:</strong> ' + F.toFixed(4) + ' N (' + nature + ')</div>';
          }
          if (resEl) resEl.textContent = 'F = ' + F.toFixed(4) + ' N (' + nature + ')';
        } else if (type === "waves-speed") {
          var freq = vals.freq !== undefined ? vals.freq : 256;
          var lambda = vals.lambda !== undefined ? vals.lambda : 1.3;
          var v = freq * lambda;
          var T = freq > 0 ? 1 / freq : 0;
          if (stepsEl) {
            stepsEl.innerHTML =
              '<div class="zn-solver-step"><strong>1. Wave Speed Formula:</strong> v = f &times; &lambda;</div>' +
              '<div class="zn-solver-step"><strong>2. Computation:</strong> v = ' + freq + ' Hz &times; ' + lambda + ' m = ' + v.toFixed(1) + ' m/s</div>' +
              '<div class="zn-solver-step"><strong>3. Wave Period:</strong> T = 1/f = ' + (T * 1000).toFixed(2) + ' ms</div>';
          }
          if (resEl) resEl.textContent = 'v = ' + v.toFixed(1) + ' m/s (T = ' + (T * 1000).toFixed(2) + ' ms)';
        } else if (type === "thermo-first-law") {
          var Q = vals.Q !== undefined ? vals.Q : 500;
          var W = vals.W !== undefined ? vals.W : 200;
          var dU = Q - W;
          if (stepsEl) {
            stepsEl.innerHTML =
              '<div class="zn-solver-step"><strong>1. First Law Equation:</strong> &Delta;Q = &Delta;U + &Delta;W &rArr; &Delta;U = &Delta;Q - &Delta;W</div>' +
              '<div class="zn-solver-step"><strong>2. Thermodynamic Balance:</strong> &Delta;U = ' + Q + ' J - ' + W + ' J = ' + dU + ' J</div>' +
              '<div class="zn-solver-step"><strong>3. Internal Energy Change:</strong> ' + (dU >= 0 ? 'Increases by ' + dU + ' J (Heating)' : 'Decreases by ' + Math.abs(dU) + ' J (Cooling)') + '</div>';
          }
          if (resEl) resEl.textContent = '&Delta;U = ' + (dU >= 0 ? '+' : '') + dU + ' Joules';
        }
      }

      inputs.forEach(function(inp) {
        inp.addEventListener("input", update);
      });
      update();
    });
  });
})();`);

  const pageJs = simJsParts.join('\n\n');

  // Generate CSS
  const pageCss = `/* Scoped styles for ${topic.title} */
.zn-page { max-width: 820px; }
.zn-sim-canvas-wrap { background: var(--paper-light); }
`;

  // Render HTML Blocks
  const renderedBlocksHtml = blocksList.map(b => {
    if (b.type === 'text') {
      const paras = b.spec.paragraphs.map(p => `<p>${escapeHtml(p)}</p>`).join('\n    ');
      return `<section class="zn-text" id="${b.id}">\n    ${paras}\n  </section>`;
    } else if (b.type === 'diagram') {
      return `<figure class="zn-diagram" id="${b.id}">
    <div class="zn-diagram-svg">${b.spec.svg}</div>
    <figcaption>${escapeHtml(b.spec.caption || '')}</figcaption>
  </figure>`;
    } else if (b.type === 'simulation') {
      const controlsHtml = (b.spec.controls || []).map(c => `
      <label class="zn-sim-control"><span>${escapeHtml(c.label)}</span><input type="range" data-control="${c.id}" min="${c.min}" max="${c.max}" step="${c.step || 1}" value="${c.initial}"><output>${c.initial}</output></label>`).join('');
      return `<section class="zn-sim zn-sim-${b.id}" id="${b.id}" data-sim-id="${b.id}" aria-label="${escapeHtml(b.spec.title)}">
    <h3>${escapeHtml(b.spec.title)}</h3>
    <div class="zn-sim-controls">${controlsHtml}
    </div>
    <div class="zn-sim-canvas-wrap">
      <canvas class="zn-sim-canvas" width="480" height="288" tabindex="0"></canvas>
    </div>
    <p class="zn-sim-desc">${escapeHtml(b.spec.description)}</p>
  </section>`;
    } else if (b.type === 'worked_example') {
      const stepsHtml = (b.spec.steps || []).map(s => `<li><strong>${escapeHtml(s.title)}</strong> ${escapeHtml(s.detail)}</li>`).join('\n      ');
      return `<section class="zn-example" id="${b.id}">
    <h3>Worked Example</h3>
    <p class="zn-example-problem">${escapeHtml(b.spec.problem)}</p>
    <ol>
      ${stepsHtml}
    </ol>
    <p class="zn-answer"><span class="zn-answer-label">Answer:</span> ${escapeHtml(b.spec.answer)}</p>
  </section>`;
    } else if (b.type === 'reveal') {
      const stepsHtml = (b.spec.steps || []).map(s => `<details class="zn-reveal-step"><summary>${escapeHtml(s.title)}</summary><p>${escapeHtml(s.detail)}</p></details>`).join('\n      ');
      return `<section class="zn-reveal" id="${b.id}">
    <h3>${escapeHtml(b.spec.title)}</h3>
    ${stepsHtml}
  </section>`;
    } else if (b.type === 'check') {
      const opts = (b.spec.options || []).map((o, idx) => `
      <label class="zn-opt"><input type="radio" name="check-${b.id}" value="${idx}"> <span>${escapeHtml(o)}</span></label>`).join('');
      return `<fieldset class="zn-check" id="${b.id}" data-format="${b.spec.format || 'mcq'}" data-answer-index="${b.spec.answer_index || 0}">
    <legend>${escapeHtml(b.spec.question)}</legend>${opts}
    <button type="button" class="zn-check-btn">Check</button>
    <p class="zn-check-feedback" aria-live="polite"></p>
    <details class="zn-check-why"><summary>Why?</summary><p>${escapeHtml(b.spec.explanation || '')}</p></details>
  </fieldset>`;
    } else if (b.type === 'formula_breakdown') {
      const termsHtml = (b.spec.terms || []).map(t => `
      <div class="zn-term-card">
        <div><span class="zn-term-symbol">${escapeHtml(t.symbol)}</span><span class="zn-term-name">${escapeHtml(t.name)}</span></div>
        <p class="zn-term-desc">${escapeHtml(t.desc || '')} <em>(SI: ${escapeHtml(t.unit || '-')})</em></p>
      </div>`).join('');
      return `<section class="zn-formula-breakdown" id="${b.id}" aria-label="${escapeHtml(b.spec.title)}">
    <div class="zn-formula-header">
      <h4 class="zn-formula-title">${escapeHtml(b.spec.title)}</h4>
      <div class="zn-formula-expr">${escapeHtml(b.spec.expression)}</div>
    </div>
    <div class="zn-formula-terms">
      ${termsHtml}
    </div>
  </section>`;
    } else if (b.type === 'comparison') {
      const rowsHtml = (b.spec.rows || []).map(r => `
      <tr>
        <td><strong>${escapeHtml(r.aspect)}</strong></td>
        <td>${escapeHtml(r.valA)}</td>
        <td>${escapeHtml(r.valB)}</td>
      </tr>`).join('');
      return `<section class="zn-comparison-block" id="${b.id}" style="margin:28px 0;">
    <h3 style="font-family:var(--hand);font-size:26px;margin:0 0 10px;">${escapeHtml(b.spec.title || 'Concept Comparison')}</h3>
    <table class="zn-comparison-table">
      <thead>
        <tr>
          <th>Aspect</th>
          <th>${escapeHtml(b.spec.conceptA)}</th>
          <th>${escapeHtml(b.spec.conceptB)}</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>
  </section>`;
    } else if (b.type === 'numerical_solver') {
      const inputsHtml = (b.spec.parameters || []).map(p => `
      <label class="zn-solver-field">
        <span>${escapeHtml(p.label)} (${escapeHtml(p.unit)})</span>
        <input type="number" data-param="${escapeHtml(p.id)}" value="${p.default}" step="${p.step || 1}">
      </label>`).join('');
      return `<section class="zn-solver-box" id="${b.id}" data-solver-type="${escapeHtml(b.spec.solver_type || 'default')}">
    <h4 class="zn-solver-header">${escapeHtml(b.spec.title || 'Interactive Numerical Problem Solver')}</h4>
    <p class="zn-solver-problem">${escapeHtml(b.spec.problem)}</p>
    <div class="zn-solver-inputs">
      ${inputsHtml}
    </div>
    <div class="zn-solver-steps" id="steps-${b.id}"></div>
    <div class="zn-solver-result">Result: <span class="res-val" id="res-${b.id}">-</span></div>
  </section>`;
    }
    return '';
  }).join('\n\n  ');

  // Objectives
  const objectivesHtml = (lesson.objectives || []).map(o => `<li>${escapeHtml(o)}</li>`).join('\n      ');

  // Key Equations callout if present
  let equationsHtml = '';
  if (ground_truth.equations && ground_truth.equations.length > 0) {
    const eqList = ground_truth.equations.map(eq => `
      <div class="zn-eq-card" style="background:var(--paper-light);border:1px solid var(--ink);padding:14px;margin-bottom:12px;">
        <code style="font-family:var(--notes);font-size:18px;font-weight:bold;color:var(--pen-blue);">${escapeHtml(eq.expression)}</code>
        <p style="margin:4px 0 0;font-size:14px;color:var(--graphite);font-family:var(--notes);">${escapeHtml(eq.description)}</p>
      </div>`).join('');
    equationsHtml = `
  <section class="zn-equations" style="margin:36px 0;">
    <h3 style="font-family:var(--hand);font-size:28px;margin-bottom:12px;">Key Physics Formulas</h3>
    ${eqList}
  </section>`;
  }

  // Misconceptions callout if present
  let misconceptionsHtml = '';
  if (ground_truth.misconceptions && ground_truth.misconceptions.length > 0) {
    const misList = ground_truth.misconceptions.map(m => `
      <li style="margin-bottom:12px;font-family:var(--notes);font-size:15px;line-height:24px;">
        <span style="color:var(--pencil-red);font-weight:bold;border:1px solid var(--pencil-red);padding:2px 6px;margin-right:8px;">MYTH</span>${escapeHtml(m.wrong_belief)}<br>
        <span style="color:var(--tick-green);font-weight:bold;border:1px solid var(--tick-green);padding:2px 6px;margin-right:8px;">REALITY</span>${escapeHtml(m.correction)}
      </li>`).join('');
    misconceptionsHtml = `
  <section class="zn-misconceptions" style="margin:36px 0;background:var(--paper-light);border:1px solid var(--ink);padding:18px;">
    <h3 style="font-family:var(--hand);font-size:28px;margin-top:0;">Common Student Misconceptions</h3>
    <ul style="list-style:none;padding:0;">${misList}</ul>
  </section>`;
  }

  // Glossary
  const glossaryHtml = (lesson.glossary || []).map(g => `<dt>${escapeHtml(g.term)}</dt><dd>${escapeHtml(g.definition)}</dd>`).join('\n      ');

  // Full HTML Document
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'none'; base-uri 'none'">
<title>${escapeHtml(topic.title)} - Zivon Physics</title>
<link rel="stylesheet" href="../../../assets/zivon.css">
<link rel="stylesheet" href="page.css">
</head>
<body>
<main class="zn-page">
  <header class="zn-header">
    <p class="zn-kicker"><a href="../../../index.html" style="text-decoration:none;color:inherit;">← Course Hub</a> · Class ${topic.class} Physics · ${escapeHtml(topic.domain)}</p>
    <h1 class="zn-title">${escapeHtml(topic.title)}</h1>
    <p class="zn-objectives-label">Learning Objectives:</p>
    <ul class="zn-objectives">
      ${objectivesHtml}
    </ul>
  </header>

  ${equationsHtml}

  ${renderedBlocksHtml}

  ${misconceptionsHtml}

  <section class="zn-glossary">
    <h2>Glossary of Terms</h2>
    <dl>
      ${glossaryHtml}
    </dl>
  </section>

  <footer class="zn-footer">
    <p class="zn-sources">Generated by the Zivon content factory. Sources: ${escapeHtml(topic.book)}. Certified for educational use.</p>
  </footer>
</main>
<script src="../../../assets/zivon.js"></script>
<script src="page.js"></script>
</body>
</html>`;

  // Block counts for manifest
  const blockCounts = {};
  for (const b of blocksList) {
    blockCounts[b.type] = (blockCounts[b.type] || 0) + 1;
  }

  const manifest = {
    course_id: courseId,
    class: topic.class,
    topic_slug: topicSlug,
    title: topic.title,
    chapter: {
      query: topic.chapter,
      title: topic.title,
      book: topic.book,
      domain: topic.domain
    },
    sources: [
      {
        id: `ncert-class-${topic.class}`,
        title: topic.book,
        license: "NCERT (free educational use)"
      }
    ],
    run_id: `${topicSlug}-c${topic.class}`,
    generated_at: new Date().toISOString(),
    block_counts: blockCounts
  };

  return { html, css: pageCss, js: pageJs, manifest };
}

// Generates canvas simulation JS conforming to ZivonSim.register
function generateSimulationCode(simId, simType, spec) {
  if (simType.includes('lens') || simType.includes('optics')) {
    return generateOpticsSimCode(simId);
  } else if (simType.includes('charge') || simType.includes('electro')) {
    return generateElectrostaticsSimCode(simId);
  } else if (simType.includes('wave') || simType.includes('sound')) {
    return generateWavesSimCode(simId);
  } else if (simType.includes('thermo') || simType.includes('gas')) {
    return generateThermodynamicsSimCode(simId);
  } else {
    return generateMechanicsSimCode(simId);
  }
}

// 1. Mechanics Simulation JS
function generateMechanicsSimCode(simId) {
  return `ZivonSim.register('${simId}', {
  init: function(ctx) {
    ctx.ready = true;
    ctx.blockPos = 0;
    ctx.velocity = 0;
  },
  draw: function(ctx) {
    var canvas = ctx.canvas, g = ctx.g;
    var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    var W = canvas.clientWidth || ctx.width || 480;
    var H = canvas.clientHeight || ctx.height || 288;
    var pw = Math.round(W * dpr), ph = Math.round(H * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw; canvas.height = ph;
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    var PAPER_LIGHT = '#F6F0CF', PAPER = '#EFE6B8', INK = '#1C1B18', GRAPHITE = '#5A5748', PEN_BLUE = '#1F3A9E', RED = '#B3261E';
    g.fillStyle = PAPER_LIGHT;
    g.fillRect(0, 0, W, H);

    // Read values
    var F_app = parseFloat(ctx.values.applied_force !== undefined ? ctx.values.applied_force : (ctx.values.right_force || 24));
    var F_fric = parseFloat(ctx.values.friction_force !== undefined ? ctx.values.friction_force : (ctx.values.left_force || 8));
    var mass = parseFloat(ctx.values.mass || 4);

    var F_net = F_app - F_fric;
    var accel = F_net / mass;

    // Animate position
    if (!ctx.paused) {
      ctx.velocity += accel * 0.016;
      if (F_net <= 0 && ctx.velocity < 0) ctx.velocity = 0;
      ctx.blockPos += ctx.velocity * 0.8;
      if (ctx.blockPos > W - 100) ctx.blockPos = -20;
    }

    // Ground line
    var groundY = H * 0.65;
    g.beginPath();
    g.moveTo(20, groundY);
    g.lineTo(W - 20, groundY);
    g.strokeStyle = INK;
    g.lineWidth = 3;
    g.stroke();

    // Hatching under ground
    for (var x = 24; x < W - 20; x += 16) {
      g.beginPath();
      g.moveTo(x, groundY);
      g.lineTo(x - 8, groundY + 10);
      g.strokeStyle = GRAPHITE;
      g.lineWidth = 1.5;
      g.stroke();
    }

    // Moving Block
    var bx = Math.max(30, Math.min(W - 120, (W * 0.35) + (ctx.blockPos % (W * 0.5))));
    var bw = 70, bh = 46;
    var by = groundY - bh;

    g.fillStyle = PAPER;
    g.fillRect(bx, by, bw, bh);
    g.strokeStyle = INK;
    g.lineWidth = 2.5;
    g.strokeRect(bx, by, bw, bh);

    g.fillStyle = INK;
    g.font = '700 16px Caveat, cursive';
    g.textAlign = 'center';
    g.fillText(mass + ' kg', bx + bw/2, by + bh/2 + 5);

    // Force vectors
    function drawArrow(x1, y1, x2, y2, color, label) {
      var dx = x2 - x1, dy = y2 - y1;
      var len = Math.sqrt(dx*dx + dy*dy);
      if (len < 5) return;
      g.beginPath();
      g.moveTo(x1, y1);
      g.lineTo(x2, y2);
      g.strokeStyle = color;
      g.lineWidth = 3;
      g.stroke();

      var angle = Math.atan2(dy, dx);
      var head = 10;
      g.beginPath();
      g.moveTo(x2, y2);
      g.lineTo(x2 - head * Math.cos(angle - 0.4), y2 - head * Math.sin(angle - 0.4));
      g.lineTo(x2 - head * Math.cos(angle + 0.4), y2 - head * Math.sin(angle + 0.4));
      g.closePath();
      g.fillStyle = color;
      g.fill();

      g.font = '700 13px "Courier Prime", monospace';
      g.fillStyle = color;
      g.fillText(label, (x1 + x2)/2, y1 - 8);
    }

    if (F_app > 0) drawArrow(bx + bw, by + bh/2, bx + bw + Math.min(120, F_app * 3), by + bh/2, PEN_BLUE, 'F_app = ' + F_app + 'N');
    if (F_fric > 0) drawArrow(bx, by + bh/2, bx - Math.min(80, F_fric * 3), by + bh/2, RED, 'Fric = ' + F_fric + 'N');

    // Net Force indicator bar
    g.font = '700 14px "Courier Prime", monospace';
    g.textAlign = 'left';
    g.fillStyle = INK;
    g.fillText('Net Force F_net: ' + F_net.toFixed(1) + ' N', 24, 30);
    g.fillStyle = PEN_BLUE;
    g.fillText('Acceleration a = F/m: ' + accel.toFixed(2) + ' m/s²', 24, 52);
    g.fillStyle = GRAPHITE;
    g.fillText('Velocity: ' + ctx.velocity.toFixed(1) + ' m/s', 24, 74);
  }
});`;
}

// 2. Optics Simulation JS
function generateOpticsSimCode(simId) {
  return `ZivonSim.register('${simId}', {
  init: function(ctx) {
    ctx.ready = true;
  },
  draw: function(ctx) {
    var canvas = ctx.canvas, g = ctx.g;
    var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    var W = canvas.clientWidth || ctx.width || 480;
    var H = canvas.clientHeight || ctx.height || 288;
    var pw = Math.round(W * dpr), ph = Math.round(H * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw; canvas.height = ph;
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    var PAPER_LIGHT = '#F6F0CF', PAPER = '#EFE6B8', INK = '#1C1B18', GRAPHITE = '#5A5748', PEN_BLUE = '#1F3A9E', RED = '#B3261E';
    g.fillStyle = PAPER_LIGHT;
    g.fillRect(0, 0, W, H);

    var u = parseFloat(ctx.values.object_distance || 36);
    var f = parseFloat(ctx.values.focal_length || 18);

    // Thin lens formula: 1/f = 1/v - 1/u (with u negative)
    // 1/v = 1/f + 1/(-u) = 1/f - 1/u => v = (u * f) / (u - f)
    var v = (u !== f) ? (u * f) / (u - f) : 9999;
    var m = (u !== 0) ? -v / u : 1;

    var scale = 3.6;
    var cx = W * 0.52;
    var cy = H * 0.55;

    // Principal Axis
    g.beginPath();
    g.moveTo(20, cy);
    g.lineTo(W - 20, cy);
    g.strokeStyle = GRAPHITE;
    g.lineWidth = 1.5;
    g.setLineDash([4, 4]);
    g.stroke();
    g.setLineDash([]);

    // Convex Lens shape
    g.fillStyle = 'rgba(31, 58, 158, 0.12)';
    g.strokeStyle = INK;
    g.lineWidth = 2.5;
    g.beginPath();
    g.ellipse(cx, cy, 14, 90, 0, 0, Math.PI * 2);
    g.fill();
    g.stroke();

    // Mark Focal points
    var fPx = f * scale;
    g.fillStyle = INK;
    g.beginPath(); g.arc(cx - fPx, cy, 3, 0, Math.PI*2); g.fill();
    g.beginPath(); g.arc(cx + fPx, cy, 3, 0, Math.PI*2); g.fill();
    g.font = '700 13px Caveat, cursive';
    g.textAlign = 'center';
    g.fillText('F₁', cx - fPx, cy + 18);
    g.fillText('F₂', cx + fPx, cy + 18);
    g.fillText('O', cx, cy + 18);

    // Object
    var objH = 40;
    var ox = cx - (u * scale);
    g.beginPath();
    g.moveTo(ox, cy);
    g.lineTo(ox, cy - objH);
    g.strokeStyle = INK;
    g.lineWidth = 3.5;
    g.stroke();
    // Arrowhead
    g.beginPath();
    g.moveTo(ox - 5, cy - objH + 8);
    g.lineTo(ox, cy - objH);
    g.lineTo(ox + 5, cy - objH + 8);
    g.fillStyle = INK;
    g.fill();
    g.fillText('Obj', ox, cy - objH - 6);

    // Image
    var imgH = objH * m;
    var ix = cx + (v * scale);
    if (Math.abs(v) < 150) {
      g.beginPath();
      g.moveTo(ix, cy);
      g.lineTo(ix, cy + imgH);
      g.strokeStyle = (v > 0) ? RED : '#2F6B2F';
      g.lineWidth = 3;
      g.stroke();
      // Arrowhead
      var sgn = (imgH >= 0) ? 1 : -1;
      g.beginPath();
      g.moveTo(ix - 5, cy + imgH - sgn*8);
      g.lineTo(ix, cy + imgH);
      g.lineTo(ix + 5, cy + imgH - sgn*8);
      g.fillStyle = (v > 0) ? RED : '#2F6B2F';
      g.fill();
      g.fillText((v > 0 ? 'Real Img' : 'Virt Img'), ix, cy + imgH + (sgn > 0 ? 16 : -8));
    }

    // Ray 1: Parallel to axis then through F2
    g.strokeStyle = PEN_BLUE;
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(ox, cy - objH);
    g.lineTo(cx, cy - objH);
    g.lineTo(cx + fPx * 2.5, cy - objH + ((cy - (cy - objH)) / fPx) * fPx * 2.5);
    g.stroke();

    // Ray 2: Straight through optical center O
    g.beginPath();
    g.moveTo(ox, cy - objH);
    g.lineTo(cx + (cx - ox), cy + objH);
    g.stroke();

    // Readout
    g.font = '700 13px "Courier Prime", monospace';
    g.textAlign = 'left';
    g.fillStyle = INK;
    g.fillText('Object distance u = -' + u.toFixed(1) + ' cm', 20, 26);
    g.fillText('Focal length f = +' + f.toFixed(1) + ' cm', 20, 44);
    g.fillStyle = (v > 0) ? RED : '#2F6B2F';
    g.fillText('Image distance v = ' + (v !== 9999 ? v.toFixed(1) + ' cm (' + (v > 0 ? 'Real, Inverted' : 'Virtual, Erect') + ')' : 'Infinity'), 20, 62);
    g.fillText('Magnification m = ' + m.toFixed(2) + 'x', 20, 80);
  }
});`;
}

// 3. Electrostatics Simulation JS
function generateElectrostaticsSimCode(simId) {
  return `ZivonSim.register('${simId}', {
  init: function(ctx) {
    ctx.ready = true;
  },
  draw: function(ctx) {
    var canvas = ctx.canvas, g = ctx.g;
    var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    var W = canvas.clientWidth || ctx.width || 480;
    var H = canvas.clientHeight || ctx.height || 288;
    var pw = Math.round(W * dpr), ph = Math.round(H * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw; canvas.height = ph;
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    var PAPER_LIGHT = '#F6F0CF', INK = '#1C1B18', GRAPHITE = '#5A5748', PEN_BLUE = '#1F3A9E', RED = '#B3261E';
    g.fillStyle = PAPER_LIGHT;
    g.fillRect(0, 0, W, H);

    var q1 = parseFloat(ctx.values.charge_q1 !== undefined ? ctx.values.charge_q1 : 5);
    var q2 = parseFloat(ctx.values.charge_q2 !== undefined ? ctx.values.charge_q2 : -5);
    var r = parseFloat(ctx.values.separation_r !== undefined ? ctx.values.separation_r : 3);

    // Coulomb calculation F = k * |q1*q2| / r^2
    var k = 8.99; // in scaled units
    var forceMag = (k * Math.abs(q1 * q2)) / (r * r);
    var isRepulsive = (q1 * q2) > 0;

    var cy = H * 0.55;
    var cx = W / 2;
    var distPx = r * 30;
    var x1 = cx - distPx/2;
    var x2 = cx + distPx/2;

    // Draw field lines sketch
    g.strokeStyle = 'rgba(90, 87, 72, 0.25)';
    g.lineWidth = 1.2;
    for (var a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      g.beginPath();
      g.moveTo(x1 + 18 * Math.cos(a), cy + 18 * Math.sin(a));
      g.lineTo(x1 + 45 * Math.cos(a), cy + 45 * Math.sin(a));
      g.stroke();
      g.beginPath();
      g.moveTo(x2 + 18 * Math.cos(a), cy + 18 * Math.sin(a));
      g.lineTo(x2 + 45 * Math.cos(a), cy + 45 * Math.sin(a));
      g.stroke();
    }

    // Charges
    function drawCharge(x, y, q, label) {
      var color = (q >= 0) ? RED : PEN_BLUE;
      g.beginPath();
      g.arc(x, y, 20, 0, Math.PI * 2);
      g.fillStyle = color;
      g.fill();
      g.strokeStyle = INK;
      g.lineWidth = 2;
      g.stroke();

      g.fillStyle = '#FFFFFF';
      g.font = '700 22px Arial, sans-serif';
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.fillText((q >= 0 ? '+' : '−'), x, y);

      g.font = '700 13px "Courier Prime", monospace';
      g.fillStyle = INK;
      g.fillText(label + ' (' + q + 'μC)', x, y + 34);
    }

    drawCharge(x1, cy, q1, 'q₁');
    drawCharge(x2, cy, q2, 'q₂');

    // Force vectors
    var fLen = Math.min(65, forceMag * 4);
    var fDir1 = isRepulsive ? -1 : 1;
    var fDir2 = isRepulsive ? 1 : -1;

    function drawF(x, y, dir, col, text) {
      g.beginPath();
      g.moveTo(x, y - 26);
      g.lineTo(x + dir * fLen, y - 26);
      g.strokeStyle = col;
      g.lineWidth = 3;
      g.stroke();
      g.beginPath();
      g.moveTo(x + dir * fLen, y - 26);
      g.lineTo(x + dir * (fLen - 8), y - 30);
      g.lineTo(x + dir * (fLen - 8), y - 22);
      g.fillStyle = col;
      g.fill();
    }

    if (fLen > 2) {
      drawF(x1, cy, fDir1, isRepulsive ? RED : PEN_BLUE, 'F₁₂');
      drawF(x2, cy, fDir2, isRepulsive ? RED : PEN_BLUE, 'F₂₁');
    }

    // Readout
    g.font = '700 14px "Courier Prime", monospace';
    g.textAlign = 'left';
    g.textBaseline = 'top';
    g.fillStyle = INK;
    g.fillText('Separation r = ' + r.toFixed(1) + ' m', 20, 20);
    g.fillStyle = isRepulsive ? RED : PEN_BLUE;
    g.fillText('Coulomb Force F = ' + forceMag.toFixed(2) + ' N (' + (isRepulsive ? 'REPULSIVE' : 'ATTRACTIVE') + ')', 20, 40);
  }
});`;
}

// 4. Waves Simulation JS
function generateWavesSimCode(simId) {
  return `ZivonSim.register('${simId}', {
  init: function(ctx) {
    ctx.phase = 0;
  },
  draw: function(ctx) {
    var canvas = ctx.canvas, g = ctx.g;
    var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    var W = canvas.clientWidth || ctx.width || 480;
    var H = canvas.clientHeight || ctx.height || 288;
    var pw = Math.round(W * dpr), ph = Math.round(H * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw; canvas.height = ph;
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    var PAPER_LIGHT = '#F6F0CF', INK = '#1C1B18', GRAPHITE = '#5A5748', PEN_BLUE = '#1F3A9E';
    g.fillStyle = PAPER_LIGHT;
    g.fillRect(0, 0, W, H);

    var A = parseFloat(ctx.values.amplitude || 24);
    var f = parseFloat(ctx.values.frequency || 1.2);
    var lambda = parseFloat(ctx.values.wavelength || 80);

    // v = f * lambda
    var waveSpeed = f * (lambda / 10);

    if (!ctx.paused) {
      ctx.phase += f * 0.08;
    }

    var cy = H * 0.58;

    // Center equilibrium line
    g.beginPath();
    g.moveTo(20, cy);
    g.lineTo(W - 20, cy);
    g.strokeStyle = GRAPHITE;
    g.lineWidth = 1.2;
    g.setLineDash([4, 4]);
    g.stroke();
    g.setLineDash([]);

    // Continuous wave function y = A * sin(2π(x/λ - ft))
    g.beginPath();
    for (var x = 20; x < W - 20; x += 3) {
      var y = cy - A * Math.sin((2 * Math.PI * (x / lambda)) - ctx.phase);
      if (x === 20) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.strokeStyle = PEN_BLUE;
    g.lineWidth = 3;
    g.stroke();

    // Discrete oscillating particles
    for (var px = 40; px < W - 20; px += 30) {
      var py = cy - A * Math.sin((2 * Math.PI * (px / lambda)) - ctx.phase);
      g.beginPath();
      g.arc(px, py, 4, 0, Math.PI * 2);
      g.fillStyle = INK;
      g.fill();
    }

    // Readout
    g.font = '700 14px "Courier Prime", monospace';
    g.textAlign = 'left';
    g.fillStyle = INK;
    g.fillText('Frequency f = ' + f.toFixed(1) + ' Hz', 20, 24);
    g.fillText('Wavelength λ = ' + lambda.toFixed(0) + ' cm', 20, 44);
    g.fillStyle = PEN_BLUE;
    g.fillText('Wave speed v = f · λ = ' + waveSpeed.toFixed(1) + ' m/s', 20, 64);
  }
});`;
}

// 5. Thermodynamics Simulation JS
function generateThermodynamicsSimCode(simId) {
  return `ZivonSim.register('${simId}', {
  init: function(ctx) {
    ctx.particles = [];
    for (var i = 0; i < 35; i++) {
      ctx.particles.push({
        x: 40 + Math.random() * 120,
        y: 40 + Math.random() * 100,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4
      });
    }
  },
  draw: function(ctx) {
    var canvas = ctx.canvas, g = ctx.g;
    var dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    var W = canvas.clientWidth || ctx.width || 480;
    var H = canvas.clientHeight || ctx.height || 288;
    var pw = Math.round(W * dpr), ph = Math.round(H * dpr);
    if (canvas.width !== pw || canvas.height !== ph) {
      canvas.width = pw; canvas.height = ph;
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);

    var PAPER_LIGHT = '#F6F0CF', PAPER = '#EFE6B8', INK = '#1C1B18', GRAPHITE = '#5A5748', PEN_BLUE = '#1F3A9E', RED = '#B3261E';
    g.fillStyle = PAPER_LIGHT;
    g.fillRect(0, 0, W, H);

    var T = parseFloat(ctx.values.temperature || 300);
    var V = parseFloat(ctx.values.volume || 3);

    // Ideal gas law P = nRT / V
    var P = (0.0821 * T) / V;
    var speedMultiplier = Math.sqrt(T / 300);

    var cy = H * 0.55;
    var cylX = 30, cylY = 70;
    var cylH = 150;
    var maxW = 280;
    var currentW = (V / 5) * maxW;

    // Cylinder chamber
    g.fillStyle = PAPER;
    g.fillRect(cylX, cylY, currentW, cylH);
    g.strokeStyle = INK;
    g.lineWidth = 3;
    g.strokeRect(cylX, cylY, currentW, cylH);

    // Movable Piston
    g.fillStyle = '#5A5748';
    g.fillRect(cylX + currentW - 12, cylY, 12, cylH);
    g.fillRect(cylX + currentW, cylY + cylH/2 - 8, 40, 16);

    // Update and draw particles
    g.fillStyle = PEN_BLUE;
    for (var i = 0; i < ctx.particles.length; i++) {
      var p = ctx.particles[i];
      if (!ctx.paused) {
        p.x += p.vx * speedMultiplier;
        p.y += p.vy * speedMultiplier;

        if (p.x < cylX + 4) { p.x = cylX + 4; p.vx = -p.vx; }
        if (p.x > cylX + currentW - 16) { p.x = cylX + currentW - 16; p.vx = -p.vx; }
        if (p.y < cylY + 4) { p.y = cylY + 4; p.vy = -p.vy; }
        if (p.y > cylY + cylH - 4) { p.y = cylY + cylH - 4; p.vy = -p.vy; }
      }
      g.beginPath();
      g.arc(p.x, p.y, 4, 0, Math.PI * 2);
      g.fill();
    }

    // Readout / Gauges
    g.font = '700 14px "Courier Prime", monospace';
    g.textAlign = 'left';
    g.fillStyle = INK;
    g.fillText('Temperature T: ' + T.toFixed(0) + ' K (avg speed: ' + speedMultiplier.toFixed(2) + 'x)', 20, 24);
    g.fillText('Volume V: ' + V.toFixed(1) + ' Liters', 20, 44);
    g.fillStyle = RED;
    g.fillText('Pressure P = nRT/V: ' + P.toFixed(2) + ' atm', 240, 44);
  }
});`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
