const assert = require('node:assert/strict');
const http = require('node:http');
const { test } = require('node:test');
const {
  app,
  buildMessages,
  countWords,
  estimateSpeakingSeconds,
  parseModelScript,
  validateGenerateInput,
} = require('../server');

const validInput = {
  problem: 'I needed a concise demo narration for a software assignment.',
  demo: 'I enter a real project example and show a timed script.',
  myCode: 'The server validates input before calling the model.',
  aiCode: 'The client uses relative same-origin requests and handles errors.',
  durationSeconds: 180,
  tone: 'natural',
};

function requestJson(port, route, body) {
  return new Promise((resolve, reject) => {
    const request = http.request({
      host: '127.0.0.1',
      port,
      path: route,
      method: body ? 'POST' : 'GET',
      headers: body ? { 'Content-Type': 'application/json' } : {},
    }, (response) => {
      let raw = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { raw += chunk; });
      response.on('end', () => {
        let payload;
        try { payload = JSON.parse(raw); } catch { payload = raw; }
        resolve({ status: response.statusCode, headers: response.headers, payload });
      });
    });
    request.on('error', reject);
    if (body) request.write(JSON.stringify(body));
    request.end();
  });
}

test('input validation rejects empty, oversized, and out-of-range fields', () => {
  assert.match(validateGenerateInput({ ...validInput, demo: ' ' }).error, /Fill in all four/);
  assert.match(validateGenerateInput({ ...validInput, problem: 'x'.repeat(4_001) }).error, /under 4,000/);
  assert.match(validateGenerateInput({ ...validInput, durationSeconds: 181 }).error, /30-second steps/);
  assert.match(validateGenerateInput({ ...validInput, tone: 'unlisted' }).error, /available narration tones/);
  assert.equal(validateGenerateInput(validInput).value.durationSeconds, 180);
});

test('prompt construction separates source notes and requests the assignment sections', () => {
  const [system, user] = buildMessages(validInput);
  assert.match(system.content, /untrusted source notes/);
  assert.match(system.content, /Live Demo/);
  assert.match(system.content, /My Code Choice/);
  assert.match(system.content, /AI-Generated Code I Understand/);
  assert.equal(JSON.parse(user.content).targetDurationSeconds, 180);
});

test('script parsing and speaking-time estimates are bounded and deterministic', () => {
  const parsed = parseModelScript(JSON.stringify({ title: 'Demo', script: 'One clear line.' }));
  assert.deepEqual(parsed, { title: 'Demo', script: 'One clear line.' });
  assert.equal(countWords('One clear line.'), 3);
  assert.equal(estimateSpeakingSeconds('One clear line.', 60), 3);
  assert.throws(() => parseModelScript('not JSON'), /could not be read/);
  assert.throws(() => parseModelScript(JSON.stringify({ script: '' })), /empty response/);
  assert.throws(() => parseModelScript(JSON.stringify({ title: 'No script' })), /narration script/);
});

test('health, validation, and successful AI route stay on the Express backend', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));

  const originalFetch = global.fetch;
  const originalKey = process.env.OPENROUTER_API_KEY;
  const originalNodeEnv = process.env.NODE_ENV;
  let providerCall;
  process.env.OPENROUTER_API_KEY = 'test-only-not-a-real-secret';
  global.fetch = async (url, options) => {
    providerCall = { url, options, body: JSON.parse(options.body) };
    return new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ title: 'A clear demo', script: 'LIVE DEMO (~90 seconds)\nHere is the real example.\n\nMY CODE CHOICE (~60 seconds)\nI validate each field before generating.\n\nAI-GENERATED CODE I UNDERSTAND (~30 seconds)\nThe browser sends this to my server.' }) } }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  t.after(() => {
    global.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENROUTER_API_KEY;
    else process.env.OPENROUTER_API_KEY = originalKey;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  });

  const port = server.address().port;
  const health = await requestJson(port, '/health');
  assert.equal(health.status, 200);
  assert.deepEqual(health.payload, { status: 'ok' });

  const invalid = await requestJson(port, '/api/generate', { ...validInput, problem: '' });
  assert.equal(invalid.status, 400);
  assert.match(invalid.payload.error, /Fill in all four/);
  assert.equal(providerCall, undefined);

  const generated = await requestJson(port, '/api/generate', validInput);
  assert.equal(generated.status, 200);
  assert.equal(generated.payload.title, 'A clear demo');
  assert.ok(generated.payload.wordCount > 0);
  assert.equal(providerCall.body.model, 'openai/gpt-4o-mini');
  assert.equal(providerCall.options.headers.Authorization, 'Bearer test-only-not-a-real-secret');
  assert.equal(providerCall.options.headers['X-Title'], 'Sayflow - Spoken Demo Writer');
  assert.match(providerCall.url, /openrouter\.ai\/api\/v1\/chat\/completions$/);
  assert.equal(generated.headers['x-content-type-options'], 'nosniff');
});
