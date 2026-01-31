import { useMemo } from "react";

export function useFilteredData<T extends Record<string, unknown>>(
  data: T[],
  searchTerm: string,
  searchFields: (keyof T)[],
  filters: Record<string, unknown> = {},
): T[] {
  return useMemo(() => {
    return data.filter((item) => {
      // Vérifier si l'item correspond au terme de recherche
      const matchSearch =
        searchTerm === "" ||
        searchFields.some((field) => {
          const value = item[field];
          return (
            value &&
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
          );
        });

      if (!matchSearch) return false;

      // Vérifier si l'item correspond aux filtres
      const matchFilters = Object.entries(filters).every(
        ([key, filterValue]) => {
          if (
            filterValue === "tous" ||
            filterValue === "" ||
            filterValue === null ||
            filterValue === undefined
          ) {
            return true;
          }
          return item[key] === filterValue;
        },
      );

      return matchFilters;
    });
  }, [data, searchTerm, searchFields, filters]);
}

/**
 * Hook pour calculer des statistiques sur les données filtrées
 */
export function useDataStats<T>(
  data: T[],
  countField?: keyof T,
): {
  total: number;
  active?: number;
  inactive?: number;
} {
  return useMemo(() => {
    const result: { total: number; active?: number; inactive?: number } = {
      total: data.length,
    };

    if (countField) {
      result.active = data.filter((item) => item[countField] === "actif").length;
      result.inactive = data.filter(
        (item) => item[countField] === "inactif",
      ).length;
    }

    return result;
  }, [data, countField]);
}
