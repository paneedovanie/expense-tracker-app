import {
  IExpense,
  IPaginatedQuery,
  IPaginatedResponse,
  TCreateExpenseInput,
  TUpdateExpenseInput,
} from "@/types";
import api from "@/utils/api";
import { BaseService } from "./base.service";
import { jsonToFormData } from "@/utils";

class ExpensesService extends BaseService {
  async paginated(query?: IPaginatedQuery) {
    return api.get<IPaginatedResponse<IExpense>>(
      `${this.apiBaseUrl}/api/v1/expenses`,
      query,
      {
        headers: await this.applyAccessToken(),
      }
    );
  }

  async get(id: string) {
    return api.get<IExpense>(
      `${this.apiBaseUrl}/api/v1/expenses/${id}`,
      undefined,
      {
        headers: await this.applyAccessToken(),
      }
    );
  }

  async create(input: TCreateExpenseInput) {
    return api.post<IExpense>(
      `${this.apiBaseUrl}/api/v1/expenses`,
      jsonToFormData(input),
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(await this.applyAccessToken()),
        },
      }
    );
  }

  async update(id: string, input: TUpdateExpenseInput) {
    return api.post<IExpense>(
      `${this.apiBaseUrl}/api/v1/expenses/${id}`,
      jsonToFormData(input),
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(await this.applyAccessToken()),
        },
      }
    );
  }
}

export const expensesService = new ExpensesService();
