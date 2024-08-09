import { Outlet, Link, useParams } from "@remix-run/react";

export const handle = {
  breadcrumb: ({ params }) => {
    const { ip_addr } = params;
    return <Link to={`/devices/${ip_addr}/config`}>hardware</Link>;
  },
};

export default function SomeParent() {
  return <Outlet />;
}
