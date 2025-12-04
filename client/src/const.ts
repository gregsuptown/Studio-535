export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "Studio 535";

export const APP_LOGO = "https://placehold.co/128x128/E1E7EF/1F2937?text=535";

// Login URL - simple redirect to login page
export const getLoginUrl = () => "/login";
