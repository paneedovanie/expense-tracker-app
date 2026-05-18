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

  const processValue = (key: string, value: unknown) => {
    if (value === undefined || value === null) {
      return;
    }

    if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else if (Array.isArray(value)) {
      // Handle arrays by appending each item with the same key
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          // For array of objects, stringify each object
          formData.append(`${key}[${index}]`, JSON.stringify(item));
        } else {
          formData.append(`${key}[${index}]`, String(item));
        }
      });
    } else if (typeof value === "object") {
      // Handle nested objects by stringifying them
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  };

  Object.entries(input).forEach(([key, value]) => {
    processValue(key, value);
  });

  return formData;
}
