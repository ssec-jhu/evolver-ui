import { LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useParams,
  useSearchParams,
} from "@remix-run/react";

export const handle = {
  breadcrumb: ({ params }) => {
    const { ip_addr, hardware_name } = params;

    return (
      <Link to={`/devices/${ip_addr}/hardware/${hardware_name}`}>
        {hardware_name}
      </Link>
    );
  },
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const hardwareClassinfo = new URL(request.url).searchParams.get("classinfo");
  const searchParams = new URLSearchParams(request.url.split("?")[1]);
  console.log("searchParams", searchParams);

  // get the history for this hardware device
  return json({ message: "Hello, World!", hardwareClassinfo });
}

export default function Hardware() {
  const { message } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const classinfo = searchParams.get("classinfo");
  const { hardware_name, ip_addr } = useParams();
  return <h1>{message}</h1>;
}
