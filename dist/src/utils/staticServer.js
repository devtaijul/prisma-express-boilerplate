"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// utils/staticServer.ts
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const mime_types_1 = __importDefault(require("mime-types"));
const util_1 = require("util");
const statAsync = (0, util_1.promisify)(fs_1.default.stat);
const readdirAsync = (0, util_1.promisify)(fs_1.default.readdir);
class StaticFileServer {
    constructor(uploadsPath = "./uploads") {
        this.app = (0, express_1.default)();
        this.uploadsDir = path_1.default.resolve(uploadsPath);
        this.ensureUploadsDirectory();
        this.setupMiddleware();
        this.setupRoutes();
    }
    ensureUploadsDirectory() {
        if (!fs_1.default.existsSync(this.uploadsDir)) {
            fs_1.default.mkdirSync(this.uploadsDir, { recursive: true });
            console.log(`📁 Created uploads directory: ${this.uploadsDir}`);
        }
    }
    setupMiddleware() {
        // CORS headers for static files
        this.app.use("/uploads", (req, res, next) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header("Access-Control-Allow-Methods", "GET, HEAD");
            res.header("Access-Control-Allow-Headers", "Content-Type");
            next();
        });
        // Static file serving with custom headers
        this.app.use("/uploads", express_1.default.static(this.uploadsDir, {
            setHeaders: (res, filePath) => {
                // Cache control headers
                res.setHeader("Cache-Control", "public, max-age=31536000");
                // Security headers
                res.setHeader("X-Content-Type-Options", "nosniff");
                // Get MIME type
                const mimeType = mime_types_1.default.lookup(filePath) || "application/octet-stream";
                res.setHeader("Content-Type", mimeType);
                // Disable caching for certain file types
                if (filePath.match(/\.(html|htm|json)$/)) {
                    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
                }
            },
        }));
    }
    setupRoutes() {
        // Directory listing API (optional - for admin panel)
        this.app.get("/api/uploads/list", async (req, res) => {
            try {
                const directoryPath = req.query.path
                    ? path_1.default.join(this.uploadsDir, req.query.path)
                    : this.uploadsDir;
                // Security check
                if (!directoryPath.startsWith(this.uploadsDir)) {
                    return res.status(403).json({ error: "Access denied" });
                }
                const files = await readdirAsync(directoryPath);
                const fileDetails = await Promise.all(files.map(async (file) => {
                    const filePath = path_1.default.join(directoryPath, file);
                    const stats = await statAsync(filePath);
                    const isDirectory = stats.isDirectory();
                    return {
                        name: file,
                        path: filePath.replace(this.uploadsDir, "").replace(/\\/g, "/"),
                        type: isDirectory ? "directory" : "file",
                        size: isDirectory ? null : stats.size,
                        modified: stats.mtime,
                        url: isDirectory
                            ? null
                            : `/uploads${filePath
                                .replace(this.uploadsDir, "")
                                .replace(/\\/g, "/")}`,
                        mimeType: isDirectory
                            ? null
                            : mime_types_1.default.lookup(file) || "application/octet-stream",
                    };
                }));
                res.json({
                    success: true,
                    data: fileDetails,
                    currentPath: directoryPath.replace(this.uploadsDir, "") || "/",
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message,
                });
            }
        });
        // Get file info
        this.app.get("/api/uploads/info", async (req, res) => {
            try {
                const filePath = path_1.default.join(this.uploadsDir, req.query.path);
                if (!filePath.startsWith(this.uploadsDir)) {
                    return res.status(403).json({ error: "Access denied" });
                }
                const stats = await statAsync(filePath);
                res.json({
                    success: true,
                    data: {
                        name: path_1.default.basename(filePath),
                        path: filePath.replace(this.uploadsDir, ""),
                        size: stats.size,
                        modified: stats.mtime,
                        created: stats.birthtime,
                        url: `/uploads${filePath
                            .replace(this.uploadsDir, "")
                            .replace(/\\/g, "/")}`,
                        mimeType: mime_types_1.default.lookup(filePath) || "application/octet-stream",
                    },
                });
            }
            catch (error) {
                res.status(404).json({
                    success: false,
                    error: "File not found",
                });
            }
        });
        // Health check
        this.app.get("/health", (req, res) => {
            res.json({
                status: "ok",
                uploadsDir: this.uploadsDir,
                totalSpace: this.getDirectorySize(this.uploadsDir),
            });
        });
    }
    getDirectorySize(dirPath) {
        let totalSize = 0;
        const files = fs_1.default.readdirSync(dirPath);
        files.forEach((file) => {
            const filePath = path_1.default.join(dirPath, file);
            const stats = fs_1.default.statSync(filePath);
            if (stats.isDirectory()) {
                totalSize += this.getDirectorySize(filePath);
            }
            else {
                totalSize += stats.size;
            }
        });
        return totalSize;
    }
    start(port = 5001) {
        this.app.listen(port, () => {
            console.log(`📁 Static file server running on port ${port}`);
            console.log(`📂 Serving files from: ${this.uploadsDir}`);
            console.log(`🌐 Access files at: http://localhost:${port}/uploads`);
        });
    }
    getApp() {
        return this.app;
    }
}
exports.default = StaticFileServer;
