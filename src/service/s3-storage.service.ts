// s3-storage.service.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import type { IStorageService } from "./../interface/storage.interface";
import { decryptFile, encryptFile } from "../helper/encryptFile";

export class S3StorageService implements IStorageService {
  private s3: S3Client;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async uploadFile(file: Express.Multer.File, fileKey: string): Promise<string> {
    const encryptedFileBuffer = encryptFile(file.buffer); // เข้ารหัสไฟล์ก่อนอัพโหลด

    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET || "",
      Key: fileKey,
      Body: encryptedFileBuffer,
      ContentType: file.mimetype,
      ServerSideEncryption: "AES256" as const, // Enabling server-side encryption
    };

    await this.s3.send(new PutObjectCommand(uploadParams));
    return `https://${process.env.AWS_S3_BUCKET}.s3.amazonaws.com/${fileKey}`;
  }

  async getFile(fileKey: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: fileKey,
    });

    try {
      const { Body } = await this.s3.send(command);
      if (Body && Body.transformToWebStream) {
        const stream = Body.transformToWebStream();
        if (stream instanceof ReadableStream) {
          const chunks: Buffer[] = [];
          for await (const chunk of stream) {
            chunks.push(chunk);
          }
          const encryptedFileBuffer = Buffer.concat(chunks);
          return decryptFile(encryptedFileBuffer); // ถอดรหัสก่อนส่งกลับ
        } else {
          console.log("Body is not a ReadableStream");
          return Buffer.from("");
        }
      } else {
        console.log("Body is not a ReadableStream");
        return Buffer.from("");
      }
    } catch (err) {
      console.error(err);
      throw new Error("Error fetching file from S3");
    }
  }
}
