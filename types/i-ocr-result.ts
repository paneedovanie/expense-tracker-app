import { EExpenseCategory } from './e-expense-category';

export interface IOcrResultData {
  description?: string;
  amount?: number;
  date?: string;
  category?: EExpenseCategory;
  rawText?: string;
}

export interface IOcrResult {
  success: boolean;
  data?: IOcrResultData;
  error?: string;
}

export interface IOcrScanParams {
  groupId: string;
  ocrData: string;
}