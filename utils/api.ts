import { objectToQueryString } from "./request";

class Api {
  async request(url: string, options?: RequestInit) {
    const result = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      } as RequestInit["headers"],
    });

    const data =
      result.headers.get("content-length") !== "0"
        ? await result.json?.()
        : undefined;

    if (!result.ok) {
      throw data;
    }

    return data;
  }

  async get<T = unknown>(
    url: string,
    query?: Record<
      string,
      | string
      | number
      | boolean
      | Date
      | undefined
      | Array<string | number | boolean | Date | undefined>
    >,
    options?: RequestInit
  ): Promise<T> {
    return this.request(`${url}${query ? objectToQueryString(query) : ""}`, {
      ...options,
      method: "get",
    });
  }

  async post<T = unknown>(
    url: string,
    data?: Record<string, unknown> | FormData,
    options?: RequestInit
  ): Promise<T> {
    return this.request(url, {
      ...options,
      body: data instanceof FormData ? data : data && JSON.stringify(data),
      method: "post",
    });
  }

  async put<T = unknown>(
    url: string,
    data?: Record<string, unknown> | FormData,
    options?: RequestInit
  ): Promise<T> {
    return this.request(url, {
      ...options,
      body: data instanceof FormData ? data : data && JSON.stringify(data),
      method: "put",
    });
  }

  async patch<T = unknown>(
    url: string,
    data?: Record<string, unknown> | FormData,
    options?: RequestInit
  ): Promise<T> {
    return this.request(url, {
      ...options,
      body: data && JSON.stringify(data),
      method: "patch",
    });
  }

  async delete<T = unknown>(
    url: string,
    data?: Record<string, unknown>,
    options?: RequestInit
  ): Promise<T> {
    return this.request(url, {
      ...options,
      body: data && JSON.stringify(data),
      method: "delete",
    });
  }
}

const api = new Api();

export default api;

export const addTokenToHeader = (token: string) => {
  return { Authorization: `Bearer ${token}` };
};
