import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  json,
  useLoaderData,
  useLocation,
  useMatches,
  useRouteError,
  useSearchParams,
} from "@remix-run/react";
import { ReactNode } from "react";
import "~/tailwind.css";
import Navbar from "~/components/Navbar";
import { GlobalLoading } from "~/components/GlobalLoading";
import { db } from "~/utils/db.server";
import { userPrefs } from "~/cookies.server";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { getClientEnv } from "~/utils/env.server";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("Cookie");
  const cookie = (await userPrefs.parse(cookieHeader)) || {};
  const formData = await request.formData();
  let redirectTo = "./";

  if (formData.has("theme")) {
    const theme = formData.get("theme");
    true;

    if (formData.has("redirectTo")) {
      redirectTo = formData.get("redirectTo") as string;
    }

    cookie.theme = theme;
    // Update the theme cookie, redirect to the page the user was on when they toggled the theme
    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await userPrefs.serialize(cookie),
      },
    });
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  // read user preferences from the client's cookie, this means user preference can be persisted between refreshes.
  const cookieHeader = request.headers.get("Cookie");
  const cookie: { theme: "dark" | "light" } = (await userPrefs.parse(
    cookieHeader,
  )) || { theme: "dark" };

  try {
    // automatically add the local (running on same raspberry pi) device to the db
    await db.device.create({ data: { ip_addr: "127.0.0.1" } });
  } catch (error) {
    // succeed anyway the local device is already in the db
  }
  // make the theme available to the client side, daisy ui uses it to set the theme
  return json({ theme: cookie.theme, ENV: getClientEnv() });
}

export default function App() {
  const { theme } = useLoaderData<typeof loader>();
  const { pathname } = useLocation();
  const [queryParams] = useSearchParams();
  const matches = useMatches();

  const breadcrumbs = matches
    .filter((match) => match.handle && match.handle.breadcrumb)
    .map((match, index) => {
      return <li key={index}>{match.handle.breadcrumb(match, queryParams)}</li>;
    });

  return (
    <Document theme={theme}>
      <Navbar pathname={pathname} />
      <ToastContainer
        position="top-right"
        autoClose={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        theme={theme === "dark" ? "dark" : "light"}
      />
      <div className="mx-auto max-w-6xl flex flex-col gap-4">
        <div className="breadcrumbs text-sm">
          <ul>{breadcrumbs}</ul>
        </div>
        <Outlet />
      </div>
    </Document>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return (
      <Document title={error.statusText}>
        <section className="w-full h-svh bg-red-100 text-red-600">
          <h1 className="text-3xl">Oops!</h1>
          <p>There was an error:</p>
          <pre>
            {error.status} {error.statusText || error.data}
          </pre>
          <div className="flex flex-col">
            <Link className="link" to="/devices" reloadDocument>
              home
            </Link>
            <Link className="link" to="https://evolver.bio">
              forum
            </Link>
          </div>
        </section>
      </Document>
    );
  }
  if (error instanceof Error) {
    return (
      <div>
        <h1>Error</h1>
        <p>{error.message}</p>
        <p>The stack trace is:</p>
        <pre>{error.stack}</pre>
      </div>
    );
  }
  return <h1>Unknown Error</h1>;
}

function Document(props: {
  children: ReactNode;
  title?: string;
  theme?: string;
}) {
  return (
    <html lang="en" data-theme={props.theme}>
      <head>
        {props.title ? <title>{props.title}</title> : null}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <Meta />
        <Links />
      </head>
      <body>
        <GlobalLoading />
        {props.children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
