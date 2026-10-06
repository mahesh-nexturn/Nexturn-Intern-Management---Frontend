// Real backend-backed auth helpers. Kept as thin wrappers so existing
// localStorage-based role checks throughout the app (e.g. `role === "HR"`)
// continue to work without touching every page.
import { getAccessToken } from "./api";

export const logoutUser = () => {
  localStorage.removeItem("role");
  localStorage.removeItem("email");
  localStorage.removeItem("name");
  localStorage.removeItem("userId");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const getCurrentUser = () => {
  return {
    role: localStorage.getItem("role"),
    email: localStorage.getItem("email"),
    name: localStorage.getItem("name"),
    id: localStorage.getItem("userId"),
  };
};

export const isLoggedIn = () => {
  return !!getAccessToken() && !!localStorage.getItem("role");
};