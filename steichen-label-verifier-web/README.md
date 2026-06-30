# Steichen Label Verifier — Web App

An AI-powered browser-based tool for TTB compliance agents to verify alcohol beverage labels against COLA application data. Built with React, powered by the Anthropic Claude Vision API. No installation required — runs entirely in the browser.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Deploying the App](#deploying-the-app)
- [Using the App](#using-the-app)
- [Project Structure](#project-structure)
- [Technical Approach](#technical-approach)
- [Assumptions and Trade-offs](#assumptions-and-trade-offs)
- [Known Limitations](#known-limitations)

---

## Overview

Compliance agents upload a label image alongside the corresponding application data (brand name, ABV, class/type, etc.). The tool sends the image to Claude Vision with a structured compliance prompt and returns a per-field pass/fail/warn verdict in under 5 seconds, along with a plain-English explanation for each field.

Batch mode lets agents queue up multiple label images and process them sequentially — designed for the peak-season bulk-import scenario where importers submit 200–300 labels at once.

This is the web version of the `Steichen-label-verifier` Eclipse/Maven desktop project. It is functionally identical — the same prompt logic, the same five application fields, the same verdict system — but runs in any modern browser with no Java or IDE required, and can be shared as a public URL.

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18 or later | [Download from nodejs.org](https://nodejs.org/) |
| npm | 9 or later | Bundled with Node.js |
| Anthropic API key | — | [Get one at console.anthropic.com](https://console.anthropic.com/) |
| GitHub account | — | Required for Vercel/Netlify deployment |

> **Network note:** The app calls `api.anthropic.com` on port 443 directly from the browser. Ensure your network allows outbound HTTPS to that domain.

---

## Setup

### 1 — Clone or unzip the project

```bash
# If using Git:
git clone <your-repo-url>
cd steichen-label-verifier-web

# Or unzip the downloaded archive and cd into the folder.
```

### 2 — Install dependencies

```bash
npm install
```

This downloads React, react-scripts, and their dependencies into `node_modules/`. It may take a minute on first run.

### 3 — Run locally

```bash
npm start
```

Opens the app at `http://localhost:3000`. The browser reloads automatically when you edit source files.

### 4 — Build for production

```bash
npm run build
```

Creates an optimised static bundle in the `build/` folder. This is what gets deployed to Vercel or Netlify.

---

## Deploying the App

### Option A — Vercel (recommended)

1. Push the project folder to a GitHub repository.
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
3. Click **Add New Project** → select your repository.
4. Vercel auto-detects Create React App. Leave all settings as-is and click **Deploy**.
5. Done — you'll receive a permanent public URL like `https://steichen-label-verifier.vercel.app` that you can share immediately.

A `vercel.json` is included in the project root with the correct build and output settings.

### Option B — Netlify

1. Push the project folder to a GitHub repository.
2. Go to [netlify.com](https://netlify.com) → **Add new site → Import from Git**.
3. Select your repository.
   - Build command: `npm run build`
   - Publish directory: `build`
4. Click **Deploy site**.
5. Done — you'll receive a public URL like `https://steichen-label-verifier.netlify.app`.

A `netlify.toml` is included with the correct build settings and SPA redirect rules.

---

## Using the App

### First visit

On first visit, a dialog asks for your Anthropic API key. Enter your key (starts with `sk-ant-…`) and click **Save & continue**. The key is stored in the browser's `localStorage` and is never transmitted anywhere other than `api.anthropic.com`.

To change the key later, click **Change API key** in the top-right corner of the header.

### Single label review

1. Click the image upload area and select a label photo (JPG, PNG, or WEBP).
2. Fill in any or all of the application data fields on the left panel.
3. Click **Run compliance check**.
4. Results appear on the right within a few seconds, showing:
   - An overall verdict banner (APPROVED / REJECTED / NEEDS REVIEW)
   - A per-field row for every application field you entered, plus always a Government Warning check

### Batch review

1. Click **Upload multiple labels…** in the footer bar.
2. In the batch dialog, click **Add label images** to select multiple files at once.
3. The application data from the main form is applied to every label in the batch.
4. Click **Run batch review** — labels are processed sequentially with a live progress bar and per-row status updates.

### Tips

- You do not need to fill in all application data fields — any blank field is simply not checked. At minimum the Government Warning is always checked.
- The AI is lenient about capitalisation differences (e.g. "STONE'S THROW" vs "Stone's Throw" passes) but flags substantive mismatches.
- A **NEEDS REVIEW** verdict means the AI detected something worth a human look but not a clear-cut violation — consistent with the "warn" judgement call described in stakeholder interviews.

---

## Project Structure

```
steichen-label-verifier-web/
├── package.json                     npm build descriptor and dependency list
├── vercel.json                      Vercel deployment configuration
├── netlify.toml                     Netlify deployment configuration
├── public/
│   └── index.html                   HTML shell — root mount point for React
└── src/
    ├── index.js                     React entry point
    ├── index.css                    Global styles and CSS custom properties (theme)
    ├── anthropicClient.js           API call logic + prompt builder
    │                                (ported from PromptBuilder.java & AnthropicClient.java)
    ├── App.jsx                      Root component — state management and layout wiring
    ├── App.module.css               Root layout (header / body / footer)
    └── components/
        ├── Header.jsx               Navy header bar with title and API key button
        ├── Header.module.css
        ├── ApiKeyModal.jsx          First-run API key entry modal
        ├── ApiKeyModal.module.css
        ├── FormPanel.jsx            Left panel: image upload zone and application data fields
        ├── FormPanel.module.css
        ├── ResultsPanel.jsx         Right panel: verdict banner and per-field check rows
        ├── ResultsPanel.module.css
        ├── BatchModal.jsx           Batch review modal with file table and progress bar
        └── BatchModal.module.css
```

---

## Technical Approach

### Why React?

React was chosen to make this deployable as a shareable URL with no installation or runtime on the recipient's machine. Any modern browser can run it. The component-per-concern structure also maps cleanly onto the Java desktop version's class structure — `FormPanel` corresponds to the left panel in `MainWindow`, `ResultsPanel` to `ResultsPanel.java`, `BatchModal` to `BatchDialog.java`, and so on.

### Why no backend?

For a prototype, a backend would add infrastructure complexity with no meaningful benefit. The Anthropic API is called directly from the browser using the `anthropic-dangerous-direct-browser-calls` header, which Anthropic supports for prototyping. In a production deployment, the API call would be proxied through a server-side function to keep the API key out of the browser entirely.

### API design

`anthropicClient.js` is the single module responsible for all Anthropic communication. It exports three functions: `buildPrompt` (constructs the compliance prompt from form data), `verifyLabel` (sends image + prompt, returns parsed JSON), and `readFileAsBase64` (converts a browser `File` object for the API). Keeping these separate from the React components means prompt wording can be iterated without touching UI code — the same separation as `PromptBuilder.java` vs `AnthropicClient.java` in the desktop version.

### State management

All application state lives in `App.jsx` using React's built-in `useState`. There is no external state library. The state shape is intentionally flat: one object for form fields, one string for review state (`empty` / `loading` / `done` / `error`), and one object for the last result. This keeps the data flow easy to follow in a prototype context.

### Prompt strategy

The prompt instructs Claude to:
1. Match each provided application field against the label, with explicit leniency rules for capitalisation (addressing Dave's "STONE'S THROW" scenario from the interview notes).
2. Always check the Government Warning Statement against the exact statutory requirements noted by Jenny Park, regardless of whether it was in the application data.
3. Respond only with a rigid JSON schema — no prose, no markdown fences — so parsing is deterministic.

The prompt is a faithful port of `steichen.ttb.labelverifier.service.PromptBuilder` — wording is identical.

### CSS approach

Each component has a co-located CSS Module (`.module.css`). All colours, radii, and font settings are defined as CSS custom properties in `index.css` and referenced by name throughout. To change the colour scheme, only `index.css` needs to be edited.

---

## Assumptions and Trade-offs

| Assumption / Trade-off | Rationale |
|------------------------|-----------|
| API key stored in `localStorage` | Simplest secure-enough approach for a prototype; production would proxy calls through a server-side function so the key never reaches the browser |
| Direct browser API calls | Supported by Anthropic for prototyping via the `anthropic-dangerous-direct-browser-calls` header; a production deployment would use a backend proxy |
| Sequential batch processing | Avoids rate-limit issues; simpler to implement and debug; parallel processing is a straightforward extension |
| Shared application data for the whole batch | Follows the most common real-world case (one importer submits many SKUs with similar data); per-label data entry would be a future enhancement |
| No COLA system integration | As noted by Marcus Williams — the COLA system integration is years away; this is a standalone proof-of-concept |
| PNG / WEBP / JPG only | Covers all realistic label photo formats; TIFF and PDF label artwork are out of scope for this prototype |
| No image size validation | Very large images will increase API latency and cost; a production version should cap uploads at ~5 MB |
| Each visitor supplies their own API key | Eliminates the need for any backend or authentication system for the prototype; a shared deployment would need a hosted key and access controls |

---

## Known Limitations

- **No offline mode.** An internet connection to `api.anthropic.com` is required.
- **No per-label application data in batch mode.** All batch items share the application data from the main form.
- **No export.** Results are displayed on screen only; a future version could export to CSV or PDF.
- **Image quality.** Badly lit or skewed label photos may reduce accuracy — the AI will flag uncertainty via a WARN verdict rather than silently failing.
- **API key in the browser.** Storing the key in `localStorage` is acceptable for a prototype but not for a multi-user production deployment. A server-side proxy with proper authentication would be the correct approach.
- **No persistent history.** Completed reviews are not saved. Refreshing the page clears all results.
