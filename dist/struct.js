"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const superstruct_1 = require("superstruct");
exports.struct = superstruct_1.superstruct({
    types: {
        'string!': (x) => typeof x === 'string' && x !== ''
    }
});
//# sourceMappingURL=struct.js.map