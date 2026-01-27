"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOrderTrackingNumber = exports.comparePassword = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const hashPassword = (p) => bcrypt_1.default.hash(p, 10);
exports.hashPassword = hashPassword;
const comparePassword = (p, h) => bcrypt_1.default.compare(p, h);
exports.comparePassword = comparePassword;
const generateOrderTrackingNumber = () => {
    const timestamp = Date.now().toString();
    const randomDigits = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, "0");
    return `ORD-${timestamp}${randomDigits}`;
};
exports.generateOrderTrackingNumber = generateOrderTrackingNumber;
