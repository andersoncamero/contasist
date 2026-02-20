export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8081/api/v1";

export const getAuthHeader = (): HeadersInit => {
  const authData = localStorage.getItem("ContAsist-auth");
  if (authData) {
    const { state } = JSON.parse(authData);
    if (state?.token) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.token}`,
      };
    }
  }

  return { 'Content-Type': 'application/json' };
};
