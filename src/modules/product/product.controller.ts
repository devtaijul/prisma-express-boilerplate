import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

export const createProduct = async (req: Request, res: Response) => {
  try {
    const {
      featuredImageId,
      galleryImageIds = [],
      attachProductId = null,
      relatedProductIds = [],
      categoryId,
      ...data
    } = req.body;

    const product = await prisma.product.create({
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
              connect: galleryImageIds.map((id: string) => ({ id })),
            }
          : undefined,

        attachProduct: attachProductId
          ? { connect: { id: attachProductId } }
          : undefined,

        relatedProducts: relatedProductIds.length
          ? {
              connect: relatedProductIds.map((id: string) => ({ id })),
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
  } catch (error) {
    res.status(500).json({ message: "Product create failed", error });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }
    const {
      featuredImageId,
      galleryImageIds,
      categoryId,
      attachProductId = null,
      relatedProductIds = [],
      ...data
    } = req.body;

    const product = await prisma.product.update({
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
              set: galleryImageIds.map((id: string) => ({ id })),
            }
          : undefined,

        attachProduct: attachProductId
          ? { connect: { id: attachProductId } }
          : { disconnect: true },

        relatedProducts: relatedProductIds.length
          ? {
              set: relatedProductIds.map((id: string) => ({ id })),
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
  } catch (error) {
    res.status(500).json({ message: "Product update failed", error });
  }
};

export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    await prisma.product.delete({
      where: { id },
    });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Product delete failed", error });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      page = "1",
      limit = "10",
      search = "",
      orderBy = "createdAt",
      order = "desc",
    } = req.query as Record<string, string>;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(limit);
    const skip = (pageNumber - 1) * pageSize;

    const searchNumber = Number(search);
    const isNumber = !isNaN(searchNumber);

    const products = await prisma.product.findMany({
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

    const productCount = await prisma.product.count({
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
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch products", error });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ message: "Invalid product id" });
    }

    const product = await prisma.product.findUnique({
      where: { id },
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

    res.json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch product", error });
  }
};
