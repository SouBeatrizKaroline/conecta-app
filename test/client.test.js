import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { ConectaClient } from '../integration/client.js';

test('cliente só coleta após iniciar sessão e encerra coleta após retirada', async (t) => {
  const received = [];
  const server = createServer(async (req, res) => {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    received.push({
      url: req.url,
      auth: req.headers.authorization,
      body: raw ? JSON.parse(raw) : null,
    });
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify(
        req.url.endsWith('/sessions')
          ? { id: 'session-test', token: 'session-only' }
          : { accepted: true },
      ),
    );
  }).listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const client = new ConectaClient(`http://127.0.0.1:${server.address().port}`);
  await assert.rejects(client.track('click', 'ajuda', 'ajuda'), /Inicie uma sessão/);
  await client.start('demo-01', true);
  await client.track('click', 'ajuda', 'ajuda');
  await client.revoke();
  await assert.rejects(client.track('click', 'ajuda', 'ajuda'), /Inicie uma sessão/);
  assert.equal(received.length, 3);
  assert.equal(received[1].auth, 'Bearer session-only');
  assert.equal(received[1].body.type, 'click');
  assert.deepEqual(Object.keys(received[1].body).sort(), [
    'id',
    'occurredAt',
    'page',
    'target',
    'type',
  ]);
  assert.deepEqual(received[2].body, { analyticsConsent: false });
});
