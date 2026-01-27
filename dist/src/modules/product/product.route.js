"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const router = (0, express_1.Router)();
router
    .get("/", product_controller_1.getProducts)
    .post("/", product_controller_1.createProduct)
    .get("/special", product_controller_1.getSpecialProducts);
router
    .get("/:id", product_controller_1.getProductById)
    .put("/:id", product_controller_1.updateProduct)
    .delete("/:id", product_controller_1.deleteProduct);
exports.default = router;
