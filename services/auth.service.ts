import { apiBaseUrl } from "@/constants/env";
import {
  IUser,
  TChangePasswordInput,
  TLoginInput,
  TPasswordResetInput,
  TRegisterInput,
  TUpdateAuthUserInput,
} from "@/types";
import { jsonToFormData } from "@/utils";
import api from "@/utils/api";
import { BaseService } from "./base.service";

class AuthService extends BaseService {
  async register(input: TRegisterInput) {
    return api.post<IUser>(
      `${apiBaseUrl}/api/v1/auth/register`,
      jsonToFormData(input),
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }

  async updateUser(input: TUpdateAuthUserInput) {
    return api.post<IUser>(
      `${apiBaseUrl}/api/v1/auth/user`,
      jsonToFormData(input),
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(await this.applyAccessToken()),
        },
      }
    );
  }

  async login(input: TLoginInput) {
    return api.post<void>(`${apiBaseUrl}/api/v1/auth/login`, input);
  }

  async devLogin(input: TLoginInput) {
    return api.post<{ accessToken: string }>(
      `${apiBaseUrl}/api/v1/auth/dev-login`,
      input
    );
  }

  async passwordReset(input: TPasswordResetInput) {
    return api.post<void>(`${apiBaseUrl}/api/v1/auth/password-reset`, input);
  }

  async changePassword(input: TChangePasswordInput) {
    return api.post<void>(`${apiBaseUrl}/api/v1/auth/change-password`, input, {
      headers: await this.applyAccessToken(),
    });
  }

  async getUser() {
    return api.get<IUser>(`${apiBaseUrl}/api/v1/auth/user`, undefined, {
      headers: await this.applyAccessToken(),
    });
  }
}

export const authService = new AuthService();
