import { Link, isRouteErrorResponse } from "react-router";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";
import { ROUTES } from "~/utils/routes";

interface DefaultErrorBoundaryProps<T> {
  error: T;
  title?: string;
  subtitle?: string;
}

export function DefaultErrorBoundary<T>({
  error,
  title = "Something went wrong",
  subtitle = "An error occurred while loading this page.",
}: DefaultErrorBoundaryProps<T>) {
  return (
    <div className="flex flex-col gap-4 bg-base-300 p-4 rounded-box">
      <WrenchScrewdriverIcon className="w-10 h-10" />

      <h1 className="font-mono">{title}</h1>
      <p>{subtitle}</p>

      <div>
        {isRouteErrorResponse(error) && (
          <>
            <h1>
              {error.status} {error.statusText}
            </h1>
            <p>{error.data}</p>
          </>
        )}
        {error instanceof Error && (
          <div>
            <h1>message</h1>
            <p>{error.message}</p>
          </div>
        )}
      </div>

      <Link to={ROUTES.static.devices} className="link">
        back to devices
      </Link>
    </div>
  );
}
