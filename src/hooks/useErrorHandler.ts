import { useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { logger } from "../utils/logger";

interface ErrorHandlerOptions {
  showToast?: boolean;
  redirectOnAuth?: boolean;
  customMessage?: string;
}

interface ErrorWithDetails extends Error {
  code?: string;
  status?: number;
}

export const useErrorHandler = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();

  const handleError = useCallback(
    (
      error: Error | ErrorWithDetails | unknown,
      options: ErrorHandlerOptions = {},
    ) => {
      const {
        showToast = true,
        redirectOnAuth = true,
        customMessage,
      } = options;

      const errorObj = error as ErrorWithDetails;

      logger.error("Error caught", {
        error: errorObj?.message || String(error),
        code: errorObj?.code,
        status: errorObj?.status,
        stack: errorObj?.stack,
      });

      let message = customMessage || "Une erreur est survenue";

      if (errorObj?.message) {
        message = errorObj.message;
      }

      if (errorObj?.code === "PGRST301" || errorObj?.status === 401) {
        message = "Session expirée. Veuillez vous reconnecter.";
        if (redirectOnAuth) {
          logout();
          navigate("/connexion", { replace: true });
        }
      } else if (errorObj?.code === "PGRST116") {
        message = "Données introuvables";
      } else if (errorObj?.code === "23505") {
        message = "Cette donnée existe déjà";
      } else if (errorObj?.code === "23503") {
        message = "Référence invalide";
      } else if (errorObj?.message?.includes("network")) {
        message = "Erreur de connexion. Vérifiez votre internet.";
      }

      if (showToast) {
        toast.error(message);
      }

      return { message, handled: true };
    },
    [navigate, logout],
  );

  return { handleError };
};
