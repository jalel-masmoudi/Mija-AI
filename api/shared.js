export const json = (response, body, status = 200) => response.status(status).json(body);
export const stepContext = step => `Product: Nordic bedside cabinet. Current step ${step.id}: ${step.title}. Instruction: ${step.instruction}. Parts: ${step.parts.join(', ')}. Tool: ${step.tool}.`;
export async function openai(input, format) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');
  const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: 'gpt-5.6', input, text: { format }, store: false }) });
  if (!response.ok) throw new Error((await response.json()).error?.message || 'OpenAI request failed');
  const data = await response.json(); const text = data.output_text || data.output?.flatMap(item => item.content || []).find(item => item.type === 'output_text')?.text;
  return JSON.parse(text);
}
