// local-storage.service.ts
import type { IStorageService } from "./../interface/storage.interface";
import fs from "fs";
import path from "path";
import { decryptFile, encryptFile } from "../helper/encryptFile";

export class LocalStorageService implements IStorageService {
  private storagePath: string;

  constructor(storagePath: string) {
    this.storagePath = storagePath;
  }

  async uploadFile(file: Express.Multer.File, fileKey: string): Promise<string> {
    const encryptedFileBuffer = encryptFile(file.buffer); // เข้ารหัสไฟล์ก่อนอัพโหลด

    const filePath = path.join(__dirname, "../" + this.storagePath, fileKey);
    fs.writeFileSync(filePath, encryptedFileBuffer);
    return `file://${filePath}`;
  }

  async getFile(fileKey: string): Promise<Buffer> {
    const filePath = path.join(__dirname, "../" + this.storagePath, fileKey);
    try {
      const encryptedFileBuffer = await fs.promises.readFile(filePath);
      return decryptFile(encryptedFileBuffer); // ถอดรหัสก่อนส่งกลับ
    } catch (err) {
      console.error(err);
      throw new Error("Error fetching file from local storage");
    }
  }
}
