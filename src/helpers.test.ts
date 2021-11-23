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
      ['https://foo1.com', '08d9edafb3d87ad668729c6476dac5c3'],
      ['https://foo2.com', 'b531aa92fcc30ce83b968eb39e5192f2'],
    ])('builds a unique string out of different URLs: %s', (url, expected) => {
      const result = hashRequest('json', url);
      expect(result).toBe(expected);
    });

    it.each([
      ['text', '683e693c3143edb2a7fbf2c5d626bd09'],
      ['json', '21797d08e391d59efa62707bee72ba9e'],
      ['html', '70cc405167ffd214ce321a7c318dce12'],
      ['script', '4599305aa1241ad8a00a9a97faebacf5'],
    ])(
      'builds a unique string out of different formats on the URL: %s',
      (format, expected) => {
        const result = hashRequest(format, 'https://foo.com');
        expect(result).toBe(expected);
      }
    );

    it.each([
      [{ headers: { foo: 'bar' } }, '0124f0198d408343137566c14ddbd36a'],
      [{ headers: { bar: 'foo' } }, 'a8b594f480d983d06ef3430190e45a9f'],
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
        const expected = '1dabc76118b4f29f9df71238829c9b29';
        expect(result).toBe(expected);
      }
    );
  });
});
