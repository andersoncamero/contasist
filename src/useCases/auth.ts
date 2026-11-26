import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/entities/User";
import { API_BASE_URL } from "@/services/apiConfig";

export interface AuthActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  hasCheckedSession: boolean;
  isLoading: boolean;

  register: (
    email: string,
    password: string,
    name: string,
    role?: string
  ) => Promise<AuthActionResult>;

  login: (
    email: string,
    password: string
  ) => Promise<AuthActionResult>;
  checkSession: () => Promise<boolean>;
  forgotPassword: (email: string) => Promise<AuthActionResult>;
  resetPassword: (
    token: string,
    newPassword: string
  ) => Promise<AuthActionResult>;
  logout: () => Promise<void>;
  getAuthHeader: () => object;
}

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

interface RawUserPayload {
  id?: string | number;
  _id?: string | number;
  email?: string;
  name?: string;
  role?: string;
  business_id?: string | number;
  businessId?: string | number;
  companyId?: string | number;
  created_at?: string;
  createdAt?: string;
}

let inFlightSessionCheck: Promise<boolean> | null = null;

const mapUserPayload = (rawUser: RawUserPayload, fallbackEmail = "", fallbackName = ""): User => ({
  id: String(rawUser?.id || rawUser?._id || ""),
  email: String(rawUser?.email || fallbackEmail),
  name: String(rawUser?.name || fallbackName),
  role: rawUser?.role === "user" ? "user" : "admin",
  business_id: String(rawUser?.business_id || rawUser?.businessId || rawUser?.companyId || ""),
  createdAt: rawUser?.created_at
    ? new Date(rawUser.created_at)
    : rawUser?.createdAt
      ? new Date(rawUser.createdAt)
      : new Date(),
});

const parseAuthPayload = async (response: Response): Promise<ApiErrorResponse> => {
  const raw = await response.text();
  if (!raw.trim()) {
    return {};
  }
  try {
    return JSON.parse(raw) as ApiErrorResponse;
  } catch {
    return { message: raw };
  }
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      currentUser: null,
      isAuthenticated: false,
      hasCheckedSession: false,
      isLoading: false,

      register: async (email, password, name, role = "admin") => {
        set({ isLoading: true });

        try {
          const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ name, email, password, role }),
          });

          const data = await response.json();

          if (!response.ok) {
            const errorData = data as ApiErrorResponse;
            set({ isLoading: false });
            return {
              success: false,
              error:
                errorData.message ||
                errorData.error ||
                "Ocurrió un error en el registro",
            };
          }

          localStorage.removeItem("active_company_id");

          const rawUser = data?.user || data?.data?.user || data?.data || data || {};

          const user: User = {
            id: String(rawUser?.id || rawUser?._id || ""),
            email: String(rawUser?.email || email),
            name: String(rawUser?.name || name),
            role: (rawUser?.role as "admin" | "user") || "admin",
            business_id: String(rawUser?.business_id || rawUser?.businessId || ""),
            createdAt: rawUser?.created_at
              ? new Date(rawUser.created_at)
              : rawUser?.createdAt
              ? new Date(rawUser.createdAt)
              : new Date(),
          };

          set({
            currentUser: user,
            isAuthenticated: true,
            hasCheckedSession: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          console.error("Error en registro:", error);
          set({ isLoading: false });
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "No se pudo conectar con el servidor",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      login: async (email, password) => {
        set({ isLoading: true });

        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            set({ isLoading: false });
            return {
              success: false,
              error: "Credenciales inválidas o error en el servidor",
            };
          }

          localStorage.removeItem("active_company_id");

          const data = await response.json();
          const rawUser = data?.user || data?.data?.user || data?.userProfile || null;

          const user: User | null = rawUser
            ? {
                id: String(rawUser?.id || rawUser?._id || ""),
                email: String(rawUser?.email || email),
                name: String(rawUser?.name || ""),
                role: (rawUser?.role as "admin" | "user") || "admin",
                business_id: String(rawUser?.business_id || rawUser?.businessId || ""),
                createdAt: rawUser?.created_at ? new Date(rawUser.created_at) : new Date(),
              }
            : null;

          set({
            currentUser: user,
            isAuthenticated: true,
            hasCheckedSession: true,
            isLoading: false,
          });

          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: "No se pudo conectar con el servidor",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      checkSession: async () => {
        if (inFlightSessionCheck) {
          return inFlightSessionCheck;
        }

        inFlightSessionCheck = (async () => {
          try {
            const response = await fetch(`${API_BASE_URL}/auth/me`, {
              method: "GET",
              credentials: "include",
            });

            if (!response.ok) {
              localStorage.removeItem("active_company_id");
              set({
                currentUser: null,
                isAuthenticated: false,
                hasCheckedSession: true,
                isLoading: false,
              });
              return false;
            }

            const data = (await response.json()) as { user?: RawUserPayload };
            const user = data?.user ? mapUserPayload(data.user) : null;

            set({
              currentUser: user,
              isAuthenticated: Boolean(user),
              hasCheckedSession: true,
              isLoading: false,
            });
            return Boolean(user);
          } catch {
            set({
              currentUser: null,
              isAuthenticated: false,
              hasCheckedSession: true,
              isLoading: false,
            });
            return false;
          } finally {
            inFlightSessionCheck = null;
          }
        })();

        return inFlightSessionCheck;
      },

      forgotPassword: async (email) => {
        set({ isLoading: true });

        try {
          const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ email: email.trim() }),
          });

          const payload = await parseAuthPayload(response);
          if (!response.ok) {
            return {
              success: false,
              error:
                payload.message ||
                payload.error ||
                "No se pudo enviar el correo de recuperación",
            };
          }

          return {
            success: true,
            message:
              payload.message ||
              "Si el correo existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña",
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "No se pudo conectar con el servidor",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      resetPassword: async (token, newPassword) => {
        set({ isLoading: true });

        try {
          const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ token: token.trim(), newPassword }),
          });

          const payload = await parseAuthPayload(response);
          if (!response.ok) {
            const isInvalidToken =
              response.status === 400 &&
              typeof payload.message === "string" &&
              payload.message.includes("Invalid or expired");

            return {
              success: false,
              error: isInvalidToken
                ? "El enlace de recuperación es inválido o ha expirado"
                : payload.message ||
                  payload.error ||
                  "No se pudo actualizar la contraseña",
            };
          }

          return {
            success: true,
            message: payload.message || "Contraseña actualizada correctamente",
          };
        } catch (error) {
          return {
            success: false,
            error:
              error instanceof Error
                ? error.message
                : "No se pudo conectar con el servidor",
          };
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          await fetch(`${API_BASE_URL}/auth/logout`, {
            method: "POST",
            credentials: "include",
          });
        } catch (error) {
          console.error("Error al cerrar sesión:", error);
        }
        localStorage.removeItem("active_company_id");
        set({
          currentUser: null,
          isAuthenticated: false,
          hasCheckedSession: true,
        });
      },

      getAuthHeader: () => {
        return {};
      },

    }),
    {
      name: "ContAsist-auth",
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
;
