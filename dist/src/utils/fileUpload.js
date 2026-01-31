"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getImageDimensions = exports.deleteFile = exports.getFileUrl = exports.uploadMultiple = exports.uploadSingle = void 0;
// utils/fileUpload.ts
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
// Helper to get file dimensions (for images)
const sharp_1 = __importDefault(require("sharp"));
// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_PATH || "./uploads";
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Allowed file types
const allowedMimeTypes = [
    // Images
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    // Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // Videos
    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    // Audio
    "audio/mpeg",
    "audio/wav",
    "audio/ogg",
];
// File filter function
const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`));
    }
};
// Storage configuration
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        // Create year/month folder structure
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        const folderPath = path_1.default.join(uploadDir, year, month);
        // Create folder if not exists
        if (!fs_1.default.existsSync(folderPath)) {
            fs_1.default.mkdirSync(folderPath, { recursive: true });
        }
        cb(null, folderPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
        cb(null, uniqueName);
    },
});
// Multer configuration
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || "50") * 1024 * 1024, // MB to bytes
    },
});
// Single file upload middleware
exports.uploadSingle = upload.single("file");
// Multiple files upload middleware
exports.uploadMultiple = upload.array("files", 10); // Max 10 files
// Helper function to get file URL
const getFileUrl = (filename, year, month) => {
    const baseUrl = process.env.BASE_URL || "http://localhost:4000";
    return `${baseUrl}/uploads/${year}/${month}/${filename}`;
};
exports.getFileUrl = getFileUrl;
// Helper function to delete file
const deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs_1.default.unlink(filePath, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};
exports.deleteFile = deleteFile;
const getImageDimensions = async (filePath) => {
    try {
        const metadata = await (0, sharp_1.default)(filePath).metadata();
        return {
            width: metadata.width || 0,
            height: metadata.height || 0,
        };
    }
    catch (error) {
        console.error("Error getting image dimensions:", error);
        return { width: 0, height: 0 };
    }
};
exports.getImageDimensions = getImageDimensions;
