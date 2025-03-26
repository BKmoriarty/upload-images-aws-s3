import express, { type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import type { IStorageService } from "./interface/storage.interface";
import { S3StorageService } from "./service/s3-storage.service";
import { LocalStorageService } from "./service/local-storage.service";

const app = express();
const port = 8088;
const upload = multer({ storage: multer.memoryStorage() }).single("image");

// เลือก Provider ที่ใช้
let storageService: IStorageService;

if (process.env.STORAGE_PROVIDER === "s3") {
  storageService = new S3StorageService();
  console.log(`Using S3 storage provider`);
} else {
  storageService = new LocalStorageService("./uploads");
  console.log(`Using local storage provider`);
}

app.post("/upload", upload, (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const fileKey = `${Date.now()}_${req.file.originalname}`;

    try {
      const fileUrl = await storageService.uploadFile(req.file, fileKey);
      res.status(200).json({
        message: "File uploaded successfully",
        fileUrl,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error uploading file" });
    }
  })().catch(next);
});

// API สำหรับ Get Image
app.get("/images/:key", (req: Request, res: Response, next: NextFunction) => {
  (async () => {
    const fileKey = req.params.key;

    try {
      const fileBuffer = await storageService.getFile(fileKey);

      if (!fileBuffer) {
        return res.status(404).json({ error: "Image not found" });
      }

      // กำหนดประเภทของไฟล์ที่เหมาะสม
      const contentType = "image/jpeg"; // หรือ image/png, image/gif ตามประเภทของไฟล์
      res.setHeader("Content-Type", contentType);

      // ส่งไฟล์ให้กับ client
      res.status(200).send(fileBuffer);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error retrieving image" });
    }
  })().catch(next);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
