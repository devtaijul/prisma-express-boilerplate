"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParentCategories = exports.childDrivenCategory = exports.updateCategory = exports.getCategoryById = exports.getAllCategories = exports.createCategory = exports.getAllFlatCategory = void 0;
const prisma_1 = require("../../config/prisma");
const asyncHandler_1 = require("../../middlewares/asyncHandler");
exports.getAllFlatCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const flatCategories = await prisma_1.prisma.category.findMany();
    res.status(200).json({
        success: true,
        flatCategories,
    });
});
exports.createCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { title, description, slug, parentCategoryId, featuredImage, isPublished, seoTitle, seoDescription, } = req.body;
    const variables = {
        title,
        description,
        slug,
        seoTitle,
        seoDescription,
        parentId: null,
        isPublished: isPublished || false,
        featuredImageId: null,
    };
    if (parentCategoryId) {
        variables.parentId = parentCategoryId;
    }
    if (featuredImage) {
        variables.featuredImageId = featuredImage;
    }
    // check  if  name or  slug  already exist
    const existingCategory = await prisma_1.prisma.category.findFirst({
        where: {
            OR: [{ title: title }, { slug: slug }],
        },
    });
    if (existingCategory) {
        return res.status(400).json({
            success: false,
            message: "Category already exist",
        });
    }
    const category = await prisma_1.prisma.category.create({
        data: variables,
    });
    console.log("category", category);
    res.status(201).json({
        sucess: true,
        message: "Category created successfully",
        category,
    });
});
exports.getAllCategories = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const categories = await prisma_1.prisma.category.findMany({
        include: {
            parent: true,
        },
    });
    const categoryCount = await prisma_1.prisma.category.count();
    res.status(200).json({
        success: true,
        data: categories,
        total: categoryCount,
    });
});
exports.getCategoryById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
        return res.status(400).json({
            success: false,
            message: "Category id is required",
        });
    }
    const category = await prisma_1.prisma.category.findUnique({
        where: {
            id,
        },
        include: {
            parent: true,
            children: true,
            featuredImage: true,
        },
    });
    res.status(200).json({
        success: true,
        data: category,
    });
});
exports.updateCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
        return res.status(400).json({
            success: false,
            message: "Category id is required",
        });
    }
    const { title, description, slug, parentCategoryId, featuredImageId, isPublished, seoTitle, seoDescription, } = req.body;
    const variables = {
        title,
        description,
        slug,
        seoTitle,
        seoDescription,
        parentId: null,
        isPublished: isPublished || false,
        featuredImageId: null,
    };
    if (parentCategoryId) {
        variables.parentId = parentCategoryId;
    }
    if (featuredImageId) {
        variables.featuredImageId = featuredImageId;
    }
    const existingCategory = await prisma_1.prisma.category.findFirst({
        where: {
            OR: [{ title: title }, { slug: slug }, { id: id }],
        },
    });
    if (!existingCategory) {
        return res.status(400).json({
            success: false,
            message: "Category not found",
        });
    }
    const category = await prisma_1.prisma.category.update({
        where: {
            id,
        },
        data: variables,
    });
    res.status(200).json({
        success: true,
        message: "Category updated successfully",
        category,
    });
});
exports.childDrivenCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Fetch all categories at once
    const allCategories = await prisma_1.prisma.category.findMany({
        orderBy: { id: "asc" },
    });
    // Create a map for quick lookup
    const categoryMap = new Map();
    allCategories.forEach((category) => {
        categoryMap.set(category.id, { ...category, children: [] });
    });
    // Build tree
    const tree = [];
    allCategories.forEach((category) => {
        if (category.parentId) {
            const parent = categoryMap.get(category.parentId);
            if (parent) {
                parent.children.push(categoryMap.get(category.id));
            }
        }
        else {
            tree.push(categoryMap.get(category.id));
        }
    });
    res.json({
        success: true,
        data: tree,
    });
});
const buildCategoryTree = (categories) => {
    const map = new Map();
    // map setup
    categories.forEach((cat) => {
        map.set(cat.id, { ...cat, children: [] });
    });
    // build tree
    const roots = [];
    map.forEach((cat) => {
        if (cat.parentId) {
            map.get(cat.parentId)?.children?.push(cat);
        }
        else {
            roots.push(cat);
        }
    });
    return roots;
};
const calculateProductCount = (category) => {
    const childrenCount = category.children?.reduce((sum, child) => sum + calculateProductCount(child), 0) ?? 0;
    category.productCount = category._count.products + childrenCount;
    return category.productCount;
};
exports.getParentCategories = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const categories = await prisma_1.prisma.category.findMany({
        include: {
            featuredImage: true,
            _count: {
                select: { products: true },
            },
        },
        orderBy: { createdAt: "asc" },
    });
    const tree = buildCategoryTree(categories);
    tree.forEach((category) => calculateProductCount(category));
    res.status(200).json({
        success: true,
        data: tree,
    });
});
