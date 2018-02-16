import { btoa, atob } from '../src/utils';

describe('btoa()', () => {
  test('should be a function', () => {
    expect(typeof btoa).toBe('function');
  });

  test('should encode to base64 a string', () => {
    var string = 'Helo World!';
    var expected = 'SGVsbyBXb3JsZCE=';
    var actual = btoa(string);

    expect(actual).toBe(expected);
  });

  test('should convert back a string after applying `atob`', () => {
    var string = 'SGVsbyBXb3JsZCE=';
    expect(btoa(atob(string))).toBe(string);
  });
});

describe('atob()', () => {
  test('should be a function', () => {
    expect(typeof atob).toBe('function');
  });

  test('should decode a base64 string', () => {
    var string = 'SGVsbyBXb3JsZCE=';
    var expected = 'Helo World!';
    var actual = atob(string);

    expect(actual).toBe(expected);
  });

  test('should convert back a string after applying `btoa`', () => {
    var string = 'Helo World!';
    expect(atob(btoa(string))).toBe(string);
  });
});
