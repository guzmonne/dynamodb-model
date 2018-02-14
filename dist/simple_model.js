"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SimpleModel {
    constructor(config) {
        this.data = [];
        this.track = false;
        this.calls = [];
        this.hash = config.hash;
        this.table = config.table;
        this.documentClient = config.documentClient;
        this.schema = config.schema;
        if (config.track !== undefined)
            this.track = config.track;
        if (config.range !== undefined)
            this.range = config.range;
        if (config.tenant !== undefined) {
            this.tenant = config.tenant;
            this.hasTenantRegExp = new RegExp(`^${this.tenant}|`);
        }
    }
}
exports.SimpleModel = SimpleModel;
//# sourceMappingURL=simple_model.js.map