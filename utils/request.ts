import { flatMap, isArray, isDate, isUndefined, map } from "lodash";

export function objectToQueryString(
  obj?: Record<
    string,
    | string
    | number
    | boolean
    | Date
    | undefined
    | Array<string | number | boolean | Date | undefined>
  >
): string {
  if (!obj) {
    return "";
  }

  const queryString = flatMap(obj, (value, key) => {
    // Skip undefined values
    if (isUndefined(value)) {
      return [];
    }

    // Handle arrays
    if (isArray(value)) {
      if (!value.length) {
        return [];
      }
      return map(value, (item, index) => {
        return `${encodeURIComponent(key)}[${index}]=${encodeURIComponent(
          isDate(item) ? (item as Date).toISOString() : item?.toString() ?? ""
        )}`;
      });
    }

    // Handle other types (string, number, boolean, Date)
    return `${encodeURIComponent(key)}=${encodeURIComponent(
      isDate(value) ? (value as Date).toISOString() : value.toString()
    )}`;
  });

  return queryString.length > 0 ? "?" + queryString.join("&") : "";
}

export function jsonToFormData(input: Record<string, unknown>) {
  const formData = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value as string | Blob);
    }
  });
  return formData;
}
