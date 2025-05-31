export interface IPaginatedQuery
  extends Record<string, string | number | boolean | Date | undefined> {
  page?: number;
  perPage?: number;
  orderBy?: string;
  orderDir?: "ASC" | "DESC";
}
