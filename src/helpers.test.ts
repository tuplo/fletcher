import { delay, hashRequest, serializeObject } from './helpers';

describe('helpers', () => {
  describe('delay', () => {
    it('delays execution of given function', () => {
      jest.useFakeTimers();
      const fnSpy = jest.fn();

      delay(30_000, fnSpy);
      expect(fnSpy).not.toHaveBeenCalled();
      jest.advanceTimersByTime(30_000);
      expect(fnSpy).toHaveBeenCalledTimes(1);

      jest.useRealTimers();
    });
  });

  describe('hash request for caching', () => {
    it('serializes an object', () => {
      const obj = {
        b: 1,
        a: 'foo',
        g: false,
        c: null,
        z: 'foo bar',
        r: 'Foobar',
      };
      const result = serializeObject(obj);

      const expected = 'a=foo,b=1,c=null,g=false,r=foobar,z=foo%20bar';
      expect(result).toBe(expected);
    });

    it.each([
      ['https://foo1.com', '1d624947f883aca4ed54f5fb40ef29dd'],
      ['https://foo2.com', '787e206a2af554d3f591cd03f4fd5e2f'],
    ])('builds a unique string out of different URLs: %s', (url, expected) => {
      const result = hashRequest('json', url);
      expect(result).toBe(expected);
    });

    it.each([
      ['text', '53b9ec162c85f2adc7d2f5d7b81a4285'],
      ['json', 'c3c309c968a44669d01df91077215772'],
      ['html', '1f809e57f68cc9f232cc604504aca5e3'],
      ['script', 'd684bf5ac4479c35bbf5444c5c90a1be'],
    ])(
      'builds a unique string out of different formats on the URL: %s',
      (format, expected) => {
        const result = hashRequest(format, 'https://foo.com');
        expect(result).toBe(expected);
      }
    );

    it.each([
      [{ headers: { foo: 'bar' } }, '3e45732f405ff974d9e704c313569513'],
      [{ headers: { bar: 'foo' } }, 'e849a068e12c331f1b44963a8a0ff0bc'],
    ])(
      'builds a unique string out of different options on the URL',
      (options, expected) => {
        const result = hashRequest('json', 'https://foo.com', options);
        expect(result).toBe(expected);
      }
    );

    it.each([
      [
        {
          headers: { foo: 'bar', baz: 'buz' },
          urlSearchParams: { quz: 'qaz', qaz: 'quz' },
        },
      ],
      [
        {
          headers: { baz: 'buz', foo: 'bar' },
          urlSearchParams: { qaz: 'quz', quz: 'qaz' },
        },
      ],
    ])(
      'builds the same cache key for options ordered differently',
      (options) => {
        const result = hashRequest('json', 'https://foo.com', options);
        const expected = 'ccb40792768d732cec5c2cf8231f88c9';
        expect(result).toBe(expected);
      }
    );
  });
});
