import { superstruct } from 'superstruct';

export var struct = superstruct({
  'string!': (x: any): boolean => typeof x === 'string' && x !== ''
});
