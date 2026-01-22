/**
 * Fonctions utilitaires pour conversion camelCase <-> snake_case
 * Utilisé pour synchroniser les données entre frontend (camelCase) et backend (snake_case)
 */

/**
 * Convertit une chaîne camelCase en snake_case
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convertit une chaîne snake_case en camelCase
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convertit récursivement toutes les clés d'un objet de camelCase vers snake_case
 */
export function objectToSnakeCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => objectToSnakeCase(item)) as any;
  }

  if (typeof obj !== "object") {
    return obj;
  }

  const result: any = {};

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
        result[snakeKey] = objectToSnakeCase(value);
      } else if (Array.isArray(value)) {
        result[snakeKey] = value.map((item) =>
          typeof item === "object" ? objectToSnakeCase(item) : item,
        );
      } else {
        result[snakeKey] = value;
      }
    }
  }

  return result;
}

/**
 * Convertit récursivement toutes les clés d'un objet de snake_case vers camelCase
 */
export function objectToCamelCase<T = any>(obj: any): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => objectToCamelCase(item)) as any;
  }

  if (typeof obj !== "object") {
    return obj;
  }

  const result: any = {};

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
        result[camelKey] = objectToCamelCase(value);
      } else if (Array.isArray(value)) {
        result[camelKey] = value.map((item) =>
          typeof item === "object" ? objectToCamelCase(item) : item,
        );
      } else {
        result[camelKey] = value;
      }
    }
  }

  return result;
}

/**
 * Convertit les paramètres de requête en snake_case pour l'API
 */
export function queryParamsToSnakeCase(params: Record<string, any>): string {
  const snakeParams = objectToSnakeCase(params);
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(snakeParams)) {
    if (value !== null && value !== undefined) {
      searchParams.append(key, String(value));
    }
  }

  return searchParams.toString();
}
