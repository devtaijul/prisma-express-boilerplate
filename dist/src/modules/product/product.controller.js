"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSpecialProducts = exports.getProductBySlug = exports.getProductById = exports.getProducts = exports.deleteProduct = exports.updateProduct = exports.createProduct = void 0;
const prisma_1 = require("../../config/prisma");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
const createProduct = async (req, res) => {
    try {
        const { featuredImageId, galleryImageIds = [], attachProductId = null, relatedProductIds = [], categoryId, ...data } = req.body;
        const exists = await prisma_1.prisma.product.findUnique({
            where: {
                slug: data.slug,
            },
        });
        if (exists) {
            return res.status(400).json({
                success: false,
                message: "Product already exists",
            });
        }
        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: "Category id is required",
            });
        }
        const category = await prisma_1.prisma.category.findUnique({
            where: {
                id: categoryId,
            },
        });
        if (!category) {
            return res.status(400).json({
                success: false,
                message: "Category not found",
            });
        }
        const product = await prisma_1.prisma.product.create({
            data: {
                ...data,
                category: {
                    connect: {
                        id: categoryId,
                    },
                },
                featuredImage: featuredImageId
                    ? { connect: { id: featuredImageId } }
                    : undefined,
                galleryImages: galleryImageIds.length
                    ? {
                        connect: galleryImageIds.map((id) => ({ id })),
                    }
                    : undefined,
                attachProduct: attachProductId
                    ? { connect: { id: attachProductId } }
                    : undefined,
                relatedProducts: relatedProductIds.length
                    ? {
                        connect: relatedProductIds.map((id) => ({ id })),
                    }
                    : undefined,
            },
            include: {
                featuredImage: true,
                galleryImages: true,
                attachProduct: true,
                relatedProducts: true,
            },
        });
        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Product create failed", error });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "Invalid product id" });
        }
        const { featuredImageId, galleryImageIds, categoryId, attachProductId = null, relatedProductIds = [], ...data } = req.body;
        const product = await prisma_1.prisma.product.update({
            where: { id },
            data: {
                ...data,
                category: {
                    connect: {
                        id: categoryId,
                    },
                },
                featuredImage: featuredImageId
                    ? { connect: { id: featuredImageId } }
                    : { disconnect: true },
                galleryImages: galleryImageIds
                    ? {
                        set: galleryImageIds.map((id) => ({ id })),
                    }
                    : undefined,
                attachProduct: attachProductId
                    ? { connect: { id: attachProductId } }
                    : { disconnect: true },
                relatedProducts: relatedProductIds.length
                    ? {
                        set: relatedProductIds.map((id) => ({ id })),
                    }
                    : undefined,
            },
            include: {
                featuredImage: true,
                galleryImages: true,
                attachProduct: true,
                relatedProducts: true,
            },
        });
        res.json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Product update failed", error });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "Invalid product id" });
        }
        await prisma_1.prisma.product.delete({
            where: { id },
        });
        res.json({ message: "Product deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Product delete failed", error });
    }
};
exports.deleteProduct = deleteProduct;
const getProducts = async (req, res) => {
    try {
        const { page = "1", limit = "10", search = "", orderBy = "createdAt", order = "desc", } = req.query;
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;
        const searchNumber = Number(search);
        const isNumber = !isNaN(searchNumber);
        const products = await prisma_1.prisma.product.findMany({
            skip,
            take: pageSize,
            where: {
                OR: [
                    {
                        title: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    ...(isNumber
                        ? [
                            {
                                price: {
                                    equals: searchNumber,
                                },
                            },
                        ]
                        : []),
                ],
            },
            orderBy: {
                [orderBy]: order === "asc" ? "asc" : "desc",
            },
            include: {
                featuredImage: true,
                galleryImages: true,
                attachProduct: true,
                relatedProducts: true,
            },
        });
        const productCount = await prisma_1.prisma.product.count({
            where: {
                OR: [
                    {
                        title: {
                            contains: search,
                            mode: "insensitive",
                        },
                    },
                    ...(isNumber
                        ? [
                            {
                                price: {
                                    equals: searchNumber,
                                },
                            },
                        ]
                        : []),
                ],
            },
        });
        res.json({
            success: true,
            data: products,
            page: pageNumber,
            limit: pageSize,
            total: productCount,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch products", error });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || Array.isArray(id)) {
            return res.status(400).json({ message: "Invalid product identifier" });
        }
        const product = await prisma_1.prisma.product.findFirst({
            where: {
                OR: [
                    { id: id }, // match by product id
                    { slug: id }, // match by product slug
                ],
            },
            include: {
                featuredImage: true,
                galleryImages: true,
                attachProduct: true,
                relatedProducts: true,
            },
        });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        let relatedProducts = [];
        if (!product.isCustomeRelation) {
            relatedProducts = await prisma_1.prisma.product.findMany({
                where: {
                    categoryId: product.categoryId,
                },
                include: {
                    featuredImage: true,
                    galleryImages: true,
                    attachProduct: true,
                    relatedProducts: true,
                },
            });
        }
        return res.json({
            success: true,
            data: product,
            relatedProducts,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Failed to fetch product",
        });
    }
};
exports.getProductById = getProductById;
const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        if (!slug || Array.isArray(slug)) {
            return res.status(400).json({ message: "Invalid product id" });
        }
        const product = await prisma_1.prisma.product.findUnique({
            where: { slug },
            include: {
                featuredImage: true,
                galleryImages: true,
                attachProduct: {
                    include: {
                        featuredImage: true,
                    },
                },
                relatedProducts: true,
            },
        });
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.json({
            success: true,
            data: product,
        });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch product", error });
    }
};
exports.getProductBySlug = getProductBySlug;
exports.getSpecialProducts = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { type = "top" } = req.query;
    if (type === "new") {
        const products = await prisma_1.prisma.product.findMany({
            where: {
                newArrival: true,
            },
            include: {
                featuredImage: true,
                galleryImages: true,
                attachProduct: true,
                relatedProducts: true,
            },
        });
        res.json({
            success: true,
            data: products,
        });
    }
    else {
        const products = await prisma_1.prisma.product.findMany({
            where: {
                isTopSelling: true,
            },
            include: {
                featuredImage: true,
                galleryImages: true,
                attachProduct: {
                    include: {
                        featuredImage: true,
                    },
                },
                relatedProducts: true,
            },
        });
        res.json({
            success: true,
            data: products,
        });
    }
});
