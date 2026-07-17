const product = {
  id: 'nordic-bedside-cabinet',
  name: 'Nordic bedside cabinet',
  totalMinutes: 32,
  steps: [
    ['Sort your parts', 'Lay the five wooden panels flat on a clean, soft surface.', ['All panels', 'Hardware pack'], 'No tools needed', 2],
    ['Add dowels to the base', 'Press four wooden dowels into the marked holes in the base panel.', ['Base panel', '4 × dowel B'], 'Hand pressure', 3],
    ['Attach the left side panel', 'Align panel A with the base and secure it from underneath.', ['Left panel A', '2 × screw A'], 'Phillips screwdriver', 3],
    ['Fit the back panel', 'Slide the back panel into the grooves with its finished face outward.', ['Back panel C'], 'Hand pressure', 3],
    ['Attach the right side panel', 'Seat panel D over the dowels, then tighten the two screws evenly.', ['Right panel D', '2 × screw A'], 'Phillips screwdriver', 4],
    ['Secure the inner shelf', 'Rest the shelf on the support pegs with the edge band facing forward.', ['Shelf E', '4 × support peg'], 'Hand pressure', 3],
    ['Attach the drawer runners', 'Keep the stamped arrows facing the front before tightening each runner.', ['2 × drawer runner', '4 × screw C'], 'Phillips screwdriver', 4],
    ['Build the drawer box', 'Join the drawer sides to the drawer front with the short screws.', ['Drawer front', '2 × drawer side', '4 × screw D'], 'Phillips screwdriver', 4],
    ['Slide in the drawer', 'Pull both runners fully forward and slide the drawer in level.', ['Built drawer'], 'Hand pressure', 2],
    ['Install the top panel', 'Place the top over all four corners and tighten from inside the cabinet.', ['Top panel', '4 × screw E'], 'Phillips screwdriver', 3],
    ['Fit the handle', 'Center the handle on the drawer front and tighten the two bolts.', ['Handle', '2 × bolt F'], 'Phillips screwdriver', 2],
    ['Final check', 'Make sure the cabinet stands level and every drawer movement is smooth.', ['Completed cabinet'], 'None', 1]
  ].map(([title, instruction, parts, tool, minutes], index) => ({ id: index + 1, title, instruction, parts, tool, minutes }))
};

