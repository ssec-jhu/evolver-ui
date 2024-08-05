import { MoonIcon, SunIcon } from "@heroicons/react/24/solid";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { loader } from "../root";

export default function ThemeController() {
  const fetcher = useFetcher();
  const { theme } = useLoaderData<typeof loader>();

  return (
    <label className="swap swap-rotate pt-2">
      <div className="hidden">switch theme</div>
      <input
        type="checkbox"
        role="switch"
        name="theme"
        value={theme === "dark" ? "light" : "dark"}
        onChange={() => {
          const formData = new FormData();
          formData.set("theme", theme === "dark" ? "light" : "dark");
          fetcher.submit(formData, { method: "POST" });
        }}
      ></input>
      <SunIcon title="sun" className="swap-off h-6 w-6  fill-current" />
      <MoonIcon title="moon" className="swap-on h-6 w-6 fill-current" />
    </label>
  );
}
