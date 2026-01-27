"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => (req, res, next) => {
    schema.parse({
        body: req.body,
        params: req.params,
        query: req.query,
    });
    next();
};
exports.validate = validate;
