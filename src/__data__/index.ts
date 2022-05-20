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
  .reply(500, undefined, { foo: 'bar' })
  .get('/dr%C3%A1cula')
  .reply(200, { foo: 'bar' });
