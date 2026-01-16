// utils/staticServer.ts
import express, { Application, Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import { promisify } from "util";

const statAsync = promisify(fs.stat);
const readdirAsync = promisify(fs.readdir);

class StaticFileServer {
  private app: Application;
  private uploadsDir: string;

  constructor(uploadsPath: string = "./uploads") {
    this.app = express();
    this.uploadsDir = path.resolve(uploadsPath);

    this.ensureUploadsDirectory();
    this.setupMiddleware();
    this.setupRoutes();
  }

  private ensureUploadsDirectory(): void {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      console.log(`📁 Created uploads directory: ${this.uploadsDir}`);
    }
  }

  private setupMiddleware(): void {
    // CORS headers for static files
    this.app.use(
      "/uploads",
      (req: Request, res: Response, next: NextFunction) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, HEAD");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        next();
      }
    );

    // Static file serving with custom headers
    this.app.use(
      "/uploads",
      express.static(this.uploadsDir, {
        setHeaders: (res: Response, filePath: string) => {
          // Cache control headers
          res.setHeader("Cache-Control", "public, max-age=31536000");

          // Security headers
          res.setHeader("X-Content-Type-Options", "nosniff");

          // Get MIME type
          const mimeType = mime.lookup(filePath) || "application/octet-stream";
          res.setHeader("Content-Type", mimeType);

          // Disable caching for certain file types
          if (filePath.match(/\.(html|htm|json)$/)) {
            res.setHeader(
              "Cache-Control",
              "no-store, no-cache, must-revalidate"
            );
          }
        },
      })
    );
  }

  private setupRoutes(): void {
    // Directory listing API (optional - for admin panel)
    this.app.get("/api/uploads/list", async (req: Request, res: Response) => {
      try {
        const directoryPath = req.query.path
          ? path.join(this.uploadsDir, req.query.path as string)
          : this.uploadsDir;

        // Security check
        if (!directoryPath.startsWith(this.uploadsDir)) {
          return res.status(403).json({ error: "Access denied" });
        }

        const files = await readdirAsync(directoryPath);
        const fileDetails = await Promise.all(
          files.map(async (file) => {
            const filePath = path.join(directoryPath, file);
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
                : mime.lookup(file) || "application/octet-stream",
            };
          })
        );

        res.json({
          success: true,
          data: fileDetails,
          currentPath: directoryPath.replace(this.uploadsDir, "") || "/",
        });
      } catch (error: any) {
        res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    });

    // Get file info
    this.app.get("/api/uploads/info", async (req: Request, res: Response) => {
      try {
        const filePath = path.join(this.uploadsDir, req.query.path as string);

        if (!filePath.startsWith(this.uploadsDir)) {
          return res.status(403).json({ error: "Access denied" });
        }

        const stats = await statAsync(filePath);

        res.json({
          success: true,
          data: {
            name: path.basename(filePath),
            path: filePath.replace(this.uploadsDir, ""),
            size: stats.size,
            modified: stats.mtime,
            created: stats.birthtime,
            url: `/uploads${filePath
              .replace(this.uploadsDir, "")
              .replace(/\\/g, "/")}`,
            mimeType: mime.lookup(filePath) || "application/octet-stream",
          },
        });
      } catch (error: any) {
        res.status(404).json({
          success: false,
          error: "File not found",
        });
      }
    });

    // Health check
    this.app.get("/health", (req: Request, res: Response) => {
      res.json({
        status: "ok",
        uploadsDir: this.uploadsDir,
        totalSpace: this.getDirectorySize(this.uploadsDir),
      });
    });
  }

  private getDirectorySize(dirPath: string): number {
    let totalSize = 0;

    const files = fs.readdirSync(dirPath);
    files.forEach((file) => {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        totalSize += this.getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    });

    return totalSize;
  }

  public start(port: number = 5001): void {
    this.app.listen(port, () => {
      console.log(`📁 Static file server running on port ${port}`);
      console.log(`📂 Serving files from: ${this.uploadsDir}`);
      console.log(`🌐 Access files at: http://localhost:${port}/uploads`);
    });
  }

  public getApp(): Application {
    return this.app;
  }
}

export default StaticFileServer;
