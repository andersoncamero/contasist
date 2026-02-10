import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/entities/User";
import { API_BASE_URL } from "./apiConfig";



interface AuthState {
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  register: (
    email: string,
    password: string,
    name: string
  ) => Promise<{ success: boolean; error?: string }>;

  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  getAuthHeader: () => { Authorization: string } | object;
}

interface ApiLoginResponse {
  token: string;
}

interface ApiRegisterResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
  };
}

interface ApiErrorResponse {
  error: string;
  message: string;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      register: async (email, password, name) => {
        set({ isLoading: true });

        try {
          const response = await fetch(`${API_BASE_URL}/auth/sign-up`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password, name }),
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
                "An unknown error occurred",
            };
          }

          const successData = data as ApiRegisterResponse;
          const user: User = {
            id: successData.user.id,
            email: successData.user.email,
            name: successData.user.name,
            role: successData.user.role as "admin" | "user",
            createdAt: new Date(successData.user.created_at),
          };

          set({
            currentUser: user,
            token: successData.token,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            error: "No se pudo conectar con el servidor",
          };
        } finally {
          set({ isLoading: false });
        }

        return { success: true };
      },

      login: async (email, password) => {
        set({ isLoading: true });

        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
          });

          if (!response.ok) {
            set({ isLoading: false });
            return {
              success: false,
              error:
                "An unknown error occurred",
            };
          }
          const data = await response.json();
          const successData = data as ApiLoginResponse;

          set({
            token: successData.token,
            isAuthenticated: true,
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
        return { success: true };
      },

      logout: () => {
        return set({
          currentUser: null,
          token: null,
          isAuthenticated: false,
        });
      },

      getAuthHeader: () => {
        const token = get().token;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
      
    }),
    {
      name: "ContAsist-auth",
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
