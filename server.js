import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0';

const frontendDir = path.join(__dirname, 'frontend');

// Security & Caching middleware (mirroring docker/nginx.conf)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');

  // Demo freshness: HTML and courses.js are never cached
  if (req.path.endsWith('.html') || req.path === '/' || req.path === '/courses.js') {
    res.setHeader('Cache-Control', 'no-store');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=300');
  }
  next();
});

// Health check endpoint (matches K8s / nginx probe)
app.get('/healthz', (req, res) => {
  res.status(200).type('text/plain').send('ok\n');
});

app.use(express.json());

// Content Factory Bridge import
import { CURRICULUM_TOPICS, getRegisteredCourses, generateContentModule, rebuildCoursesJs } from './factory-bridge.js';

// Rebuild initial courses list on startup
rebuildCoursesJs();

// API: Get topics catalog and generation status
app.get('/api/topics', (req, res) => {
  const registered = getRegisteredCourses();
  const regSlugs = new Set(registered.map(r => r.topic_slug));

  const topics = CURRICULUM_TOPICS.map(t => ({
    ...t,
    isGenerated: regSlugs.has(t.slug),
    href: regSlugs.has(t.slug) ? `courses/class-${t.class}-physics/${t.slug}/index.html` : null
  }));

  res.json({ topics, courses: registered });
});

// API: Get all registered courses
app.get('/api/courses', (req, res) => {
  const courses = getRegisteredCourses();
  res.json(courses);
});

// API: Trigger Content Factory generation
app.post('/api/generate', async (req, res) => {
  try {
    const { chapter, classLevel = 9, domain } = req.body;
    if (!chapter) {
      return res.status(400).json({ error: 'Chapter or topic name is required' });
    }

    console.log(`[API] Content Factory request for "${chapter}" (Class ${classLevel}, Domain: ${domain || 'Auto'})...`);
    const result = await generateContentModule(chapter, parseInt(classLevel, 10), domain);
    res.json(result);
  } catch (err) {
    console.error('[API] Content Factory generation failed:', err);
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

// Serve static assets and courses from frontend/
app.use(express.static(frontendDir, {
  extensions: ['html'],
  index: 'index.html'
}));

// Route fallback: unknown requests serve index.html
app.use((req, res) => {
  res.sendFile(path.join(frontendDir, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`Zivon server running at http://${HOST}:${PORT}`);
});
