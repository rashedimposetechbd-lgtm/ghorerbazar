import { Express, Request, Response } from "express";
import fs from "fs";
import path from "path";
import express from "express";
import { cmsDataStore } from "./dataStore";

export function registerUploadRoutes(app: Express) {
  const uploadsDir = path.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Serve static files from /uploads
  app.use("/uploads", express.static(uploadsDir));

  // Direct file upload endpoint (Base64 or multipart JSON)
  app.post("/api/upload", (req: Request, res: Response) => {
    try {
      const { filename, dataBase64, folder = "general" } = req.body;
      if (!filename || !dataBase64) {
        return res.status(400).json({ error: "filename and dataBase64 are required" });
      }

      // Sanitize extension and name
      const ext = path.extname(filename) || ".png";
      const baseName = path.basename(filename, ext).replace(/[^a-zA-Z0-9_-]/g, "");
      const uniqueName = `${baseName}-${Date.now()}${ext}`;
      const filePath = path.join(uploadsDir, uniqueName);

      // Strip data url prefix if present (e.g. data:image/png;base64,)
      const cleanBase64 = dataBase64.replace(/^data:[^;]+;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");

      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${uniqueName}`;
      const fileSizeKb = Math.round(buffer.length / 1024);

      const media = cmsDataStore.addMediaFile({
        name: filename,
        url: fileUrl,
        fileType: ext.replace(".", "").toUpperCase(),
        fileSize: `${fileSizeKb} KB`,
        folder,
      });

      return res.json({
        success: true,
        url: fileUrl,
        media,
      });
    } catch (error: any) {
      console.error("[Upload] Error writing file:", error);
      return res.status(500).json({ error: error.message || "Failed to upload file" });
    }
  });
}
