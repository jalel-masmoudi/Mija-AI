import { afterAll, beforeAll, expect, test } from 'bun:test';
import { existsSync, rmSync, writeFileSync } from 'node:fs';

const port = 3999;
const base = `http://localhost:${port}`;
const envPath = `${import.meta.dir}/.env`;
const createdEnv = !existsSync(envPath);
let server;

beforeAll(async () => {
  if (createdEnv) writeFileSync(envPath, 'OPENAI_API_KEY=sk-test\n');
  server = Bun.spawn(['bun', 'server.js'], { cwd: import.meta.dir, env: { ...process.env, PORT: String(port) }, stdout: 'ignore' });
  for (let i = 0; i < 50; i++) {
    try { await fetch(base); return; } catch { await Bun.sleep(100); }
  }
  throw new Error('server did not start');
});

afterAll(() => {
  server?.kill();
  if (createdEnv) rmSync(envPath, { force: true });
});

test('serves the app', async () => {
  const response = await fetch(`${base}/`);
  expect(response.status).toBe(200);
  expect(await response.text()).toContain('<main id="app"');
  expect((await fetch(`${base}/app.js`)).status).toBe(200);
});

test.each(['/.env', '/.git/config', '/.gitignore', '/%2e%2e/etc/passwd', '/..%2f..%2fetc/passwd', '/%2e/.env', '/%E0%A4%A'])('404 for %s', async path => {
  const response = await fetch(`${base}${path}`);
  expect(response.status).toBe(404);
  expect(await response.text()).not.toContain('sk-');
});
