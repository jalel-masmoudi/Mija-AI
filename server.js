import { resolve, sep } from 'node:path';

const root = import.meta.dir;
const key = Bun.env.OPENAI_API_KEY;
const json = (body, status = 200) => Response.json(body, { status });
const outputText = response => response.output_text || response.output?.flatMap(item => item.content || []).find(item => item.type === 'output_text')?.text || '';
const stepContext = step => `Product: Nordic bedside cabinet. Current step ${step.id}: ${step.title}. Instruction: ${step.instruction}. Parts: ${step.parts.join(', ')}. Tool: ${step.tool}.`;

async function openai(input, format) {
  if (!key) throw new Error('OPENAI_API_KEY is not set');
  const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` }, body: JSON.stringify({ model: 'gpt-5.6', input, text: { format }, store: false }) });
  if (!response.ok) throw new Error((await response.json()).error?.message || 'OpenAI request failed');
  return JSON.parse(outputText(await response.json()));
}

Bun.serve({ port: Bun.env.PORT || 3000, async fetch(request) {
  const url = new URL(request.url);
  if (request.method === 'POST' && url.pathname === '/api/chat') {
    try { const { question, step } = await request.json(); return json(await openai(`${stepContext(step)}\nUser question: ${question}\nAnswer concisely, safely, and only about this build.`, { type: 'json_schema', name: 'assembly_answer', strict: true, schema: { type: 'object', properties: { answer: { type: 'string' } }, required: ['answer'], additionalProperties: false } })); }
    catch (error) { return json({ error: error.message }, 503); }
  }
  if (request.method === 'POST' && url.pathname === '/api/verify') {
    try { const { image, step } = await request.json(); return json(await openai([{ role: 'user', content: [{ type: 'input_text', text: `${stepContext(step)}\nInspect this photo. Do not claim certainty when the needed part is obscured. Return practical feedback.` }, { type: 'input_image', image_url: image }] }], { type: 'json_schema', name: 'assembly_verification', strict: true, schema: { type: 'object', properties: { status: { type: 'string', enum: ['pass', 'fix', 'unclear'] }, confidence: { type: 'integer', minimum: 0, maximum: 100 }, message: { type: 'string' }, correction: { type: ['string', 'null'] } }, required: ['status', 'confidence', 'message', 'correction'], additionalProperties: false } })); }
    catch (error) { return json({ error: error.message }, 503); }
  }
  let path;
  try { path = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname); } catch { path = '/.'; }
  const filePath = resolve(root, `.${path}`);
  const file = Bun.file(filePath);
  if (path.split(/[/\\]/).some(segment => segment.startsWith('.')) || !filePath.startsWith(root + sep) || !await file.exists()) return new Response('Not found', { status: 404 });
  return new Response(file);
}});
console.log('Mija AI running at http://localhost:3000');
