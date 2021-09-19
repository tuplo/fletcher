# fletch

HTTP request library, focused on web scraping.

<p>
  <img src="https://img.shields.io/npm/v/@tuplo/fletch">
  <a href="https://codeclimate.com/github/tuplo/fletch/maintainability">
    <img src="https://api.codeclimate.com/v1/badges/4a26597a1e38d18ba6d5/maintainability" />
  </a>
  <a href="https://codeclimate.com/github/tuplo/fletch/test_coverage">
    <img src="https://api.codeclimate.com/v1/badges/4a26597a1e38d18ba6d5/test_coverage" />
  </a>
  <img src="https://github.com/tuplo/fletch/workflows/Build/badge.svg">
</p>

## Usage

```typescript
import fletch from '@tuplo/fletch';

const $page = await fletch.html('https://foo.com/page.html');
const heading = $page.find('body > h1');

const { foo } = await fletch.json('https://foo.com/page.html');

const { foo } = await fletch.script('https://foo.com/page.html', {
  scriptPath: 'script:nth-of-type(3)',
});

const [jsonld] = await fletch.jsonld('https://foo.com/page.html)
```

## Options

| Option            | Description                                                                    | Default                                                    |
| ----------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `cache`           | Caches requests in memory                                                      | `false`                                                    |
| `delay`           | Introduce a delay before the request (ms)                                      | 1_000                                                      |
| `formData`        | Object with key/value pairs to send as form data                               |
| `encoding`        | The encoding used by the source page, will be converted to UTF8                |
| `headers`         | A simple multi-map of names to values                                          |
| `log`             | Should log all request URLS to stderr                                          | false                                                      |
| `proxy`           | Proxy configuration (`host`, `port`, `username`, `password`)                   |
| `retry`           | Retries failed responses                                                       | [`async-retry`](https://github.com/vercel/async-retry#api) |
| `scriptFindFn`    | A function to find a `script` element on the page, execute and return it       |
| `scriptPath`      | A CSS selector to pick a `script` element on the page, execute and return it   |
| `scriptSandbox`   | An object to use as base on an execution of a piece of code found on the page  |
| `urlSearchParams` | A key-value object listing what parameters to add to the query string of `url` |
| `validateStatus`  | A function to decide if the response status is an error and should be thrown   |

## API

### `fletch(url: string, options?: FletchOptions) => http.Response`

Generic utility to return a HTTP Response

### `fletch.html(url: string, options?: FletchOptions) => cheerio.Cheerio`

Requests a HTTP resource, parses it using Cheerio and returns its

```typescript
const $page = await fletch.html('https://foo.com/page.html');
const heading = $page.find('body > h1');
```

### `fletch.script<T>(url: string, options?: FletchOptions) => T`

Requests a HTTP resource, finds a `script` on it, executes and returns its global context.

```typescript
const { foo } = await fletch.script('https://foo.com/page.html', {
  scriptPath: 'script:nth-of-type(3)',
});
```

### `fletch.text(url: string, options?: FletchOptions) => string`

Requests a HTTP resource, returning it as a `string`

### `fletch.json<T>(url: string, options?: FletchOptions) => T`

Requests a HTTP resource, returning it as a JSON object

### `fletch.jsonld(url: string, options?: FletchOptions) => unknown[]`

Requests a HTTP resource, retrieving all the JSON-LD blocks found on the document

### `fletch.create(options: FletchOptions) => Object`

Creates a new instance of fletch with a custom config

```typescript
const instance = fletch.create({ headers: { foo: 'bar' } });
await instance.json('http://foo.com');
```

## Install

```bash
$ npm install @tuplo/fletch

# or with yarn
$ yarn add @tuplo/fletch
```

### Contribute

Contributions are always welcome!

### License

> The MIT License (MIT)
>
> Copyright (c) 2020 - 2021 Tuplo.
>
> Permission is hereby granted, free of charge, to any person obtaining a copy
> of this software and associated documentation files (the "Software"), to deal
> in the Software without restriction, including without limitation the rights
> to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
> copies of the Software, and to permit persons to whom the Software is
> furnished to do so, subject to the following conditions:
>
> The above copyright notice and this permission notice shall be included in
> all copies or substantial portions of the Software.
>
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
> IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
> FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
> AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
> LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
> OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
> THE SOFTWARE.
