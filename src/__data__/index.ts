// import { mockRoutes } from 'src/mock-routes';

// mockRoutes(
//   'https://fletcher.dev',
//   [
//     { path: '/simple.html', reply: { file: 'simple.html' } },
//     { path: '/simple.json', reply: { file: 'simple.json' } },
//     { path: '/json-ld.html', reply: { file: 'json-ld.html' } },
//     { path: '/inline-script.html', reply: { file: 'inline-script.html' } },
//     { path: '/headers', reply: { headers: { foo: 'bar' } } },
//   ],
//   { mockFilesDir: __dirname }
// );

import nock from 'nock';

nock('https://fletcher.dev')
  .persist()
  .get('/simple.html')
  .replyWithFile(200, `${__dirname}/simple.html`)
  .get('/simple.json')
  .replyWithFile(200, `${__dirname}/simple.json`)
  .get('/json-ld.html')
  .replyWithFile(200, `${__dirname}/json-ld.html`)
  .get('/inline-script.html')
  .replyWithFile(200, `${__dirname}/inline-script.html`)
  .get('/headers')
  .reply(200, undefined, { foo: 'bar' })
  .get('/error')
  .reply(500, undefined, { foo: 'bar' });
