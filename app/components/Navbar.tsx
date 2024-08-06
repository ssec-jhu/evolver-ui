import { Link } from "@remix-run/react";
import ThemeController from "./ThemeController";
import clsx from "clsx";

export default function Navbar({ pathname = "" as string }): JSX.Element {
  return (
    <div className="">
      <div className="mx-auto max-w-6xl flex flex-wrap justify-between gap-10 min-h-16 items-center">
        <div className="flex-1">
          <div className="flex items-center space-x-1">
            <Link to="/" className="text-3xl text-primary">
              Evolver
            </Link>
          </div>
        </div>
        <div className="flex-none">
          <Link
            tabIndex={0}
            role="button"
            className={clsx(
              "link",
              pathname !== "/devices/list" && "link-hover",
            )}
            to="/devices/list"
          >
            Devices
          </Link>
        </div>
        <div className="flex-none">
          <ThemeController />
        </div>
      </div>
      <div className="divider h-0 m-0"></div>
    </div>
  );
}
