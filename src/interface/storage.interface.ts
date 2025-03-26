// storage.interface.ts
export interface IStorageService {
  uploadFile(file: Express.Multer.File, fileKey: string): Promise<string>;
  getFile(fileKey: string): Promise<Buffer>;
}
