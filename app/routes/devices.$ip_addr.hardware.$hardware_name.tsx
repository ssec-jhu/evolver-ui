import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Link, useLoaderData, useParams } from "@remix-run/react";

export const handle = {
  Breadcrumb: () => {
    const { ip_addr, hardware_name } = useParams();
    return <Link to={`/devices/${ip_addr}`}>{hardware_name}</Link>;
  },
};

export async function loader({ params }: LoaderFunctionArgs) {
  console.log("params", params);
  return json({ message: "Hello, World!" });
}

export default function Hardware() {
  const { message } = useLoaderData<typeof loader>();
  return <h1>{message}</h1>;
}
