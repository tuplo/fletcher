/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable @typescript-eslint/naming-convention */
const fletcher = require('../dist/index');

async function main() {
  const WEBSHARE_API_KEY = '5559ad7db6a33d4207dc5a7a18f3a071c7c31de0';
  const url = 'https://proxy.webshare.io/api/proxy/list';

  const res = await fletcher.json(url, {
    headers: {
      Authorization: `Token ${WEBSHARE_API_KEY}`,
    },
    urlSearchParams: {
      countries: 'GB',
    },
  });

  const [proxy] = res.results;
  const { username, password, proxy_address, ports } = proxy;

  const url2 = 'http://example.com';
  const res2 = await fletcher.text(url2, {
    proxy: {
      username,
      password,
      host: proxy_address,
      port: ports.http,
      protocol: 'http',
    },
    retry: 0,
  });

  console.log(res2);
}

main();
