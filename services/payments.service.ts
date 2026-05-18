import {
  IPayment,
  IPaginatedQuery,
  IPaginatedResponse,
  TCreatePaymentInput,
  TUpdatePaymentInput,
} from "@/types";
import api from "@/utils/api";
import { BaseService } from "./base.service";
import { jsonToFormData } from "@/utils";

class PaymentsService extends BaseService {
  async paginated(query?: IPaginatedQuery) {
    return api.get<IPaginatedResponse<IPayment>>(
      `${this.apiBaseUrl}/api/v1/payments`,
      query,
      {
        headers: await this.applyAccessToken(),
      }
    );
  }

  async get(id: string) {
    return api.get<IPayment>(
      `${this.apiBaseUrl}/api/v1/payments/${id}`,
      undefined,
      {
        headers: await this.applyAccessToken(),
      }
    );
  }

  async create(input: TCreatePaymentInput) {
    return api.post<IPayment>(`${this.apiBaseUrl}/api/v1/payments`, input, {
      headers: {
        // "Content-Type": "multipart/form-data",
        ...(await this.applyAccessToken()),
      },
    });
  }

  async update(id: string, input: TUpdatePaymentInput) {
    return api.post<IPayment>(
      `${this.apiBaseUrl}/api/v1/payments/${id}`,
      input,
      {
        headers: {
          // "Content-Type": "multipart/form-data",
          ...(await this.applyAccessToken()),
        },
      }
    );
  }

  async delete(id: string) {
    return api.delete<IPayment>(
      `${this.apiBaseUrl}/api/v1/payments/${id}`,
      undefined,
      {
        headers: await this.applyAccessToken(),
      }
    );
  }
}

export const paymentsService = new PaymentsService();
