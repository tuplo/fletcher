import fs from 'fs';
import path from 'path';
import { setGlobalDispatcher, MockAgent } from 'undici';

const agent = new MockAgent();
agent.disableNetConnect();

const pool = agent.get('https://fletcher.dev');

type Route = {
  method?: string;
  path: string;
  reply?: {
    body?: string | (() => string);
    statusCode?: number;
    file?: string;
    headers?: Record<string, string>;
  };
};

const routes: Route[] = [
  {
    path: '/simple.html',
    reply: {
      file: 'simple.html',
    },
  },
  {
    path: '/simple.json',
    reply: {
      file: 'simple.json',
    },
  },
  {
    path: '/json-ld.html',
    reply: {
      file: 'json-ld.html',
    },
  },
  {
    path: '/inline-script.html',
    reply: {
      file: 'inline-script.html',
    },
  },
  {
    path: '/headers',
    reply: {
      headers: { foo: 'bar' },
    },
  },
];

routes.forEach((route) => {
  const { method = 'GET', reply } = route;

  let body = '';
  if (reply?.file) {
    const filePath = path.join(__dirname, reply?.file || 'simple.html');
    body = fs.readFileSync(filePath, 'utf8');
  } else if (reply?.body) {
    body = typeof reply?.body === 'function' ? reply?.body() : reply.body;
  }

  pool
    .intercept({
      method,
      path: route.path,
    })
    .reply(reply?.statusCode || 200, body, {
      headers: reply?.headers || {},
    })
    .persist();
});

setGlobalDispatcher(agent);
