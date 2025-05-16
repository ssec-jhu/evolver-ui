import { Link } from "react-router";
import ThemeController from "./ThemeController";
import clsx from "clsx";

export default function Navbar({ pathname = "" as string }): JSX.Element {
  return (
    <div className="">
      <div className="mx-auto max-w-6xl flex flex-wrap justify-between gap-4 min-h-16 items-center">
        <div className="flex-1">
          <div className="flex items-center space-x-1">
            <Link to="/" className="text-primary ">
              Evolver
            </Link>
          </div>
        </div>
        <div className="flex  gap-10">
          <Link
            tabIndex={0}
            role="button"
            className={clsx(
              "link",
              pathname !== "/devices" && "link-hover",
            )}
            to="/devices"
          >
            devices
          </Link>
          <ThemeController />
        </div>
      </div>
      <div className="divider h-0 m-0"></div>
    </div>
  );
}
