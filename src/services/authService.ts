// Real backend-backed auth helpers. Kept as thin wrappers so existing
// sessionStorage-based (per-tab) role checks throughout the app (e.g. `role === "HR"`)
// continue to work without touching every page.
import { getAccessToken } from "./api";

export const logoutUser = () => {
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("backendRole");
  sessionStorage.removeItem("email");
  sessionStorage.removeItem("name");
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("refreshToken");
};

export const getCurrentUser = () => {
  return {
    role: sessionStorage.getItem("role"),
    email: sessionStorage.getItem("email"),
    name: sessionStorage.getItem("name"),
    id: sessionStorage.getItem("userId"),
  };
};

// Super user (backend ADMIN) vs HR user (backend HR). Both have UI role "HR" (manage rights).
export const isAdminUser = () => sessionStorage.getItem("backendRole") === "ADMIN";
export const isHrUser = () => sessionStorage.getItem("backendRole") === "HR";

export const isLoggedIn = () => {
  return !!getAccessToken() && !!sessionStorage.getItem("role");
};