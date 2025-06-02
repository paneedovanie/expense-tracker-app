import {
  IGroup,
  IPaginatedQuery,
  IPaginatedResponse,
  TAddGroupMembersInput,
  TCreateGroupInput,
  TRemoveGroupMembersInput,
  TUpdateGroupInput,
} from "@/types";
import api from "@/utils/api";
import { BaseService } from "./base.service";
import { jsonToFormData } from "@/utils";

class GroupsService extends BaseService {
  async paginated(query?: IPaginatedQuery) {
    return api.get<IPaginatedResponse<IGroup>>(
      `${this.apiBaseUrl}/api/v1/groups`,
      query,
      {
        headers: await this.applyAccessToken(),
      }
    );
  }

  async get(id: string) {
    return api.get<IGroup>(
      `${this.apiBaseUrl}/api/v1/groups/${id}`,
      undefined,
      {
        headers: await this.applyAccessToken(),
      }
    );
  }

  async create(input: TCreateGroupInput) {
    return api.post<IGroup>(
      `${this.apiBaseUrl}/api/v1/groups`,
      jsonToFormData(input),
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(await this.applyAccessToken()),
        },
      }
    );
  }

  async update(id: string, input: TUpdateGroupInput) {
    return api.post<IGroup>(
      `${this.apiBaseUrl}/api/v1/groups/${id}`,
      jsonToFormData(input),
      {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(await this.applyAccessToken()),
        },
      }
    );
  }

  async addMembers(id: string, input: TAddGroupMembersInput) {
    return api.patch<void>(
      `${this.apiBaseUrl}/api/v1/groups/${id}/members`,
      input,
      {
        headers: await this.applyAccessToken(),
      }
    );
  }

  async removeMembers(id: string, input: TRemoveGroupMembersInput) {
    return api.delete<void>(
      `${this.apiBaseUrl}/api/v1/groups/${id}/members`,
      input,
      {
        headers: await this.applyAccessToken(),
      }
    );
  }
}

export const groupsService = new GroupsService();
