export interface IPaginatedResponse<T> {
  data: T[];
  page: number;
  perPage: number;
  total: number;
}
