```markdown
# Webform AI Prompt Generator

En lille demo-app (Node + Express + static frontend) til at generere AI-prompt via et webform med de funktioner du beskrev:

Funktioner
- Søgetekst (tekstområde) — skriv prompten.
- Hukommelse (knap) — vis alt i serverhukommelsen; slå til "Gem næste svar i hukommelsen".
- Link Validering (knap) — server-side validation. Udfører en HTTP HEAD/GET og returnerer kun URL'er der svarer med HTTP 200. UI viser også curl-eksemplet: `curl -Is [URL] | head -n 1`.
- Kopier (knap) — kopierer output til udklipsholderen.

Hvordan køre lokalt
1. Installer afhængigheder:
   npm install
2. Start server:
   npm start
3. Åbn browser på:
   http://localhost:3000

API
- POST /api/validate { url } → validerer URL. Returnerer kun koden og første linje-tekst; UI skjuler 404.
- GET /api/memory → returnerer alle gemte memory-entries.
- POST /api/memory { text } → gemmer en tekst i hukommelsen (append).

Bemærkninger
- Dette er en demo; "hukommelse" er gemt i memory.json på serveren.
- Link-validering foretages server-side for at undgå CORS/HEAD-problemer i klienten.
```
