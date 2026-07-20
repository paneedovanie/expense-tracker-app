import { useMutation } from "@tanstack/react-query";
import { IFile, IOcrResult } from "@/types";
import { ocrService } from "@/services/ocr.service";

export function useOcr() {
  return useMutation<IOcrResult, Error, IFile>({
    mutationKey: ["ocr"],
    mutationFn: (file: IFile) => ocrService.scanReceipt(file),
  });
}