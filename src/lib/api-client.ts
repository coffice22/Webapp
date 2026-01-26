/**
 * Client API pour MySQL/PHP Backend
 * Version optimisée sans console.log
 */

import { objectToSnakeCase, objectToCamelCase } from "../utils/case-converter";
import { logger } from "../utils/logger";
import { ERROR_MESSAGES } from "../constants/messages";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost/api";

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor() {
    this.token = localStorage.getItem("auth_token");
    this.refreshToken = localStorage.getItem("refresh_token");

    if (!import.meta.env.VITE_API_URL) {
      logger.warn(
        `[API] VITE_API_URL non configuré, utilisation par défaut: ${API_URL}`,
      );
    } else {
      logger.info(`[API] URL configurée: ${API_URL}`);
    }

    logger.info("API Client initialized");
  }

  setToken(token: string | null, refreshToken?: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("auth_token", token);
    } else {
      localStorage.removeItem("auth_token");
    }

    if (refreshToken !== undefined) {
      this.refreshToken = refreshToken;
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      } else {
        localStorage.removeItem("refresh_token");
      }
    }
  }

  getToken(): string | null {
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("auth_token");
    }
    return this.token;
  }

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      this.refreshToken = localStorage.getItem("refresh_token");
    }
    return this.refreshToken;
  }

  private isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const parts = token.split(".");
      if (parts.length !== 3) return true;

      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      const exp = payload.exp * 1000;
      const now = Date.now();

      return now >= exp;
    } catch {
      return true;
    }
  }

  private isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      const payload = JSON.parse(
        atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
      );
      const exp = payload.exp * 1000;
      const now = Date.now();
      const timeLeft = exp - now;

      return timeLeft < 5 * 60 * 1000;
    } catch {
      return false;
    }
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const response = await fetch(`${API_URL}/auth/refresh.php`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
          throw new Error("Failed to refresh token");
        }

        const data = await response.json();

        if (data.success && data.data) {
          this.setToken(data.data.token, data.data.refreshToken);
          return data.data.token;
        }

        throw new Error("Invalid refresh response");
      } catch (error) {
        this.handleAuthError();
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryWithRefresh = true,
    retryCount = 0,
  ): Promise<ApiResponse<T>> {
    const MAX_RETRIES = 3;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    const publicEndpoints = ["/auth/login.php", "/auth/register.php"];
    const isPublicEndpoint = publicEndpoints.some((ep) =>
      endpoint.includes(ep),
    );

    if (!isPublicEndpoint) {
      if (this.isTokenExpired()) {
        logger.debug("Token expired, refreshing before request");
        try {
          await this.refreshAccessToken();
        } catch (error) {
          logger.error("Cannot refresh expired token:", error);
          this.handleAuthError();
          return {
            success: false,
            error: ERROR_MESSAGES.SESSION_EXPIRED,
          };
        }
      } else if (this.isTokenExpiringSoon() && retryWithRefresh) {
        logger.debug("Token expires soon, refreshing proactively");
        try {
          await this.refreshAccessToken();
        } catch (error) {
          logger.warn(
            "Proactive refresh failed, continuing with current token",
          );
        }
      }

      const currentToken = this.getToken();
      if (!currentToken) {
        logger.error("No token available for authenticated endpoint");
        this.handleAuthError();
        return {
          success: false,
          error: ERROR_MESSAGES.UNAUTHORIZED,
        };
      }

      headers["Authorization"] = `Bearer ${currentToken}`;
    }

    const url = `${API_URL}${endpoint}`;
    logger.debug(`Request: ${options.method || "GET"} ${url}`);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      logger.debug(`Response status: ${response.status}`);

      let data: any;
      const contentType = response.headers.get("content-type");

      if (contentType?.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        logger.error("[API] Non-JSON response:", {
          url,
          status: response.status,
          contentType,
          preview: text.substring(0, 200),
        });

        if (response.status >= 500 && retryCount < MAX_RETRIES) {
          logger.debug(
            `Server error, retrying... (${retryCount + 1}/${MAX_RETRIES})`,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (retryCount + 1)),
          );
          return this.request<T>(
            endpoint,
            options,
            retryWithRefresh,
            retryCount + 1,
          );
        }

        throw new Error(
          `Erreur serveur (${response.status}): Le serveur n'a pas renvoyé de réponse JSON valide`,
        );
      }

      if (response.status === 401) {
        logger.error("401 Unauthorized received");

        if (retryWithRefresh && !isPublicEndpoint) {
          logger.debug("Attempting token refresh after 401");
          try {
            await this.refreshAccessToken();
            logger.debug("Token refreshed successfully, retrying request");
            return this.request<T>(endpoint, options, false, retryCount);
          } catch (refreshError) {
            logger.error("Refresh failed after 401:", refreshError);
            this.handleAuthError();
            throw new Error(data.error || ERROR_MESSAGES.SESSION_EXPIRED);
          }
        } else {
          this.handleAuthError();
          throw new Error(data.error || ERROR_MESSAGES.SESSION_EXPIRED);
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error || data.message || ERROR_MESSAGES.SERVER_ERROR,
        );
      }

      return data;
    } catch (error: any) {
      logger.error("[API] Request failed:", {
        url,
        method: options.method || "GET",
        error: error.message,
      });

      if (error.message === "Failed to fetch" && retryCount < MAX_RETRIES) {
        logger.debug(
          `Network error, retrying... (${retryCount + 1}/${MAX_RETRIES})`,
        );
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (retryCount + 1)),
        );
        return this.request<T>(
          endpoint,
          options,
          retryWithRefresh,
          retryCount + 1,
        );
      }

      if (error.message === "Failed to fetch") {
        return {
          success: false,
          error: `Impossible de contacter l'API (${API_URL}). Vérifiez que le serveur est accessible.`,
        };
      }

      return {
        success: false,
        error: error.message || ERROR_MESSAGES.UNKNOWN_ERROR,
      };
    }
  }

  private handleAuthError() {
    logger.warn("Session expired - cleaning up");
    this.setToken(null, null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("coffice-auth");

      const protectedPaths = [
        "/app",
        "/erp",
        "/dashboard",
        "/tableau-de-bord",
        "/admin",
        "/profil",
        "/reservations",
        "/mes-reservations",
      ];
      const currentPath = window.location.pathname;
      const isProtectedPage = protectedPaths.some(
        (path) => currentPath.startsWith(path) || currentPath.includes(path),
      );

      if (isProtectedPage && !currentPath.includes("/connexion")) {
        logger.info("Redirecting to login - session expired");
        window.location.href = "/connexion?session_expired=1";
      }
    }
  }

  async login(email: string, password: string) {
    return this.request("/auth/login.php", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    email: string;
    password: string;
    nom: string;
    prenom: string;
    telephone?: string;
    profession?: string;
    entreprise?: string;
    codeParrainage?: string;
  }) {
    const snakeCaseData = objectToSnakeCase(data);
    return this.request("/auth/register.php", {
      method: "POST",
      body: JSON.stringify(snakeCaseData),
    });
  }

  async me() {
    return this.request("/auth/me.php");
  }

  async logout() {
    try {
      await this.request("/auth/logout.php", {
        method: "POST",
      });
    } catch (error) {
      logger.warn("Error calling logout API:", error);
    } finally {
      this.setToken(null, null);
    }
    return { success: true, message: "Déconnexion réussie" };
  }

  // ============= UTILISATEURS =============
  async getUsers() {
    return this.request("/users/index.php");
  }

  async getUser(id: string) {
    return this.request(`/users/show.php?id=${id}`);
  }

  async updateUser(id: string, data: any) {
    const snakeCaseData = objectToSnakeCase(data);
    return this.request(`/users/update.php?id=${id}`, {
      method: "PUT",
      body: JSON.stringify(snakeCaseData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/delete.php?id=${id}`, {
      method: "DELETE",
    });
  }

  // ============= ESPACES =============
  async getEspaces() {
    return this.request("/espaces/index.php");
  }

  async getEspace(id: string) {
    return this.request(`/espaces/show.php?id=${id}`);
  }

  async createEspace(data: any) {
    const snakeCaseData = objectToSnakeCase(data);
    return this.request("/espaces/create.php", {
      method: "POST",
      body: JSON.stringify(snakeCaseData),
    });
  }

  async updateEspace(id: string, data: any) {
    const snakeCaseData = objectToSnakeCase(data);
    return this.request("/espaces/update.php", {
      method: "PUT",
      body: JSON.stringify({ id, ...snakeCaseData }),
    });
  }

  async deleteEspace(id: string) {
    return this.request("/espaces/delete.php", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
  }

  // ============= RÉSERVATIONS =============
  async getReservations(userId?: string) {
    const query = userId ? `?user_id=${userId}` : "";
    return this.request(`/reservations/index.php${query}`);
  }

  async getReservation(id: string) {
    return this.request(`/reservations/show.php?id=${id}`);
  }

  async createReservation(data: {
    espaceId: string;
    dateDebut: string;
    dateFin: string;
    participants?: number;
    notes?: string;
    codePromo?: string;
    montantTotal?: number;
  }) {
    const apiData = {
      espace_id: data.espaceId,
      date_debut: data.dateDebut,
      date_fin: data.dateFin,
      participants: data.participants || 1,
      notes: data.notes || null,
      code_promo: data.codePromo || null,
      montant_total: data.montantTotal || 0,
      statut: "en_attente",
      type_reservation: "heure",
      mode_paiement: null,
      montant_paye: 0,
    };

    return this.request("/reservations/create.php", {
      method: "POST",
      body: JSON.stringify(apiData),
    });
  }

  async updateReservation(id: string, data: any) {
    const snakeCaseData = objectToSnakeCase(data);
    return this.request("/reservations/update.php", {
      method: "PUT",
      body: JSON.stringify({ id, ...snakeCaseData }),
    });
  }

  async cancelReservation(id: string) {
    return this.request("/reservations/cancel.php", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }

  // ============= DOMICILIATION =============
  async getDomiciliations() {
    return this.request("/domiciliations/index.php");
  }

  async getUserDomiciliation(userId: string) {
    return this.request(`/domiciliations/user.php?user_id=${userId}`);
  }

  async createDemandeDomiciliation(data: any) {
    const transformedData: any = { ...data };

    if (data.representantLegal) {
      transformedData.representant_nom = data.representantLegal.nom;
      transformedData.representant_prenom = data.representantLegal.prenom;
      transformedData.representant_fonction = data.representantLegal.fonction;
      transformedData.representant_telephone = data.representantLegal.telephone;
      transformedData.representant_email = data.representantLegal.email;
      delete transformedData.representantLegal;
    }

    const snakeCaseData = objectToSnakeCase(transformedData);
    return this.request("/domiciliations/create.php", {
      method: "POST",
      body: JSON.stringify(snakeCaseData),
    });
  }

  async updateDemandeDomiciliation(id: string, data: any) {
    const transformedData: any = { id, ...data };

    if (data.representantLegal) {
      transformedData.representant_nom = data.representantLegal.nom;
      transformedData.representant_prenom = data.representantLegal.prenom;
      transformedData.representant_fonction = data.representantLegal.fonction;
      transformedData.representant_telephone = data.representantLegal.telephone;
      transformedData.representant_email = data.representantLegal.email;
      delete transformedData.representantLegal;
    }

    const snakeCaseData = objectToSnakeCase(transformedData);
    return this.request("/domiciliations/update.php", {
      method: "PUT",
      body: JSON.stringify(snakeCaseData),
    });
  }

  async validateDomiciliation(id: string) {
    return this.request("/domiciliations/validate.php", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }

  async rejectDomiciliation(id: string, motif: string) {
    return this.request("/domiciliations/reject.php", {
      method: "POST",
      body: JSON.stringify({ id, motif }),
    });
  }

  async activateDomiciliation(id: string) {
    return this.request("/domiciliations/activate.php", {
      method: "POST",
      body: JSON.stringify({ id }),
    });
  }

  // ============= ABONNEMENTS =============
  async getAbonnements() {
    return this.request("/abonnements/index.php");
  }

  async createAbonnement(data: any) {
    const snakeCaseData = objectToSnakeCase(data);
    return this.request("/abonnements/create.php", {
      method: "POST",
      body: JSON.stringify(snakeCaseData),
    });
  }

  async updateAbonnement(id: string, data: any) {
    const snakeCaseData = objectToSnakeCase(data);
    return this.request("/abonnements/update.php", {
      method: "PUT",
      body: JSON.stringify({ id, ...snakeCaseData }),
    });
  }

  async deleteAbonnement(id: string) {
    return this.request("/abonnements/delete.php", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
  }

  // ============= CODES PROMO =============
  async validateCodePromo(code: string, montant: number, type: string) {
    return this.request("/codes-promo/validate.php", {
      method: "POST",
      body: JSON.stringify({ code, montant, type }),
    }).then((response) => {
      if (response.success && response.data) {
        const data = response.data as any;
        return {
          valid: true,
          codePromoId: data.id || data.code,
          reduction: data.reduction || 0,
        };
      }
      return {
        valid: false,
        error: response.error || "Code invalide",
      };
    });
  }

  async getCodesPromo() {
    return this.request("/codes-promo/index.php");
  }

  async createCodePromo(data: any) {
    const snakeCaseData = objectToSnakeCase(data);
    return this.request("/codes-promo/create.php", {
      method: "POST",
      body: JSON.stringify(snakeCaseData),
    });
  }

  async updateCodePromo(id: string, data: any) {
    const snakeCaseData = objectToSnakeCase(data);
    return this.request(
      `/codes-promo/update.php?id=${encodeURIComponent(id)}`,
      {
        method: "PUT",
        body: JSON.stringify(snakeCaseData),
      },
    );
  }

  async deleteCodePromo(id: string) {
    return this.request(
      `/codes-promo/delete.php?id=${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );
  }

  // ============= PARRAINAGES =============
  async getParrainages(userId?: string) {
    const query = userId ? `?user_id=${userId}` : "";
    return this.request(`/parrainages/index.php${query}`);
  }

  async verifyCodeParrainage(code: string) {
    return this.request("/parrainages/verify.php", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
  }

  // ============= STATISTIQUES =============
  async getAdminStats() {
    return this.request("/admin/stats.php");
  }

  async getRevenue(period = "month") {
    return this.request(`/admin/revenue.php?period=${period}`);
  }

  // ============= NOTIFICATIONS =============
  async getNotifications() {
    return this.request("/notifications/index.php");
  }

  async markNotificationRead(id: string) {
    return this.request(`/notifications/read.php?id=${id}`, {
      method: "PUT",
    });
  }

  async markAllNotificationsRead() {
    return this.request("/notifications/read-all.php", {
      method: "PUT",
    });
  }

  async deleteNotification(id: string) {
    return this.request(`/notifications/delete.php?id=${id}`, {
      method: "DELETE",
    });
  }

  // ============= GENERIC METHODS =============
  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
export default apiClient;
