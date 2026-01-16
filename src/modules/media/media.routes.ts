// routes/media.routes.ts
import { Router, Request, Response, NextFunction } from "express";

import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import {
  deleteFile,
  getFileUrl,
  getImageDimensions,
  uploadMultiple,
  uploadSingle,
} from "../../utils/fileUpload";
import { prisma } from "../../config/prisma";

const router = Router();

// Upload single file
router.post(
  "/upload",
  uploadSingle,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Extract year and month from file path
      const filePath = req.file.path;
      const pathParts = filePath.split(path.sep);
      const year = pathParts[pathParts.length - 3];
      const month = pathParts[pathParts.length - 2];
      const filename = pathParts[pathParts.length - 1];

      // Get file URL
      const fileUrl = getFileUrl(filename, year, month);

      // Get image dimensions if it's an image
      let dimensions = { width: 0, height: 0 };
      if (req.file.mimetype.startsWith("image/")) {
        dimensions = await getImageDimensions(filePath);
      }

      // Create media record in database
      const media = await prisma.media.create({
        data: {
          url: fileUrl,
          filename: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          width: dimensions.width || null,
          height: dimensions.height || null,
          altText: "",
          caption: "",
        },
      });

      res.status(201).json({
        success: true,
        message: "File uploaded successfully",
        media: {
          id: media.id,
          url: media.url,
          filename: media.filename,
          mimeType: media.mimeType,
          size: media.size,
          dimensions: {
            width: media.width,
            height: media.height,
          },
          createdAt: media.createdAt,
          altText: media.altText,
          caption: media.caption,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// Upload multiple files
router.post(
  "/upload-multiple",
  uploadMultiple,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
      }

      const files = req.files as Express.Multer.File[];
      const uploadedMedia = [];

      for (const file of files) {
        // Extract year and month from file path
        const filePath = file.path;
        const pathParts = filePath.split(path.sep);
        const year = pathParts[pathParts.length - 3];
        const month = pathParts[pathParts.length - 2];
        const filename = pathParts[pathParts.length - 1];

        // Get file URL
        const fileUrl = getFileUrl(filename, year, month);

        // Get image dimensions if it's an image
        let dimensions = { width: 0, height: 0 };
        if (file.mimetype.startsWith("image/")) {
          dimensions = await getImageDimensions(filePath);
        }

        // Create media record
        const media = await prisma.media.create({
          data: {
            url: fileUrl,
            filename: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            width: dimensions.width || null,
            height: dimensions.height || null,
            altText: "",
            caption: "",
          },
        });

        uploadedMedia.push({
          id: media.id,
          url: media.url,
          filename: media.filename,
          mimeType: media.mimeType,
          size: media.size,
          dimensions: {
            width: media.width,
            height: media.height,
          },
          createdAt: media.createdAt,
          altText: media.altText,
          caption: media.caption,
        });
      }

      res.status(201).json({
        success: true,
        message: `${files.length} files uploaded successfully`,
        media: uploadedMedia,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Get all media with pagination
router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("i am calling");

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const skip = (page - 1) * limit;

    // Build where clause for search
    const where: any = {};
    if (search) {
      where.filename = {
        contains: search,
        mode: "insensitive",
      };
    }

    // Get total count
    const total = await prisma.media.count({ where });

    // Get media with pagination
    const media = await prisma.media.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    });

    // Format response
    const formattedMedia = media.map((item) => ({
      id: item.id,
      url: item.url,
      filename: item.filename,
      mimeType: item.mimeType,
      size: item.size,
      dimensions: {
        width: item.width,
        height: item.height,
      },
      createdAt: item.createdAt,
      altText: item.altText,
      caption: item.caption,
    }));

    res.status(200).json({
      success: true,
      data: formattedMedia,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get single media by ID
router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const media = await prisma.media.findUnique({
      where: { id },
    });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: media.id,
        url: media.url,
        filename: media.filename,
        mimeType: media.mimeType,
        size: media.size,
        dimensions: {
          width: media.width,
          height: media.height,
        },
        createdAt: media.createdAt,
        altText: media.altText,
        caption: media.caption,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Update media
router.put("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { altText, caption } = req.body;

    const media = await prisma.media.update({
      where: { id },
      data: {
        altText: altText || null,
        caption: caption || null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Media updated successfully",
      data: {
        id: media.id,
        url: media.url,
        filename: media.filename,
        mimeType: media.mimeType,
        size: media.size,
        dimensions: {
          width: media.width,
          height: media.height,
        },
        createdAt: media.createdAt,
        altText: media.altText,
        caption: media.caption,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Delete media
router.delete(
  "/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // Find media first
      const media = await prisma.media.findUnique({
        where: { id },
      });

      if (!media) {
        return res.status(404).json({
          success: false,
          message: "Media not found",
        });
      }

      // Extract file path from URL
      const urlParts = media.url.split("/uploads/");
      if (urlParts.length > 1) {
        const filePath = path.join(
          process.env.UPLOAD_PATH || "./uploads",
          urlParts[1]
        );

        // Delete file from filesystem
        if (fs.existsSync(filePath)) {
          await deleteFile(filePath);
        }
      }

      // Delete from database (cascade will delete connections)
      await prisma.media.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: "Media deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
);

// Search media
router.get(
  "/search",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Search query is required",
        });
      }

      const media = await prisma.media.findMany({
        where: {
          filename: {
            contains: q as string,
            mode: "insensitive",
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      });

      const formattedMedia = media.map((item) => ({
        id: item.id,
        url: item.url,
        filename: item.filename,
        mimeType: item.mimeType,
        size: item.size,
        dimensions: {
          width: item.width,
          height: item.height,
        },
        createdAt: item.createdAt,
        altText: item.altText,
        caption: item.caption,
      }));

      res.status(200).json({
        success: true,
        data: formattedMedia,
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
