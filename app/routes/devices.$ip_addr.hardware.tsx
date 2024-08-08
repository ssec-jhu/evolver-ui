import { Outlet, Link, useParams } from "@remix-run/react";

export const handle = {
  Breadcrumb: () => {
    const { ip_addr } = useParams();
    return <Link to={`/devices/${ip_addr}/hardware`}>hardware</Link>;
  },
};

export default function SomeParent() {
  return <Outlet />;
}
