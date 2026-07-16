export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  PROMPT_MANAGEMENT: "/dashboard/prompt-management",
  PROMPT_DETAIL: (id: string) => `/dashboard/prompt-management/${id}`,
};
