import { superstruct } from 'superstruct';

export var struct = superstruct({
  types: {
    'string!': (x: any): boolean => typeof x === 'string' && x !== ''
  }
});
