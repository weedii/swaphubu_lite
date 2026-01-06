import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import Cookies from "js-cookie";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Authentication utilities
export const getAuthToken = (): string | undefined => {
  return Cookies.get("access_token");
};

export const setAuthToken = (token: string, expires: number = 7): void => {
  Cookies.set("access_token", token, { expires });
};

export const removeAuthToken = (): void => {
  Cookies.remove("access_token");
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Admin role utilities
export const isUserAdmin = (user: any): boolean => {
  return user?.is_admin === true;
};
