import { Model } from './model';

export function createModel<T extends Model = Model>(
  Ctor: { new (...args: any[]): T },
  kwArgs: K
): T {
  return new Ctor(kwArgs);
}

// w has type `Widget`
const w = createWidget(Widget, { style: new Widget.Style() });
// t has type `TextInput`
const t = createWidget(TextInput, { style: new TextInput.Style() });
