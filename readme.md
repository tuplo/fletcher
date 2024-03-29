# @tuplo/fletcher

HTTP request library, focused on web scraping.

<p>
  <img src="https://img.shields.io/npm/v/@tuplo/fletcher">
  <a href="https://codeclimate.com/github/tuplo/fletcher/maintainability">
    <img src="https://api.codeclimate.com/v1/badges/4a26597a1e38d18ba6d5/maintainability" />
  </a>
  <a href="https://codeclimate.com/github/tuplo/fletcher/test_coverage">
    <img src="https://api.codeclimate.com/v1/badges/4a26597a1e38d18ba6d5/test_coverage" />
  </a>
</p>


## Install

```bash
$ npm install @tuplo/fletcher

# or with yarn
$ yarn add @tuplo/fletcher
```


## Usage

Fetch a HTML page and parse it using `cheerio`.

```typescript
import fetch from '@tuplo/fletcher';

const $page = await fetch.html('https://foo.com/page.html');
const heading = $page.find('body > h1');
```

Fetch a JSON file and parse it.

```typescript
const { foo } = await fetch.json('https://foo.com/page.html');
```

Find a script on a page and evaluate it.

```typescript
const { foo } = await fetch.script('https://foo.com/page.html', {
  scriptPath: 'script:nth-of-type(3)',
});
```

Find JSON-LD metadata on a page.

```typescript
const [jsonld] = await fetch.jsonld('https://foo.com/page.html');
```

Work with the raw Response.

```typescript
const res = await fetch.response('https://foo.com');
console.log(res.headers);
console.log(await res.text());
```

Work with `Puppeteer` for headless browser automation.

```typescript
const client = fetch.create({
  browserWSEndpoint: 'ws://localhost:3000',
});
const $page = await client.browser.html('https://foo.com');
const { foo } = await client.browser.json('https://foo.com', /ajax-list/);
```

## Options

| Option              | Description                                                                    | Default                                                    |
| ------------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `browserWSEndpoint` | Puppeteer web socket address                                                   |
| `cache`             | Caches requests in memory                                                      | `false`                                                    |
| `delay`             | Introduce a delay before the request (ms)                                      | 1_000                                                      |
| `formData`          | Object with key/value pairs to send as form data                               |
| `encoding`          | The encoding used by the source page, will be converted to UTF8                |
| `headers`           | A simple multi-map of names to values                                          |
| `jsonData`          | Object with key/value pairs to send as json data                               |
| `log`               | Should log all request URLS to stderr                                          | false                                                      |
| `onAfterRequest` | Callback to be called right after request is resolved
| `proxy`             | Proxy configuration (`host`, `port`, `username`, `password`)                   |
| `retry`             | Retries failed responses                                                       | [`async-retry`](https://github.com/vercel/async-retry#api) |
| `scriptFindFn`      | A function to find a `script` element on the page, execute and return it       |
| `scriptPath`        | A CSS selector to pick a `script` element on the page, execute and return it   |
| `scriptSandbox`     | An object to use as base on an execution of a piece of code found on the page  |
| `urlSearchParams`   | A key-value object listing what parameters to add to the query string of `url` |
| `userAgent`         | Set a custom user agent                                                        |
| `validateStatus`    | A function to decide if the response status is an error and should be thrown   |

## API

##### `fletcher(url: string, options?: FletcherOptions) => http.Response`

Generic utility to return a HTTP Response

##### `fletcher.html(url: string, options?: FletcherOptions) => Cheerio<AnyNode>`

Requests a HTTP resource, parses it using Cheerio and returns its

```typescript
const $page = await fletcher.html('https://foo.com/page.html');
const heading = $page.find('body > h1');
```

##### `fletcher.script<T>(url: string, options?: FletcherOptions) => T`

Requests a HTTP resource, finds a `script` on it, executes and returns its global context.

```typescript
const { foo } = await fletcher.script('https://foo.com/page.html', {
	scriptPath: 'script:nth-of-type(3)',
});
```

##### `fletcher.text(url: string, options?: FletcherOptions) => string`

Requests a HTTP resource, returning it as a `string`

##### `fletcher.cookies(url: string, options?: FletcherOptions) => CookieJar`

Requests a HTTP resources, returning the cookies returned with it.

##### `fletcher.json<T>(url: string, options?: FletcherOptions) => T`

Requests a HTTP resource, returning it as a JSON object

##### `fletcher.jsonld(url: string, options?: FletcherOptions) => unknown[]`

Requests a HTTP resource, retrieving all the JSON-LD blocks found on the document

##### `fletcher.response(url: string, options?: FletcherOptions) => Response`

Requests a HTTP resource, returning the full HTTP Response object

##### `fletcher.browser.html(url: string) => Cheerio<AnyNode>`

Requests a HTTP resource using Puppeteer/Chrome, parses it using Cheerio and returns its.

##### `fletcher.browser.json<T>(url: string, requestUrl: string | RegExp) => T`

Requests a HTTP resource using Puppeteer/Chrome, intercepts a request made by that page and returns it as a JSON object

##### `fletcher.create(options: FletcherOptions) => Object`

Creates a new instance of fletcher with a custom config

```typescript
const instance = fletcher.create({ headers: { foo: 'bar' } });
await instance.json('http://foo.com');
```
