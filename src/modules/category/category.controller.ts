import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { Category } from "../../../generated/prisma";
import { CategoryInput } from "../../types/express";

export const getAllFlatCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const flatCategories = await prisma.category.findMany();
    res.status(200).json({
      success: true,
      flatCategories,
    });
  },
);

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      title,
      description,
      slug,
      parentCategoryId,
      featuredImage,
      isPublished,
      seoTitle,
      seoDescription,
    } = req.body;

    const variables: CategoryInput = {
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
    const existingCategory = await prisma.category.findFirst({
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

    const category = await prisma.category.create({
      data: {
        ...variables,
      } as Category,
    });

    console.log("category", category);
    res.status(201).json({
      sucess: true,
      message: "Category created successfully",
      category,
    });
  },
);

export const getAllCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    const categoryCount = await prisma.category.count();
    res.status(200).json({
      success: true,
      data: categories,
      total: categoryCount,
    });
  },
);

export const getCategoryById = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Category id is required",
      });
    }

    const category = await prisma.category.findUnique({
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
  },
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        success: false,
        message: "Category id is required",
      });
    }

    const {
      title,
      description,
      slug,
      parentCategoryId,
      featuredImageId,
      isPublished,
      seoTitle,
      seoDescription,
    } = req.body;

    const variables: CategoryInput = {
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

    const existingCategory = await prisma.category.findFirst({
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

    const category = await prisma.category.update({
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
  },
);

export const childDrivenCategory = asyncHandler(
  async (req: Request, res: Response) => {
    // Fetch all categories at once
    const allCategories = await prisma.category.findMany({
      orderBy: { id: "asc" },
    });

    // Create a map for quick lookup
    const categoryMap = new Map();
    allCategories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Build tree
    const tree: Category[] = [];
    allCategories.forEach((category) => {
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children.push(categoryMap.get(category.id));
        }
      } else {
        tree.push(categoryMap.get(category.id));
      }
    });

    res.json({
      success: true,
      data: tree,
    });
  },
);

type CategoryNode = {
  id: string;
  parentId: string | null;
  _count: { products: number };
  children?: CategoryNode[];
  productCount?: number;
};

const buildCategoryTree = (categories: CategoryNode[]) => {
  const map = new Map<string, CategoryNode>();

  // map setup
  categories.forEach((cat) => {
    map.set(cat.id, { ...cat, children: [] });
  });

  // build tree
  const roots: CategoryNode[] = [];
  map.forEach((cat) => {
    if (cat.parentId) {
      map.get(cat.parentId)?.children?.push(cat);
    } else {
      roots.push(cat);
    }
  });

  return roots;
};

const calculateProductCount = (category: CategoryNode): number => {
  const childrenCount =
    category.children?.reduce(
      (sum, child) => sum + calculateProductCount(child),
      0,
    ) ?? 0;

  category.productCount = category._count.products + childrenCount;

  return category.productCount;
};
export const getParentCategories = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await prisma.category.findMany({
      include: {
        featuredImage: true,
        _count: {
          select: { products: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const tree = buildCategoryTree(categories as CategoryNode[]);

    tree.forEach((category) => calculateProductCount(category));

    res.status(200).json({
      success: true,
      data: tree,
    });
  },
);
