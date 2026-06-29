const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL   = 'claude-sonnet-4-6';

/**
 * Builds the compliance review prompt from the application form data.
 * Faithfully ported from steichen.ttb.labelverifier.service.PromptBuilder.
 */
export function buildPrompt(fields) {
  const lines = [];
  if (fields.brand)     lines.push(`- Brand name: "${fields.brand}"`);
  if (fields.classType) lines.push(`- Class/type: "${fields.classType}"`);
  if (fields.abv)       lines.push(`- Alcohol content: "${fields.abv}"`);
  if (fields.net)       lines.push(`- Net contents: "${fields.net}"`);
  if (fields.producer)  lines.push(`- Bottler/producer: "${fields.producer}"`);

  const appData = lines.length
    ? lines.join('\n')
    : '(No application data provided — review all visible TTB-required elements.)';

  return `You are a TTB (Alcohol and Tobacco Tax and Trade Bureau) label compliance reviewer.
Your job is to verify that the information on an alcohol beverage label matches the application
data provided and meets TTB regulatory requirements.

APPLICATION DATA PROVIDED:
${appData}

REVIEW INSTRUCTIONS:
1. Examine the label image carefully.
2. For each application field provided, check if it matches what appears on the label.
   Be lenient about capitalisation differences that do not change meaning
   (e.g. "STONE'S THROW" vs "Stone's Throw" should PASS), but flag any substantive discrepancy as FAIL.
3. ALWAYS check for the mandatory Government Warning Statement regardless of
   whether it was included in the application data. It must:
   - Begin with "GOVERNMENT WARNING:" in ALL CAPS and visually bold.
   - Contain the exact statutory language about drinking during pregnancy
     and operating machinery/driving.
   - Be present, legible, and not buried in tiny text.
4. Use "warn" for minor issues that require human agent judgement.
5. Use "fail" for clear regulatory violations.
6. Use "pass" when the field matches and complies.

Respond ONLY with a valid JSON object — no markdown fences, no explanation.
Use exactly this structure:
{
  "overall": "pass" | "fail" | "warn",
  "summary": "One-sentence summary for the compliance agent",
  "checks": [
    {
      "field": "field display name",
      "status": "pass" | "fail" | "warn",
      "detail": "brief explanation (1-2 sentences)"
    }
  ]
}
Include a check for every application field provided, plus always include Government Warning as its own check entry.`;
}

/**
 * Sends a base64 image + prompt to Claude Vision and returns a parsed result object.
 * @param {string} apiKey   - Anthropic API key
 * @param {string} base64   - base64-encoded image (no data URI prefix)
 * @param {string} mimeType - e.g. "image/jpeg"
 * @param {string} prompt   - the compliance prompt
 * @returns {Promise<{overall, summary, checks}>}
 */
export async function verifyLabel(apiKey, base64, mimeType, prompt) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64 } },
          { type: 'text',  text: prompt },
        ],
      }],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const text = data.content.map(b => b.text || '').join('').replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Model returned unexpected response format.');
  }
}

/**
 * Reads a File object and returns { base64, mimeType }.
 */
export function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve({
      base64:   e.target.result.split(',')[1],
      mimeType: file.type || 'image/jpeg',
    });
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
