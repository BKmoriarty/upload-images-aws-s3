import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "your-encryption-key"; // ควรเป็นรหัสที่ยาวพอสมควร (32 bytes สำหรับ AES-256)
const ALGORITHM = "aes-256-cbc"; // ใช้ AES-256 สำหรับการเข้ารหัส
const IV_LENGTH = 16; // ขนาดของ Initialization Vector (IV)

export function encryptFile(fileBuffer: Buffer): Buffer {
  const iv = crypto.randomBytes(IV_LENGTH); // สร้าง IV ใหม่ทุกครั้งเพื่อความปลอดภัย
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "utf-8"), iv);

  // เข้ารหัสไฟล์
  const encrypted = Buffer.concat([cipher.update(fileBuffer), cipher.final()]);

  // ส่งคืนไฟล์ที่ถูกเข้ารหัสพร้อมกับ IV (จะใช้ในการถอดรหัส)
  return Buffer.concat([iv, encrypted]);
}

export function decryptFile(encryptedFileBuffer: Buffer): Buffer {
  // ใช้ .subarray() แทน .slice()
  const iv = encryptedFileBuffer.subarray(0, IV_LENGTH); // ดึง IV ออกจากข้อมูลที่เก็บไว้
  const encryptedData = encryptedFileBuffer.subarray(IV_LENGTH); // ดึงข้อมูลที่ถูกเข้ารหัส

  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, "utf-8"), iv);

  const decrypted = Buffer.concat([decipher.update(encryptedData), decipher.final()]);
  return decrypted;
}