const app = document.querySelector('#app');
const manualInput = document.querySelector('#manualInput');
const saved = JSON.parse(localStorage.getItem('mija-session') || 'null');
const state = saved || { screen: 'home', step: 0, completed: [], verified: [], manualName: '', cameraOn: false, correctionSeen: false };
let mediaStream;
const save = () => localStorage.setItem('mija-session', JSON.stringify({ ...state, cameraOn: false }));
const esc = (value) => String(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
const current = () => product.steps[state.step];
const progress = () => Math.round((state.completed.length / product.steps.length) * 100);
const remaining = () => Math.max(0, product.totalMinutes - product.steps.slice(0, state.step).reduce((total, item) => total + item.minutes, 0));

function frame(content, name = 'Mija AI') {
  app.innerHTML = `<div class="app-shell"><header class="topbar"><button class="brand" data-action="home" aria-label="Go home"><span class="brand-mark">m</span><span>${name}</span><i>AI</i></button><button class="profile" data-action="home" aria-label="Open profile">MR</button></header>${content}</div>`;
  bind();
}

function home() {
  const hasBuild = state.step > 0 || state.completed.length;
  frame(`<section class="home-screen"><div class="eyebrow"><span></span> ASSEMBLY, MADE CLEAR</div><h1>Build it right.<br><em>Feel certain.</em></h1><p class="intro">Your camera-ready guide for every screw, panel, and “does this look right?” moment.</p><button class="primary wide" data-action="start">Start a new build <b>→</b></button>${hasBuild ? `<article class="resume-card"><div class="cabinet-icon">▥</div><div><span>CONTINUE BUILD</span><h2>${product.name}</h2><p>Step ${state.step + 1} of ${product.steps.length} · ${progress()}% complete</p></div><button class="round-button" data-action="guide" aria-label="Continue build">→</button><div class="card-progress"><i style="width:${progress()}%"></i></div></article>` : `<div class="how"><span>✦</span><p><strong>Start with anything you have.</strong><br>Scan a product code or upload a manual to get your guide.</p></div>`}</section><section class="home-visual"><div class="visual-head"><span class="live-dot"></span> YOUR NEXT BUILD</div>${cabinetModel()}<div class="assistant-note"><span>✦</span><p><b>Hi, I’m Mija.</b><br>I’ll help you make every step feel easy.</p></div></section><footer><span>Made for real-world building.</span><button data-action="reset" class="reset">Reset demo</button></footer>`);
}

function start() {
  state.screen = 'start';
  frame(`<section class="start-screen"><button class="back" data-action="home">← Back</button><div class="eyebrow"><span></span> NEW PROJECT</div><h1>Let’s find your<br><em>assembly guide.</em></h1><p class="intro">For this demo, any manual, photo, or product code opens the Nordic bedside cabinet guide.</p><div class="entry-options"><button class="entry" data-action="upload"><span>↥</span><div><b>Upload a manual</b><small>PDF, photo, or document</small></div><i>→</i></button><div class="code-entry"><span>⌁</span><label><b>Enter product code</b><input id="productCode" autocomplete="off" placeholder="Try MIJA-NORDIC-01" aria-label="Product code"></label><button data-action="code" aria-label="Open product code">→</button></div></div><button class="secondary" data-action="demo">Use the demo cabinet</button></section>`);
}

function guide() {
  state.screen = 'guide';
  const step = current();
  const isDone = state.completed.includes(step.id);
  frame(`<section class="guide-screen"><div class="guide-head"><button class="back" data-action="home">←</button><div><span>ASSEMBLY GUIDE</span><b>Step ${step.id} of ${product.steps.length}</b></div><button class="dots" data-action="reset" aria-label="Reset project">•••</button></div><div class="step-progress"><i style="width:${((step.id - 1) / product.steps.length) * 100}%"></i></div><section class="assembly-view"><div class="view-label"><span class="live-dot"></span> INTERACTIVE VIEW</div>${cabinetModel(step.id)}<button class="rotate" data-action="rotate" aria-label="Rotate model">↻</button><div class="view-tag">${step.id === 7 ? 'ARROWS FACE FRONT' : `STEP ${String(step.id).padStart(2, '0')}`}</div></section><section class="step-sheet"><div class="step-meta"><span>${step.minutes} MINUTES</span><span>${remaining()} MIN LEFT</span></div><h1>${step.title}</h1><p>${step.instruction}</p><div class="parts"><h2>You’ll need</h2>${step.parts.map(part => `<span>${esc(part)}</span>`).join('')}<small>⌁ ${step.tool}</small></div><div class="actions"><button class="secondary" data-action="camera">${state.verified.includes(step.id) ? '✓ Verified' : 'Check with camera'}</button><button class="primary" data-action="next">${isDone && step.id < product.steps.length ? 'Next step →' : step.id === product.steps.length ? 'Finish build ✓' : 'Mark step done →'}</button></div><button class="ask" data-action="chat">✦ Ask Mija about this step <b>→</b></button></section></section>`);
}

function cabinetModel(step = 1) {
  const active = Math.min(5, Math.max(1, Math.ceil(step / 2)));
  return `<div class="model" data-rotation="0"><div class="part top ${active === 5 ? 'active' : ''}"></div><div class="part back ${active === 2 ? 'active' : ''}"></div><div class="part side left ${active === 2 ? 'active' : ''}"></div><div class="part side right ${active === 3 ? 'active' : ''}"></div><div class="part base ${active === 1 ? 'active' : ''}"></div><div class="wire w1"></div><div class="wire w2"></div><div class="wire w3"></div></div>`;
}

function camera() {
  state.screen = 'camera';
  const step = current();
  frame(`<section class="camera-screen"><div class="camera-head"><button class="back" data-action="guide">←</button><div><span>VISUAL CHECK</span><b>${step.title}</b></div><button class="help" data-action="sample">Use demo photo</button></div><div class="camera-frame"><video id="camera" autoplay playsinline></video><canvas id="snapshot" hidden></canvas><div class="camera-guide"><i></i><i></i><i></i><i></i></div><p id="cameraStatus">Position the current assembly step inside the frame.</p></div><div class="camera-actions"><button class="secondary" data-action="start-camera">Turn on camera</button><button class="capture" data-action="capture" aria-label="Capture photo">●</button></div><p class="camera-note">Your camera stays on this device until you choose to analyze a photo.</p></section>`);
}

function analysis(result) {
  state.screen = 'analysis';
  const step = current();
  const api = typeof result === 'object' ? result : null;
  const needsFix = step.id === 7 && !state.correctionSeen;
  const pass = api ? api.status === 'pass' : result === 'pass' || !needsFix;
  if (pass && !state.verified.includes(step.id)) state.verified.push(step.id);
  save();
  const message = api?.message || (pass ? `Your ${step.title.toLowerCase()} is ready. You can move on whenever you are.` : 'The runner arrow is facing the back. Flip both runners so the arrows point toward the drawer front, then check again.');
  const confidence = api?.confidence ?? (pass ? 94 : 68);
  frame(`<section class="analysis-screen"><div class="analysis-illustration ${pass ? 'pass' : 'fix'}"><span>${pass ? '✓' : '↻'}</span></div><div class="eyebrow"><span></span> ${pass ? 'VISUAL CHECK COMPLETE' : 'ONE QUICK ADJUSTMENT'}</div><h1>${pass ? 'That looks<br><em>just right.</em>' : 'Almost there.'}</h1><p>${esc(message)}</p><div class="confidence"><span>ASSEMBLY CONFIDENCE</span><b>${confidence}%</b><i><em style="width:${confidence}%"></em></i></div>${pass ? `<button class="primary wide" data-action="guide">Back to step ${step.id} →</button>` : `<button class="primary wide" data-action="fixed">I fixed it</button><button class="secondary wide" data-action="guide">Back to instructions</button>`}</section>`);
}

function chat() {
  state.screen = 'chat';
  const step = current();
  frame(`<section class="chat-screen"><div class="chat-head"><button class="back" data-action="guide">←</button><div><span>ASK MIJA</span><b>About step ${step.id}</b></div></div><div id="messages" class="messages"><div class="message mija">I’m looking at <b>${step.title.toLowerCase()}</b>. What would you like to know?</div></div><div class="suggestions"><button data-question="What part do I need?">What part do I need?</button><button data-question="Why doesn't it fit?">Why doesn’t it fit?</button><button data-question="Can I skip this step?">Can I skip this step?</button></div><form id="chatForm" class="chat-input"><input id="question" autocomplete="off" placeholder="Ask about this step…" aria-label="Ask Mija" /><button aria-label="Send question">↑</button></form></section>`);
}

function done() {
  state.screen = 'done'; state.completed = product.steps.map(step => step.id); save();
  frame(`<section class="done-screen"><div class="confetti">✦ ✦ ✦</div><div class="done-mark">✓</div><div class="eyebrow"><span></span> BUILD COMPLETE</div><h1>You made it.<br><em>Beautifully done.</em></h1><p>Your ${product.name.toLowerCase()} is assembled and checked. Nice work.</p><div class="finish-card"><span>PROJECT TIME</span><b>${product.totalMinutes} min</b><small>${product.steps.length} steps completed</small></div><button class="primary wide" data-action="home">View my projects →</button></section>`);
}

function answer(question) {
  const step = current(); const q = question.toLowerCase();
  if (/part|need|screw|tool/.test(q)) return `For this step, use ${step.parts.join(', ')}. You’ll need a ${step.tool.toLowerCase()}.`;
  if (/fit|wrong|stuck|align/.test(q)) return `Don’t force it. Loosen the last fastener slightly, align the pre-drilled holes, then tighten evenly. The finished edge should face outward.`;
  if (/skip/.test(q)) return `I wouldn’t skip ${step.title.toLowerCase()}. It keeps the cabinet square for the next step.`;
  return `For ${step.title.toLowerCase()}, ${step.instruction} Want me to explain the parts or check your work with the camera?`;
}

async function startCamera() {
  const status = document.querySelector('#cameraStatus');
  try { mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }); document.querySelector('#camera').srcObject = mediaStream; status.textContent = 'Camera ready. Center your work, then capture a photo.'; }
  catch { status.textContent = 'Camera access is unavailable here. Choose “Use demo photo” to continue.'; }
}
async function verifyImage(image) { try { const response = await fetch('/api/verify', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ image, step: current() }) }); const data = await response.json(); analysis(data.error ? 'photo' : data); } catch { analysis('photo'); } }
function stopCamera() { mediaStream?.getTracks().forEach(track => track.stop()); mediaStream = undefined; }
function markDone() { const id = current().id; if (!state.completed.includes(id)) state.completed.push(id); save(); if (id === product.steps.length) return done(); state.step += 1; save(); guide(); }
function bind() {
  document.querySelectorAll('[data-action]').forEach(button => button.addEventListener('click', async () => {
    const action = button.dataset.action;
    if (action !== 'camera' && action !== 'start-camera' && action !== 'capture') stopCamera();
    if (action === 'home') home(); if (action === 'start') start(); if (action === 'guide') guide(); if (action === 'camera') camera(); if (action === 'chat') chat();
    if (action === 'upload') manualInput.click(); if (action === 'demo' || action === 'code') { state.manualName = action === 'code' ? (document.querySelector('#productCode').value.trim() || 'Product code') : 'Demo cabinet'; state.step = 0; save(); guide(); }
    if (action === 'start-camera') startCamera(); if (action === 'capture') { const video = document.querySelector('#camera'); const canvas = document.querySelector('#snapshot'); if (video?.videoWidth) { canvas.width = video.videoWidth; canvas.height = video.videoHeight; canvas.getContext('2d').drawImage(video, 0, 0); } stopCamera(); verifyImage(canvas?.toDataURL('image/jpeg', .8)); }
    if (action === 'sample') analysis('pass'); if (action === 'fixed') { state.correctionSeen = true; analysis('pass'); }
    if (action === 'next') markDone(); if (action === 'reset') { localStorage.removeItem('mija-session'); Object.assign(state, { screen: 'home', step: 0, completed: [], verified: [], manualName: '', cameraOn: false, correctionSeen: false }); home(); }
    if (action === 'rotate') { const model = document.querySelector('.model'); model.style.transform = `rotateY(${(Number(model.dataset.rotation) || 0) + 45}deg)`; model.dataset.rotation = String((Number(model.dataset.rotation) || 0) + 45); }
  }));
  document.querySelector('#productCode')?.addEventListener('keydown', event => { if (event.key === 'Enter') { state.manualName = event.target.value || 'Product code'; state.step = 0; save(); guide(); } });
  document.querySelectorAll('[data-question]').forEach(button => button.addEventListener('click', () => addMessage(button.dataset.question)));
  document.querySelector('#chatForm')?.addEventListener('submit', event => { event.preventDefault(); const input = document.querySelector('#question'); if (input.value.trim()) { addMessage(input.value.trim()); input.value = ''; } });
}
async function addMessage(question) { const messages = document.querySelector('#messages'); messages.insertAdjacentHTML('beforeend', `<div class="message user">${esc(question)}</div><div class="message mija" id="thinking">Thinking…</div>`); messages.scrollTop = messages.scrollHeight; try { const response = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ question, step: current() }) }); const data = await response.json(); document.querySelector('#thinking').textContent = data.answer || answer(question); } catch { document.querySelector('#thinking').textContent = answer(question); } }
manualInput.addEventListener('change', event => { const file = event.target.files[0]; if (file) { state.manualName = file.name; state.step = 0; save(); guide(); } event.target.value = ''; });
home();
