import { BaseService } from "./base.service";
import { IFile, IOcrResult } from "@/types";
import api from "@/utils/api";

class OcrService extends BaseService {
  async scanReceipt(file: IFile): Promise<IOcrResult> {
    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      name: file.name || "receipt.jpg",
      type: file.type || "image/jpeg",
    } as any);

    const headers = await this.applyAccessToken();

    return api.post<IOcrResult>(`${this.apiBaseUrl}/api/v1/ocr`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        ...headers,
      },
    });
  }
}

export const ocrService = new OcrService();
