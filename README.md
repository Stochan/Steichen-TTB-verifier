# Steichen Label Verifier — Web App

A deployable React web app for TTB alcohol label compliance verification, powered by Claude Vision.
Upload a label image, enter the application data, and get a structured pass/fail/warn verdict
per field in seconds.

Ported from the `Steichen-label-verifier` Eclipse/Maven desktop project (`steichen.ttb` package).

---

## Deploy in 5 minutes (no coding required)

### Option A — Vercel (recommended)

1. Push this folder to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New Project** → select your repo → **Deploy**.
4. You'll get a live URL like `https://steichen-label-verifier.vercel.app`.

### Option B — Netlify

1. Push this folder to a GitHub repo.
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**.
3. Select your repo. Build command: `npm run build`, publish directory: `build`.
4. Click **Deploy site**.

---

## Run locally

```bash
npm install
npm start
# Opens at http://localhost:3000
```

Build for production:

```bash
npm run build
```

---

## API Key

On first visit the app asks for an Anthropic API key. It is stored in the browser's
`localStorage` under the key `steichen_ttb_anthropic_api_key` and is only ever sent
to `api.anthropic.com`. Each visitor uses their own key — there is no shared backend.

Get a key at [console.anthropic.com](https://console.anthropic.com/).

---

## Project structure

```
src/
├── anthropicClient.js          API call logic + prompt builder
│                               (ported from PromptBuilder.java & AnthropicClient.java)
├── App.jsx                     Root component, state management
├── App.module.css              Root layout
├── index.js                    React entry point
├── index.css                   Global styles + CSS variables
└── components/
    ├── Header.jsx/css          Navy header — "Steichen Label Verifier"
    ├── ApiKeyModal.jsx/css     First-run API key entry
    ├── FormPanel.jsx/css       Left panel: image upload + form fields
    ├── ResultsPanel.jsx/css    Right panel: verdict banner + per-field check rows
    └── BatchModal.jsx/css      Batch review modal with live progress
```

---

## Notes

- No backend or server — the app calls the Anthropic API directly from the browser.
- Each label review costs a small amount of API credit (~$0.01–$0.05 per check).
- The Government Warning Statement is always checked regardless of which fields are filled in.
- Batch mode processes labels sequentially to stay within API rate limits.
- The prompt is a faithful port of `steichen.ttb.labelverifier.service.PromptBuilder`.
