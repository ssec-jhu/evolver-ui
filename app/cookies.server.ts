import { createCookie } from "react-router";

export const userPrefs = createCookie("prefs");

// Device info cookie to store the URL for the currently selected device
export const deviceInfo = createCookie("device-info", {
  path: "/",
  sameSite: "lax",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24, // 24 hours
});
