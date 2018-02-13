"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function createModel(Ctor, kwArgs) {
    return new Ctor(kwArgs);
}
exports.createModel = createModel;
// w has type `Widget`
const w = createWidget(Widget, { style: new Widget.Style() });
// t has type `TextInput`
const t = createWidget(TextInput, { style: new TextInput.Style() });
//# sourceMappingURL=create_model.js.map