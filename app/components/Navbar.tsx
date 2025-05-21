import { Link } from "react-router";
import ThemeController from "./ThemeController";
import clsx from "clsx";
import { ROUTES } from "../utils/routes";

export default function Navbar({ pathname = "" as string }): JSX.Element {
  return (
    <div className="">
      <div className="mx-auto max-w-6xl flex flex-wrap justify-between gap-4 min-h-16 items-center">
        <div className="flex-1">
          <div className="flex items-center space-x-1">
            <Link to={ROUTES.static.root} className="text-primary ">
              eVolver
            </Link>
          </div>
        </div>
        <div className="flex  gap-10">
          <Link
            tabIndex={0}
            role="button"
            className={clsx(
              "link",
              pathname !== ROUTES.static.devices && "link-hover",
            )}
            to={ROUTES.static.devices}
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
