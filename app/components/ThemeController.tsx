import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { useFetcher, useLoaderData, useLocation } from "react-router";

export default function ThemeController() {
  const { pathname, search } = useLocation();

  // depends on root.tsx action returning a redirect with Set-Cookie header
  const fetcher = useFetcher();

  // depends on root.tsx loader returning a theme
  const { theme } = useLoaderData();

  return (
    <label className="swap swap-rotate">
      {/* this hidden checkbox controls the state */}
      <input
        type="checkbox"
        role="switch"
        value={theme === "dark" ? "light" : "dark"}
        onChange={() => {
          const formData = new FormData();
          const newTheme = theme === "dark" ? "light" : "dark";
          formData.set("theme", newTheme);
          formData.set("redirectTo", pathname + search);
          // handled by the root action which updates the userPrefs cookie.
          fetcher.submit(formData, { method: "POST" });
        }}
      ></input>
      <SunIcon title="sun" className="swap-off h-6 w-6  fill-current" />
      <MoonIcon title="moon" className="swap-on h-6 w-6 fill-current" />
    </label>
  );
}
