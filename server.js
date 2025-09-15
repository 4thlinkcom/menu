const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const MEMORY_FILE = path.join(__dirname, 'memory.json');

function readMemory() {
  try {
    const raw = fs.readFileSync(MEMORY_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

function writeMemory(arr) {
  fs.writeFileSync(MEMORY_FILE, JSON.stringify(arr, null, 2), 'utf8');
}

// GET memory
app.get('/api/memory', (req, res) => {
  res.json({ data: readMemory() });
});

// POST memory (append)
app.post('/api/memory', (req, res) => {
  const { text } = req.body;
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Invalid text' });
  }
  const mem = readMemory();
  const entry = {
    id: Date.now(),
    text: text,
    created_at: new Date().toISOString()
  };
  mem.push(entry);
  writeMemory(mem);
  res.json({ ok: true, entry });
});

// POST validate URL
app.post('/api/validate', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing url' });
  }
  // Basic sanitize / validation
  let parsed;
  try {
    parsed = new URL(url);
    if (!/^https?:$/.test(parsed.protocol)) throw new Error('Invalid protocol');
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    // Try HEAD first
    const fetch = global.fetch || require('node-fetch');
    let response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
    // Some servers don't like HEAD → fall back to GET
    if (response.status === 405 || response.status === 501 || response.status === 0) {
      response = await fetch(url, { method: 'GET', redirect: 'follow' });
    }

    const status = response.status;
    const statusText = response.statusText || '';
    const firstLine = `HTTP ${status} ${statusText}`.trim();

    res.json({ url, status, firstLine });
  } catch (err) {
    // On network error, return 0 status
    res.json({ url, status: 0, firstLine: '', error: String(err) });
  }
});

// Serve index.html for all other routes (SPA-safe)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webform AI Prompt Generator running at http://localhost:${PORT}`);
});
