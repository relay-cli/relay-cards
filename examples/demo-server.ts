import {createServer, type IncomingMessage, type ServerResponse} from 'node:http';
import {setTimeout as delay} from 'node:timers/promises';

const once = process.argv.includes('--once');

const json = (response: ServerResponse, status: number, body: unknown): void => {
  const content = JSON.stringify(body);
  response.writeHead(status, {
    'content-type': 'application/json',
    'content-length': Buffer.byteLength(content),
  });
  response.end(content);
};

const server = createServer(async (request: IncomingMessage, response: ServerResponse) => {
  const started = performance.now();
  const path = request.url ?? '/';

  if (path === '/health') {
    json(response, 200, {status: 'ok'});
  } else if (path === '/users' && request.method === 'POST') {
    json(response, 201, {id: 'usr_demo', name: 'Ada'});
  } else if (path === '/slow') {
    await delay(90);
    json(response, 200, {waited: true});
  } else if (path === '/missing') {
    json(response, 404, {error: 'not found'});
  } else {
    json(response, 200, {service: 'relay-demo'});
  }

  const status = response.statusCode;
  const durationMs = Number((performance.now() - started).toFixed(1));
  console.log(
    JSON.stringify({
      method: request.method ?? 'GET',
      path,
      status,
      durationMs,
      remoteAddress: request.socket.remoteAddress,
    }),
  );
});

const request = async (baseUrl: string, path: string, init?: RequestInit): Promise<void> => {
  await fetch(`${baseUrl}${path}`, init);
};

const runScenario = async (baseUrl: string): Promise<void> => {
  await delay(250);
  await request(baseUrl, '/health');
  await delay(250);
  console.log(JSON.stringify({event: 'cache.refresh', entries: 48, source: 'demo'}));
  await delay(250);
  await request(baseUrl, '/users', {method: 'POST'});
  await delay(250);
  console.warn('WARN: Queue depth reached 72%');
  await delay(250);
  await request(baseUrl, '/slow');
  await delay(250);
  console.error('TypeError: Demo record has no owner');
  console.error('    at loadOwner (examples/demo-server.ts:74:11)');
  console.error('    at processRequest (examples/demo-server.ts:81:5)');
  await delay(250);
  await request(baseUrl, '/missing');
  await delay(250);
  for (let index = 0; index < 4; index += 1) {
    console.log('worker heartbeat');
  }

  if (once) {
    await delay(100);
    server.close();
  } else {
    console.log('Demo sequence complete. Press Ctrl+C to stop the server.');
  }
};

server.listen(0, '127.0.0.1', () => {
  const address = server.address();
  if (address === null || typeof address === 'string') {
    throw new Error('Unable to read the demo server address.');
  }
  const baseUrl = `http://127.0.0.1:${address.port}`;
  console.log(`Relay demo listening on ${baseUrl}`);
  void runScenario(baseUrl);
});

const stop = (): void => {
  console.log('Relay demo shutting down');
  server.close(() => process.exit(0));
};

process.once('SIGINT', stop);
process.once('SIGTERM', stop);
