type Primitive = string | number | boolean | null | undefined;
type JsonValue = Primitive | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function objectToSnakeCase<T extends JsonObject = JsonObject>(
  obj: JsonValue,
): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      objectToSnakeCase(item as JsonObject),
    ) as unknown as T;
  }

  if (typeof obj !== "object") {
    return obj as T;
  }

  if (obj instanceof Date) {
    return obj as unknown as T;
  }

  const result: JsonObject = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = camelToSnake(key);
      const value = obj[key];

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        result[snakeKey] = objectToSnakeCase(value as JsonObject);
      } else if (Array.isArray(value)) {
        result[snakeKey] = value.map((item) =>
          typeof item === "object" && item !== null
            ? objectToSnakeCase(item as JsonObject)
            : item,
        );
      } else {
        result[snakeKey] = value;
      }
    }
  }

  return result as T;
}

export function objectToCamelCase<T extends JsonObject = JsonObject>(
  obj: JsonValue,
): T {
  if (obj === null || obj === undefined) {
    return obj as T;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) =>
      objectToCamelCase(item as JsonObject),
    ) as unknown as T;
  }

  if (typeof obj !== "object") {
    return obj as T;
  }

  if (obj instanceof Date) {
    return obj as unknown as T;
  }

  const result: JsonObject = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const camelKey = snakeToCamel(key);
      const value = obj[key];

      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        result[camelKey] = objectToCamelCase(value as JsonObject);
      } else if (Array.isArray(value)) {
        result[camelKey] = value.map((item) =>
          typeof item === "object" && item !== null
            ? objectToCamelCase(item as JsonObject)
            : item,
        );
      } else {
        result[camelKey] = value;
      }
    }
  }

  return result as T;
}

export function queryParamsToSnakeCase(
  params: Record<string, JsonValue>,
): string {
  const snakeParams = objectToSnakeCase(params);
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(snakeParams)) {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}
