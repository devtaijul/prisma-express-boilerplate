"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/connection.routes.ts
const express_1 = require("express");
const prisma_1 = require("../../config/prisma");
const router = (0, express_1.Router)();
// Get connections for a media
router.get("/:mediaId", async (req, res, next) => {
    try {
        const { mediaId } = req.params;
        const connections = await prisma_1.prisma.mediaConnection.findMany({
            where: { mediaId },
            include: {
                media: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.status(200).json({
            success: true,
            data: connections.map((conn) => ({
                id: conn.id,
                mediaId: conn.mediaId,
                connectedTo: conn.connectedTo,
                connectedId: conn.connectedId,
                connectionType: conn.connectionType,
                createdAt: conn.createdAt,
                media: {
                    id: conn.media.id,
                    filename: conn.media.filename,
                    url: conn.media.url,
                },
            })),
        });
    }
    catch (error) {
        next(error);
    }
});
// Create connection
router.post("/", async (req, res, next) => {
    try {
        const { mediaId, connectedTo, connectedId, connectionType } = req.body;
        // Check if media exists
        const media = await prisma_1.prisma.media.findUnique({
            where: { id: mediaId },
        });
        if (!media) {
            return res.status(404).json({
                success: false,
                message: "Media not found",
            });
        }
        // Check if connection already exists
        const existingConnection = await prisma_1.prisma.mediaConnection.findFirst({
            where: {
                mediaId,
                connectedTo,
                connectedId,
                connectionType,
            },
        });
        if (existingConnection) {
            return res.status(400).json({
                success: false,
                message: "Connection already exists",
            });
        }
        // Create connection
        const connection = await prisma_1.prisma.mediaConnection.create({
            data: {
                mediaId,
                connectedTo,
                connectedId,
                connectionType,
            },
        });
        res.status(201).json({
            success: true,
            message: "Connection created successfully",
            data: connection,
        });
    }
    catch (error) {
        next(error);
    }
});
// Delete connection
router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const connection = await prisma_1.prisma.mediaConnection.findUnique({
            where: { id },
        });
        if (!connection) {
            return res.status(404).json({
                success: false,
                message: "Connection not found",
            });
        }
        await prisma_1.prisma.mediaConnection.delete({
            where: { id },
        });
        res.status(200).json({
            success: true,
            message: "Connection deleted successfully",
        });
    }
    catch (error) {
        next(error);
    }
});
// Get connections for an entity
router.get("/entity/:connectedTo/:connectedId", async (req, res, next) => {
    try {
        const { connectedTo, connectedId } = req.params;
        const connections = await prisma_1.prisma.mediaConnection.findMany({
            where: {
                connectedTo,
                connectedId,
            },
            include: {
                media: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });
        res.status(200).json({
            success: true,
            data: connections.map((conn) => ({
                id: conn.id,
                mediaId: conn.mediaId,
                connectedTo: conn.connectedTo,
                connectedId: conn.connectedId,
                connectionType: conn.connectionType,
                createdAt: conn.createdAt,
                media: {
                    id: conn.media.id,
                    filename: conn.media.filename,
                    url: conn.media.url,
                    mimeType: conn.media.mimeType,
                    dimensions: {
                        width: conn.media.width,
                        height: conn.media.height,
                    },
                },
            })),
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
