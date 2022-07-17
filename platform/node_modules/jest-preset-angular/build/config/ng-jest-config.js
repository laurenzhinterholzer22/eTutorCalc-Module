"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NgJestConfig = void 0;
const config_set_1 = require("ts-jest/dist/config/config-set");
class NgJestConfig extends config_set_1.ConfigSet {
    _resolveTsConfig(compilerOptions, resolvedConfigFile) {
        const result = super._resolveTsConfig(compilerOptions, resolvedConfigFile);
        result.options.enableIvy = true;
        result.options.noEmitOnError = false;
        result.options.suppressOutputPathCheck = true;
        result.options.allowEmptyCodegenFiles = false;
        result.options.annotationsAs = 'decorators';
        result.options.enableResourceInlining = false;
        result.options.allowJs = true;
        return result;
    }
}
exports.NgJestConfig = NgJestConfig;
