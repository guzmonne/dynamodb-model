"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function btoa(string) {
    return new Buffer(string).toString('base64');
}
exports.btoa = btoa;
function atob(string) {
    return new Buffer(string, 'base64').toString('ascii');
}
exports.atob = atob;
//# sourceMappingURL=utils.js.map