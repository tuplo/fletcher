import serializeObject from './serialize-object';

describe('serializeObject', () => {
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
});
