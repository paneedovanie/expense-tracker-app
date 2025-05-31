import { apiBaseUrl } from "@/constants/env";
import { accessTokenStore } from "@/stores";
import { getToken } from "@/utils";
import { addTokenToHeader } from "@/utils/api";
import { getDefaultStore } from "jotai";

const store = getDefaultStore();

export abstract class BaseService {
  protected apiBaseUrl = apiBaseUrl;

  protected async applyAccessToken() {
    const accessToken = store.get(accessTokenStore);
    if (!accessToken) {
      return {};
    }
    return addTokenToHeader(accessToken);
  }
}
