import { IPaginatedQuery, IPaginatedResponse, IUser } from "@/types";
import api from "@/utils/api";
import { BaseService } from "./base.service";

class UsersService extends BaseService {
  async paginated(query?: IPaginatedQuery) {
    return api.get<IPaginatedResponse<IUser>>(
      `${this.apiBaseUrl}/api/v1/users`,
      query,
      {
        headers: await this.applyAccessToken(),
      }
    );
  }
}

export const usersService = new UsersService();
