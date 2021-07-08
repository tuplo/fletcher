# fletch

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

> Web scraping HTTP request library

## Usage

All purpose HTTP requests library focused on web scraping.

```typescript
import fletch from '@tuplo/fletch';

const $page = await fletch.html('https://foo.com/page.html');
const heading = $page.find('body > h1');

const { foo } = await fletch.json('https://foo.com/page.html');

const { foo } = await fletch.script('https://foo.com/page.html', {
  scriptPath: 'script:nth-of-type(3)',
});
```

## Options

| Option            | Description                                                                    | Default                                                    |
| ----------------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `delay`           | Introduce a delay before the request (ms)                                      | 1_000                                                      |
| `headers`         | A simple multi-map of names to values                                          |
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

## Install

```bash
$ npm install @tuplo/fletch

# or with yarn
$ yarn add @tuplo/fletch
```

## Contribute

Contributions are always welcome!

## License

MIT
