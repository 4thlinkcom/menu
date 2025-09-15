// Simple frontend logic
const promptEl = document.getElementById('prompt');
const generateBtn = document.getElementById('generate');
const outputEl = document.getElementById('output');
const copyBtn = document.getElementById('copy-output');

const memoryToggleBtn = document.getElementById('memory-toggle');
const memoryPanel = document.getElementById('memory-panel');
const showMemoryBtn = document.getElementById('show-memory');
const saveNextCheckbox = document.getElementById('save-next');
const memoryListSection = document.getElementById('memory-list-section');
const memoryListEl = document.getElementById('memory-list');

const validateUrlInput = document.getElementById('validate-url');
const validateBtn = document.getElementById('validate-btn');
const validationSection = document.getElementById('validation-section');
const validationResult = document.getElementById('validation-result');

memoryToggleBtn.addEventListener('click', () => {
  memoryPanel.classList.toggle('hidden');
});

generateBtn.addEventListener('click', async () => {
  const prompt = promptEl.value.trim();
  if (!prompt) {
    outputEl.textContent = '(skriv en prompt først)';
    return;
  }

  // Mock AI response demo: just echo with a header
  const aiResponse = `AI-svar (demo)\n----------------\n${prompt}\n\n[Dette er et demo-svar — i en rigtig integration vil du kalde en AI-tjeneste her.]`;
  outputEl.textContent = aiResponse;

  // If save-next enabled -> POST to /api/memory
  if (saveNextCheckbox.checked) {
    try {
      await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: aiResponse })
      });
      // After saving, automatically uncheck
      saveNextCheckbox.checked = false;
    } catch (err) {
      console.error('Kunne ikke gemme i hukommelsen', err);
    }
  }
});

copyBtn.addEventListener('click', async () => {
  const txt = outputEl.textContent || '';
  try {
    await navigator.clipboard.writeText(txt);
    copyBtn.textContent = 'Kopieret ✓';
    setTimeout(() => (copyBtn.textContent = 'Kopier'), 1500);
  } catch (err) {
    alert('Kopiering mislykkedes: ' + err);
  }
});

showMemoryBtn.addEventListener('click', async () => {
  try {
    const r = await fetch('/api/memory');
    const json = await r.json();
    memoryListEl.innerHTML = '';
    if (json.data && json.data.length) {
      json.data.forEach(entry => {
        const li = document.createElement('li');
        li.textContent = `${entry.created_at} — ${entry.text}`;
        memoryListEl.appendChild(li);
      });
      memoryListSection.classList.remove('hidden');
    } else {
      memoryListEl.innerHTML = '<li>(ingen gemte poster)</li>';
      memoryListSection.classList.remove('hidden');
    }
  } catch (err) {
    console.error(err);
  }
});

validateBtn.addEventListener('click', async () => {
  const url = validateUrlInput.value.trim();
  if (!url) {
    validationResult.textContent = '(indtast en URL)';
    validationSection.classList.remove('hidden');
    return;
  }
  validationResult.textContent = 'Validerer...';
  validationSection.classList.remove('hidden');
  try {
    const r = await fetch('/api/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const json = await r.json();
    // Per spec: only show in svaret if HTTP 200
    if (json.status === 200) {
      validationResult.textContent = `✅ ${json.firstLine}\nURL: ${json.url}`;
    } else if (json.status === 404) {
      validationResult.textContent = `❌ 404 — udeladt fra svaret`;
    } else if (json.status === 0) {
      validationResult.textContent = `❌ Netværksfejl eller intet svar: ${json.error || ''}`;
    } else {
      validationResult.textContent = `❌ Status ${json.status} — udeladt fra svaret`;
    }
  } catch (err) {
    validationResult.textContent = `Fejl: ${err}`;
  }
});
