"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NgJestTransformer = void 0;
const ts_jest_transformer_1 = require("ts-jest/dist/ts-jest-transformer");
const ng_jest_compiler_1 = require("./compiler/ng-jest-compiler");
const ng_jest_config_1 = require("./config/ng-jest-config");
class NgJestTransformer extends ts_jest_transformer_1.TsJestTransformer {
    _createConfigSet(config) {
        return new ng_jest_config_1.NgJestConfig(config);
    }
    _createCompiler(configSet, cacheFS) {
        this._compiler = new ng_jest_compiler_1.NgJestCompiler(configSet, cacheFS);
    }
}
exports.NgJestTransformer = NgJestTransformer;
