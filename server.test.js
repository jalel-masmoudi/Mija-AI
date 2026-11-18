import { afterAll, beforeAll, expect, test } from 'bun:test';
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const root = mkdtempSync(join(tmpdir(), 'mija-root-'));
const outside = mkdtempSync(join(tmpdir(), 'mija-outside-'));
let server;
let base;

beforeAll(async () => {
  for (const file of ['server.js', 'index.html', 'app.js', 'styles.css', 'manifest.webmanifest', 'Dockerfile']) copyFileSync(join(import.meta.dir, file), join(root, file));
  writeFileSync(join(root, '.env'), 'OPENAI_API_KEY=sk-test\n');
  mkdirSync(join(root, '.git'));
  writeFileSync(join(root, '.git', 'config'), '[core]\n');
  writeFileSync(join(outside, 'secret.txt'), 'sk-outside\n');
  symlinkSync(join(outside, 'secret.txt'), join(root, 'sw.js'));

  server = Bun.spawn(['bun', 'server.js'], { cwd: root, env: { ...process.env, PORT: '0', OPENAI_API_KEY: '' }, stdout: 'pipe' });
  const reader = server.stdout.getReader();
  let log = '';
  while (!/localhost:\d+/.test(log)) {
    const { value, done } = await reader.read();
    if (done) throw new Error(`server did not start: ${log}`);
    log += new TextDecoder().decode(value);
  }
  reader.releaseLock();
  base = `http://localhost:${log.match(/localhost:(\d+)/)[1]}`;
});

afterAll(async () => {
  server?.kill();
  await server?.exited;
  rmSync(root, { recursive: true, force: true });
  rmSync(outside, { recursive: true, force: true });
});

test('serves the app', async () => {
  const response = await fetch(`${base}/`);
  expect(response.status).toBe(200);
  expect(await response.text()).toContain('<main id="app"');
  expect((await fetch(`${base}/app.js`)).status).toBe(200);
});

test.each([
  '/.env', '/.git/config', '/%2e%2e/etc/passwd', '/..%2f..%2fetc/passwd', '/%2e/.env', '/%E0%A4%A',
  '/%00', '/%00.env', '/.env%00', '/app.js%00',
  '/server.js', '/Dockerfile',
  '/sw.js',
])('404 for %s', async path => {
  const response = await fetch(`${base}${path}`);
  expect(response.status).toBe(404);
  expect(await response.text()).toBe('Not found');
});
